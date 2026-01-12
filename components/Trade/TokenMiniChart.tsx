"use client";

import { ExternalLink, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface TokenMiniChartProps {
  symbol: string;
  name: string;
  price: string;
  reserve: number;
  variant: "algo" | "usdc";
}

export function TokenMiniChart({ symbol, name, price, reserve, variant }: TokenMiniChartProps) {
  // Generate mock chart data with timestamps
  const chartData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    value: Math.random() * 5000 + 20000,
  }));

  const chartConfig = {
    value: {
      label: "Price",
      color: variant === "algo" ? "hsl(262, 83%, 58%)" : "hsl(164, 80%, 40%)",
    },
  } satisfies ChartConfig;

  const priceChange = ((Math.random() - 0.5) * 10).toFixed(2);
  const isPositive = parseFloat(priceChange) > 0;

  return (
    <div className="token-chart-card group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 group-hover:scale-110 ${
              variant === "algo"
                ? "bg-gradient-to-br from-primary/20 to-primary/5 text-primary border border-primary/20"
                : "bg-gradient-to-br from-success/20 to-success/5 text-success border border-success/20"
            }`}
          >
            {symbol.slice(0, 2)}
          </div>
          <div>
            <div className="font-semibold text-lg">{price}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              {name}
              <span
                className={`flex items-center gap-0.5 text-xs font-medium ${
                  isPositive ? "text-success" : "text-destructive"
                }`}
              >
                <TrendingUp className={`w-3 h-3 ${isPositive ? "" : "rotate-180"}`} />
                {Math.abs(parseFloat(priceChange))}%
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold">{reserve.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">Reserve</div>
        </div>
      </div>

      {/* Area Chart */}
      <ChartContainer config={chartConfig} className="h-[80px] w-full mb-3">
        <AreaChart
          accessibilityLayer
          data={chartData}
          margin={{
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="hour"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            hide
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <Area
            dataKey="value"
            type="monotone"
            fill={`url(#fill${variant})`}
            fillOpacity={0.4}
            stroke={chartConfig.value.color}
            strokeWidth={2}
          />
          <defs>
            <linearGradient id={`fill${variant}`} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={chartConfig.value.color}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={chartConfig.value.color}
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
        </AreaChart>
      </ChartContainer>

      <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-all hover:gap-2 group/btn">
        Open Details
        <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
      </button>
    </div>
  );
}
