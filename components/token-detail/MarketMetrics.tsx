"use client";

interface MetricItemProps {
  label: string;
  value: string;
  change?: number;
  subLabel?: string;
  subValue?: string;
}

function MetricItem({ label, value, change, subLabel, subValue }: MetricItemProps) {
  return (
    <div className="space-y-1">
      <span className="metric-label">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="metric-value text-xl">{value}</span>
        {change !== undefined && (
          <span className={change >= 0 ? "metric-change-positive" : "metric-change-negative"}>
            {change >= 0 ? "+" : ""}{change.toFixed(2)}%
          </span>
        )}
      </div>
      {subLabel && subValue && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{subLabel}</span>
          <span className="text-foreground font-mono">{subValue}</span>
        </div>
      )}
    </div>
  );
}

interface MarketMetricsProps {
  price?: string;
  priceChange?: number;
  marketCap?: string;
  volume24h?: string;
  volumeChange?: number;
  circulatingSupply?: string;
  maxSupply?: string;
  liquidityRatio?: number;
}

export function MarketMetrics({
  price = "$91,937.00",
  priceChange = 1.51,
  marketCap = "$1.84T",
  volume24h = "$45.04B",
  volumeChange = 109.75,
  circulatingSupply = "19.98 M",
  maxSupply = "21.00 M",
  liquidityRatio = 95,
}: MarketMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="dashboard-card space-y-6">
        <MetricItem
          label="Token price"
          value={price}
          change={priceChange}
        />
        <MetricItem
          label="Market cap"
          value={marketCap}
        />
        <div>
          <span className="metric-label">Volume by exchange type (24h)</span>
          <div className="flex justify-between mt-2">
            <div>
              <span className="text-muted-foreground text-sm">CEX</span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-foreground">{volume24h}</span>
                <span className="metric-change-positive">+{volumeChange.toFixed(2)}%</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground text-sm">DEX</span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-foreground">$0.00</span>
                <span className="text-muted-foreground text-sm">0.00%</span>
              </div>
            </div>
          </div>
          <div className="flex gap-0.5 mt-2">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-2 rounded-sm bg-primary"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-card space-y-6">
        <MetricItem
          label="Volume 24h"
          value={volume24h}
          change={volumeChange}
        />
        <div className="bg-secondary/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Liquidity ratio</span>
            <span className="font-mono text-primary">{liquidityRatio}%</span>
          </div>
          <div className="text-right text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Circulating supply:</span>
              <span className="font-mono text-foreground">{circulatingSupply}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max supply:</span>
              <span className="font-mono text-foreground">{maxSupply}</span>
            </div>
          </div>
          <div className="flex gap-0.5 mt-3">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-sm ${i < Math.round(liquidityRatio / 3.33) ? "bg-success" : "bg-muted"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
