"use client";

import { useReadContract } from "wagmi";
import { formatEther, Address } from "viem";
import { CONTRACT_ADDRESSES, TOKENS } from "@/contracts/config";
import { MultiTokenLiquidityPoolsABI } from "@/contracts/abis";
import { avalanche } from '@/lib/chains/avalanche';
import { Droplet, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SelectedPoolInfoProps {
  token0Symbol: string;
  token1Symbol: string;
}

export function SelectedPoolInfo({ token0Symbol, token1Symbol }: SelectedPoolInfoProps) {
  const token0 = TOKENS[token0Symbol];
  const token1 = TOKENS[token1Symbol];

  // Get pool ID
  const token0Addr = token0.address.toLowerCase() < token1.address.toLowerCase() 
    ? token0.address as Address 
    : token1.address as Address;
  const token1Addr = token0.address.toLowerCase() < token1.address.toLowerCase() 
    ? token1.address as Address 
    : token0.address as Address;

  const { data: poolId } = useReadContract({
    address: CONTRACT_ADDRESSES.POOLS as Address,
    abi: MultiTokenLiquidityPoolsABI,
    functionName: 'getPoolId',
    args: [token0Addr, token1Addr],
    chainId: avalanche.id,
  });

  const { data: poolInfo } = useReadContract({
    address: CONTRACT_ADDRESSES.POOLS as Address,
    abi: MultiTokenLiquidityPoolsABI,
    functionName: 'getPoolInfo',
    args: [poolId as bigint],
    chainId: avalanche.id,
    query: {
      enabled: poolId !== undefined,
    },
  });

  // Extract pool data
  const reserve0 = poolInfo ? parseFloat(formatEther((poolInfo as any)[2] || BigInt(0))) : 0;
  const reserve1 = poolInfo ? parseFloat(formatEther((poolInfo as any)[3] || BigInt(0))) : 0;
  const totalSupply = poolInfo ? formatEther((poolInfo as any)[4] || BigInt(0)) : '0';
  
  const total = reserve0 + reserve1 || 1;
  const token0Percent = (reserve0 / total) * 100;
  const token1Percent = (reserve1 / total) * 100;
  const tvl = reserve0 + reserve1;

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold mb-1">
            {token0Symbol} / {token1Symbol}
          </h3>
          <p className="text-sm text-muted-foreground">Pool Information</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Droplet className="w-5 h-5 text-primary" />
        </div>
      </div>

      {/* TVL */}
      <div className="mb-6 p-4 bg-gradient-to-br from-primary/5 to-transparent rounded-xl border border-primary/10">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Total Value Locked</span>
        </div>
        <div className="text-3xl font-bold">
          ${tvl >= 1000 ? (tvl / 1000).toFixed(2) + 'K' : tvl.toFixed(2)}
        </div>
      </div>

      {/* Reserves */}
      <div className="space-y-4 mb-6">
        <div>
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="font-medium">{token0Symbol}</span>
            <span className="text-muted-foreground">{token0Percent.toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between mb-1 text-xs text-muted-foreground">
            <span>Reserve</span>
            <span className="font-mono">{reserve0.toFixed(2)}</span>
          </div>
          <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-300"
              style={{ width: `${token0Percent}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="font-medium">{token1Symbol}</span>
            <span className="text-muted-foreground">{token1Percent.toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between mb-1 text-xs text-muted-foreground">
            <span>Reserve</span>
            <span className="font-mono">{reserve1.toFixed(2)}</span>
          </div>
          <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-success to-success/60 transition-all duration-300"
              style={{ width: `${token1Percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="pt-4 border-t border-border space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Pool ID</span>
          <span className="font-mono font-medium">#{poolId != null ? poolId.toString() : '-'}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">LP Tokens</span>
          <span className="font-mono font-medium">{parseFloat(totalSupply).toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Fee Tier</span>
          <span className="font-medium">0.3%</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Status</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="font-medium text-success">Active</span>
          </span>
        </div>
      </div>
    </Card>
  );
}

