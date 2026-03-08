"use client";

import { useState } from "react";
import { SwapCardDex } from "@/components/trade/SwapCardDex";
import { PoolLiquidity } from "@/components/trade/PoolLiquidity";
import { SwapHistory } from "@/components/trade/SwapHistory";
import { ToggleSection } from "@/components/trade/ToggleSection";

const MOCK_HISTORY: any[] = [];

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
                        <SwapCardDex />

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
