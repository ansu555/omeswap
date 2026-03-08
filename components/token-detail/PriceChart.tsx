"use client";

import { useState, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PriceChartProps {
  basePrice?: number;
  priceChange24h?: number;
}

const generateChartData = (days: number, basePrice: number = 85000) => {
  const data = [];
  let price = basePrice;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const volatility = basePrice * 0.03;

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    price = price + (Math.random() - 0.48) * volatility;
    price = Math.max(basePrice * 0.7, Math.min(basePrice * 1.5, price));
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      price: price,
    });
  }
  return data;
};

const timeframes = [
  { id: "24h", label: "24h", days: 1 },
  { id: "7d", label: "7d", days: 7 },
  { id: "1m", label: "1m", days: 30 },
  { id: "3m", label: "3m", days: 90 },
  { id: "1y", label: "1y", days: 365 },
  { id: "max", label: "Max", days: 730 },
];

const chartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function PriceChart({ basePrice = 85000, priceChange24h = 0 }: PriceChartProps) {
  const [activeTimeframe, setActiveTimeframe] = useState("1y");
  const days = timeframes.find((t) => t.id === activeTimeframe)?.days || 365;

  const data = useMemo(() => generateChartData(days, basePrice), [days, basePrice]);

  const formatPrice = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value.toFixed(2)}`;
  };

  // Calculate price change amount
  const priceChangeAmount = (basePrice * priceChange24h) / 100;
  const isPositive = priceChange24h >= 0;

  // Format current date/time
  const currentDateTime = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Format display price
  const displayPrice = basePrice >= 1000
    ? `$${basePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : basePrice >= 1
    ? `$${basePrice.toFixed(2)}`
    : `$${basePrice.toFixed(4)}`;

  // Format change amount
  const displayChangeAmount = Math.abs(priceChangeAmount) >= 1
    ? `$${Math.abs(priceChangeAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `$${Math.abs(priceChangeAmount).toFixed(4)}`;

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header flex-col items-start gap-2 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            {displayPrice}
          </h2>
          <div className="flex items-center gap-2 text-sm">
            <span className={cn(
              "flex items-center gap-1 font-medium",
              isPositive ? "text-green-500" : "text-red-500"
            )}>
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {displayChangeAmount} ({isPositive ? "+" : ""}{priceChange24h.toFixed(2)}%)
            </span>
            <span className="text-muted-foreground">{currentDateTime}</span>
          </div>
        </div>
        <div className="flex gap-1 bg-secondary/50 p-1 rounded-lg">
          {timeframes.map((tf) => (
            <button
              key={tf.id}
              onClick={() => setActiveTimeframe(tf.id)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                activeTimeframe === tf.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-price)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-price)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tickMargin={8}
            interval="preserveStartEnd"
            minTickGap={50}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickMargin={8}
            tickFormatter={formatPrice}
            domain={["auto", "auto"]}
            orientation="right"
            width={60}
          />
          <ChartTooltip
            cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 }}
            content={
              <ChartTooltipContent
                labelFormatter={(label) => label}
                formatter={(value, name) => (
                  <div className="flex min-w-[120px] items-center justify-between gap-4">
                    <span className="text-muted-foreground">
                      {chartConfig[name as keyof typeof chartConfig]?.label || name}
                    </span>
                    <span className="font-mono font-medium tabular-nums text-foreground">
                      ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              />
            }
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="var(--color-price)"
            strokeWidth={2}
            fill="url(#priceGradient)"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
