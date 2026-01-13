import { ExternalLink, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SwapRecord {
  id: string;
  time: string;
  from: string;
  fromAmount: number;
  to: string;
  toAmount: string;
  route: string;
  slippage: string;
  status: "confirmed" | "pending" | "failed";
  txHash: string;
}

interface SwapHistoryProps {
  records: SwapRecord[];
  onRefresh: () => void;
}

export function SwapHistory({ records, onRefresh }: SwapHistoryProps) {
  if (records.length === 0) {
    return (
      <div className="glass-card rounded-xl border border-border p-8 text-center text-muted-foreground">
        No swap history
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <h3 className="text-foreground font-semibold">Your Swap History</h3>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 text-sm hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh
        </button>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="text-muted-foreground font-medium">TIME</TableHead>
            <TableHead className="text-muted-foreground font-medium">FROM</TableHead>
            <TableHead className="text-muted-foreground font-medium">TO</TableHead>
            <TableHead className="text-muted-foreground font-medium text-right">AMOUNT</TableHead>
            <TableHead className="text-muted-foreground font-medium text-right">RECEIVED</TableHead>
            <TableHead className="text-muted-foreground font-medium text-center">ROUTE</TableHead>
            <TableHead className="text-muted-foreground font-medium text-center">SLIPPAGE</TableHead>
            <TableHead className="text-muted-foreground font-medium text-right">STATUS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow
              key={record.id}
              className="border-border/50 hover:bg-secondary/30 transition-colors"
            >
              <TableCell className="text-muted-foreground text-sm font-light">
                {record.time}
              </TableCell>
              <TableCell>
                <span className="font-medium text-foreground">{record.from}</span>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{record.to}</span>
                </div>
              </TableCell>
              <TableCell className="text-right text-muted-foreground font-mono">
                {record.fromAmount} {record.from}
              </TableCell>
              <TableCell className="text-right font-mono font-medium text-foreground">
                {record.toAmount}
              </TableCell>
              <TableCell className="text-center text-muted-foreground text-sm">
                {record.route}
              </TableCell>
              <TableCell className="text-center text-muted-foreground text-sm">
                {record.slippage}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-3">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${record.status === "confirmed"
                        ? "bg-green-500/10 text-green-500"
                        : record.status === "pending"
                          ? "bg-yellow-500/10 text-yellow-500"
                          : "bg-red-500/10 text-red-500"
                      }`}
                  >
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </span>
                  <a
                    href={`https://explorer.example.com/tx/${record.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    title="View Transaction"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
