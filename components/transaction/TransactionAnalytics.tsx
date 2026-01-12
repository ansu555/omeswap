import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Activity, Clock, Calculator } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis } from "recharts";

interface TransactionAnalyticsProps {
  totalVolume: number;
  totalTransactions: number;
  last24hTransactions: number;
  avgTransaction: number;
}

// Mock chart data
const chartData = [
  { date: "Nov 11", volume: 15 },
  { date: "Nov 12", volume: 25 },
  { date: "Nov 13", volume: 40 },
  { date: "Nov 14", volume: 55 },
  { date: "Nov 15", volume: 85 },
  { date: "Nov 16", volume: 120 },
  { date: "Nov 20", volume: 165 },
  { date: "Nov 28", volume: 90 },
  { date: "Dec 4", volume: 45 },
  { date: "Dec 5", volume: 30 },
];

const chartConfig = {
  volume: {
    label: "Volume",
    color: "hsl(var(--primary))",
  },
};

export const TransactionAnalytics = ({
  totalVolume,
  totalTransactions,
  last24hTransactions,
  avgTransaction,
}: TransactionAnalyticsProps) => {
  const stats = [
    {
      label: "Total Volume",
      value: `${totalVolume.toFixed(2)} ALGO`,
      subValue: `≈ $${(totalVolume * 0.13).toFixed(2)} USD`,
      icon: TrendingUp,
      delay: "0ms",
    },
    {
      label: "Total Transactions",
      value: totalTransactions.toString(),
      subValue: "All-time on this site",
      icon: Activity,
      delay: "50ms",
    },
    {
      label: "24h Transactions",
      value: last24hTransactions.toString(),
      subValue: "Last 24 hours",
      icon: Clock,
      delay: "100ms",
    },
    {
      label: "Avg Transaction",
      value: `${avgTransaction.toFixed(2)} ALGO`,
      subValue: "Per transaction",
      icon: Calculator,
      delay: "150ms",
    },
  ];

  return (
    <Card className="mb-6 glass-card bg-card/50 animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Transaction Analytics</h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="p-4 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/30 transition-all duration-300"
              style={{ animationDelay: stat.delay }}
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.subValue}</p>
            </div>
          ))}
        </div>

        {/* Volume Chart */}
        <div className="mt-6">
          <p className="text-sm text-muted-foreground mb-4">
            Transaction Volume (Last 14 Days)
          </p>
          <ChartContainer config={chartConfig} className="h-48 w-full">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-volume)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-volume)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                width={35}
              />
              <ChartTooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="var(--color-volume)"
                strokeWidth={2}
                fill="url(#volumeGradient)"
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};
