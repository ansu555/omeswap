import { BaseNode } from "../BaseNode";
import type {
  HandleDef,
  ConfigField,
  ExecutionContext,
} from "@/types/agent-builder-canvas";
import { ethers } from "ethers";
import { useTransactionStore } from "@/store/transaction-store";

const ROUTER_ABI = [
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function swapExactAVAXForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
  "function swapExactTokensForAVAX(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
];

// AVAX = native coin sentinel — not a real ERC-20, triggers payable swap
const NATIVE_AVAX = "AVAX";

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
];

const WAVAX_ADDRESS = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";

const TOKEN_ADDRESSES: Record<string, { address: string; decimals: number }> = {
  WAVAX: { address: WAVAX_ADDRESS, decimals: 18 },
  "USDC.e": {
    address: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664",
    decimals: 6,
  },
  "USDT.e": {
    address: "0xc7198437980c041c805A1EDcbA50c1Ce5db95118",
    decimals: 6,
  },
  JOE: { address: "0x6e84a6216eA6daCC71eE8E6b0a5B7322EEbC0fDd", decimals: 18 },
  PNG: { address: "0x60781C2586D68229fde47564546784ab3fACA982", decimals: 18 },
};

const DEX_ROUTERS: Record<string, string> = {
  "Trader Joe": "0x60aE616a2155Ee3d9A68541Ba4544862310933d4",
  Pangolin: "0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106",
};

export class SwapNode extends BaseNode {
  readonly type = "swap";
  readonly label = "Swap";
  readonly description = "Executes a token swap on Trader Joe or Pangolin";
  readonly icon = "Repeat2";
  readonly category = "action" as const;
  readonly color = "border-green-500";
  readonly bgColor = "bg-green-950";

  readonly handles: HandleDef[] = [
    {
      id: "signal",
      label: "Execute",
      position: "left",
      type: "target",
      dataType: "signal",
    },
    {
      id: "txHash",
      label: "Tx Hash",
      position: "right",
      type: "source",
      dataType: "string",
    },
  ];

  readonly configSchema: ConfigField[] = [
    {
      key: "dex",
      label: "DEX",
      type: "select",
      options: ["Trader Joe", "Pangolin"],
      default: "Trader Joe",
    },
    {
      key: "tokenIn",
      label: "Token In",
      type: "select",
      // AVAX = native coin (uses swapExactAVAXForTokens, no approval needed)
      options: [NATIVE_AVAX, ...Object.keys(TOKEN_ADDRESSES)],
      default: NATIVE_AVAX,
    },
    {
      key: "tokenOut",
      label: "Token Out",
      type: "select",
      options: Object.keys(TOKEN_ADDRESSES),
      default: "USDC.e",
    },
    {
      key: "amountIn",
      label: "Amount In",
      type: "number",
      default: 0.1,
    },
    {
      key: "slippage",
      label: "Slippage %",
      type: "number",
      default: 0.5,
    },
  ];

  async execute(
    inputs: Record<string, unknown>,
    context: ExecutionContext,
  ): Promise<Record<string, unknown>> {
    if (!inputs.signal) return { txHash: null };
    if (!context.signer || !context.walletAddress)
      throw new Error("Wallet not connected");

    const dex = (this.config.dex as string) || "Trader Joe";
    const tokenIn = (this.config.tokenIn as string) || NATIVE_AVAX;
    const tokenOut = (this.config.tokenOut as string) || "USDC.e";
    const amountIn = (this.config.amountIn as number) || 0.1;
    const slippage = (this.config.slippage as number) || 0.5;

    const routerAddress = DEX_ROUTERS[dex];
    const outToken = TOKEN_ADDRESSES[tokenOut];
    if (!outToken) throw new Error(`Unknown token out: ${tokenOut}`);

    const signer = context.signer as ethers.Signer;
    const router = new ethers.Contract(routerAddress, ROUTER_ABI, signer);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    const slippageBps = BigInt(Math.floor((1 - slippage / 100) * 10000));

    context.addLog(
      `[Swap] ${amountIn} ${tokenIn} → ${tokenOut} on ${dex} (slippage: ${slippage}%)`,
    );

    let tx;

    // ── Path A: native AVAX → ERC-20 (swapExactAVAXForTokens) ──────────────
    if (tokenIn === NATIVE_AVAX) {
      const amountInWei = ethers.parseEther(amountIn.toString());
      const path = [WAVAX_ADDRESS, outToken.address];
      const amounts = await router.getAmountsOut(amountInWei, path);
      const amountOutMin = (amounts[1] * slippageBps) / BigInt(10000);

      tx = await router.swapExactAVAXForTokens(
        amountOutMin,
        path,
        context.walletAddress,
        deadline,
        { value: amountInWei },
      );

      // ── Path B: ERC-20 → ERC-20 (swapExactTokensForTokens) ─────────────────
    } else {
      const inToken = TOKEN_ADDRESSES[tokenIn];
      if (!inToken) throw new Error(`Unknown token in: ${tokenIn}`);

      const amountInWei = ethers.parseUnits(
        amountIn.toString(),
        inToken.decimals,
      );
      const path = [inToken.address, outToken.address];
      const amounts = await router.getAmountsOut(amountInWei, path);
      const amountOutMin = (amounts[1] * slippageBps) / BigInt(10000);

      // Approve if allowance is insufficient
      const tokenContract = new ethers.Contract(
        inToken.address,
        ERC20_ABI,
        signer,
      );
      const allowance = await tokenContract.allowance(
        context.walletAddress,
        routerAddress,
      );
      if (allowance < amountInWei) {
        context.addLog(`[Swap] Approving ${tokenIn}...`);
        const approveTx = await tokenContract.approve(
          routerAddress,
          ethers.MaxUint256,
        );
        await approveTx.wait();
        context.addLog(`[Swap] Approved`);
      }

      tx = await router.swapExactTokensForTokens(
        amountInWei,
        amountOutMin,
        path,
        context.walletAddress,
        deadline,
      );
    }

    context.addLog(`[Swap] Tx submitted: ${tx.hash}`);
    await tx.wait();
    context.addLog(`[Swap] Confirmed!`);

    // Record in global transaction store
    try {
      useTransactionStore.getState().addTransaction({
        type: "SWAP",
        fromToken: tokenIn === NATIVE_AVAX ? "AVAX" : tokenIn,
        toToken: tokenOut,
        fromAmount: amountIn,
        toAmount: 0, // exact output not easily available from tx
        txHash: tx.hash,
        walletAddress: context.walletAddress,
        timestamp: Date.now(),
        source: "agent-builder",
        dex: dex,
      });
    } catch {
      /* non-critical */
    }

    return { txHash: tx.hash };
  }
}
