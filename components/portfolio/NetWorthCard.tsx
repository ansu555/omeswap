import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

interface NetWorthCardProps {
  netWorthUsd: number;
  change24hPercent: number;
  chartData: { time: string; value: number }[];
  stickerImageUrl?: string;
}

export function NetWorthCard({
  netWorthUsd,
  change24hPercent,
  chartData,
  stickerImageUrl,
}: NetWorthCardProps) {
  const isPositive = change24hPercent >= 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="relative">
      {/* Floating sticker */}
      {stickerImageUrl && (
        <motion.div
          initial={{ y: -20, rotate: -10, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.3
          }}
          className="absolute -top-6 -right-4 z-10"
        >
          <img
            src={stickerImageUrl}
            alt="Portfolio sticker"
            className="w-24 h-24 object-contain drop-shadow-2xl"
          />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="gradient-card rounded-2xl p-6 relative overflow-hidden glow-purple"
      >
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />

        <div className="relative z-10">
          <p className="text-primary text-sm font-medium mb-2">Net Worth</p>

          <div className="flex items-baseline gap-2 mb-3">
            <motion.span
              key={netWorthUsd}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-foreground"
            >
              {formatCurrency(netWorthUsd)}
            </motion.span>
            <span className="text-muted-foreground text-lg">USD</span>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium ${isPositive
                  ? "bg-success/20 text-success"
                  : "bg-destructive/20 text-destructive"
                }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {isPositive ? "+" : ""}
              {change24hPercent.toFixed(2)}%
            </span>
            <span className="text-muted-foreground text-sm">vs last month</span>
          </div>

          {/* Mini chart */}
          <div className="h-20 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(262, 83%, 71%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(262, 83%, 71%)" stopOpacity={0} />
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
                  stroke="hsl(262, 83%, 71%)"
                  strokeWidth={2}
                  fill="url(#netWorthGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
