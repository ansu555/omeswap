"use client";

import { useState, useEffect } from "react";
import { SwapCard } from "@/components/trade/SwapCard";
import { PoolLiquidity } from "@/components/trade/PoolLiquidity";
import { TokenMiniChart } from "@/components/trade/TokenMiniChart";
import { SwapHistory } from "@/components/trade/SwapHistory";
import { ToggleSection } from "@/components/trade/ToggleSection";
import { CryptoLogoCursor } from "@/components/trade/CryptoLogoCursor";

const MOCK_HISTORY = [
    {
        id: "1",
        time: "about 1 month ago",
        from: "tUSDC",
        fromAmount: 100,
        to: "tUSDT",
        toAmount: "~99.7 tUSDT",
        route: "Mantle DEX",
        slippage: "0.5%",
        status: "confirmed" as const,
        txHash: "abc123",
    },
];

export default function TradePage() {
    const [showChart, setShowChart] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [cryptoLogos, setCryptoLogos] = useState<string[]>([]);

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

            <div className="container mx-auto px-4 pt-24 pb-12 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Left Sidebar - Pool Liquidity */}
                    <div className="lg:col-span-1 order-2 lg:order-1">
                        <PoolLiquidity />
                        {showChart && (
                            <div className="mt-6">
                                <TokenMiniChart
                                    symbol="tUSDC"
                                    name="Test USDC"
                                    price="$1.00"
                                    reserve={0}
                                    variant="usdc"
                                />
                            </div>
                        )}
                    </div>

                    {/* Center - Main Trading Interface */}
                    <div className="lg:col-span-1 order-1 lg:order-2">
                        <div className="flex flex-col items-center space-y-6">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-3 mb-6">
                                    <TabsTrigger value="swap">Swap</TabsTrigger>
                                    <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
                                    <TabsTrigger value="mint">Mint Tokens</TabsTrigger>
                                </TabsList>

                                <TabsContent value="swap" className="mt-0">
                                    <SwapCardDex />
                                </TabsContent>

                                <TabsContent value="liquidity" className="mt-0">
                                    <AddLiquidityCard />
                                </TabsContent>

                                <TabsContent value="mint" className="mt-0">
                                    <MintTokensCard />
                                </TabsContent>
                            </Tabs>

                            {/* Chart Toggle */}
                            <ToggleSection
                                label="Price Chart"
                                isVisible={showChart}
                                onToggle={() => setShowChart(!showChart)}
                            />
                        </div>
                    </div>

                    {/* Right Sidebar - Swap History */}
                    <div className="lg:col-span-1 order-3">
                        <div className="mb-4">
                            <ToggleSection
                                label="Swap History"
                                isVisible={showHistory}
                                onToggle={() => setShowHistory(!showHistory)}
                            />
                        </div>
                        
                        {showHistory && (
                            <SwapHistory
                                records={MOCK_HISTORY}
                                onRefresh={() => console.log("Refreshing history...")}
                            />
                        )}

                        {/* Instructions Card */}
                        <div className="mt-6 p-4 bg-card border border-border rounded-xl backdrop-blur-xl">
                            <h3 className="font-semibold mb-3 text-sm">🎯 Getting Started</h3>
                            <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
                                <li>Connect your wallet (top right)</li>
                                <li>Switch to <strong>Mantle Sepolia Testnet</strong></li>
                                <li>Click "Mint Tokens" tab to get test tokens</li>
                                <li>Use "Liquidity" tab to add liquidity to pools</li>
                                <li>Use "Swap" tab to trade tokens</li>
                            </ol>
                            
                            <div className="mt-4 pt-4 border-t border-border">
                                <h4 className="font-semibold mb-2 text-xs">📋 Smart Contracts</h4>
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Pools:</span>
                                        <a 
                                            href="https://explorer.sepolia.mantle.xyz/address/0xe63514C2B0842B58A16Ced0C63668BAA91B033Af"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline font-mono text-[10px]"
                                        >
                                            0xe635...3Af ↗
                                        </a>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Router:</span>
                                        <a 
                                            href="https://explorer.sepolia.mantle.xyz/address/0xFe2108798dC74481d5cCE1588cBD00801758dD6d"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline font-mono text-[10px]"
                                        >
                                            0xFe21...D6d ↗
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-border">
                                <h4 className="font-semibold mb-2 text-xs">⚡ Features</h4>
                                <ul className="text-xs text-muted-foreground space-y-1">
                                    <li>✅ Uniswap V2 AMM</li>
                                    <li>✅ Multi-hop routing</li>
                                    <li>✅ 0.3% swap fee</li>
                                    <li>✅ LP token rewards</li>
                                    <li>✅ Low gas on L2</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
