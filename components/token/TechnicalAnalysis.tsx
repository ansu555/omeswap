"use client";

import { useState } from "react";
import { MessageCirclePlus, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TechnicalAnalysisProps {
    analysis: string;
    priceChange24h: number;
    auditScores: {
        financial: number;
        security: number;
    };
}

export const TechnicalAnalysis = ({ analysis, priceChange24h, auditScores: _auditScores }: TechnicalAnalysisProps) => {
    const [showFullAnalysis, setShowFullAnalysis] = useState(false);

    // Determine trend from price change
    const trend = priceChange24h > 5 ? "Bullish" : priceChange24h < -5 ? "Bearish" : "Neutral";
    const opportunity = priceChange24h > 2 ? "Buy" : priceChange24h < -2 ? "Sell" : "Neutral";
    const marketState = priceChange24h > 3 ? "Uptrend" : priceChange24h < -3 ? "Downtrend" : "In transition";

    const TrendIcon = trend === "Bullish" ? TrendingUp : trend === "Bearish" ? TrendingDown : Minus;
    const trendColor = trend === "Bullish" ? "text-green-500" : trend === "Bearish" ? "text-red-500" : "text-muted-foreground";

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Technical Analysis</h3>
                <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <MessageCirclePlus className="w-4 h-4" />
                    Tell me more
                </button>
            </div>

            {/* General Direction */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium">General Direction</label>
                    <button className="w-4 h-4 rounded-full bg-muted-foreground/20 flex items-center justify-center text-xs">
                        i
                    </button>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" />
                    <div
                        className="absolute top-0 h-full w-1 bg-white rounded-full shadow-lg"
                        style={{
                            left: `${Math.min(100, Math.max(0, ((priceChange24h + 20) / 40) * 100))}%`,
                        }}
                    />
                </div>
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>Bearish</span>
                    <span>Bullish</span>
                </div>
            </div>

            {/* Analysis Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Current Trend */}
                <div className="glass-card rounded-lg p-4 border bg-card/50">
                    <p className="text-sm text-muted-foreground mb-2">Current Trend</p>
                    <div className="flex items-center gap-2">
                        <TrendIcon className={cn("w-5 h-5", trendColor)} />
                        <span className={cn("font-semibold", trendColor)}>{trend}</span>
                    </div>
                </div>

                {/* Potential Opportunity */}
                <div className="glass-card rounded-lg p-4 border bg-card/50">
                    <p className="text-sm text-muted-foreground mb-2">Potential Opportunity</p>
                    <span className="font-semibold">{opportunity}</span>
                    <div className="mt-2 relative h-2 bg-muted rounded-full overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" />
                        <div
                            className="absolute top-0 h-full w-1 bg-white rounded-full shadow-lg"
                            style={{
                                left: `${opportunity === "Buy" ? 75 : opportunity === "Sell" ? 25 : 50}%`,
                            }}
                        />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                        <span>Buy</span>
                        <span>Sell</span>
                    </div>
                </div>

                {/* Market State */}
                <div className="glass-card rounded-lg p-4 border bg-card/50">
                    <p className="text-sm text-muted-foreground mb-2">Market State</p>
                    <span className={cn(
                        "font-semibold",
                        marketState === "Uptrend" ? "text-green-500" : marketState === "Downtrend" ? "text-red-500" : "text-foreground"
                    )}>
                        {marketState}
                    </span>
                    <div className="mt-2 relative h-2 bg-muted rounded-full overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" />
                        <div
                            className="absolute top-0 h-full w-1 bg-white rounded-full shadow-lg"
                            style={{
                                left: `${marketState === "Uptrend" ? 75 : marketState === "Downtrend" ? 25 : 50}%`,
                            }}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Transition Trend Upcoming Move</p>
                </div>
            </div>

            {/* Full Analysis Text */}
            {analysis && (
                <div className="glass-card rounded-lg p-6 border bg-card/50">
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {showFullAnalysis ? analysis : `${analysis.substring(0, 200)}...`}
                    </p>
                    {analysis.length > 200 && (
                        <button
                            onClick={() => setShowFullAnalysis(!showFullAnalysis)}
                            className="mt-2 text-sm text-primary hover:underline"
                        >
                            {showFullAnalysis ? "Show less" : "Show more"}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

