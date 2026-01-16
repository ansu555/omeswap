"use client";

import { useState } from "react";
import { SwapCard } from "@/components/trade/SwapCard";
import { PoolLiquidity } from "@/components/trade/PoolLiquidity";
import { TokenMiniChart } from "@/components/trade/TokenMiniChart";
import { SwapHistory } from "@/components/trade/SwapHistory";
import { ToggleSection } from "@/components/trade/ToggleSection";

const MOCK_HISTORY = [
    {
        id: "1",
        time: "about 1 month ago",
        from: "ALGO",
        fromAmount: 1,
        to: "USDC",
        toAmount: "~13.659219 USDC",
        route: "tinyman",
        slippage: "0.5%",
        status: "confirmed" as const,
        txHash: "abc123",
    },
];

export default function Index() {
    const [showChart, setShowChart] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    return (
        <div className="min-h-screen bg-transparent relative z-10">
            {/* Header is handled by layout.tsx */}

            <main className="container mx-auto px-4 py-8 pt-32">
                <div className="flex flex-col lg:flex-row gap-6 justify-center">
                    {/* Left Column - Pool Liquidity (only when chart toggled) */}
                    <div className="hidden lg:block lg:flex-1 lg:max-w-md">
                        {showChart && (
                            <div className="animate-fade-in">
                                <PoolLiquidity />
                            </div>
                        )}
                    </div>

                    {/* Center Column - Swap Card */}
                    <div className="flex flex-col items-center gap-6 lg:w-[420px] flex-shrink-0">
                        <SwapCard />

                        {/* Toggle Buttons */}
                        <div className="flex items-center gap-3">
                            <ToggleSection
                                label="Chart"
                                isVisible={showChart}
                                onToggle={() => setShowChart(!showChart)}
                            />
                            <ToggleSection
                                label="History"
                                isVisible={showHistory}
                                onToggle={() => setShowHistory(!showHistory)}
                            />
                        </div>

                        {/* Token Mini Charts */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                            <TokenMiniChart
                                symbol="AL"
                                name="ALGO"
                                price="1.799483 USDC"
                                reserve={19.39}
                                variant="algo"
                            />
                            <TokenMiniChart
                                symbol="US"
                                name="USDC"
                                price="0.555715 ALGO"
                                reserve={10.78}
                                variant="usdc"
                            />
                        </div>
                    </div>

                    {/* Right Column - Spacer for balance */}
                    <div className="hidden lg:block lg:flex-1 lg:max-w-md" />
                </div>

                {/* Collapsible History Section */}
                {showHistory && (
                    <div className="mt-8 animate-fade-in">
                        <SwapHistory records={MOCK_HISTORY} onRefresh={() => { }} />
                    </div>
                )}
            </main>
        </div>
    );
}
