import { ArrowRightLeft, Plus, Minus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
    onRowClick: (tx: TransactionRow) => void;
}

export function TransactionsTable({ transactions, onRowClick }: TransactionsTableProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
        }).format(value);
    };

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "swap":
                return <ArrowRightLeft className="w-4 h-4 text-blue-500" />;
            case "add":
                return <Plus className="w-4 h-4 text-green-500" />;
            case "remove":
                return <Minus className="w-4 h-4 text-red-500" />;
            default:
                return null;
        }
    };

    const getLabel = (type: string) => {
        switch (type) {
            case "swap":
                return "Swap";
            case "add":
                return "Add Liquidity";
            case "remove":
                return "Remove Liquidity";
            default:
                return type;
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground font-medium uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3">Action</th>
                        <th className="px-4 py-3">Total Value</th>
                        <th className="px-4 py-3">Token Amount</th>
                        <th className="px-4 py-3 hidden sm:table-cell">Token Amount</th>
                        <th className="px-4 py-3 hidden md:table-cell">Account</th>
                        <th className="px-4 py-3 text-right">Time</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                    {transactions.map((tx) => (
                        <tr
                            key={tx.id}
                            className="hover:bg-muted/30 transition-colors cursor-pointer"
                            onClick={() => onRowClick(tx)}
                        >
                            <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                    {getIcon(tx.type)}
                                    <span className="font-medium text-foreground">{getLabel(tx.type)}</span>
                                </div>
                            </td>
                            <td className="px-4 py-4">{formatCurrency(tx.totalValue)}</td>
                            <td className="px-4 py-4">
                                {tx.token0.amount.toLocaleString()} {tx.token0.symbol}
                            </td>
                            <td className="px-4 py-4 hidden sm:table-cell">
                                {tx.token1.amount.toLocaleString()} {tx.token1.symbol}
                            </td>
                            <td className="px-4 py-4 hidden md:table-cell font-mono text-cyan-500">
                                {formatAddress(tx.account)}
                            </td>
                            <td className="px-4 py-4 text-right text-muted-foreground">
                                {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
