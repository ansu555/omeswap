import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Copy, ExternalLink, ArrowUpRight, Plus, Minus, Layers } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import type { Transaction, TransactionType } from "@/app/Transaction/page";

interface TransactionTableProps {
  transactions: Transaction[];
}

const getTypeConfig = (type: TransactionType) => {
  switch (type) {
    case "SWAP":
      return {
        label: "Swap",
        icon: ArrowUpRight,
        className: "bg-primary/10 text-primary border-primary/20",
      };
    case "ADD_LIQUIDITY":
      return {
        label: "Add Liquidity",
        icon: Plus,
        className: "bg-green-500/10 text-green-400 border-green-500/20",
      };
    case "REMOVE_LIQUIDITY":
      return {
        label: "Remove Liquidity",
        icon: Minus,
        className: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      };
    case "POOL_CREATION":
      return {
        label: "Pool Creation",
        icon: Layers,
        className: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      };
  }
};

const copyToClipboard = (text: string, label: string) => {
  navigator.clipboard.writeText(text);
  toast.success(`${label} copied to clipboard`);
};

export const TransactionTable = ({ transactions }: TransactionTableProps) => {
  if (transactions.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="py-16 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
              <Layers className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground">No transactions found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your filters or make your first transaction
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card bg-card/50 overflow-hidden animate-fade-in" style={{ animationDelay: "150ms" }}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-primary font-semibold">Time</TableHead>
              <TableHead className="text-primary font-semibold">Type</TableHead>
              <TableHead className="text-primary font-semibold">Token Amount</TableHead>
              <TableHead className="text-primary font-semibold">Pool Address</TableHead>
              <TableHead className="text-primary font-semibold">Wallet</TableHead>
              <TableHead className="text-primary font-semibold text-right">Explorer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx, index) => {
              const typeConfig = getTypeConfig(tx.type);
              const TypeIcon = typeConfig.icon;

              return (
                <TableRow
                  key={tx.id}
                  className="border-border/30 hover:bg-muted/30 transition-colors group"
                  style={{
                    animationDelay: `${index * 30}ms`,
                  }}
                >
                  {/* Time */}
                  <TableCell className="text-muted-foreground">
                    <span className="whitespace-nowrap">
                      {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
                    </span>
                  </TableCell>

                  {/* Type */}
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge
                        variant="outline"
                        className={`${typeConfig.className} w-fit flex items-center gap-1.5`}
                      >
                        <TypeIcon className="h-3 w-3" />
                        {typeConfig.label}
                      </Badge>
                      <span className="text-xs text-foreground font-medium">
                        {tx.fromToken} <ArrowRight className="inline h-3 w-3 text-muted-foreground mx-1" /> {tx.toToken}
                      </span>
                    </div>
                  </TableCell>

                  {/* Token Amount */}
                  <TableCell>
                    <div className="flex items-center gap-2 text-foreground">
                      <span className="font-mono">{tx.fromAmount.toFixed(6)}</span>
                      <ArrowRight className="h-4 w-4 text-primary" />
                      <span className="font-mono">{tx.toAmount.toFixed(6)}</span>
                    </div>
                  </TableCell>

                  {/* Pool Address */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-sm text-muted-foreground font-mono">
                        {tx.poolAddress}
                      </code>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => copyToClipboard(tx.poolAddress, "Pool address")}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy pool address</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>

                  {/* Wallet */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-sm text-muted-foreground font-mono">
                        {tx.walletAddress}
                      </code>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => copyToClipboard(tx.walletAddress, "Wallet address")}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy wallet address</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>

                  {/* Explorer */}
                  <TableCell className="text-right">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary hover:bg-primary/10"
                          onClick={() => window.open(tx.explorerUrl, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View on explorer</TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
