import { cn } from "@/lib/utils";

interface SummaryItem {
  name: string;
  symbol: string;
  value: string;
  change?: number;
}

interface SummaryCardProps {
  title: string;
  items: SummaryItem[];
  type: "gainers" | "losers" | "trending";
}

export const SummaryCard = ({ title, items, type }: SummaryCardProps) => {
  return (
    <div className="glass-card rounded-lg p-4 flex-1 min-w-[280px]">
      <h3 className="text-sm font-medium text-foreground mb-3">{title}</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={`${item.name}-${item.symbol}`}
            className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/30 cursor-pointer transition-colors group"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {item.name}
              </span>
              <span className="text-xs text-muted-foreground">{item.symbol}</span>
            </div>
            <span
              className={cn(
                "text-sm font-mono font-medium",
                type === "gainers" && "text-success",
                type === "losers" && "text-destructive",
                type === "trending" && "text-foreground"
              )}
            >
              {type === "trending" ? item.value : item.change !== undefined ? (
                `${item.change >= 0 ? "+" : ""}${item.change.toFixed(2)}%`
              ) : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
