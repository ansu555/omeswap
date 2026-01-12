"use client";

import { Droplet, TrendingUp, Clock, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PoolLiquidityProps {
  algoReserve: number;
  usdcReserve: number;
  totalLiquidity: string;
  lastUpdated: string;
}

export function PoolLiquidity({
  algoReserve,
  usdcReserve,
  totalLiquidity,
  lastUpdated,
}: PoolLiquidityProps) {
  const total = algoReserve + usdcReserve;
  const algoPercent = (algoReserve / total) * 100;
  const usdcPercent = (usdcReserve / total) * 100;

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
              TINYMAN
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-success">
          <TrendingUp className="w-4 h-4" />
          <span className="font-medium">+2.4%</span>
        </div>
      </div>

      {/* Reserve Visualization */}
      <div className="space-y-4 mb-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-primary/60" />
              <span className="font-medium">ALGO</span>
            </div>
            <span className="text-muted-foreground">{algoPercent.toFixed(1)}%</span>
          </div>
          <div className="relative h-3 rounded-full bg-muted/50 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500 ease-out group-hover:from-primary group-hover:to-primary"
              style={{ width: `${algoPercent}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-success to-success/60" />
              <span className="font-medium">USDC</span>
            </div>
            <span className="text-muted-foreground">{usdcPercent.toFixed(1)}%</span>
          </div>
          <div className="relative h-3 rounded-full bg-muted/50 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-success to-success/60 rounded-full transition-all duration-500 ease-out group-hover:from-success group-hover:to-success"
              style={{ width: `${usdcPercent}%` }}
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
              ALGO
            </p>
          </div>
          <p className="text-2xl font-bold mb-1">{algoReserve.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Reserve Balance</p>
        </div>

        <div className="bg-gradient-to-br from-success/5 to-success/[0.02] rounded-xl p-4 border border-success/10 hover:border-success/20 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-success" />
            </div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              USDC
            </p>
          </div>
          <p className="text-2xl font-bold mb-1">{usdcReserve.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Reserve Balance</p>
        </div>

        <div className="bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl p-4 border border-border hover:border-primary/20 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Droplet className="w-4 h-4 text-primary" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total Liquidity
            </p>
          </div>
          <p className="text-xl font-bold mb-1">{totalLiquidity}</p>
          <p className="text-xs text-muted-foreground">Pool Units</p>
        </div>

        <div className="bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl p-4 border border-border hover:border-primary/20 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-primary" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Updated
            </p>
          </div>
          <p className="text-xl font-bold mb-1">{lastUpdated}</p>
          <p className="text-xs text-muted-foreground">Last Snapshot</p>
        </div>
      </div>
    </div>
  );
}
