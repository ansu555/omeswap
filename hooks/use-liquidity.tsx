'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther, Address } from 'viem';
import { CONTRACT_ADDRESSES, TOKENS } from '@/contracts/config';
import { MultiTokenLiquidityPoolsABI, ERC20ABI } from '@/contracts/abis';
import { mantleTestnet } from '@/lib/chains/mantle';

export function useLiquidity(token0Symbol: string, token1Symbol: string) {
  const { address } = useAccount();
  const [amount0, setAmount0] = useState<string>('');
  const [amount1, setAmount1] = useState<string>('');
  
  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const token0 = TOKENS[token0Symbol];
  const token1 = TOKENS[token1Symbol];

  // Get pool ID
  const { data: poolId } = useReadContract({
    address: CONTRACT_ADDRESSES.POOLS as Address,
    abi: MultiTokenLiquidityPoolsABI,
    functionName: 'getPoolId',
    args: [token0.address as Address, token1.address as Address],
    chainId: mantleTestnet.id,
  });

  // Get pool info
  const { data: poolInfo, refetch: refetchPoolInfo } = useReadContract({
    address: CONTRACT_ADDRESSES.POOLS as Address,
    abi: MultiTokenLiquidityPoolsABI,
    functionName: 'getPoolInfo',
    args: [poolId as bigint],
    chainId: mantleTestnet.id,
    query: {
      enabled: !!poolId,
    },
  });

  // Get user position
  const { data: userPosition, refetch: refetchPosition } = useReadContract({
    address: CONTRACT_ADDRESSES.POOLS as Address,
    abi: MultiTokenLiquidityPoolsABI,
    functionName: 'getUserPosition',
    args: [poolId as bigint, address as Address],
    chainId: mantleTestnet.id,
    query: {
      enabled: !!poolId && !!address,
    },
  });

  // Get token0 allowance
  const { data: allowance0, refetch: refetchAllowance0 } = useReadContract({
    address: token0.address as Address,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: [address as Address, CONTRACT_ADDRESSES.POOLS as Address],
    chainId: mantleTestnet.id,
    query: {
      enabled: !!address,
    },
  });

  // Get token1 allowance
  const { data: allowance1, refetch: refetchAllowance1 } = useReadContract({
    address: token1.address as Address,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: [address as Address, CONTRACT_ADDRESSES.POOLS as Address],
    chainId: mantleTestnet.id,
    query: {
      enabled: !!address,
    },
  });

  // Get balances
  const { data: balance0, refetch: refetchBalance0 } = useReadContract({
    address: token0.address as Address,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: [address as Address],
    chainId: mantleTestnet.id,
    query: {
      enabled: !!address,
    },
  });

  const { data: balance1, refetch: refetchBalance1 } = useReadContract({
    address: token1.address as Address,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: [address as Address],
    chainId: mantleTestnet.id,
    query: {
      enabled: !!address,
    },
  });

  // Approve token0
  const approveToken0 = async () => {
    if (!amount0) return;
    
    writeContract({
      address: token0.address as Address,
      abi: ERC20ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESSES.POOLS as Address, parseEther(amount0)],
      chainId: mantleTestnet.id,
    });
  };

  // Approve token1
  const approveToken1 = async () => {
    if (!amount1) return;
    
    writeContract({
      address: token1.address as Address,
      abi: ERC20ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESSES.POOLS as Address, parseEther(amount1)],
      chainId: mantleTestnet.id,
    });
  };

  // Add liquidity
  const addLiquidity = async () => {
    if (!amount0 || !amount1 || !poolId) return;

    writeContract({
      address: CONTRACT_ADDRESSES.POOLS as Address,
      abi: MultiTokenLiquidityPoolsABI,
      functionName: 'addLiquidity',
      args: [
        poolId as bigint,
        parseEther(amount0),
        parseEther(amount1),
        BigInt(0), // min amount0
        BigInt(0), // min amount1
      ],
      chainId: mantleTestnet.id,
    });
  };

  // Remove liquidity
  const removeLiquidity = async (liquidityAmount: string) => {
    if (!poolId) return;

    writeContract({
      address: CONTRACT_ADDRESSES.POOLS as Address,
      abi: MultiTokenLiquidityPoolsABI,
      functionName: 'removeLiquidity',
      args: [
        poolId as bigint,
        parseEther(liquidityAmount),
        BigInt(0), // min amount0
        BigInt(0), // min amount1
      ],
      chainId: mantleTestnet.id,
    });
  };

  // Calculate quote for proportional amounts
  const getQuote = (inputAmount: string, isToken0: boolean) => {
    if (!poolInfo || !inputAmount) return '0';
    
    const [, , reserve0, reserve1] = poolInfo as [Address, Address, bigint, bigint, bigint];
    
    if (reserve0 === BigInt(0) || reserve1 === BigInt(0)) {
      return inputAmount; // Initial liquidity, can be any ratio
    }

    const input = parseEther(inputAmount);
    if (isToken0) {
      const output = (input * reserve1) / reserve0;
      return formatEther(output);
    } else {
      const output = (input * reserve0) / reserve1;
      return formatEther(output);
    }
  };

  // Check if approvals are needed
  const needsApproval0 = () => {
    if (!amount0 || !allowance0) return true;
    return parseEther(amount0) > (allowance0 as bigint);
  };

  const needsApproval1 = () => {
    if (!amount1 || !allowance1) return true;
    return parseEther(amount1) > (allowance1 as bigint);
  };

  // Refetch data after transaction
  useEffect(() => {
    if (isSuccess) {
      refetchBalance0();
      refetchBalance1();
      refetchAllowance0();
      refetchAllowance1();
      refetchPoolInfo();
      refetchPosition();
    }
  }, [isSuccess, refetchBalance0, refetchBalance1, refetchAllowance0, refetchAllowance1, refetchPoolInfo, refetchPosition]);

  return {
    amount0,
    setAmount0,
    amount1,
    setAmount1,
    balance0: balance0 ? formatEther(balance0 as bigint) : '0',
    balance1: balance1 ? formatEther(balance1 as bigint) : '0',
    poolInfo: poolInfo ? {
      token0: (poolInfo as any)[0],
      token1: (poolInfo as any)[1],
      reserve0: formatEther((poolInfo as any)[2]),
      reserve1: formatEther((poolInfo as any)[3]),
      totalSupply: formatEther((poolInfo as any)[4]),
    } : null,
    userPosition: userPosition ? {
      liquidity: formatEther((userPosition as any)[0]),
      token0Amount: formatEther((userPosition as any)[1]),
      token1Amount: formatEther((userPosition as any)[2]),
    } : null,
    needsApproval0: needsApproval0(),
    needsApproval1: needsApproval1(),
    approveToken0,
    approveToken1,
    addLiquidity,
    removeLiquidity,
    getQuote,
    isLoading: isWritePending || isConfirming,
    isSuccess,
    hash,
  };
}

