"use client";

import { useEffect, useMemo, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Activity, Clock, Calculator, LucideIcon } from "lucide-react";
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

// Mock chart data for the bottom volume chart
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

// Generate smooth SVG path for sparkline
const generateSmoothPath = (points: number[], width: number, height: number): string => {
  if (!points || points.length < 2) {
    return `M 0 ${height}`;
  }

  const xStep = width / (points.length - 1);
  const maxPoint = Math.max(...points);
  const minPoint = Math.min(...points);
  const range = maxPoint - minPoint || 1;

  const pathData = points.map((point, i) => {
    const x = i * xStep;
    const normalized = ((point - minPoint) / range) * 100;
    const y = height - (normalized / 100) * (height * 0.8) - (height * 0.1);
    return [x, y];
  });

  let path = `M ${pathData[0][0]} ${pathData[0][1]}`;

  for (let i = 0; i < pathData.length - 1; i++) {
    const x1 = pathData[i][0];
    const y1 = pathData[i][1];
    const x2 = pathData[i + 1][0];
    const y2 = pathData[i + 1][1];
    const midX = (x1 + x2) / 2;
    path += ` C ${midX},${y1} ${midX},${y2} ${x2},${y2}`;
  }

  return path;
};

// Mini sparkline component for stat cards
interface MiniSparklineProps {
  data: number[];
  color: string;
  gradientId: string;
}

const MiniSparkline = ({ data, color, gradientId }: MiniSparklineProps) => {
  const linePathRef = useRef<SVGPathElement>(null);
  const areaPathRef = useRef<SVGPathElement>(null);

  const svgWidth = 100;
  const svgHeight = 40;

  const linePath = useMemo(
    () => generateSmoothPath(data, svgWidth, svgHeight),
    [data]
  );

  const areaPath = useMemo(() => {
    if (!linePath.startsWith("M")) return "";
    return `${linePath} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`;
  }, [linePath]);

  useEffect(() => {
    const path = linePathRef.current;
    const area = areaPathRef.current;

    if (path && area) {
      const length = path.getTotalLength();
      path.style.transition = 'none';
      path.style.strokeDasharray = length + ' ' + length;
      path.style.strokeDashoffset = String(length);

      area.style.transition = 'none';
      area.style.opacity = '0';

      path.getBoundingClientRect();

      path.style.transition = 'stroke-dashoffset 0.8s ease-in-out';
      path.style.strokeDashoffset = '0';

      area.style.transition = 'opacity 0.8s ease-in-out 0.2s';
      area.style.opacity = '1';
    }
  }, [linePath]);

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="w-full h-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.4} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        ref={areaPathRef}
        d={areaPath}
        fill={`url(#${gradientId})`}
      />
      <path
        ref={linePathRef}
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Mock sparkline data for each stat card
const volumeSparkData = [20, 35, 45, 30, 55, 80, 120, 90, 110, 150, 180, 165];
const transactionsSparkData = [2, 3, 2, 4, 3, 5, 4, 6, 5, 7, 6, 8];
const last24hSparkData = [0, 1, 0, 2, 1, 0, 1, 2, 1, 0, 1, 1];
const avgSparkData = [25, 30, 28, 35, 32, 38, 36, 40, 35, 38, 36, 36];

interface StatItem {
  label: string;
  value: string;
  subValue: string;
  icon: LucideIcon;
  delay: string;
  sparkData: number[];
  sparkColor: string;
  gradientId: string;
}

export const TransactionAnalytics = ({
  totalVolume,
  totalTransactions,
  last24hTransactions,
  avgTransaction,
}: TransactionAnalyticsProps) => {
  const stats: StatItem[] = [
    {
      label: "Total Volume",
      value: `${totalVolume.toFixed(2)} ALGO`,
      subValue: `≈ $${(totalVolume * 0.13).toFixed(2)} USD`,
      icon: TrendingUp,
      delay: "0ms",
      sparkData: volumeSparkData,
      sparkColor: "#8B5CF6",
      gradientId: "volumeSparkGradient",
    },
    {
      label: "Total Transactions",
      value: totalTransactions.toString(),
      subValue: "All-time on this site",
      icon: Activity,
      delay: "50ms",
      sparkData: transactionsSparkData,
      sparkColor: "#22C55E",
      gradientId: "txSparkGradient",
    },
    {
      label: "24h Transactions",
      value: last24hTransactions.toString(),
      subValue: "Last 24 hours",
      icon: Clock,
      delay: "100ms",
      sparkData: last24hSparkData,
      sparkColor: "#3B82F6",
      gradientId: "last24hSparkGradient",
    },
    {
      label: "Avg Transaction",
      value: `${avgTransaction.toFixed(2)} ALGO`,
      subValue: "Per transaction",
      icon: Calculator,
      delay: "150ms",
      sparkData: avgSparkData,
      sparkColor: "#F59E0B",
      gradientId: "avgSparkGradient",
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
              <div className="flex justify-between items-start gap-2">
                {/* Left side content */}
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-muted-foreground truncate">{stat.label}</span>
                  </div>
                  <p className="text-xl font-bold text-foreground truncate">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{stat.subValue}</p>
                </div>

                {/* Right side chart */}
                <div className="w-16 h-10 flex-shrink-0">
                  <MiniSparkline
                    data={stat.sparkData}
                    color={stat.sparkColor}
                    gradientId={stat.gradientId}
                  />
                </div>
              </div>
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
