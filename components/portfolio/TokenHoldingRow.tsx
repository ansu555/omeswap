import { motion } from "framer-motion";
import { TokenChip } from "./TokenChip";
import { Check, Square } from "lucide-react";

interface Token {
  id: string;
  chain: string;
  symbol: string;
  amount: string;
  priceUsd: number;
  imageUrl?: string;
}

interface TokenHoldingRowProps {
  tokens: Token[];
  selectedTokenIds: Set<string>;
  onToggleToken: (id: string) => void;
  onSelectAll: () => void;
  totalPortfolioValue: number;
}

export function TokenHoldingRow({
  tokens,
  selectedTokenIds,
  onToggleToken,
  onSelectAll,
  totalPortfolioValue,
}: TokenHoldingRowProps) {
  const allSelected = tokens.length > 0 && selectedTokenIds.size === tokens.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide pb-4">
        {/* Select All Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSelectAll}
          disabled={tokens.length === 0}
          className={`flex-shrink-0 w-24 h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all duration-200 ${allSelected
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label="Select all tokens"
        >
          {allSelected ? (
            <Check className="w-5 h-5" />
          ) : (
            <Square className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">Select all</span>
        </motion.button>

        {/* Token Chips */}
        {tokens.map((token, index) => {
          const holdingValue = parseFloat(token.amount) * token.priceUsd;
          const percentOfPortfolio =
            totalPortfolioValue > 0
              ? (holdingValue / totalPortfolioValue) * 100
              : 0;

          return (
            <TokenChip
              key={token.id}
              id={token.id}
              symbol={token.symbol}
              amount={token.amount}
              priceUsd={token.priceUsd}
              percentOfPortfolio={percentOfPortfolio}
              imageUrl={token.imageUrl}
              isSelected={selectedTokenIds.has(token.id)}
              onToggle={onToggleToken}
              index={index}
            />
          );
        })}

        {tokens.length === 0 && (
          <div className="flex-1 text-center py-8 text-muted-foreground">
            No tokens found. Connect your wallet to view holdings.
          </div>
        )}
      </div>

      {/* Progress bar showing portfolio distribution */}
      {tokens.length > 0 && (
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden flex">
          {tokens.map((token, index) => {
            const holdingValue = parseFloat(token.amount) * token.priceUsd;
            const percent =
              totalPortfolioValue > 0
                ? (holdingValue / totalPortfolioValue) * 100
                : 0;
            const colors = [
              "bg-primary",
              "bg-success",
              "bg-accent",
              "bg-destructive",
              "bg-muted-foreground",
            ];

            return (
              <motion.div
                key={token.id}
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className={`h-full ${colors[index % colors.length]}`}
              />
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
