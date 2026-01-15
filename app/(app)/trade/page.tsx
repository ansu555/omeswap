"use client";

import { useState, useEffect } from "react";
import { SwapCardDex } from "@/components/trade/SwapCardDex";
import { AddLiquidityCard } from "@/components/trade/AddLiquidityCard";
import { MintTokensCard } from "@/components/trade/MintTokensCard";
import { PoolLiquidity } from "@/components/trade/PoolLiquidity";
import { TokenMiniChart } from "@/components/trade/TokenMiniChart";
import { SwapHistory } from "@/components/trade/SwapHistory";
import { ToggleSection } from "@/components/trade/ToggleSection";
import { CryptoLogoCursor } from "@/components/trade/CryptoLogoCursor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MOCK_HISTORY = [
    {
        id: "1",
        time: "about 1 month ago",
        from: "MNT",
        fromAmount: 1,
        to: "tUSDC",
        toAmount: "~13.659219 tUSDC",
        route: "pool",
        slippage: "0.5%",
        status: "confirmed" as const,
        txHash: "abc123",
    },
];

export default function TradePage() {
    const [showChart, setShowChart] = useState(true);
    const [showHistory, setShowHistory] = useState(false);
    const [cryptoLogos, setCryptoLogos] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState("swap");

    // Fetch crypto logos from backend
    useEffect(() => {
        const fetchCryptoLogos = async () => {
            try {
                const response = await fetch("/api/crypto?limit=20");
                if (response.ok) {
                    const data = await response.json();
                    const logos = (data.tokens || [])
                        .map((token: { imageUrl?: string }) => token.imageUrl)
                        .filter(Boolean);
                    setCryptoLogos(logos);
                }
            } catch (error) {
                console.error("Failed to fetch crypto logos:", error);
            }
        };
        fetchCryptoLogos();
    }, []);

    return (
        <div className="min-h-screen bg-transparent relative z-10">
            {/* Crypto Logo Cursor Background */}
            {cryptoLogos.length > 0 && (
                <CryptoLogoCursor
                    images={cryptoLogos}
                    spacing={100}
                    randomFloat={true}
                    exitDuration={0.4}
                    removalInterval={40}
                    maxPoints={12}
                    logoSize={36}
                />
            )}

            {/* Header is handled by layout.tsx */}

            <main className="container mx-auto px-4 py-6 pt-6">
                <div className="flex flex-col lg:flex-row gap-6 justify-center">
                    {/* Left Column - Pool Liquidity (only when chart toggled) */}
                    <div className="hidden lg:block lg:flex-1 lg:max-w-md">
                        {showChart && (
                            <div className="animate-fade-in">
                                <PoolLiquidity />
                            </div>
                        )}
                    </div>

                    {/* Center Column - Trading Interface */}
                    <div className="flex flex-col items-center gap-6 lg:w-[420px] flex-shrink-0">
                        
                        <SwapCardDex />

                        {/* Toggle Buttons */}
                        <div className="flex items-center gap-3">
                            <ToggleSection
                                label="Pool Stats"
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full animate-fade-in">
                            <TokenMiniChart
                                symbol="MNT"
                                name="Mantle"
                                price="1.80 USDC"
                                reserve={19.39}
                                variant="algo"
                            />
                            <TokenMiniChart
                                symbol="tUSDC"
                                name="USD Coin"
                                price="0.55 MNT"
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
                    <div className="mt-8 animate-fade-in max-w-4xl mx-auto">
                        <SwapHistory records={MOCK_HISTORY} onRefresh={() => { }} />
                    </div>
                )}
            </main>
        </div>
    );
}
