"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    AuditScoreCard,
    RadarChart,
    FinancialAuditChart,
    TechnicalAnalysis,
    FundamentalAnalysis,
    SimilarTokens,
} from "@/components/token";
import type { TokenDetailResponse } from "@/app/api/token/[id]/route";

interface AnalysisResponse {
    fundamental: string;
    technical: string;
}

export default function TokenDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [tokenData, setTokenData] = useState<TokenDetailResponse | null>(null);
    const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeScore, setActiveScore] = useState<"financial" | "fundamental" | "social" | "security">("financial");
    const [similarTokens, setSimilarTokens] = useState<any[]>([]);

    useEffect(() => {
        const fetchTokenData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/token/${id}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch token data");
                }
                const data: TokenDetailResponse = await response.json();
                setTokenData(data);

                // Fetch analysis
                const analysisResponse = await fetch(`/api/token/${id}/analysis`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        tokenName: data.name,
                        symbol: data.symbol,
                        price: data.price,
                        marketCap: data.marketCap,
                        volume24h: data.volume24h,
                        priceChange24h: data.priceChange24h,
                        auditScores: data.auditScores,
                        tags: data.tags,
                    }),
                });

                if (analysisResponse.ok) {
                    const analysisData: AnalysisResponse = await analysisResponse.json();
                    setAnalysis(analysisData);
                }

                // Fetch similar tokens (top tokens from main API)
                const similarResponse = await fetch("/api/crypto?limit=10");
                if (similarResponse.ok) {
                    const similarData = await similarResponse.json();
                    // Filter out current token and get top 3
                    const filtered = similarData.tokens
                        .filter((t: any) => t.id !== id)
                        .slice(0, 3)
                        .map((t: any) => ({
                            id: t.id,
                            name: t.name,
                            symbol: t.symbol,
                            imageUrl: t.imageUrl,
                            price: t.price,
                            priceChange24h: t.change24h,
                            auditScore: 8.0 + Math.random() * 1.5, // Placeholder score
                        }));
                    setSimilarTokens(filtered);
                }
            } catch (error) {
                console.error("Error fetching token data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchTokenData();
        }
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen pt-32">
                <div className="max-w-[1600px] mx-auto px-4 md:px-6">
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-64 bg-muted/30 rounded-lg animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!tokenData) {
        return (
            <div className="min-h-screen pt-32">
                <div className="max-w-[1600px] mx-auto px-4 md:px-6">
                    <div className="glass-card rounded-lg p-12 text-center">
                        <h2 className="text-2xl font-bold mb-2">Token not found</h2>
                        <p className="text-muted-foreground">The token you're looking for doesn't exist.</p>
                    </div>
                </div>
            </div>
        );
    }

    const formatPrice = (price: number) => {
        return price.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    return (
        <div className="min-h-screen pt-32 pb-12">
            <div className="max-w-[1600px] mx-auto px-4 md:px-6 space-y-6">
                {/* Header Section */}
                <div className="glass-card rounded-2xl p-6 border bg-card/50">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="relative w-16 h-16 rounded-full bg-muted overflow-hidden flex-shrink-0">
                                {tokenData.imageUrl ? (
                                    <Image
                                        src={tokenData.imageUrl}
                                        alt={tokenData.name}
                                        width={64}
                                        height={64}
                                        className="rounded-full"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xl font-bold">
                                        {tokenData.symbol.slice(0, 2)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold mb-1">
                                    {tokenData.name} ${tokenData.symbol}
                                </h1>
                                <p className="text-sm text-muted-foreground uppercase">AUDIT REPORT</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <div className="text-right">
                                <p className="text-2xl font-bold">${formatPrice(tokenData.price)}</p>
                                <p
                                    className={cn(
                                        "text-sm font-medium flex items-center justify-end gap-1",
                                        tokenData.priceChange24h >= 0 ? "text-green-500" : "text-red-500"
                                    )}
                                >
                                    {tokenData.priceChange24h >= 0 ? (
                                        <ArrowUp className="w-4 h-4" />
                                    ) : (
                                        <ArrowDown className="w-4 h-4" />
                                    )}
                                    {tokenData.priceChange24h >= 0 ? "+" : ""}
                                    {tokenData.priceChange24h.toFixed(2)}%
                                </p>
                            </div>
                            <div className="border-2 border-green-500 rounded-lg px-4 py-2">
                                <p className="text-2xl font-bold text-green-500">
                                    {tokenData.auditScores.overall.toFixed(1)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Audit Score Navigation */}
                <div className="flex flex-wrap gap-2">
                    <AuditScoreCard
                        label="Financial"
                        score={tokenData.auditScores.financial}
                        isActive={activeScore === "financial"}
                        onClick={() => setActiveScore("financial")}
                    />
                    <AuditScoreCard
                        label="Fundamental"
                        score={tokenData.auditScores.fundamental}
                        isActive={activeScore === "fundamental"}
                        onClick={() => setActiveScore("fundamental")}
                    />
                    <AuditScoreCard
                        label="Social"
                        score={tokenData.auditScores.social}
                        isActive={activeScore === "social"}
                        onClick={() => setActiveScore("social")}
                    />
                    <AuditScoreCard
                        label="Security"
                        score={tokenData.auditScores.security}
                        isActive={activeScore === "security"}
                        onClick={() => setActiveScore("security")}
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Radar Chart */}
                    <div className="lg:col-span-1">
                        <div className="glass-card rounded-2xl p-6 border bg-card/50">
                            <RadarChart
                                financial={tokenData.auditScores.financial}
                                fundamental={tokenData.auditScores.fundamental}
                                social={tokenData.auditScores.social}
                                security={tokenData.auditScores.security}
                            />
                        </div>

                        {/* Individual Score Cards */}
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="glass-card rounded-lg p-4 border bg-card/50 text-center">
                                <p className="text-sm text-muted-foreground mb-2">Financial</p>
                                <div className="w-16 h-16 mx-auto rounded-full border-2 border-blue-500 flex items-center justify-center">
                                    <span className="text-xl font-bold">{tokenData.auditScores.financial}</span>
                                </div>
                            </div>
                            <div className="glass-card rounded-lg p-4 border bg-card/50 text-center">
                                <p className="text-sm text-muted-foreground mb-2">Fundamental</p>
                                <div className="w-16 h-16 mx-auto rounded-full border-2 border-blue-500 flex items-center justify-center">
                                    <span className="text-xl font-bold">{tokenData.auditScores.fundamental}</span>
                                </div>
                            </div>
                            <div className="glass-card rounded-lg p-4 border bg-card/50 text-center">
                                <p className="text-sm text-muted-foreground mb-2">Social</p>
                                <div className="w-16 h-16 mx-auto rounded-full border-2 border-blue-500 flex items-center justify-center">
                                    <span className="text-xl font-bold">{tokenData.auditScores.social}</span>
                                </div>
                            </div>
                            <div className="glass-card rounded-lg p-4 border bg-card/50 text-center">
                                <p className="text-sm text-muted-foreground mb-2">Security</p>
                                <div className="w-16 h-16 mx-auto rounded-full border-2 border-blue-500 flex items-center justify-center">
                                    <span className="text-xl font-bold">{tokenData.auditScores.security}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Financial Audit */}
                    <div className="lg:col-span-2">
                        <div className="glass-card rounded-2xl p-6 border bg-card/50">
                            <FinancialAuditChart
                                historicalData={tokenData.historicalData}
                                currentPrice={tokenData.price}
                                priceChange24h={tokenData.priceChange24h}
                                marketCap={tokenData.marketCap}
                                volume24h={tokenData.volume24h}
                                volumeBreakdown={tokenData.volumeBreakdown}
                                circulatingSupply={tokenData.circulatingSupply}
                                maxSupply={tokenData.maxSupply}
                                liquidityRatio={tokenData.liquidityRatio}
                            />
                        </div>
                    </div>
                </div>

                {/* Technical Analysis and Fundamental */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="glass-card rounded-2xl p-6 border bg-card/50">
                        <TechnicalAnalysis
                            analysis={analysis?.technical || ""}
                            priceChange24h={tokenData.priceChange24h}
                            auditScores={{
                                financial: tokenData.auditScores.financial,
                                security: tokenData.auditScores.security,
                            }}
                        />
                    </div>
                    <div className="glass-card rounded-2xl p-6 border bg-card/50">
                        <FundamentalAnalysis analysis={analysis?.fundamental || ""} />
                    </div>
                </div>

                {/* Similar Tokens */}
                {similarTokens.length > 0 && (
                    <div className="glass-card rounded-2xl p-6 border bg-card/50">
                        <SimilarTokens
                            tokens={similarTokens}
                            onTokenClick={(tokenId) => router.push(`/token/${tokenId}`)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
