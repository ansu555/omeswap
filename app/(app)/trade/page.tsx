"use client";

import { useState, useEffect } from "react";
import { SwapCardDex } from "@/components/trade/SwapCardDex";
import { AddLiquidityCard } from "@/components/trade/AddLiquidityCard";
import { MintTokensCard } from "@/components/trade/MintTokensCard";
import { SelectedPoolInfo } from "@/components/trade/SelectedPoolInfo";
import { CryptoLogoCursor } from "@/components/trade/CryptoLogoCursor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TradePage() {
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
                    {/* Main Trading Interface */}
                    <div className="w-full max-w-4xl mx-auto">
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
                    </div>
                </div>
            </main>
        </div>
    );
}
