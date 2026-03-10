"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from "wagmi";
import { parseEther, formatEther, Address } from "viem";
import { CONTRACT_ADDRESSES, TOKENS } from "@/contracts/config";
import { MultiTokenLiquidityPoolsABI, ERC20ABI } from "@/contracts/abis";
import { avalanche } from "@/lib/chains/avalanche";
import { useTransactionStore } from "@/store/transaction-store";

export function useDexSwap() {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: avalanche.id });
  const [tokenIn, setTokenIn] = useState<string>("WAVAX");
  const [tokenOut, setTokenOut] = useState<string>("USDC");
  const [amountIn, setAmountIn] = useState<string>("");
  const [slippage, setSlippage] = useState<number>(0.5); // 0.5%
  const [estimatedOutput, setEstimatedOutput] = useState<string>("0");
  const [isApproving, setIsApproving] = useState(false);
  const [pendingSwap, setPendingSwap] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const hash = swapHash || approveHash;
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Wait for approval transaction to complete
  const { isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
    query: { enabled: !!approveHash && isApproving },
  });

  // Get pool ID from pair mapping
  const tokenInAddr = TOKENS[tokenIn].address as Address;
  const tokenOutAddr = TOKENS[tokenOut].address as Address;

  // Determine token ordering (token0 < token1 by address)
  const token0Addr =
    tokenInAddr.toLowerCase() < tokenOutAddr.toLowerCase()
      ? tokenInAddr
      : tokenOutAddr;
  const token1Addr =
    tokenInAddr.toLowerCase() < tokenOutAddr.toLowerCase()
      ? tokenOutAddr
      : tokenInAddr;

  const { data: poolId } = useReadContract({
    address: CONTRACT_ADDRESSES.POOLS as Address,
    abi: MultiTokenLiquidityPoolsABI,
    functionName: "getPoolId",
    args: [token0Addr, token1Addr],
    chainId: avalanche.id,
  });

  const { data: poolInfo } = useReadContract({
    address: CONTRACT_ADDRESSES.POOLS as Address,
    abi: MultiTokenLiquidityPoolsABI,
    functionName: "getPoolInfo",
    args: [poolId as bigint],
    chainId: avalanche.id,
    query: {
      enabled: poolId !== undefined,
    },
  });

  // Calculate estimate in real-time when amountIn changes (with debouncing to avoid rate limits)
  useEffect(() => {
    // Debounce to avoid too many RPC calls
    const timeoutId = setTimeout(async () => {
      if (
        !publicClient ||
        !amountIn ||
        parseFloat(amountIn) <= 0 ||
        !poolInfo ||
        poolId === undefined
      ) {
        setEstimatedOutput("0");
        return;
      }

      try {
        // Determine which reserve is for tokenIn and tokenOut
        const token0IsIn =
          token0Addr.toLowerCase() === tokenInAddr.toLowerCase();
        const reserveIn = token0IsIn
          ? (poolInfo as any)[2]
          : (poolInfo as any)[3];
        const reserveOut = token0IsIn
          ? (poolInfo as any)[3]
          : (poolInfo as any)[2];

        // Only calculate if reserves are valid
        if (
          !reserveIn ||
          !reserveOut ||
          reserveIn === BigInt(0) ||
          reserveOut === BigInt(0)
        ) {
          setEstimatedOutput("0");
          return;
        }

        // Calculate output using getAmountOut from Pools contract
        const amountOut = (await publicClient.readContract({
          address: CONTRACT_ADDRESSES.POOLS as Address,
          abi: MultiTokenLiquidityPoolsABI,
          functionName: "getAmountOut",
          args: [parseEther(amountIn), reserveIn, reserveOut],
        })) as bigint;

        if (amountOut && amountOut > BigInt(0)) {
          setEstimatedOutput(formatEther(amountOut));
        } else {
          setEstimatedOutput("0");
        }
      } catch (error: any) {
        // Ignore rate limit errors silently, only log other errors
        if (
          !error?.message?.includes("429") &&
          !error?.message?.includes("rate limit")
        ) {
          console.error("Error calculating estimate:", error);
        }
        // Don't set to '0' on rate limit errors, keep previous value
        if (
          !error?.message?.includes("429") &&
          !error?.message?.includes("rate limit")
        ) {
          setEstimatedOutput("0");
        }
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [
    amountIn,
    poolInfo,
    poolId,
    tokenInAddr,
    tokenOutAddr,
    token0Addr,
    publicClient,
  ]);

  // Check token allowance for both Router and Pools (we'll use Pools directly like console)
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: TOKENS[tokenIn].address as Address,
    abi: ERC20ABI,
    functionName: "allowance",
    args: [address as Address, CONTRACT_ADDRESSES.POOLS as Address],
    chainId: avalanche.id,
    query: {
      enabled: !!address,
    },
  });

  // Get token balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: TOKENS[tokenIn].address as Address,
    abi: ERC20ABI,
    functionName: "balanceOf",
    args: [address as Address],
    chainId: avalanche.id,
    query: {
      enabled: !!address,
    },
  });

  // Check if approval is needed
  const needsApproval = () => {
    if (!amountIn || !allowance) return true;
    return parseEther(amountIn) > (allowance as bigint);
  };

  // Effect to handle approval confirmation and then trigger swap
  useEffect(() => {
    if (isApproveSuccess && pendingSwap) {
      console.log("Approval successful, checking if swap should execute...", {
        isApproveSuccess,
        pendingSwap,
        needsApproval: needsApproval(),
        amountIn,
        estimatedOutput,
      });

      // Small delay to ensure allowance is updated
      setTimeout(async () => {
        await refetchAllowance();

        // Double check approval is no longer needed
        if (
          !needsApproval() &&
          amountIn &&
          estimatedOutput &&
          estimatedOutput !== "0"
        ) {
          console.log("Executing swap after approval...");
          setIsApproving(false);
          setPendingSwap(false);

          // Execute swap after approval
          const outputBigInt = parseEther(estimatedOutput);
          const minAmountOut =
            (outputBigInt * BigInt(10000 - slippage * 100)) / BigInt(10000);

          writeSwap({
            address: CONTRACT_ADDRESSES.POOLS as Address,
            abi: MultiTokenLiquidityPoolsABI,
            functionName: "swap",
            args: [
              poolId as bigint,
              TOKENS[tokenIn].address as Address,
              parseEther(amountIn),
              minAmountOut,
            ],
            chainId: avalanche.id,
          });
        } else {
          console.log("Swap conditions not met after approval:", {
            needsApproval: needsApproval(),
            amountIn,
            estimatedOutput,
          });
          setIsApproving(false);
          setPendingSwap(false);
        }
      }, 1000); // 1 second delay to allow blockchain state to update
    }
  }, [
    isApproveSuccess,
    pendingSwap,
    estimatedOutput,
    amountIn,
    poolId,
    tokenIn,
    slippage,
    writeSwap,
    refetchAllowance,
    needsApproval,
  ]);

  // Combined approve and swap function - executes sequentially
  const approveAndSwap = () => {
    console.log("approveAndSwap called", {
      amountIn,
      estimatedOutput,
      address,
      poolId,
      needsApproval: needsApproval(),
    });

    // Validate inputs - poolId can be 0n (BigInt zero is valid, so check for undefined/null only)
    if (
      !amountIn ||
      !estimatedOutput ||
      !address ||
      poolId === undefined ||
      poolId === null ||
      estimatedOutput === "0" ||
      parseFloat(estimatedOutput) <= 0
    ) {
      console.error("Missing required values:", {
        amountIn: !!amountIn,
        estimatedOutput: !!estimatedOutput,
        address: !!address,
        poolId: poolId !== undefined && poolId !== null,
        estimatedOutputNotZero: estimatedOutput !== "0",
        estimatedOutputPositive: parseFloat(estimatedOutput) > 0,
      });
      setError("Please enter a valid amount and ensure the pool has liquidity");
      return;
    }

    try {
      // Step 1: Check if approval is needed
      if (needsApproval()) {
        console.log("Approval needed, starting approval...");
        setIsApproving(true);
        setPendingSwap(true);

        // Trigger approval transaction
        writeApprove({
          address: TOKENS[tokenIn].address as Address,
          abi: ERC20ABI,
          functionName: "approve",
          args: [CONTRACT_ADDRESSES.POOLS as Address, parseEther(amountIn)],
          chainId: avalanche.id,
        });
      } else {
        console.log("No approval needed, executing swap directly...");
        // No approval needed, execute swap directly
        const outputBigInt = parseEther(estimatedOutput);
        const minAmountOut =
          (outputBigInt * BigInt(10000 - slippage * 100)) / BigInt(10000);

        console.log("Swap params:", {
          poolId: poolId.toString(),
          tokenIn: TOKENS[tokenIn].address,
          amountIn: parseEther(amountIn).toString(),
          minAmountOut: minAmountOut.toString(),
        });

        writeSwap({
          address: CONTRACT_ADDRESSES.POOLS as Address,
          abi: MultiTokenLiquidityPoolsABI,
          functionName: "swap",
          args: [
            poolId as bigint,
            TOKENS[tokenIn].address as Address,
            parseEther(amountIn),
            minAmountOut,
          ],
          chainId: avalanche.id,
        });
      }
    } catch (error: any) {
      console.error("Error in approveAndSwap:", error);
      setError(error?.message || "Transaction failed");
      setIsApproving(false);
      setPendingSwap(false);
    }
  };

  // Handle errors from writeContract hooks
  useEffect(() => {
    if (approveError) {
      setError(approveError.message || "Approval failed");
      setIsApproving(false);
      setPendingSwap(false);
    }
  }, [approveError]);

  useEffect(() => {
    if (swapError) {
      setError(swapError.message || "Swap failed");
    }
  }, [swapError]);

  // Clear error on success
  useEffect(() => {
    if (isSuccess) {
      setError(null);
    }
  }, [isSuccess]);

  // Pool/liquidity helpers
  // Check if pool exists by verifying poolInfo has valid data (token0 and token1 addresses)
  const poolExists =
    poolInfo !== undefined &&
    poolInfo !== null &&
    (poolInfo as any)[0] &&
    (poolInfo as any)[1];
  const hasLiquidity =
    poolExists &&
    (poolInfo as any)[2] > BigInt(0) &&
    (poolInfo as any)[3] > BigInt(0);

  // Record transaction in store
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  useEffect(() => {
    if (isSuccess && swapHash && address) {
      addTransaction({
        type: "SWAP",
        fromToken: tokenIn,
        toToken: tokenOut,
        fromAmount: parseFloat(amountIn) || 0,
        toAmount: parseFloat(estimatedOutput) || 0,
        txHash: swapHash,
        walletAddress: address,
        timestamp: Date.now(),
        source: "dex-swap",
        dex: "OmeSwap Pools",
      });
    }
  }, [isSuccess, swapHash]);

  // Refetch data after transaction
  useEffect(() => {
    if (isSuccess) {
      console.log("Transaction successful, refetching data...");
      refetchBalance();
      refetchAllowance();
      setIsApproving(false);
      setPendingSwap(false);
      setError(null);
      // Don't clear amountIn, keep it so user can see the result
    }
  }, [isSuccess, refetchBalance, refetchAllowance]);

  return {
    tokenIn,
    setTokenIn,
    tokenOut,
    setTokenOut,
    amountIn,
    setAmountIn,
    slippage,
    setSlippage,
    estimatedOutput: estimatedOutput || "0",
    balance: balance ? formatEther(balance as bigint) : "0",
    hasLiquidity,
    poolExists,
    needsApproval: needsApproval(),
    approveAndSwap,
    isLoading: isApprovePending || isSwapPending || isConfirming || isApproving,
    isSuccess,
    hash,
    error,
  };
}
