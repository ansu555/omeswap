'use client';

import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, formatEther, Address } from 'viem';
import { TOKENS } from '@/contracts/config';
import { ERC20ABI } from '@/contracts/abis';
import { mantleTestnet } from '@/lib/chains/mantle';

export function useTokenMint(tokenSymbol: string) {
  const { address } = useAccount();
  const token = TOKENS[tokenSymbol];
  
  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Get token balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: token.address as Address,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: [address as Address],
    chainId: mantleTestnet.id,
    query: {
      enabled: !!address,
    },
  });

  // Mint tokens
  const mint = async (amount: string) => {
    if (!address) return;

    writeContract({
      address: token.address as Address,
      abi: ERC20ABI,
      functionName: 'mint',
      args: [address, parseEther(amount)],
      chainId: mantleTestnet.id,
    });
  };

  return {
    balance: balance ? formatEther(balance as bigint) : '0',
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
  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const mintAll = async (amount: string = '10000') => {
    if (!address) return;

    // Mint first token (others can be minted subsequently)
    const firstToken = Object.values(TOKENS)[0];
    writeContract({
      address: firstToken.address as Address,
      abi: ERC20ABI,
      functionName: 'mint',
      args: [address, parseEther(amount)],
      chainId: mantleTestnet.id,
    });
  };

  return {
    mintAll,
    isLoading: isWritePending || isConfirming,
    isSuccess,
    hash,
  };
}

