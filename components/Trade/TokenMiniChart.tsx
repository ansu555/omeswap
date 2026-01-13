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
    <div className="glass-card rounded-lg border border-border p-3 hover:border-primary/50 transition-colors group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all duration-300 group-hover:scale-105 ${
              variant === "algo"
                ? "bg-gradient-to-br from-primary/20 to-primary/5 text-primary border border-primary/20"
                : "bg-gradient-to-br from-success/20 to-success/5 text-success border border-success/20"
            }`}
          >
            {symbol.slice(0, 2)}
          </div>
          <div>
            <div className="font-semibold text-sm">{price}</div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
              {name}
              <span
                className={`flex items-center gap-0.5 text-[10px] font-medium ${
                  isPositive ? "text-success" : "text-destructive"
                }`}
              >
                <TrendingUp className={`w-2.5 h-2.5 ${isPositive ? "" : "rotate-180"}`} />
                {Math.abs(parseFloat(priceChange))}%
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold">{reserve.toFixed(2)}</div>
          <div className="text-[10px] text-muted-foreground">Reserve</div>
        </div>
      </div>

      {/* Area Chart */}
      <ChartContainer config={chartConfig} className="h-[50px] w-full mb-2">
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
          <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
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
            strokeWidth={1.5}
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

      <button className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-all hover:gap-1.5 group/btn">
        Open Details
        <ExternalLink className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
      </button>
    </div>
  );
}
