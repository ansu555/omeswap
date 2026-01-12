import { cn } from "@/lib/utils";

export interface PoolRow {
    id: string;
    rank: number;
    token0: { name: string; symbol: string };
    token1: { name: string; symbol: string };
    fee: number;
    tvl: number;
    volume24h: number;
    volume7d: number;
    apr: number;
}

interface PoolsTableProps {
    pools: PoolRow[];
    onRowClick: (pool: PoolRow) => void;
}

export function PoolsTable({ pools, onRowClick }: PoolsTableProps) {
    const formatCurrency = (value: number) => {
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
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Pool</th>
                        <th className="px-4 py-3 text-right">TVL</th>
                        <th className="px-4 py-3 text-right">Volume 24h</th>
                        <th className="px-4 py-3 text-right hidden sm:table-cell">Volume 7d</th>
                        <th className="px-4 py-3 text-right">APR</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                    {pools.map((pool) => (
                        <tr
                            key={pool.id}
                            className="hover:bg-muted/30 transition-colors cursor-pointer"
                            onClick={() => onRowClick(pool)}
                        >
                            <td className="px-4 py-4 text-muted-foreground">{pool.rank}</td>
                            <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-foreground">
                                        {pool.token0.symbol}/{pool.token1.symbol}
                                    </span>
                                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground border">
                                        {pool.fee}%
                                    </span>
                                </div>
                            </td>
                            <td className="px-4 py-4 text-right">{formatCurrency(pool.tvl)}</td>
                            <td className="px-4 py-4 text-right">{formatCurrency(pool.volume24h)}</td>
                            <td className="px-4 py-4 text-right hidden sm:table-cell">{formatCurrency(pool.volume7d)}</td>
                            <td className="px-4 py-4 text-right text-green-500 font-medium">{pool.apr}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
