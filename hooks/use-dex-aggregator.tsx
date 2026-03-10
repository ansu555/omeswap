"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
  useReadContract,
} from "wagmi";
import { parseUnits, formatUnits, Address } from "viem";
import {
  MAINNET_TOKENS,
  DEX_ROUTERS,
  WAVAX_ADDRESS,
  TOKEN_ADDRESSES,
  TRADER_JOE_V2,
} from "@/contracts/config";
import { ERC20ABI } from "@/contracts/abis";
import { avalanche } from "@/lib/chains/avalanche";
import { useTransactionStore } from "@/store/transaction-store";

// USDC.e (bridged) — used as intermediate hop when direct path has no liquidity
const USDCE_ADDRESS = TOKEN_ADDRESSES["USDC.e"].address;

// UniswapV2-compatible router ABI (TraderJoe V1, Pangolin)
const V1_ROUTER_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "address[]", name: "path", type: "address[]" },
    ],
    name: "getAmountsOut",
    outputs: [
      { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "uint256", name: "amountOutMin", type: "uint256" },
      { internalType: "address[]", name: "path", type: "address[]" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
    ],
    name: "swapExactTokensForTokens",
    outputs: [
      { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// TraderJoe V2 Quoter ABI
const TJ_V2_QUOTER_ABI = [
  {
    inputs: [
      { internalType: "address[]", name: "route", type: "address[]" },
      { internalType: "uint128", name: "amountIn", type: "uint128" },
    ],
    name: "findBestPathFromAmountIn",
    outputs: [
      {
        name: "quote",
        type: "tuple",
        components: [
          { name: "route", type: "address[]" },
          { name: "pairs", type: "address[]" },
          { name: "binSteps", type: "uint256[]" },
          { name: "versions", type: "uint8[]" },
          { name: "amounts", type: "uint128[]" },
          { name: "virtualAmountsWithoutSlippage", type: "uint128[]" },
          { name: "fees", type: "uint256[]" },
        ],
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

// TraderJoe V2 Router ABI
const TJ_V2_ROUTER_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "uint256", name: "amountOutMinShares", type: "uint256" },
      {
        name: "path",
        type: "tuple",
        components: [
          { name: "pairBinSteps", type: "uint256[]" },
          { name: "versions", type: "uint8[]" },
          { name: "tokenPath", type: "address[]" },
        ],
      },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
    ],
    name: "swapExactTokensForTokens",
    outputs: [{ internalType: "uint256", name: "amountOut", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export type DexSource = "traderjoe" | "traderjoe_v2" | "pangolin";

export interface DexQuote {
  dex: DexSource;
  dexName: string;
  amountOut: bigint;
  amountOutFormatted: string;
  path: Address[];
  // V2-specific — used to build the Path struct for the swap
  v2BinSteps?: bigint[];
  v2Versions?: number[];
  isBest: boolean;
}

const V1_DEX_CONFIG: { dex: DexSource; dexName: string; router: Address }[] = [
  {
    dex: "traderjoe",
    dexName: "Trader Joe V1",
    router: DEX_ROUTERS.TRADER_JOE,
  },
  { dex: "pangolin", dexName: "Pangolin", router: DEX_ROUTERS.PANGOLIN },
];

export function useDexAggregator(
  tokenInSymbol: string,
  tokenOutSymbol: string,
  amountInRaw: string,
  slippage: number,
) {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: avalanche.id });

  const [quotes, setQuotes] = useState<DexQuote[]>([]);
  const [selectedDex, setSelectedDex] = useState<DexSource>("traderjoe_v2");
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tokenIn = MAINNET_TOKENS[tokenInSymbol];
  const tokenOut = MAINNET_TOKENS[tokenOutSymbol];

  const selectedDexConfig = V1_DEX_CONFIG.find((d) => d.dex === selectedDex);
  const selectedQuote =
    quotes.find((q) => q.dex === selectedDex) ?? quotes[0] ?? null;

  const approvalSpender: Address =
    selectedDex === "traderjoe_v2"
      ? TRADER_JOE_V2.ROUTER
      : (selectedDexConfig?.router ?? DEX_ROUTERS.TRADER_JOE);

  // Balance query
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: tokenIn?.address as Address,
    abi: ERC20ABI,
    functionName: "balanceOf",
    args: [address as Address],
    chainId: avalanche.id,
    query: { enabled: !!address && !!tokenIn },
  });

  // Allowance query
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenIn?.address as Address,
    abi: ERC20ABI,
    functionName: "allowance",
    args: [address as Address, approvalSpender],
    chainId: avalanche.id,
    query: { enabled: !!address && !!tokenIn },
  });

  const {
    writeContract: writeApprove,
    data: approveHash,
    isPending: isApprovePending,
    error: approveError,
  } = useWriteContract();

  const {
    writeContract: writeSwap,
    data: swapHash,
    isPending: isSwapPending,
    error: swapError,
  } = useWriteContract();

  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } =
    useWaitForTransactionReceipt({ hash: approveHash });

  const { isLoading: isSwapConfirming, isSuccess: isSwapSuccess } =
    useWaitForTransactionReceipt({ hash: swapHash });

  // After approval confirmed → execute swap
  useEffect(() => {
    if (
      isApproveSuccess &&
      isApproving &&
      selectedQuote &&
      address &&
      amountInRaw &&
      tokenIn
    ) {
      setIsApproving(false);
      refetchAllowance().then(() => executeSwapTx());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApproveSuccess, isApproving]);

  // Fetch quotes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (
        !publicClient ||
        !amountInRaw ||
        parseFloat(amountInRaw) <= 0 ||
        !tokenIn ||
        !tokenOut
      ) {
        setQuotes([]);
        return;
      }

      setIsLoadingQuotes(true);
      const amountIn = parseUnits(amountInRaw, tokenIn.decimals);
      const newQuotes: DexQuote[] = [];

      // --- TraderJoe V2 quote ---
      try {
        const quote = (await publicClient.readContract({
          address: TRADER_JOE_V2.QUOTER,
          abi: TJ_V2_QUOTER_ABI,
          functionName: "findBestPathFromAmountIn",
          args: [[tokenIn.address, tokenOut.address], BigInt(amountIn)],
        })) as any;

        const amounts: bigint[] = quote.amounts;
        const amountOut = amounts[amounts.length - 1];
        if (amountOut > 0n) {
          newQuotes.push({
            dex: "traderjoe_v2",
            dexName: "Trader Joe",
            amountOut,
            amountOutFormatted: formatUnits(amountOut, tokenOut.decimals),
            path: quote.route as Address[],
            v2BinSteps: quote.binSteps as bigint[],
            v2Versions: quote.versions as number[],
            isBest: false,
          });
        }
      } catch {
        // No V2 liquidity
      }

      // --- V1 DEX quotes (TraderJoe V1, Pangolin) ---
      for (const { dex, dexName, router } of V1_DEX_CONFIG) {
        const paths: Address[][] = [[tokenIn.address, tokenOut.address]];

        if (
          tokenIn.address.toLowerCase() !== WAVAX_ADDRESS.toLowerCase() &&
          tokenOut.address.toLowerCase() !== WAVAX_ADDRESS.toLowerCase()
        ) {
          paths.push([tokenIn.address, WAVAX_ADDRESS, tokenOut.address]);
        }

        if (
          tokenIn.address.toLowerCase() !== USDCE_ADDRESS.toLowerCase() &&
          tokenOut.address.toLowerCase() !== USDCE_ADDRESS.toLowerCase()
        ) {
          paths.push([tokenIn.address, USDCE_ADDRESS, tokenOut.address]);
        }

        let bestAmountOut = 0n;
        let bestPath = paths[0];

        for (const path of paths) {
          try {
            const amounts = (await publicClient.readContract({
              address: router,
              abi: V1_ROUTER_ABI,
              functionName: "getAmountsOut",
              args: [amountIn, path],
            })) as bigint[];
            const out = amounts[amounts.length - 1];
            if (out > bestAmountOut) {
              bestAmountOut = out;
              bestPath = path;
            }
          } catch {
            /* no pool */
          }
        }

        if (bestAmountOut > 0n) {
          newQuotes.push({
            dex,
            dexName,
            amountOut: bestAmountOut,
            amountOutFormatted: formatUnits(bestAmountOut, tokenOut.decimals),
            path: bestPath,
            isBest: false,
          });
        }
      }

      newQuotes.sort((a, b) => (b.amountOut > a.amountOut ? 1 : -1));
      if (newQuotes.length > 0) {
        newQuotes[0].isBest = true;
        setSelectedDex(newQuotes[0].dex);
      }
      setQuotes(newQuotes);
      setIsLoadingQuotes(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [amountInRaw, tokenInSymbol, tokenOutSymbol, publicClient]);

  const needsApproval = (): boolean => {
    if (!amountInRaw || allowance === undefined || !tokenIn) return true;
    return parseUnits(amountInRaw, tokenIn.decimals) > (allowance as bigint);
  };

  const executeSwapTx = () => {
    if (!selectedQuote || !address || !amountInRaw || !tokenIn) return;

    const amountIn = parseUnits(amountInRaw, tokenIn.decimals);
    const slippageBps = BigInt(Math.floor(slippage * 100));
    const amountOutMin =
      (selectedQuote.amountOut * (10000n - slippageBps)) / 10000n;
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 20 * 60);

    if (
      selectedDex === "traderjoe_v2" &&
      selectedQuote.v2BinSteps &&
      selectedQuote.v2Versions
    ) {
      writeSwap({
        address: TRADER_JOE_V2.ROUTER,
        abi: TJ_V2_ROUTER_ABI,
        functionName: "swapExactTokensForTokens",
        args: [
          amountIn,
          amountOutMin,
          {
            pairBinSteps: selectedQuote.v2BinSteps,
            versions: selectedQuote.v2Versions,
            tokenPath: selectedQuote.path,
          },
          address,
          deadline,
        ],
        chainId: avalanche.id,
      });
    } else {
      const router = V1_DEX_CONFIG.find((d) => d.dex === selectedDex)!.router;
      writeSwap({
        address: router,
        abi: V1_ROUTER_ABI,
        functionName: "swapExactTokensForTokens",
        args: [amountIn, amountOutMin, selectedQuote.path, address, deadline],
        chainId: avalanche.id,
      });
    }
  };

  const executeSwap = () => {
    if (!selectedQuote || !address || !amountInRaw || !tokenIn) return;
    setError(null);

    if (needsApproval()) {
      setIsApproving(true);
      writeApprove({
        address: tokenIn.address as Address,
        abi: ERC20ABI,
        functionName: "approve",
        args: [approvalSpender, parseUnits(amountInRaw, tokenIn.decimals)],
        chainId: avalanche.id,
      });
    } else {
      executeSwapTx();
    }
  };

  useEffect(() => {
    if (approveError) {
      setError(approveError.message || "Approval failed");
      setIsApproving(false);
    }
  }, [approveError]);

  useEffect(() => {
    if (swapError) setError(swapError.message || "Swap failed");
  }, [swapError]);

  // Record transaction in store
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  useEffect(() => {
    if (isSwapSuccess && swapHash && address && tokenIn && tokenOut) {
      const dexName = selectedQuote?.dexName ?? selectedDex;
      addTransaction({
        type: "SWAP",
        fromToken: tokenInSymbol,
        toToken: tokenOutSymbol,
        fromAmount: parseFloat(amountInRaw) || 0,
        toAmount: parseFloat(selectedQuote?.amountOutFormatted ?? "0") || 0,
        txHash: swapHash,
        walletAddress: address,
        timestamp: Date.now(),
        source: "dex-aggregator",
        dex: dexName,
      });
    }
  }, [isSwapSuccess, swapHash]);

  useEffect(() => {
    if (isSwapSuccess) {
      setError(null);
      refetchBalance();
      refetchAllowance();
    }
  }, [isSwapSuccess]);

  return {
    quotes,
    selectedDex,
    setSelectedDex,
    selectedQuote,
    isLoadingQuotes,
    estimatedOutput: selectedQuote?.amountOutFormatted ?? "0",
    balance:
      balance !== undefined && tokenIn
        ? formatUnits(balance as bigint, tokenIn.decimals)
        : "0",
    needsApproval: needsApproval(),
    executeSwap,
    isApproving,
    isLoading:
      isApprovePending ||
      isApproveConfirming ||
      isSwapPending ||
      isSwapConfirming ||
      isApproving,
    isSuccess: isSwapSuccess,
    hash: swapHash,
    error,
  };
}
