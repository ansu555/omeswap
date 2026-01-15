"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  TokenHeader,
  ScoreCard,
  CategoryTabs,
  PriceChart,
  StatsCard,
  FundamentalAnalysis,
  SocialAnalysis,
  SecurityAnalysis,
  RelatedTokens,
} from "@/components/token-detail";
import { SwapCard } from "@/components/trade/SwapCard";

interface TokenData {
  id: string;
  name: string;
  symbol: string;
  imageUrl: string;
  description: string;
  price: number;
  priceChange24h: number;
  rank: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  totalSupply: number | null;
  maxSupply: number | null;
  auditScores: {
    financial: number;
    fundamental: number;
    social: number;
    security: number;
    overall: number;
  };
  historicalData: Array<{
    timestamp: number;
    price: number;
  }>;
  volumeBreakdown: {
    cex: number;
    dex: number;
  };
  liquidityRatio: number;
  tags: string[];
  dateAdded: string;
  lastUpdated: string;
  kryllData?: {
    financial: any;
    fundamental: any;
    social: any;
    security: any;
  };
}

interface AnalysisData {
  fundamental: string;
  technical: string;
}

// Format large numbers
function formatNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

// Format supply numbers
function formatSupply(num: number | null): string {
  if (num === null) return "∞";
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)} B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)} M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)} K`;
  return num.toFixed(0);
}

export default function TokenDetailPage() {
  const { id } = useParams();
  const [activeCategory, setActiveCategory] = useState("fundamental");

  // Get token data based on ID, fallback to a generic display
  const tokenId = (id as string)?.toLowerCase() as TokenId;
  const token = tokenData[tokenId] || {
    name: String(id).charAt(0).toUpperCase() + String(id).slice(1),
    ticker: String(id).toUpperCase().slice(0, 4),
    chain: "Blockchain",
    price: 1.0,
    priceChange24h: 0.0,
    overallScore: 7.5,
    description: `${String(id).charAt(0).toUpperCase() + String(id).slice(1)} is a cryptocurrency token. Detailed analytics and information will be displayed here once integrated with live data sources.`,
    scores: {
      financial: 75,
      fundamental: 70,
      social: 80,
      security: 72,
    },
    marketCap: "$0",
    volume24h: "$0",
    volumeChange: 0,
    circulatingSupply: "0",
    maxSupply: "∞",
    liquidityRatio: 50,
    tvl: "$0",
    fdv: "$0",
  };

  const categories = [
    { id: "fundamental", label: "Fundamental", score: token.scores.fundamental },
    { id: "social", label: "Social", score: token.scores.social },
    { id: "security", label: "Security", score: token.scores.security },
  ];

  return (
    <div className="min-h-screen pb-12">
      <div className="pt-28 max-w-[1400px] mx-auto px-4 md:px-6 space-y-8">
        {/* Token Header */}
        <div className="dashboard-card">
          <TokenHeader
            name={token.name}
            ticker={token.ticker}
            chain={token.chain}
            price={token.price}
            priceChange24h={token.priceChange24h}
            overallScore={token.overallScore}
            imageUrl={token.imageUrl}
          />
        </div>

        {/* Price Chart & Swap */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          <PriceChart basePrice={token.price} priceChange24h={token.priceChange24h} />
          <SwapCard />
        </div>

        {/* Stats, Score Cards & About */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
          {/* Left: Stats Card + Score Cards */}
          <div className="flex flex-col gap-6">
            <StatsCard
              tvl={token.tvl}
              marketCap={token.marketCap}
              fdv={token.fdv}
              volume1d={token.volume24h}
            />
            <div className="grid grid-cols-2 gap-4">
              <ScoreCard label="Financial" score={token.scores.financial} />
              <ScoreCard label="Fundamental" score={token.scores.fundamental} />
              <ScoreCard label="Social" score={token.scores.social} />
              <ScoreCard label="Security" score={token.scores.security} />
            </div>
          </div>

          {/* Right: About Card */}
          <div className="dashboard-card h-full">
            <h2 className="dashboard-card-title mb-4">About {tokenData.name}</h2>
            <div className="space-y-3">
              {tokenData.description ? (
                <div className="text-muted-foreground leading-relaxed max-h-[400px] overflow-y-auto pr-2">
                  {tokenData.description.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-3">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground leading-relaxed">
                  {analysisData?.fundamental.split('\n\n')[0] || 
                    `${tokenData.name} (${tokenData.symbol}) is a cryptocurrency with a market cap of ${formatNumber(tokenData.marketCap)}. It ranks #${tokenData.rank} on CoinMarketCap.`}
                </p>
              )}
              <div className="grid grid-cols-2 gap-2 text-sm border-t border-border mt-4 pt-4">
                <div>
                  <span className="text-muted-foreground">Circulating Supply:</span>
                  <p className="font-medium">{formatSupply(tokenData.circulatingSupply)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Max Supply:</span>
                  <p className="font-medium">{formatSupply(tokenData.maxSupply)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">CEX Volume:</span>
                  <p className="font-medium">{formatNumber(tokenData.volumeBreakdown.cex)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">DEX Volume:</span>
                  <p className="font-medium">{formatNumber(tokenData.volumeBreakdown.dex)}</p>
                </div>
              </div>
              {tokenData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                  {tokenData.tags.slice(0, 5).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {/* Category Content */}
        <div className="space-y-6">
          {activeCategory === "fundamental" && (
            <FundamentalAnalysis
              description={token.description}
              website={`${token.ticker.toLowerCase()}.org`}
            />
          )}

          {activeCategory === "social" && <SocialAnalysis />}

          {activeCategory === "security" && <SecurityAnalysis />}
        </div>

        {/* Related Tokens */}
        <RelatedTokens />
      </div>
    </div>
  );
}
