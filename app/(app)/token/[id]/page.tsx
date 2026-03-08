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
import { SwapCardDex } from "@/components/trade/SwapCardDex";

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
  fundamental: {
    website: string;
    whitepaper: string;
    country: string;
    maturityMonths: number;
    globalHype: number;
    narratives: Record<string, { perf: number }>;
    git: {
      name: string;
      url: string;
      description: string;
      forks: number;
      watchers: number;
      subscribers: number;
    } | null;
    news: Array<{
      time: string;
      title: string;
      score: number;
      sentiment: "bullish" | "bearish";
      link: string;
      source: string;
    }>;
    cexListings: Array<{
      name: string;
      logo: string;
      link: string;
      trustScore: number;
    }>;
  };
  social: {
    sentiment: number;
    platforms: Array<{
      name: string;
      icon: string;
      status: string;
      url: string;
      posts?: string;
      postsChange?: string;
      users?: string;
      usersChange?: string;
      usersLabel?: string;
      activeUsers?: string;
      subscribers?: string;
    }>;
  };
  security: {
    grade: string;
    infrastructureScore: number;
    securityInfo: Array<{
      label: string;
      value: string;
      status: "neutral" | "success";
    }>;
    dnsItems: Array<{ label: string; status: "ok" | "warning" }>;
    emailItems: Array<{ label: string; status: "ok" | "warning" }>;
    exposedPorts: string[];
  };
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch token data
  useEffect(() => {
    async function fetchTokenData() {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const tokenResponse = await fetch(`/api/token/${id}`);
        if (!tokenResponse.ok) {
          throw new Error(
            `Failed to fetch token data: ${tokenResponse.statusText}`,
          );
        }
        const token: TokenData = await tokenResponse.json();
        setTokenData(token);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load token data",
        );
        console.error("Error fetching token data:", err);
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
            <div className="text-destructive text-xl font-semibold mb-2">
              Error Loading Token
            </div>
            <p className="text-muted-foreground">
              {error || "Token not found"}
            </p>
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
    {
      id: "fundamental",
      label: "Fundamental",
      score: tokenData.auditScores.fundamental,
    },
    { id: "social", label: "Social", score: tokenData.auditScores.social },
    {
      id: "security",
      label: "Security",
      score: tokenData.auditScores.security,
    },
  ];

  return (
    <div className="min-h-screen pb-12">
      <div className="pt-28 max-w-[1400px] mx-auto px-4 md:px-6 space-y-8">
        {/* Token Header */}
        <div className="dashboard-card">
          <TokenHeader
            name={tokenData.name}
            ticker={tokenData.symbol}
            chain={
              tokenData.tags.includes("layer-1")
                ? "Layer 1"
                : tokenData.tags.includes("ethereum-ecosystem")
                  ? "Ethereum"
                  : "Multi-Chain"
            }
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
          <SwapCardDex />
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
              <ScoreCard
                label="Financial"
                score={tokenData.auditScores.financial}
              />
              <ScoreCard
                label="Fundamental"
                score={tokenData.auditScores.fundamental}
              />
              <ScoreCard label="Social" score={tokenData.auditScores.social} />
              <ScoreCard
                label="Security"
                score={tokenData.auditScores.security}
              />
            </div>
          </div>

          {/* Right: About Card */}
          <div className="dashboard-card h-full">
            <h2 className="dashboard-card-title mb-4">
              About {tokenData.name}
            </h2>
            <div className="space-y-3">
              <p className="text-muted-foreground leading-relaxed text-sm line-clamp-6">
                {tokenData.description ||
                  `${tokenData.name} (${tokenData.symbol}) is a cryptocurrency with a market cap of ${formatNumber(tokenData.marketCap)}.`}
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 text-sm">
                <div>
                  <span className="text-muted-foreground">
                    Circulating Supply:
                  </span>
                  <p className="font-medium">
                    {formatSupply(tokenData.circulatingSupply)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Max Supply:</span>
                  <p className="font-medium">
                    {formatSupply(tokenData.maxSupply)}
                  </p>
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
              description={
                tokenData.description ||
                `${tokenData.name} is a cryptocurrency project.`
              }
              relatedNews={tokenData.fundamental?.news}
              country={tokenData.fundamental?.country || "Unknown"}
              website={tokenData.fundamental?.website || ""}
              whitepaper={!!tokenData.fundamental?.whitepaper}
              maturityMonths={tokenData.fundamental?.maturityMonths || 0}
            />
          )}

          {activeCategory === "social" && (
            <SocialAnalysis
              sentiment={tokenData.social?.sentiment || 50}
              platforms={tokenData.social?.platforms}
            />
          )}

          {activeCategory === "security" && (
            <SecurityAnalysis
              grade={tokenData.security?.grade || "N/A"}
              infrastructureScore={tokenData.security?.infrastructureScore || 0}
              securityInfo={tokenData.security?.securityInfo}
              dnsItems={tokenData.security?.dnsItems}
              emailItems={tokenData.security?.emailItems}
              exposedPorts={tokenData.security?.exposedPorts}
            />
          )}
        </div>

        {/* Related Tokens */}
        <RelatedTokens />
      </div>
    </div>
  );
}
