"use client";

import { Droplet, Clock, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useReadContract } from "wagmi";
import { CONTRACT_ADDRESSES, TOKENS } from "@/contracts/config";
import { MultiTokenLiquidityPoolsABI } from "@/contracts/abis";
import { mantleTestnet } from "@/lib/chains/mantle";
import { formatEther, Address } from "viem";

export function PoolLiquidity() {
  // Get pool info for tUSDC/tUSDT pool
  const { data: poolId } = useReadContract({
    address: CONTRACT_ADDRESSES.POOLS as Address,
    abi: MultiTokenLiquidityPoolsABI,
    functionName: 'getPoolId',
    args: [TOKENS.tUSDC.address as Address, TOKENS.tUSDT.address as Address],
    chainId: mantleTestnet.id,
  });

  const { data: poolInfo } = useReadContract({
    address: CONTRACT_ADDRESSES.POOLS as Address,
    abi: MultiTokenLiquidityPoolsABI,
    functionName: 'getPoolInfo',
    args: [poolId as bigint],
    chainId: mantleTestnet.id,
    query: {
      enabled: !!poolId,
    },
  });

  // Extract pool data with fallbacks
  const token0Reserve = poolInfo ? parseFloat(formatEther((poolInfo as any)[2] || BigInt(0))) : 0;
  const token1Reserve = poolInfo ? parseFloat(formatEther((poolInfo as any)[3] || BigInt(0))) : 0;
  const totalSupply = poolInfo ? formatEther((poolInfo as any)[4] || BigInt(0)) : '0';

  const total = token0Reserve + token1Reserve || 1; // Prevent division by zero
  const token0Percent = (token0Reserve / total) * 100;
  const token1Percent = (token1Reserve / total) * 100;

  return (
    <div className="glass-card rounded-2xl border border-border p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
            <Droplet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Pool Liquidity</h3>
            <Badge variant="outline" className="text-xs mt-1">
              tUSDC/tUSDT
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Droplet className="w-4 h-4" />
          <span className="font-medium">Live</span>
        </div>
      </div>

      {/* Reserve Visualization */}
      <div className="space-y-4 mb-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-primary/60" />
              <span className="font-medium">tUSDC</span>
            </div>
            <span className="text-muted-foreground">{token0Percent.toFixed(1)}%</span>
          </div>
          <div className="relative h-3 rounded-full bg-muted/50 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500 ease-out group-hover:from-primary group-hover:to-primary"
              style={{ width: `${token0Percent}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-success to-success/60" />
              <span className="font-medium">tUSDT</span>
            </div>
            <span className="text-muted-foreground">{token1Percent.toFixed(1)}%</span>
          </div>
          <div className="relative h-3 rounded-full bg-muted/50 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-success to-success/60 rounded-full transition-all duration-500 ease-out group-hover:from-success group-hover:to-success"
              style={{ width: `${token1Percent}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-primary/5 to-primary/[0.02] rounded-xl p-4 border border-primary/10 hover:border-primary/20 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              tUSDC
            </p>
          </div>
          <p className="text-2xl font-bold mb-1">{token0Reserve.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Reserve Balance</p>
        </div>

        <div className="bg-gradient-to-br from-success/5 to-success/[0.02] rounded-xl p-4 border border-success/10 hover:border-success/20 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-success" />
            </div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              tUSDT
            </p>
          </div>
          <p className="text-2xl font-bold mb-1">{token1Reserve.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Reserve Balance</p>
        </div>

        <div className="bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl p-4 border border-border hover:border-primary/20 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Droplet className="w-4 h-4 text-primary" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total LP Tokens
            </p>
          </div>
          <p className="text-xl font-bold mb-1">{parseFloat(totalSupply).toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Pool Supply</p>
        </div>

        <div className="bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl p-4 border border-border hover:border-primary/20 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-primary" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Status
            </p>
          </div>
          <p className="text-xl font-bold mb-1">{poolInfo ? "Active" : "Loading..."}</p>
          <p className="text-xs text-muted-foreground">Pool Status</p>
        </div>
      </div>
    </div>
  );
}
