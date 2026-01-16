"use client";

import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MessageCirclePlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FinancialAuditChartProps {
    historicalData: Array<{ timestamp: number; price: number }>;
    currentPrice: number;
    priceChange24h: number;
    marketCap: number;
    volume24h: number;
    volumeBreakdown: { cex: number; dex: number };
    circulatingSupply: number;
    maxSupply: number | null;
    liquidityRatio: number;
}

const timeRanges = [
    { label: "24h", days: 1 },
    { label: "7d", days: 7 },
    { label: "1m", days: 30 },
    { label: "3m", days: 90 },
    { label: "1y", days: 365 },
    { label: "Max", days: Infinity },
];

export const FinancialAuditChart = ({
    historicalData,
    currentPrice,
    priceChange24h,
    marketCap,
    volume24h,
    volumeBreakdown,
    circulatingSupply,
    maxSupply,
    liquidityRatio,
}: FinancialAuditChartProps) => {
    const [selectedRange, setSelectedRange] = useState(timeRanges[4]); // Default to 1y

    const chartData = useMemo(() => {
        const now = Date.now();
        const cutoffTime = selectedRange.days === Infinity
            ? 0
            : now - selectedRange.days * 24 * 60 * 60 * 1000;

        const filtered = historicalData.filter((d) => d.timestamp >= cutoffTime);
        
        // Sample data if too many points
        const maxPoints = 100;
        if (filtered.length > maxPoints) {
            const step = Math.floor(filtered.length / maxPoints);
            return filtered.filter((_, i) => i % step === 0);
        }
        
        return filtered;
    }, [historicalData, selectedRange]);

    const formatPrice = (value: number) => {
        if (value >= 1000) {
            return `$${(value / 1000).toFixed(0)}K`;
        }
        return `$${value.toFixed(2)}`;
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const formatNumber = (num: number) => {
        return num.toLocaleString("en-US", { maximumFractionDigits: 2 });
    };

    const cexVolumeChange = volumeBreakdown.cex > 0 ? 175.69 : 0; // Placeholder
    const dexVolumeChange = 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Financial Audit</h3>
                <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <MessageCirclePlus className="w-4 h-4" />
                    Tell me more
                </button>
            </div>

            {/* Time range selector */}
            <div className="flex gap-2">
                {timeRanges.map((range) => (
                    <button
                        key={range.label}
                        onClick={() => setSelectedRange(range)}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                            selectedRange.label === range.label
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        )}
                    >
                        {range.label}
                    </button>
                ))}
            </div>

            {/* Chart */}
            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis
                            dataKey="timestamp"
                            tickFormatter={formatDate}
                            stroke="rgba(255,255,255,0.5)"
                            style={{ fontSize: "12px" }}
                        />
                        <YAxis
                            tickFormatter={formatPrice}
                            stroke="rgba(255,255,255,0.5)"
                            style={{ fontSize: "12px" }}
                        />
                        <Tooltip
                            formatter={(value: number) => [`$${formatNumber(value)}`, "Price"]}
                            labelFormatter={(label) => formatDate(label as number)}
                            contentStyle={{
                                backgroundColor: "rgba(0,0,0,0.8)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "8px",
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="price"
                            stroke="rgb(236, 72, 153)"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Financial Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Token price</p>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold">
                                ${formatNumber(currentPrice)}
                            </span>
                            <span className={cn(
                                "text-sm font-medium",
                                priceChange24h >= 0 ? "text-green-500" : "text-red-500"
                            )}>
                                {priceChange24h >= 0 ? "+" : ""}{priceChange24h.toFixed(2)}%
                            </span>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Market cap</p>
                        <p className="text-xl font-semibold">${formatNumber(marketCap)}</p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground mb-2">Volume by exchange type (24h)</p>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">CEX</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold">${formatNumber(volumeBreakdown.cex / 1e9)} B</span>
                                    <span className="text-xs text-green-500">+{cexVolumeChange.toFixed(2)}%</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">DEX</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold">${formatNumber(volumeBreakdown.dex)}</span>
                                    <span className="text-xs text-muted-foreground">{dexVolumeChange.toFixed(2)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Volume 24h</p>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-semibold">${formatNumber(volume24h)}</span>
                            <span className="text-xs text-green-500">+{cexVolumeChange.toFixed(2)}%</span>
                        </div>
                    </div>

                    <div className="bg-muted/30 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-2">Liquidity ratio {liquidityRatio}%</p>
                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <span>Circulating supply:</span>
                                <span className="font-semibold">{formatNumber(circulatingSupply / 1e6)} M</span>
                            </div>
                            {maxSupply && (
                                <div className="flex items-center justify-between text-sm">
                                    <span>Max supply:</span>
                                    <span className="font-semibold">{formatNumber(maxSupply / 1e6)} M</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

