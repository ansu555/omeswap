"use client";

import { useState, useEffect } from "react";
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
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch token data and analysis
  useEffect(() => {
    async function fetchTokenData() {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch token details
        const tokenResponse = await fetch(`/api/token/${id}`);
        if (!tokenResponse.ok) {
          throw new Error(`Failed to fetch token data: ${tokenResponse.statusText}`);
        }
        const token: TokenData = await tokenResponse.json();
        setTokenData(token);

        // Fetch analysis data
        const analysisResponse = await fetch(`/api/token/${id}/analysis`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tokenName: token.name,
            symbol: token.symbol,
            price: token.price,
            marketCap: token.marketCap,
            volume24h: token.volume24h,
            priceChange24h: token.priceChange24h,
            auditScores: token.auditScores,
            tags: token.tags,
          }),
        });

        if (analysisResponse.ok) {
          const analysis: AnalysisData = await analysisResponse.json();
          setAnalysisData(analysis);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load token data');
        console.error('Error fetching token data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTokenData();
  }, [id]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen pb-12">
        <div className="pt-28 max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="dashboard-card p-8 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
            </div>
            <p className="text-muted-foreground mt-4">Loading token data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !tokenData) {
    return (
      <div className="min-h-screen pb-12">
        <div className="pt-28 max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="dashboard-card p-8 text-center">
            <div className="text-destructive text-xl font-semibold mb-2">Error Loading Token</div>
            <p className="text-muted-foreground">{error || 'Token not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate FDV (Fully Diluted Valuation)
  const fdv = tokenData.maxSupply
    ? tokenData.price * tokenData.maxSupply
    : tokenData.marketCap;

  // Estimate TVL (Total Value Locked) - simplified calculation
  const tvl = tokenData.marketCap * 0.1; // Rough estimate: 10% of market cap

  const categories = [
    { id: "fundamental", label: "Fundamental", score: tokenData.auditScores.fundamental },
    { id: "social", label: "Social", score: tokenData.auditScores.social },
    { id: "security", label: "Security", score: tokenData.auditScores.security },
  ];

  return (
    <div className="min-h-screen pb-12">
      <div className="pt-28 max-w-[1400px] mx-auto px-4 md:px-6 space-y-8">
        {/* Token Header */}
        <div className="dashboard-card">
          <TokenHeader
            name={tokenData.name}
            ticker={tokenData.symbol}
            chain={tokenData.tags.includes('layer-1') ? 'Layer 1' : tokenData.tags.includes('ethereum-ecosystem') ? 'Ethereum' : 'Multi-Chain'}
            price={tokenData.price}
            priceChange24h={tokenData.priceChange24h}
            overallScore={tokenData.auditScores.overall}
            imageUrl={tokenData.imageUrl}
          />
        </div>

        {/* Price Chart & Swap */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          <PriceChart 
            basePrice={tokenData.price} 
            priceChange24h={tokenData.priceChange24h}
            historicalData={tokenData.historicalData}
          />
          <SwapCard />
        </div>

        {/* Stats, Score Cards & About */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
          {/* Left: Stats Card + Score Cards */}
          <div className="flex flex-col gap-6">
            <StatsCard
              tvl={formatNumber(tvl)}
              marketCap={formatNumber(tokenData.marketCap)}
              fdv={formatNumber(fdv)}
              volume1d={formatNumber(tokenData.volume24h)}
            />
            <div className="grid grid-cols-2 gap-4">
              <ScoreCard label="Financial" score={tokenData.auditScores.financial} />
              <ScoreCard label="Fundamental" score={tokenData.auditScores.fundamental} />
              <ScoreCard label="Social" score={tokenData.auditScores.social} />
              <ScoreCard label="Security" score={tokenData.auditScores.security} />
            </div>
          </div>

          {/* Right: About Card */}
          <div className="dashboard-card h-full">
            <h2 className="dashboard-card-title mb-4">About {tokenData.name}</h2>
            <div className="space-y-3">
              <p className="text-muted-foreground leading-relaxed">
                {analysisData?.fundamental.split('\n\n')[0] || 
                  `${tokenData.name} (${tokenData.symbol}) is a cryptocurrency with a market cap of ${formatNumber(tokenData.marketCap)}. It ranks #${tokenData.rank} on CoinMarketCap.`}
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Circulating Supply:</span>
                  <p className="font-medium">{formatSupply(tokenData.circulatingSupply)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Max Supply:</span>
                  <p className="font-medium">{formatSupply(tokenData.maxSupply)}</p>
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
              description={analysisData?.fundamental || `Loading fundamental analysis for ${tokenData.name}...`}
              website={`https://coinmarketcap.com/currencies/${tokenData.name.toLowerCase().replace(/\s+/g, '-')}/`}
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
