import { motion } from "framer-motion";

interface TokenChipProps {
  id: string;
  symbol: string;
  amount: string;
  priceUsd: number;
  percentOfPortfolio: number;
  imageUrl?: string;
  isSelected: boolean;
  onToggle: (id: string) => void;
  index?: number;
}

export function TokenChip({
  id,
  symbol,
  amount,
  priceUsd,
  percentOfPortfolio,
  imageUrl,
  isSelected,
  onToggle,
  index = 0,
}: TokenChipProps) {
  const holdingValue = parseFloat(amount) * priceUsd;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onToggle(id)}
      className={`flex-shrink-0 w-36 p-4 rounded-xl transition-all duration-200 ${isSelected
          ? "token-selected bg-secondary"
          : "glass-card hover:bg-secondary/50"
        }`}
      aria-pressed={isSelected}
      aria-label={`${symbol} token, ${formatCurrency(holdingValue)}, ${percentOfPortfolio.toFixed(1)}% of portfolio`}
    >
      <div className="flex items-center gap-2 mb-3">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${symbol} logo`}
            className="w-6 h-6 rounded-full"
            loading="lazy"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">
              {symbol.slice(0, 2)}
            </span>
          </div>
        )}
        <span className="font-medium text-foreground text-sm uppercase">
          {symbol}
        </span>
      </div>

      <p className="text-foreground font-semibold text-lg mb-1">
        {formatCurrency(holdingValue)}
      </p>

      <p className="text-muted-foreground text-xs">
        {percentOfPortfolio.toFixed(1)}%
      </p>
    </motion.button>
  );
}
