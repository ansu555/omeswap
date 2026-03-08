"use client";

import { useReadContracts } from "wagmi";
import { formatUnits, Address, Abi } from "viem";
import { TOKEN_ADDRESSES } from "@/contracts/config";
import { ERC20ABI } from "@/contracts/abis";
import { avalanche } from "@/lib/chains/avalanche";

const TOKEN_ENTRIES = Object.entries(TOKEN_ADDRESSES);

export function useTokenBalances(walletAddress: string | undefined) {
  const { data } = useReadContracts({
    contracts: TOKEN_ENTRIES.map(([, token]) => ({
      address: token.address as Address,
      abi: ERC20ABI as Abi,
      functionName: "balanceOf" as const,
      args: [walletAddress as Address],
      chainId: avalanche.id,
    })),
    query: { enabled: !!walletAddress },
  });

  const balances: Record<string, string> = {};

  if (data) {
    TOKEN_ENTRIES.forEach(([key, token], i) => {
      const result = data[i];
      if (result?.status === "success" && result.result !== undefined) {
        balances[key] = formatUnits(result.result as bigint, token.decimals);
      } else {
        balances[key] = "0";
      }
    });
  }

  return { balances };
}
