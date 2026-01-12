import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryItem {
    name: string;
    symbol: string;
    value: string;
    change: number;
}

interface SummaryCardProps {
    title: string;
    items: SummaryItem[];
    type: "gainers" | "losers" | "trending";
}

export function SummaryCard({ title, items, type }: SummaryCardProps) {
    return (
        <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
                {title}
            </h3>
            <div className="space-y-3">
                {items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-mono text-muted-foreground w-4">{i + 1}</span>
                            <div>
                                <div className="font-medium text-sm flex items-center gap-2">
                                    {item.name}
                                    <span className="text-xs text-muted-foreground hidden sm:inline-block">{item.symbol}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            {item.value && <div className="text-sm font-medium">{item.value}</div>}
                            <div
                                className={cn(
                                    "text-xs flex items-center justify-end gap-1",
                                    item.change >= 0 ? "text-green-500" : "text-red-500"
                                )}
                            >
                                {item.change !== 0 && (
                                    item.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />
                                )}
                                {Math.abs(item.change)}%
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
