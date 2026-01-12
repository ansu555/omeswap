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
    <div className="glass-card rounded-2xl border border-border p-6">
      <div className="mb-1">
        <h3 className="text-destructive font-semibold">Pool Liquidity</h3>
        <p className="text-sm text-muted-foreground">TINYMAN</p>
      </div>

      {/* Reserve Visualization */}
      <div className="my-6 space-y-3">
        <div className="relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            ALGO
          </div>
          <div className="ml-14 h-14 rounded-lg overflow-hidden border border-dashed border-muted">
            <div
              className="reserve-bar reserve-bar-algo h-full"
              style={{ width: `${algoPercent}%` }}
            />
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            USDC
          </div>
          <div className="ml-14 h-14 rounded-lg overflow-hidden border border-dashed border-muted">
            <div
              className="reserve-bar reserve-bar-usdc h-full"
              style={{ width: `${usdcPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">ALGO</p>
          <p className="text-xl font-semibold">{algoReserve.toFixed(4)}</p>
          <p className="text-xs text-muted-foreground">Reserve</p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">USDC</p>
          <p className="text-xl font-semibold">{usdcReserve.toFixed(4)}</p>
          <p className="text-xs text-muted-foreground">Reserve</p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Liquidity</p>
          <p className="text-xl font-semibold">{totalLiquidity}</p>
          <p className="text-xs text-muted-foreground">Raw units reported by pool</p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Last Updated</p>
          <p className="text-xl font-semibold">{lastUpdated}</p>
          <p className="text-xs text-muted-foreground">Pool snapshot timestamp</p>
        </div>
      </div>
    </div>
  );
}
