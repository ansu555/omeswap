"use client";

import { useState } from "react";
import { MessageCirclePlus } from "lucide-react";

interface FundamentalAnalysisProps {
    analysis: string;
}

export const FundamentalAnalysis = ({ analysis }: FundamentalAnalysisProps) => {
    const [showFullAnalysis, setShowFullAnalysis] = useState(false);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Fundamental</h3>
                <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <MessageCirclePlus className="w-4 h-4" />
                    Tell me more
                </button>
            </div>

            <div className="glass-card rounded-lg p-6 border bg-card/50">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {showFullAnalysis ? analysis : `${analysis.substring(0, 500)}...`}
                </p>
                {analysis.length > 500 && (
                    <button
                        onClick={() => setShowFullAnalysis(!showFullAnalysis)}
                        className="mt-4 text-sm text-primary hover:underline"
                    >
                        {showFullAnalysis ? "Show less" : "Show more"}
                    </button>
                )}
            </div>
        </div>
    );
};

