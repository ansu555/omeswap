'use client';

import { useState, useEffect } from 'react';
import { useReadContract, usePublicClient } from 'wagmi';
import { formatEther, Address } from 'viem';
import { CONTRACT_ADDRESSES, TOKENS } from '@/contracts/config';
import { MultiTokenLiquidityPoolsABI } from '@/contracts/abis';
import { avalanche } from '@/lib/chains/avalanche';

export interface DexPool {
  id: string;
  poolId: number;
  token0: {
    symbol: string;
    name: string;
    address: string;
  };
  token1: {
    symbol: string;
    name: string;
    address: string;
  };
  reserve0: string;
  reserve1: string;
  totalSupply: string;
  tvl: number;
  volume24h: number;
  volume7d: number;
  apr: number;
}

// Define all known pool pairs from deployment
const POOL_PAIRS = [
  { token0: 'USDC',  token1: 'USDTe' },
  { token0: 'WETHe', token1: 'USDC'  },
  { token0: 'WBTCe', token1: 'WETHe' },
  { token0: 'DAIe',  token1: 'USDC'  },
  { token0: 'LINKe', token1: 'WETHe' },
  { token0: 'JOE',   token1: 'WETHe' },
  { token0: 'AAVEe', token1: 'WETHe' },
  { token0: 'PNG',   token1: 'DAIe'  },
  { token0: 'WBTCe', token1: 'USDC'  },
  { token0: 'WAVAX', token1: 'USDC'  },
];

export function useDexPools() {
  const [pools, setPools] = useState<DexPool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const publicClient = usePublicClient({ chainId: avalanche.id });

  // Get pool count
  const { data: poolCount } = useReadContract({
    address: CONTRACT_ADDRESSES.POOLS as Address,
    abi: MultiTokenLiquidityPoolsABI,
    functionName: 'poolCount',
    chainId: avalanche.id,
  });

  useEffect(() => {
    async function fetchPools() {
      if (!publicClient) return;
      
      setIsLoading(true);
      const poolsData: DexPool[] = [];

      try {
        for (let i = 0; i < POOL_PAIRS.length; i++) {
          const pair = POOL_PAIRS[i];
          const token0 = TOKENS[pair.token0];
          const token1 = TOKENS[pair.token1];

          try {
            // Get pool info directly
            const poolInfo = await publicClient.readContract({
              address: CONTRACT_ADDRESSES.POOLS as Address,
              abi: MultiTokenLiquidityPoolsABI,
              functionName: 'getPoolInfo',
              args: [BigInt(i)],
            });

            if (poolInfo) {
              const reserve0 = formatEther((poolInfo as any)[2] || BigInt(0));
              const reserve1 = formatEther((poolInfo as any)[3] || BigInt(0));
              const totalSupply = formatEther((poolInfo as any)[4] || BigInt(0));
              
              const reserve0Num = parseFloat(reserve0);
              const reserve1Num = parseFloat(reserve1);
              const tvl = reserve0Num + reserve1Num;

              // Only add pools with liquidity
              if (tvl > 0.01) {
                // Mock volume and APR (would need event tracking for real data)
                const volume24h = tvl * (0.05 + Math.random() * 0.15); // 5-20% of TVL
                const volume7d = volume24h * 7;
                const apr = tvl > 0 ? 10 + Math.random() * 30 : 0; // 10-40% APR

                poolsData.push({
                  id: `pool-${i}`,
                  poolId: i,
                  token0: {
                    symbol: token0.symbol,
                    name: token0.name,
                    address: token0.address,
                  },
                  token1: {
                    symbol: token1.symbol,
                    name: token1.name,
                    address: token1.address,
                  },
                  reserve0,
                  reserve1,
                  totalSupply,
                  tvl,
                  volume24h,
                  volume7d,
                  apr,
                });
              }
            }
          } catch (error) {
            console.error(`Error fetching pool ${i}:`, error);
          }
        }

        setPools(poolsData);
      } catch (error) {
        console.error('Error fetching pools:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPools();
  }, [publicClient]);

  return {
    pools,
    poolCount: poolCount ? Number(poolCount) : 0,
    isLoading,
  };
}

