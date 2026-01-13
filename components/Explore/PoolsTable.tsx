import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface PoolRow {
  id: string;
  rank: number;
  token0: { name: string; symbol: string; imageUrl?: string };
  token1: { name: string; symbol: string; imageUrl?: string };
  fee: number;
  tvl: number;
  volume24h: number;
  volume7d: number;
  apr: number;
}

interface PoolsTableProps {
  pools: PoolRow[];
  onRowClick?: (pool: PoolRow) => void;
  isLoading?: boolean;
}

type SortKey = "rank" | "tvl" | "volume24h" | "volume7d" | "apr";
type SortDir = "asc" | "desc";

const formatNumber = (num: number): string => {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
};

export const PoolsTable = ({ pools, onRowClick, isLoading }: PoolsTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>("tvl");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sortedPools = [...pools].sort((a, b) => {
    const multiplier = sortDir === "asc" ? 1 : -1;
    return (a[sortKey] - b[sortKey]) * multiplier;
  });

  const SortIndicator = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return null;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3 h-3 inline ml-1" />
    ) : (
      <ChevronDown className="w-3 h-3 inline ml-1" />
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
            <TableHead
              className="w-12 text-muted-foreground cursor-pointer hover:text-foreground"
              onClick={() => handleSort("rank")}
            >
              #<SortIndicator columnKey="rank" />
            </TableHead>
            <TableHead className="text-muted-foreground min-w-[220px]">Pool</TableHead>
            <TableHead className="text-right text-muted-foreground">Fee Tier</TableHead>
            <TableHead
              className="text-right text-muted-foreground cursor-pointer hover:text-foreground"
              onClick={() => handleSort("tvl")}
            >
              TVL
              <SortIndicator columnKey="tvl" />
            </TableHead>
            <TableHead
              className="text-right text-muted-foreground cursor-pointer hover:text-foreground"
              onClick={() => handleSort("volume24h")}
            >
              Volume (24H)
              <SortIndicator columnKey="volume24h" />
            </TableHead>
            <TableHead
              className="text-right text-muted-foreground cursor-pointer hover:text-foreground hidden md:table-cell"
              onClick={() => handleSort("volume7d")}
            >
              Volume (7D)
              <SortIndicator columnKey="volume7d" />
            </TableHead>
            <TableHead
              className="text-right text-muted-foreground cursor-pointer hover:text-foreground"
              onClick={() => handleSort("apr")}
            >
              APR
              <SortIndicator columnKey="apr" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPools.map((pool) => (
            <TableRow
              key={pool.id}
              className="border-b border-border/50 cursor-pointer hover:bg-muted/20 transition-colors group"
              onClick={() => onRowClick?.(pool)}
            >
              <TableCell className="py-3 text-muted-foreground font-medium">
                {pool.rank}
              </TableCell>
              <TableCell className="py-3">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {pool.token0.imageUrl ? (
                      <img
                        src={pool.token0.imageUrl}
                        alt={pool.token0.symbol}
                        className="w-6 h-6 rounded-full bg-muted border-2 border-background"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold border-2 border-background">
                        {pool.token0.symbol.slice(0, 2)}
                      </div>
                    )}
                    {pool.token1.imageUrl ? (
                      <img
                        src={pool.token1.imageUrl}
                        alt={pool.token1.symbol}
                        className="w-6 h-6 rounded-full bg-muted border-2 border-background"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold border-2 border-background">
                        {pool.token1.symbol.slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {pool.token0.symbol}/{pool.token1.symbol}
                  </span>
                </div>
              </TableCell>
              <TableCell className="py-3 text-right">
                <span className="px-2 py-0.5 rounded bg-muted text-xs font-medium text-muted-foreground">
                  {pool.fee}%
                </span>
              </TableCell>
              <TableCell className="py-3 text-right font-mono text-foreground">
                {formatNumber(pool.tvl)}
              </TableCell>
              <TableCell className="py-3 text-right font-mono text-foreground">
                {formatNumber(pool.volume24h)}
              </TableCell>
              <TableCell className="py-3 text-right font-mono text-foreground hidden md:table-cell">
                {formatNumber(pool.volume7d)}
              </TableCell>
              <TableCell className="py-3 text-right">
                <span className={cn("font-mono", pool.apr > 0 ? "text-success" : "text-muted-foreground")}>
                  {pool.apr.toFixed(2)}%
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
