import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown, ChevronUp, Globe, ArrowUpDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface PortfolioRow {
  id: string;
  chain: string;
  coin: string;
  amount: string;
  priceUsd: number;
  change24hPercent: number;
  change30dPercent: number;
  holdingUsd: number;
  newsCount?: number;
  imageUrl?: string;
}

interface PortfolioTableProps {
  rows: PortfolioRow[];
  hideDust: boolean;
  mergeChains: boolean;
  onToggleHideDust: () => void;
  onToggleMergeChains: () => void;
  onSort?: (col: string, dir: "asc" | "desc") => void;
}

export function PortfolioTable({
  rows,
  hideDust,
  mergeChains,
  onToggleHideDust,
  onToggleMergeChains,
}: PortfolioTableProps) {
  const [sortColumn, setSortColumn] = useState<string>("holdingUsd");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  // Filter and sort rows
  let processedRows = [...rows];
  
  if (hideDust) {
    processedRows = processedRows.filter((row) => row.holdingUsd >= 1);
  }

  if (mergeChains) {
    const merged = new Map<string, PortfolioRow>();
    processedRows.forEach((row) => {
      const existing = merged.get(row.coin);
      if (existing) {
        merged.set(row.coin, {
          ...existing,
          amount: (parseFloat(existing.amount) + parseFloat(row.amount)).toString(),
          holdingUsd: existing.holdingUsd + row.holdingUsd,
          chain: "multi",
        });
      } else {
        merged.set(row.coin, { ...row });
      }
    });
    processedRows = Array.from(merged.values());
  }

  processedRows.sort((a, b) => {
    const aVal = a[sortColumn as keyof PortfolioRow];
    const bVal = b[sortColumn as keyof PortfolioRow];
    const modifier = sortDirection === "asc" ? 1 : -1;
    
    if (typeof aVal === "number" && typeof bVal === "number") {
      return (aVal - bVal) * modifier;
    }
    return String(aVal).localeCompare(String(bVal)) * modifier;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const isPositive = value >= 0;
    return (
      <span className={isPositive ? "text-success" : "text-destructive"}>
        {isPositive ? "+" : ""}
        {value.toFixed(2)}%
      </span>
    );
  };

  const SortButton = ({ column, label }: { column: string; label: string }) => (
    <button
      onClick={() => handleSort(column)}
      className="flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {label}
      {sortColumn === column ? (
        sortDirection === "asc" ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )
      ) : (
        <ArrowUpDown className="w-3 h-3 opacity-50" />
      )}
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      {/* Filters */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <Switch
            checked={hideDust}
            onCheckedChange={onToggleHideDust}
            aria-label="Hide dust"
          />
          <span className="text-sm text-muted-foreground">Hide Dust</span>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={mergeChains}
            onCheckedChange={onToggleMergeChains}
            aria-label="Merge chains"
          />
          <span className="text-sm text-muted-foreground">Merge chains</span>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">
                <SortButton column="coin" label="COIN" />
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">
                <SortButton column="amount" label="AMOUNT" />
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">
                <SortButton column="priceUsd" label="PRICE" />
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">
                <SortButton column="change24hPercent" label="24H CHANGE" />
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">
                <SortButton column="change30dPercent" label="30D CHANGE" />
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-right bg-primary/10">
                <SortButton column="holdingUsd" label="HOLDING" />
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">
                NEWS
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {processedRows.map((row) => (
                <motion.tr
                  key={row.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onClick={() =>
                    setExpandedRow(expandedRow === row.id ? null : row.id)
                  }
                  className="border-border hover:bg-secondary/30 cursor-pointer transition-colors"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {row.imageUrl ? (
                        <img
                          src={row.imageUrl}
                          alt={row.coin}
                          className="w-6 h-6 rounded-full"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">
                            {row.coin.slice(0, 2)}
                          </span>
                        </div>
                      )}
                      <span className="text-foreground">{row.coin}</span>
                      {row.chain !== "multi" && (
                        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {row.chain}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    {parseFloat(row.amount).toFixed(4)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(row.priceUsd)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPercent(row.change24hPercent)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPercent(row.change30dPercent)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-foreground bg-primary/5">
                    {formatCurrency(row.holdingUsd)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 text-muted-foreground">
                      <span>{row.newsCount || 0}</span>
                      <Globe className="w-4 h-4" />
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>

            {processedRows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-12 text-muted-foreground"
                >
                  No assets to display.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
