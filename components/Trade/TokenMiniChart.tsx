import { ExternalLink } from "lucide-react";

interface TokenMiniChartProps {
  symbol: string;
  name: string;
  price: string;
  reserve: number;
  variant: "algo" | "usdc";
}

export function TokenMiniChart({ symbol, name, price, reserve, variant }: TokenMiniChartProps) {
  // Generate mock bar chart data
  const bars = Array.from({ length: 24 }, () => Math.random() * 100 + 20);

  return (
    <div className="token-chart-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              variant === "algo"
                ? "bg-token-algo/20 text-token-algo"
                : "bg-token-usdc/20 text-token-usdc"
            }`}
          >
            {symbol.slice(0, 2)}
          </div>
          <div>
            <div className="font-semibold">{price}</div>
            <div className="text-xs text-muted-foreground">{name}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">{reserve.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">Reserve</div>
        </div>
      </div>

      {/* Mini Bar Chart */}
      <div className="flex items-end gap-0.5 h-10 mb-3">
        {bars.map((height, i) => (
          <div
            key={i}
            className={`flex-1 rounded-t-sm transition-all duration-200 ${
              variant === "algo" ? "bg-token-algo/60" : "bg-token-usdc/60"
            }`}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>

      <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        Open Page
        <ExternalLink className="w-3 h-3" />
      </button>
    </div>
  );
}
