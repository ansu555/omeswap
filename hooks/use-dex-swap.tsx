'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther, Address } from 'viem';
import { CONTRACT_ADDRESSES, TOKENS } from '@/contracts/config';
import { MultiHopSwapRouterABI, ERC20ABI } from '@/contracts/abis';
import { mantleTestnet } from '@/lib/chains/mantle';

export function useDexSwap() {
  const { address } = useAccount();
  const [tokenIn, setTokenIn] = useState<string>('tUSDC');
  const [tokenOut, setTokenOut] = useState<string>('tUSDT');
  const [amountIn, setAmountIn] = useState<string>('');
  const [slippage, setSlippage] = useState<number>(0.5); // 0.5%
  
  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Get estimated output amount
  const { data: estimatedOutput, refetch: refetchEstimate } = useReadContract({
    address: CONTRACT_ADDRESSES.ROUTER as Address,
    abi: MultiHopSwapRouterABI,
    functionName: 'getAmountOut',
    args: [
      amountIn ? parseEther(amountIn) : BigInt(0),
      TOKENS[tokenIn].address as Address,
      TOKENS[tokenOut].address as Address,
    ],
    chainId: mantleTestnet.id,
    query: {
      enabled: !!amountIn && parseFloat(amountIn) > 0,
    },
  });

  // Check token allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: TOKENS[tokenIn].address as Address,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: [address as Address, CONTRACT_ADDRESSES.ROUTER as Address],
    chainId: mantleTestnet.id,
    query: {
      enabled: !!address,
    },
  });

  // Get token balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: TOKENS[tokenIn].address as Address,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: [address as Address],
    chainId: mantleTestnet.id,
    query: {
      enabled: !!address,
    },
  });

  // Approve token
  const approveToken = async () => {
    if (!amountIn) return;
    
    writeContract({
      address: TOKENS[tokenIn].address as Address,
      abi: ERC20ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESSES.ROUTER as Address, parseEther(amountIn)],
      chainId: mantleTestnet.id,
    });
  };

  // Execute swap
  const executeSwap = async () => {
    if (!amountIn || !estimatedOutput || !address) return;

    const outputBigInt = estimatedOutput as bigint;
    const minAmountOut = (outputBigInt * BigInt(10000 - slippage * 100)) / BigInt(10000);

    writeContract({
      address: CONTRACT_ADDRESSES.ROUTER as Address,
      abi: MultiHopSwapRouterABI,
      functionName: 'swapSingleHop',
      args: [
        TOKENS[tokenIn].address as Address,
        TOKENS[tokenOut].address as Address,
        parseEther(amountIn),
        minAmountOut,
        address, // receiver parameter
      ],
      chainId: mantleTestnet.id,
    });
  };

  // Check if approval is needed
  const needsApproval = () => {
    if (!amountIn || !allowance) return true;
    return parseEther(amountIn) > (allowance as bigint);
  };

  // Refetch data after transaction
  useEffect(() => {
    if (isSuccess) {
      refetchBalance();
      refetchAllowance();
      refetchEstimate();
    }
  }, [isSuccess, refetchBalance, refetchAllowance, refetchEstimate]);

  return {
    tokenIn,
    setTokenIn,
    tokenOut,
    setTokenOut,
    amountIn,
    setAmountIn,
    slippage,
    setSlippage,
    estimatedOutput: estimatedOutput ? formatEther(estimatedOutput as bigint) : '0',
    balance: balance ? formatEther(balance as bigint) : '0',
    needsApproval: needsApproval(),
    approveToken,
    executeSwap,
    isLoading: isWritePending || isConfirming,
    isSuccess,
    hash,
  };
}

