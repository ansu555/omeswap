"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, formatEther, Address } from "viem";
import { CONTRACT_ADDRESSES, TOKENS } from "@/contracts/config";
import { MultiTokenLiquidityPoolsABI, ERC20ABI } from "@/contracts/abis";
import { avalanche } from "@/lib/chains/avalanche";
import { useTransactionStore } from "@/store/transaction-store";

export function useLiquidity(token0Symbol: string, token1Symbol: string) {
  const { address } = useAccount();
  const [amount0, setAmount0] = useState<string>("");
  const [amount1, setAmount1] = useState<string>("");

  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });
  const [error, setError] = useState<string | null>(null);

  const token0 = TOKENS[token0Symbol];
  const token1 = TOKENS[token1Symbol];

  // Determine token ordering (token0 < token1 by address)
  const token0Addr =
    token0.address.toLowerCase() < token1.address.toLowerCase()
      ? (token0.address as Address)
      : (token1.address as Address);
  const token1Addr =
    token0.address.toLowerCase() < token1.address.toLowerCase()
      ? (token1.address as Address)
      : (token0.address as Address);

  // Get pool ID
  const { data: poolId } = useReadContract({
    address: CONTRACT_ADDRESSES.POOLS as Address,
    abi: MultiTokenLiquidityPoolsABI,
    functionName: "getPoolId",
    args: [token0Addr, token1Addr],
    chainId: avalanche.id,
  });

  // Get pool info
  const { data: poolInfo, refetch: refetchPoolInfo } = useReadContract({
    address: CONTRACT_ADDRESSES.POOLS as Address,
    abi: MultiTokenLiquidityPoolsABI,
    functionName: "getPoolInfo",
    args: [poolId as bigint],
    chainId: avalanche.id,
    query: {
      enabled: !!poolId,
    },
  });

  // Get user position
  const { data: userPosition, refetch: refetchPosition } = useReadContract({
    address: CONTRACT_ADDRESSES.POOLS as Address,
    abi: MultiTokenLiquidityPoolsABI,
    functionName: "getUserPosition",
    args: [poolId as bigint, address as Address],
    chainId: avalanche.id,
    query: {
      enabled: !!poolId && !!address,
    },
  });

  // Get token0 allowance
  const { data: allowance0, refetch: refetchAllowance0 } = useReadContract({
    address: token0.address as Address,
    abi: ERC20ABI,
    functionName: "allowance",
    args: [address as Address, CONTRACT_ADDRESSES.POOLS as Address],
    chainId: avalanche.id,
    query: {
      enabled: !!address,
    },
  });

  // Get token1 allowance
  const { data: allowance1, refetch: refetchAllowance1 } = useReadContract({
    address: token1.address as Address,
    abi: ERC20ABI,
    functionName: "allowance",
    args: [address as Address, CONTRACT_ADDRESSES.POOLS as Address],
    chainId: avalanche.id,
    query: {
      enabled: !!address,
    },
  });

  // Get balances
  const { data: balance0, refetch: refetchBalance0 } = useReadContract({
    address: token0.address as Address,
    abi: ERC20ABI,
    functionName: "balanceOf",
    args: [address as Address],
    chainId: avalanche.id,
    query: {
      enabled: !!address,
    },
  });

  const { data: balance1, refetch: refetchBalance1 } = useReadContract({
    address: token1.address as Address,
    abi: ERC20ABI,
    functionName: "balanceOf",
    args: [address as Address],
    chainId: avalanche.id,
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
      functionName: "approve",
      args: [CONTRACT_ADDRESSES.POOLS as Address, parseEther(amount0)],
      chainId: avalanche.id,
    });
  };

  // Approve token1
  const approveToken1 = async () => {
    if (!amount1) return;

    writeContract({
      address: token1.address as Address,
      abi: ERC20ABI,
      functionName: "approve",
      args: [CONTRACT_ADDRESSES.POOLS as Address, parseEther(amount1)],
      chainId: avalanche.id,
    });
  };

  // Add liquidity
  const addLiquidity = async () => {
    console.log("addLiquidity called", {
      amount0,
      amount1,
      poolId,
      poolIdType: typeof poolId,
    });

    // Validate inputs - poolId can be 0n (BigInt zero is valid)
    if (!amount0 || !amount1 || poolId === undefined || poolId === null) {
      console.error("Missing required values for addLiquidity:", {
        amount0: !!amount0,
        amount1: !!amount1,
        poolId: poolId !== undefined && poolId !== null,
      });
      return;
    }

    try {
      console.log("Calling addLiquidity with params:", {
        poolId: poolId.toString(),
        amount0: parseEther(amount0).toString(),
        amount1: parseEther(amount1).toString(),
      });

      writeContract({
        address: CONTRACT_ADDRESSES.POOLS as Address,
        abi: MultiTokenLiquidityPoolsABI,
        functionName: "addLiquidity",
        args: [
          poolId as bigint,
          parseEther(amount0),
          parseEther(amount1),
          BigInt(0), // min amount0
          BigInt(0), // min amount1
        ],
        chainId: avalanche.id,
      });
    } catch (error: any) {
      console.error("Error in addLiquidity:", error);
    }
  };

  // Remove liquidity
  const removeLiquidity = async (liquidityAmount: string) => {
    if (!poolId) return;

    writeContract({
      address: CONTRACT_ADDRESSES.POOLS as Address,
      abi: MultiTokenLiquidityPoolsABI,
      functionName: "removeLiquidity",
      args: [
        poolId as bigint,
        parseEther(liquidityAmount),
        BigInt(0), // min amount0
        BigInt(0), // min amount1
      ],
      chainId: avalanche.id,
    });
  };

  // Calculate quote for proportional amounts
  const getQuote = (inputAmount: string, isToken0: boolean) => {
    if (!poolInfo || !inputAmount) return "0";

    const [, , reserve0, reserve1] = poolInfo as [
      Address,
      Address,
      bigint,
      bigint,
      bigint,
    ];

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

  // Handle write errors
  useEffect(() => {
    if (writeError) {
      setError(writeError.message || "Transaction failed");
      console.error("Write contract error:", writeError);
    }
  }, [writeError]);

  // Clear error on success
  useEffect(() => {
    if (isSuccess) {
      setError(null);
    }
  }, [isSuccess]);

  // Record transaction in store
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const lastActionRef = { current: "" as "add" | "remove" | "" };

  const origAddLiquidity = addLiquidity;
  const wrappedAddLiquidity = async () => {
    lastActionRef.current = "add";
    return origAddLiquidity();
  };
  const origRemoveLiquidity = removeLiquidity;
  const wrappedRemoveLiquidity = async (amt: string) => {
    lastActionRef.current = "remove";
    return origRemoveLiquidity(amt);
  };

  useEffect(() => {
    if (isSuccess && hash && address) {
      const txType =
        lastActionRef.current === "remove"
          ? ("REMOVE_LIQUIDITY" as const)
          : ("ADD_LIQUIDITY" as const);
      addTransaction({
        type: txType,
        fromToken: token0Symbol,
        toToken: token1Symbol,
        fromAmount: parseFloat(amount0) || 0,
        toAmount: parseFloat(amount1) || 0,
        txHash: hash,
        walletAddress: address,
        timestamp: Date.now(),
        source: "liquidity",
      });
    }
  }, [isSuccess, hash]);

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
  }, [
    isSuccess,
    refetchBalance0,
    refetchBalance1,
    refetchAllowance0,
    refetchAllowance1,
    refetchPoolInfo,
    refetchPosition,
  ]);

  return {
    amount0,
    setAmount0,
    amount1,
    setAmount1,
    balance0: balance0 ? formatEther(balance0 as bigint) : "0",
    balance1: balance1 ? formatEther(balance1 as bigint) : "0",
    poolInfo: poolInfo
      ? {
          token0: (poolInfo as any)[0],
          token1: (poolInfo as any)[1],
          reserve0: formatEther((poolInfo as any)[2]),
          reserve1: formatEther((poolInfo as any)[3]),
          totalSupply: formatEther((poolInfo as any)[4]),
        }
      : null,
    userPosition: userPosition
      ? {
          liquidity: formatEther((userPosition as any)[0]),
          token0Amount: formatEther((userPosition as any)[1]),
          token1Amount: formatEther((userPosition as any)[2]),
        }
      : null,
    needsApproval0: needsApproval0(),
    needsApproval1: needsApproval1(),
    approveToken0,
    approveToken1,
    addLiquidity: wrappedAddLiquidity,
    removeLiquidity: wrappedRemoveLiquidity,
    getQuote,
    isLoading: isWritePending || isConfirming,
    isSuccess,
    hash,
    error,
  };
}
