"use client";

import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { parseEther, formatEther, Address } from "viem";
import { TOKENS } from "@/contracts/config";
import { ERC20ABI } from "@/contracts/abis";
import { avalanche } from "@/lib/chains/avalanche";
import { useTransactionStore } from "@/store/transaction-store";

export function useTokenMint(tokenSymbol: string) {
  const { address } = useAccount();
  const token = TOKENS[tokenSymbol];

  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Get token balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: token.address as Address,
    abi: ERC20ABI,
    functionName: "balanceOf",
    args: [address as Address],
    chainId: avalanche.id,
    query: {
      enabled: !!address,
    },
  });

  // Mint tokens
  const mintAmountRef = { current: "" };
  const mint = async (amount: string) => {
    if (!address) return;
    mintAmountRef.current = amount;

    writeContract({
      address: token.address as Address,
      abi: ERC20ABI,
      functionName: "mint",
      args: [address, parseEther(amount)],
      chainId: avalanche.id,
    });
  };

  // Record transaction in store
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  useEffect(() => {
    if (isSuccess && hash && address) {
      addTransaction({
        type: "MINT",
        fromToken: tokenSymbol,
        toToken: tokenSymbol,
        fromAmount: parseFloat(mintAmountRef.current) || 0,
        toAmount: parseFloat(mintAmountRef.current) || 0,
        txHash: hash,
        walletAddress: address,
        timestamp: Date.now(),
        source: "token-mint",
      });
    }
  }, [isSuccess, hash]);

  return {
    balance: balance ? formatEther(balance as bigint) : "0",
    mint,
    isLoading: isWritePending || isConfirming,
    isSuccess,
    hash,
    refetchBalance,
  };
}

// Hook to mint all tokens at once
export function useBatchMint() {
  const { address } = useAccount();
  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const mintAll = async (amount: string = "10000") => {
    if (!address) return;

    // Mint first token (others can be minted subsequently)
    const firstToken = Object.values(TOKENS)[0];
    writeContract({
      address: firstToken.address as Address,
      abi: ERC20ABI,
      functionName: "mint",
      args: [address, parseEther(amount)],
      chainId: avalanche.id,
    });
  };

  return {
    mintAll,
    isLoading: isWritePending || isConfirming,
    isSuccess,
    hash,
  };
}
