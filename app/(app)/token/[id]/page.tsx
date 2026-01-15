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

// Mock data for demonstration - will be replaced with real API data
const tokenData = {
  tether: {
    name: "Tether",
    ticker: "USDT",
    chain: "Multi-Chain",
    price: 1.0,
    priceChange24h: 0.01,
    overallScore: 8.5,
    imageUrl: "https://coin-images.coingecko.com/coins/images/325/large/Tether.png",
    description: "Tether (USDT) is a stablecoin pegged to the US Dollar. It is one of the most widely used stablecoins in the cryptocurrency market, providing traders with a way to maintain a stable value while moving between different cryptocurrencies. Tether operates on multiple blockchains including Ethereum, Tron, and others.",
    scores: {
      financial: 95,
      fundamental: 89,
      social: 100,
      security: 83,
    },
    marketCap: "$95.8B",
    volume24h: "$45.04B",
    volumeChange: 109.75,
    circulatingSupply: "95.8 B",
    maxSupply: "∞",
    liquidityRatio: 99,
    tvl: "$8.2B",
    fdv: "$95.8B",
  },
  bitcoin: {
    name: "Bitcoin",
    ticker: "BTC",
    chain: "Bitcoin",
    price: 91937.0,
    priceChange24h: 1.51,
    overallScore: 9.2,
    imageUrl: "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png",
    description: "Bitcoin is the world's first decentralized cryptocurrency, created in 2009 by the pseudonymous Satoshi Nakamoto. It enables peer-to-peer electronic cash transactions without intermediaries like banks or governments, operating on a blockchain secured by Proof of Work mining and the SHA-256 cryptographic algorithm.",
    scores: {
      financial: 95,
      fundamental: 89,
      social: 100,
      security: 83,
    },
    marketCap: "$1.84T",
    volume24h: "$45.04B",
    volumeChange: 109.75,
    circulatingSupply: "19.98 M",
    maxSupply: "21.00 M",
    liquidityRatio: 95,
    tvl: "$1.0B",
    fdv: "$396.6B",
  },
};

type TokenId = keyof typeof tokenData;

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
            <h2 className="dashboard-card-title mb-4">About {token.name}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {token.description}
            </p>
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
