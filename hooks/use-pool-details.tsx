'use client';

import { useState, useEffect } from 'react';
import { useReadContract, usePublicClient, useBlockNumber } from 'wagmi';
import { formatEther, Address, parseAbiItem } from 'viem';
import { CONTRACT_ADDRESSES, TOKENS } from '@/contracts/config';
import { MultiTokenLiquidityPoolsABI } from '@/contracts/abis';
import { avalanche } from '@/lib/chains/avalanche';

export interface PoolTransaction {
  time: string;
  type: 'Swap' | 'Add' | 'Remove';
  token0Amount: string;
  token1Amount: string;
  wallet: string;
  txHash: string;
  timestamp: number;
}

export function usePoolDetails(poolId: number, token0Symbol: string, _token1Symbol: string) {
  const [transactions, setTransactions] = useState<PoolTransaction[]>([]);
  const [isLoadingTxs, setIsLoadingTxs] = useState(false);
  const publicClient = usePublicClient({ chainId: avalanche.id });
  const { data: currentBlock } = useBlockNumber({ chainId: avalanche.id });

  const token0 = TOKENS[token0Symbol];

  // Get pool info
  const { data: poolInfo, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.POOLS as Address,
    abi: MultiTokenLiquidityPoolsABI,
    functionName: 'getPoolInfo',
    args: [BigInt(poolId)],
    chainId: avalanche.id,
  });

  // Parse pool data
  const reserve0 = poolInfo ? formatEther((poolInfo as any)[2] || BigInt(0)) : '0';
  const reserve1 = poolInfo ? formatEther((poolInfo as any)[3] || BigInt(0)) : '0';
  const totalSupply = poolInfo ? formatEther((poolInfo as any)[4] || BigInt(0)) : '0';
  
  const reserve0Num = parseFloat(reserve0);
  const reserve1Num = parseFloat(reserve1);
  const tvl = reserve0Num + reserve1Num;

  // Fetch transactions from blockchain events
  useEffect(() => {
    async function fetchTransactions() {
      if (!publicClient || !currentBlock) return;
      
      setIsLoadingTxs(true);
      try {
        const fromBlock = currentBlock - BigInt(10000); // Last ~10k blocks
        const poolIdBigInt = BigInt(poolId);

        // Fetch Swap events
        const swapEvents = await publicClient.getLogs({
          address: CONTRACT_ADDRESSES.POOLS as Address,
          event: parseAbiItem('event Swap(uint256 indexed poolId, address indexed user, address tokenIn, uint256 amountIn, uint256 amountOut)'),
          args: {
            poolId: poolIdBigInt,
          },
          fromBlock,
        });

        // Fetch LiquidityAdded events
        const addEvents = await publicClient.getLogs({
          address: CONTRACT_ADDRESSES.POOLS as Address,
          event: parseAbiItem('event LiquidityAdded(uint256 indexed poolId, address indexed provider, uint256 amount0, uint256 amount1, uint256 lpTokens)'),
          args: {
            poolId: poolIdBigInt,
          },
          fromBlock,
        });

        // Fetch LiquidityRemoved events
        const removeEvents = await publicClient.getLogs({
          address: CONTRACT_ADDRESSES.POOLS as Address,
          event: parseAbiItem('event LiquidityRemoved(uint256 indexed poolId, address indexed provider, uint256 amount0, uint256 amount1, uint256 lpTokens)'),
          args: {
            poolId: poolIdBigInt,
          },
          fromBlock,
        });

        // Process Swap events
        const swapTxs: PoolTransaction[] = await Promise.all(
          swapEvents.map(async (event) => {
            const block = await publicClient.getBlock({ blockNumber: event.blockNumber });
            const timestamp = Number(block.timestamp) * 1000;
            const tokenIn = event.args.tokenIn as Address;
            const amountIn = formatEther(event.args.amountIn || BigInt(0));
            const amountOut = formatEther(event.args.amountOut || BigInt(0));
            
            const isToken0In = tokenIn.toLowerCase() === token0.address.toLowerCase();
            const token0Amount = isToken0In ? amountIn : amountOut;
            const token1Amount = isToken0In ? amountOut : amountIn;

            return {
              time: new Date(timestamp).toLocaleString(),
              type: 'Swap' as const,
              token0Amount,
              token1Amount,
              wallet: (event.args.user as Address) || event.transactionHash.slice(0, 42),
              txHash: event.transactionHash,
              timestamp,
            };
          })
        );

        // Process Add events
        const addTxs: PoolTransaction[] = await Promise.all(
          addEvents.map(async (event) => {
            const block = await publicClient.getBlock({ blockNumber: event.blockNumber });
            const timestamp = Number(block.timestamp) * 1000;
            
            return {
              time: new Date(timestamp).toLocaleString(),
              type: 'Add' as const,
              token0Amount: formatEther(event.args.amount0 || BigInt(0)),
              token1Amount: formatEther(event.args.amount1 || BigInt(0)),
              wallet: (event.args.provider as Address) || event.transactionHash.slice(0, 42),
              txHash: event.transactionHash,
              timestamp,
            };
          })
        );

        // Process Remove events
        const removeTxs: PoolTransaction[] = await Promise.all(
          removeEvents.map(async (event) => {
            const block = await publicClient.getBlock({ blockNumber: event.blockNumber });
            const timestamp = Number(block.timestamp) * 1000;
            
            return {
              time: new Date(timestamp).toLocaleString(),
              type: 'Remove' as const,
              token0Amount: formatEther(event.args.amount0 || BigInt(0)),
              token1Amount: formatEther(event.args.amount1 || BigInt(0)),
              wallet: (event.args.provider as Address) || event.transactionHash.slice(0, 42),
              txHash: event.transactionHash,
              timestamp,
            };
          })
        );

        // Combine and sort by timestamp (newest first)
        const allTxs = [...swapTxs, ...addTxs, ...removeTxs].sort((a, b) => b.timestamp - a.timestamp);
        setTransactions(allTxs);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoadingTxs(false);
      }
    }

    fetchTransactions();
  }, [publicClient, currentBlock, poolId]);

  // Calculate metrics from transactions
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  
  const swapTxs24h = transactions.filter(tx => tx.type === 'Swap' && tx.timestamp > oneDayAgo);
  const volume24h = swapTxs24h.reduce((sum, tx) => {
    // Volume is the sum of both token amounts for swaps
    return sum + parseFloat(tx.token0Amount) + parseFloat(tx.token1Amount);
  }, 0) / 2; // Divide by 2 to avoid double counting

  const volume24hToken0 = swapTxs24h.reduce((sum, tx) => sum + parseFloat(tx.token0Amount), 0);
  const volume24hToken1 = swapTxs24h.reduce((sum, tx) => sum + parseFloat(tx.token1Amount), 0);

  const fees24h = volume24h * 0.003; // 0.3% fee
  const baseAPR = tvl > 0 ? (fees24h * 365 / tvl) * 100 : 0;

  return {
    poolInfo: {
      reserve0,
      reserve1,
      totalSupply,
      tvl,
      volume24h,
      volume24hToken0,
      volume24hToken1,
      fees24h,
      baseAPR,
    },
    transactions,
    isLoadingTxs,
    refetch,
  };
}
