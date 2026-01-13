import { cn } from "@/lib/utils";
import Image from "next/image";

interface SummaryItem {
  name: string;
  symbol: string;
  value: string;
  change?: number;
  imageUrl?: string;
}

interface SummaryCardProps {
  title: string;
  items: SummaryItem[];
  type: "gainers" | "losers" | "trending";
}

export const SummaryCard = ({ title, items, type }: SummaryCardProps) => {
  return (
    <div className="bg-card text-card-foreground rounded-2xl shadow-lg p-5 border border-border flex-1 min-w-[280px]">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">{title}</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={`${item.name}-${item.symbol}`}
            className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/30 cursor-pointer transition-colors group"
          >
            <div className="flex items-center gap-2">
              {item.imageUrl && (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
              )}
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {item.name}
              </span>
              <span className="text-xs text-muted-foreground">{item.symbol}</span>
            </div>
            <span
              className={cn(
                "text-sm font-mono font-medium",
                type === "gainers" && "text-green-500",
                type === "losers" && "text-orange-500",
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
