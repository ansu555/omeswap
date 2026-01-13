import { useState } from "react";
import { ExternalLink, ChevronUp, ChevronDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface TransactionRow {
  id: string;
  type: "swap" | "add" | "remove";
  token0: { symbol: string; amount: number };
  token1: { symbol: string; amount: number };
  totalValue: number;
  account: string;
  timestamp: Date;
  txHash: string;
}

interface TransactionsTableProps {
  transactions: TransactionRow[];
  onRowClick?: (tx: TransactionRow) => void;
  isLoading?: boolean;
}

type SortKey = "totalValue" | "timestamp";
type SortDir = "asc" | "desc";

const formatNumber = (num: number): string => {
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
};

const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const getTypeLabel = (type: TransactionRow["type"]): string => {
  switch (type) {
    case "swap":
      return "Swap";
    case "add":
      return "Add";
    case "remove":
      return "Remove";
  }
};

const getTypeColor = (type: TransactionRow["type"]): string => {
  switch (type) {
    case "swap":
      return "text-primary";
    case "add":
      return "text-success";
    case "remove":
      return "text-destructive";
  }
};

export const TransactionsTable = ({
  transactions,
  onRowClick,
  isLoading,
}: TransactionsTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    const multiplier = sortDir === "asc" ? 1 : -1;
    if (sortKey === "timestamp") {
      return (a.timestamp.getTime() - b.timestamp.getTime()) * multiplier;
    }
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
            <TableHead className="text-muted-foreground min-w-[200px]">Action</TableHead>
            <TableHead
              className="text-right text-muted-foreground cursor-pointer hover:text-foreground"
              onClick={() => handleSort("totalValue")}
            >
              Total Value
              <SortIndicator columnKey="totalValue" />
            </TableHead>
            <TableHead className="text-right text-muted-foreground hidden md:table-cell">
              Token Amount
            </TableHead>
            <TableHead className="text-right text-muted-foreground hidden lg:table-cell">
              Token Amount
            </TableHead>
            <TableHead className="text-right text-muted-foreground">Account</TableHead>
            <TableHead
              className="text-right text-muted-foreground cursor-pointer hover:text-foreground"
              onClick={() => handleSort("timestamp")}
            >
              Time
              <SortIndicator columnKey="timestamp" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTransactions.map((tx) => (
            <TableRow
              key={tx.id}
              className="border-b border-border/50 cursor-pointer hover:bg-muted/20 transition-colors group"
              onClick={() => onRowClick?.(tx)}
            >
              <TableCell className="py-3">
                <div className="flex items-center gap-2">
                  <span className={cn("font-medium", getTypeColor(tx.type))}>
                    {getTypeLabel(tx.type)}
                  </span>
                  <span className="text-foreground">
                    {tx.token0.symbol}
                  </span>
                  <span className="text-muted-foreground">
                    {tx.type === "swap" ? "for" : tx.type === "add" ? "and" : "and"}
                  </span>
                  <span className="text-foreground">
                    {tx.token1.symbol}
                  </span>
                </div>
              </TableCell>
              <TableCell className="py-3 text-right font-mono text-foreground">
                {formatNumber(tx.totalValue)}
              </TableCell>
              <TableCell className="py-3 text-right font-mono text-muted-foreground hidden md:table-cell">
                {tx.token0.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} {tx.token0.symbol}
              </TableCell>
              <TableCell className="py-3 text-right font-mono text-muted-foreground hidden lg:table-cell">
                {tx.token1.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} {tx.token1.symbol}
              </TableCell>
              <TableCell className="py-3 text-right">
                <a
                  href={`https://etherscan.io/address/${tx.account}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors font-mono text-sm"
                >
                  {formatAddress(tx.account)}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </TableCell>
              <TableCell className="py-3 text-right text-muted-foreground text-sm">
                {formatTime(tx.timestamp)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
