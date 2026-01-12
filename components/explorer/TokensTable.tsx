import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

export interface TokenRow {
    id: string;
    rank: number;
    name: string;
    symbol: string;
    price: number;
    change1h: number;
    change24h: number;
    change7d: number;
    marketCap: number;
    volume24h: number;
    circulatingSupply: number;
    sparklineData: number[];
    isFavorite?: boolean;
}

interface TokensTableProps {
    tokens: TokenRow[];
    onToggleFavorite: (id: string) => void;
    onRowClick: (token: TokenRow) => void;
}

export function TokensTable({ tokens, onToggleFavorite, onRowClick }: TokensTableProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
        }).format(value);
    };

    const formatLargeNumber = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            notation: "compact",
            maximumFractionDigits: 2,
        }).format(value);
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground font-medium uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3 w-10"></th>
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3 text-right">Price</th>
                        <th className="px-4 py-3 text-right">1h %</th>
                        <th className="px-4 py-3 text-right">24h %</th>
                        <th className="px-4 py-3 text-right hidden lg:table-cell">7d %</th>
                        <th className="px-4 py-3 text-right hidden md:table-cell">Market Cap</th>
                        <th className="px-4 py-3 text-right hidden lg:table-cell">Volume (24h)</th>
                        <th className="px-4 py-3 w-[150px] hidden xl:table-cell">Last 7 Days</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                    {tokens.map((token) => (
                        <tr
                            key={token.id}
                            className="hover:bg-muted/30 transition-colors cursor-pointer"
                            onClick={() => onRowClick(token)}
                        >
                            <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => onToggleFavorite(token.id)}
                                    className="hover:text-yellow-400 transition-colors"
                                >
                                    <Star
                                        className={cn("w-4 h-4", token.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")}
                                    />
                                </button>
                            </td>
                            <td className="px-4 py-4 text-muted-foreground">{token.rank}</td>
                            <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-foreground">{token.name}</span>
                                    <span className="text-muted-foreground text-xs">{token.symbol}</span>
                                </div>
                            </td>
                            <td className="px-4 py-4 text-right font-medium">{formatCurrency(token.price)}</td>
                            <td className={cn("px-4 py-4 text-right", token.change1h >= 0 ? "text-green-500" : "text-red-500")}>
                                {token.change1h >= 0 ? "+" : ""}{token.change1h}%
                            </td>
                            <td className={cn("px-4 py-4 text-right", token.change24h >= 0 ? "text-green-500" : "text-red-500")}>
                                {token.change24h >= 0 ? "+" : ""}{token.change24h}%
                            </td>
                            <td className={cn("px-4 py-4 text-right hidden lg:table-cell", token.change7d >= 0 ? "text-green-500" : "text-red-500")}>
                                {token.change7d >= 0 ? "+" : ""}{token.change7d}%
                            </td>
                            <td className="px-4 py-4 text-right hidden md:table-cell">{formatLargeNumber(token.marketCap)}</td>
                            <td className="px-4 py-4 text-right hidden lg:table-cell">{formatLargeNumber(token.volume24h)}</td>
                            <td className="px-4 py-2 hidden xl:table-cell">
                                <div className="h-10 w-32">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={token.sparklineData.map(v => ({ value: v }))}>
                                            <Area
                                                type="monotone"
                                                dataKey="value"
                                                stroke={token.change7d >= 0 ? "#22c55e" : "#ef4444"}
                                                fill={token.change7d >= 0 ? "#22c55e20" : "#ef444420"}
                                                strokeWidth={1.5}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
