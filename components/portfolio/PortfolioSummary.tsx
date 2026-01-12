import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PortfolioSummaryProps {
  selectedWorth: number;
  change24hPercent: number;
  change30dPercent: number;
  coinCount: number;
  chartData: { time: string; value: number }[];
}

export function PortfolioSummary({
  selectedWorth,
  change24hPercent,
  change30dPercent,
  coinCount,
  chartData,
}: PortfolioSummaryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const isPositive24h = change24hPercent >= 0;
  const isPositive30d = change30dPercent >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Left - Selected Worth */}
      <div className="lg:col-span-1 space-y-4">
        <div className="glass-card rounded-xl p-5">
          <p className="text-muted-foreground text-sm mb-2">Selected worth</p>
          <motion.p
            key={selectedWorth}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gradient"
          >
            {formatCurrency(selectedWorth)}
          </motion.p>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">24h</span>
              <span
                className={`flex items-center gap-1 text-sm font-medium ${isPositive24h ? "text-success" : "text-destructive"
                  }`}
              >
                {isPositive24h ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {isPositive24h ? "+" : ""}
                {change24hPercent.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 text-center">
          <motion.p
            key={coinCount}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-5xl font-bold text-foreground"
          >
            {coinCount}
          </motion.p>
          <p className="text-muted-foreground text-sm mt-1">COINS</p>
        </div>
      </div>

      {/* Right - Chart and 30d change */}
      <div className="lg:col-span-2 glass-card rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <p className="text-muted-foreground text-sm">Performance</p>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">30 days change</span>
            <span
              className={`font-medium ${isPositive30d ? "text-success" : "text-destructive"
                }`}
            >
              {isPositive30d ? "+" : ""}
              {change30dPercent.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="summaryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(164, 80%, 54%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(164, 80%, 54%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{
                  background: "hsl(270, 50%, 8%)",
                  border: "1px solid hsl(270, 30%, 18%)",
                  borderRadius: "8px",
                  color: "white",
                }}
                formatter={(value: number) => [formatCurrency(value), "Value"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(164, 80%, 54%)"
                strokeWidth={2}
                fill="url(#summaryGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
