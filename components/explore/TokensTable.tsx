import { useState } from "react";
import {
  Star,
  ChevronUp,
  ChevronDown,
  Newspaper,
  Shield,
  TrendingUp,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sparkline } from "./Sparkline";
import { cn } from "@/lib/utils";

export interface TokenRow {
  id: string;
  rank: number;
  name: string;
  symbol: string;
  imageUrl?: string;
  price: number;
  change1h: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  sparklineData: number[];
  isFavorite?: boolean;
  auditScore?: number;
  sentiment?: number;
  newsCount?: number;
}

interface TokensTableProps {
  tokens: TokenRow[];
  onToggleFavorite?: (id: string) => void;
  onRowClick?: (token: TokenRow) => void;
  isLoading?: boolean;
}

type SortKey =
  | "rank"
  | "price"
  | "change1h"
  | "change24h"
  | "change7d"
  | "marketCap"
  | "volume24h"
  | "auditScore"
  | "sentiment"
  | "newsCount";
type SortDir = "asc" | "desc";

const formatNumber = (num: number, decimals = 2): string => {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(decimals)}`;
};

const formatPrice = (price: number): string => {
  if (price >= 1000)
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(6)}`;
};

export const TokensTable = ({
  tokens,
  onToggleFavorite,
  onRowClick,
  isLoading,
}: TokensTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedTokens = [...tokens].sort((a, b) => {
    const multiplier = sortDir === "asc" ? 1 : -1;
    const aVal = a[sortKey] ?? 0;
    const bVal = b[sortKey] ?? 0;
    return ((aVal as number) - (bVal as number)) * multiplier;
  });

  const SortIndicator = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return null;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3 h-3 inline ml-1" />
    ) : (
      <ChevronDown className="w-3 h-3 inline ml-1" />
    );
  };

  const PercentCell = ({ value }: { value: number }) => (
    <span
      className={cn(
        "font-mono text-sm",
        value > 0
          ? "text-success"
          : value < 0
            ? "text-destructive"
            : "text-muted-foreground",
      )}
    >
      {value > 0 ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );

  const ScoreBadge = ({ value }: { value?: number }) => {
    if (value == null)
      return <span className="text-muted-foreground text-sm">—</span>;
    const color =
      value >= 80
        ? "text-success"
        : value >= 50
          ? "text-yellow-500"
          : "text-destructive";
    return (
      <span className={cn("font-mono text-sm font-medium", color)}>
        {value.toFixed(1)}
      </span>
    );
  };

  const SentimentBadge = ({ value }: { value?: number }) => {
    if (value == null)
      return <span className="text-muted-foreground text-sm">—</span>;
    const color =
      value >= 70
        ? "text-success"
        : value >= 40
          ? "text-yellow-500"
          : "text-destructive";
    return (
      <span className={cn("font-mono text-sm font-medium", color)}>
        {value.toFixed(1)}%
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-14 bg-muted/30 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow className="border-b border-border hover:bg-transparent">
            <TableHead className="w-10 text-muted-foreground"></TableHead>
            <TableHead
              className="w-12 text-muted-foreground cursor-pointer hover:text-foreground"
              onClick={() => handleSort("rank")}
            >
              #<SortIndicator columnKey="rank" />
            </TableHead>
            <TableHead className="text-muted-foreground min-w-[180px]">
              Name
            </TableHead>
            <TableHead
              className="text-right text-muted-foreground cursor-pointer hover:text-foreground"
              onClick={() => handleSort("price")}
            >
              Price
              <SortIndicator columnKey="price" />
            </TableHead>
            <TableHead
              className="text-right text-muted-foreground cursor-pointer hover:text-foreground"
              onClick={() => handleSort("change24h")}
            >
              24H %<SortIndicator columnKey="change24h" />
            </TableHead>
            <TableHead
              className="text-right text-muted-foreground cursor-pointer hover:text-foreground hidden lg:table-cell"
              onClick={() => handleSort("change7d")}
            >
              30D %<SortIndicator columnKey="change7d" />
            </TableHead>
            <TableHead
              className="text-right text-muted-foreground cursor-pointer hover:text-foreground hidden md:table-cell"
              onClick={() => handleSort("marketCap")}
            >
              Market Cap
              <SortIndicator columnKey="marketCap" />
            </TableHead>
            <TableHead
              className="text-right text-muted-foreground cursor-pointer hover:text-foreground hidden lg:table-cell"
              onClick={() => handleSort("auditScore")}
            >
              <span className="flex items-center justify-end gap-1">
                <Shield className="w-3 h-3" />
                Score
              </span>
              <SortIndicator columnKey="auditScore" />
            </TableHead>
            <TableHead
              className="text-right text-muted-foreground cursor-pointer hover:text-foreground hidden xl:table-cell"
              onClick={() => handleSort("sentiment")}
            >
              <span className="flex items-center justify-end gap-1">
                <TrendingUp className="w-3 h-3" />
                Sentiment
              </span>
              <SortIndicator columnKey="sentiment" />
            </TableHead>
            <TableHead
              className="text-right text-muted-foreground cursor-pointer hover:text-foreground hidden xl:table-cell"
              onClick={() => handleSort("newsCount")}
            >
              <span className="flex items-center justify-end gap-1">
                <Newspaper className="w-3 h-3" />
                News 7D
              </span>
              <SortIndicator columnKey="newsCount" />
            </TableHead>
            <TableHead className="w-[110px] text-right text-muted-foreground hidden sm:table-cell">
              7D Chart
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTokens.map((token) => (
            <TableRow
              key={token.id}
              className="border-b border-border/50 cursor-pointer hover:bg-muted/20 transition-colors group"
              onClick={() => onRowClick?.(token)}
            >
              <TableCell className="py-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite?.(token.id);
                  }}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={cn(
                      "w-4 h-4",
                      token.isFavorite
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground hover:text-yellow-400",
                    )}
                  />
                </button>
              </TableCell>
              <TableCell className="py-3 text-muted-foreground font-medium">
                {token.rank}
              </TableCell>
              <TableCell className="py-3">
                <div className="flex items-center gap-3">
                  {token.imageUrl ? (
                    <img
                      src={token.imageUrl}
                      alt={token.name}
                      className="w-7 h-7 rounded-full bg-muted"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                      {token.symbol.slice(0, 2)}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {token.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {token.symbol}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-3 text-right font-mono text-foreground">
                {formatPrice(token.price)}
              </TableCell>
              <TableCell className="py-3 text-right">
                <PercentCell value={token.change24h} />
              </TableCell>
              <TableCell className="py-3 text-right hidden lg:table-cell">
                <PercentCell value={token.change7d} />
              </TableCell>
              <TableCell className="py-3 text-right font-mono text-foreground hidden md:table-cell">
                {formatNumber(token.marketCap)}
              </TableCell>
              <TableCell className="py-3 text-right hidden lg:table-cell">
                <ScoreBadge value={token.auditScore} />
              </TableCell>
              <TableCell className="py-3 text-right hidden xl:table-cell">
                <SentimentBadge value={token.sentiment} />
              </TableCell>
              <TableCell className="py-3 text-right font-mono text-muted-foreground text-sm hidden xl:table-cell">
                {token.newsCount ?? 0}
              </TableCell>
              <TableCell className="py-3 text-right hidden sm:table-cell">
                <div className="flex justify-end">
                  <Sparkline
                    data={token.sparklineData}
                    positive={token.change7d >= 0}
                    width={100}
                    height={32}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
