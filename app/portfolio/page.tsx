"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NetWorthCard } from "@/components/portfolio/NetWorthCard";
import { AgentWalletCard } from "@/components/portfolio/AgentWalletCard";
import { TokenHoldingRow } from "@/components/portfolio/TokenHoldingRow";
import { PortfolioSummary } from "@/components/portfolio/PortfolioSummary";
import { PortfolioTable, type PortfolioRow } from "@/components/portfolio/PortfolioTable";

// Mock data for demonstration
const MOCK_TOKENS = [
  {
    id: "eth-ethereum",
    chain: "ethereum",
    symbol: "ETH",
    amount: "2.3456",
    priceUsd: 3420.21,
    change24h: -2.1,
    change30d: 12.5,
    imageUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=035",
  },
  {
    id: "usdc-arbitrum",
    chain: "arbitrum",
    symbol: "USDC",
    amount: "5450.00",
    priceUsd: 1.0,
    change24h: 0.01,
    change30d: 0.02,
    imageUrl: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=035",
  },
  {
    id: "uni-base",
    chain: "base",
    symbol: "UNI",
    amount: "125.50",
    priceUsd: 12.45,
    change24h: 5.2,
    change30d: -8.3,
    imageUrl: "https://cryptologos.cc/logos/uniswap-uni-logo.png?v=035",
  },
  {
    id: "arb-arbitrum",
    chain: "arbitrum",
    symbol: "ARB",
    amount: "2500.00",
    priceUsd: 0.82,
    change24h: 3.4,
    change30d: 15.6,
    imageUrl: "https://cryptologos.cc/logos/arbitrum-arb-logo.png?v=035",
  },
  {
    id: "op-optimism",
    chain: "optimism",
    symbol: "OP",
    amount: "850.00",
    priceUsd: 2.15,
    change24h: -1.2,
    change30d: 22.4,
    imageUrl: "https://cryptologos.cc/logos/optimism-ethereum-op-logo.png?v=035",
  },
  {
    id: "link-ethereum",
    chain: "ethereum",
    symbol: "LINK",
    amount: "45.75",
    priceUsd: 18.92,
    change24h: 1.8,
    change30d: 5.2,
    imageUrl: "https://cryptologos.cc/logos/chainlink-link-logo.png?v=035",
  },
];

// Generate chart data
const generateChartData = (baseValue: number, variance: number, points: number) => {
  const data = [];
  let value = baseValue;
  for (let i = 0; i < points; i++) {
    value = value + (Math.random() - 0.5) * variance;
    data.push({
      time: `Day ${i + 1}`,
      value: Math.max(0, value),
    });
  }
  return data;
};

export default function Index() {
  const [selectedTokenIds, setSelectedTokenIds] = useState<Set<string>>(new Set());
  const [hideDust, setHideDust] = useState(false);
  const [mergeChains, setMergeChains] = useState(true);

  // Calculate total portfolio value
  const totalPortfolioValue = useMemo(() => {
    return MOCK_TOKENS.reduce((sum, token) => {
      return sum + parseFloat(token.amount) * token.priceUsd;
    }, 0);
  }, []);

  // Calculate selected worth
  const selectedWorth = useMemo(() => {
    if (selectedTokenIds.size === 0) return totalPortfolioValue;
    return MOCK_TOKENS.filter((t) => selectedTokenIds.has(t.id)).reduce(
      (sum, token) => sum + parseFloat(token.amount) * token.priceUsd,
      0
    );
  }, [selectedTokenIds, totalPortfolioValue]);

  // Chart data
  const chartData = useMemo(
    () => generateChartData(totalPortfolioValue, totalPortfolioValue * 0.05, 30),
    [totalPortfolioValue]
  );

  // Token toggle handler
  const handleToggleToken = useCallback((id: string) => {
    setSelectedTokenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Select all handler
  const handleSelectAll = useCallback(() => {
    setSelectedTokenIds((prev) => {
      if (prev.size === MOCK_TOKENS.length) {
        return new Set();
      }
      return new Set(MOCK_TOKENS.map((t) => t.id));
    });
  }, []);

  // Table rows
  const tableRows: PortfolioRow[] = useMemo(() => {
    const filteredTokens =
      selectedTokenIds.size === 0
        ? MOCK_TOKENS
        : MOCK_TOKENS.filter((t) => selectedTokenIds.has(t.id));

    return filteredTokens.map((token) => ({
      id: token.id,
      chain: token.chain,
      coin: token.symbol,
      amount: token.amount,
      priceUsd: token.priceUsd,
      change24hPercent: token.change24h,
      change30dPercent: token.change30d,
      holdingUsd: parseFloat(token.amount) * token.priceUsd,
      newsCount: Math.floor(Math.random() * 10),
      imageUrl: token.imageUrl,
    }));
  }, [selectedTokenIds]);

  // Calculate average changes
  const avgChange24h = useMemo(() => {
    const tokens = selectedTokenIds.size === 0 ? MOCK_TOKENS : MOCK_TOKENS.filter((t) => selectedTokenIds.has(t.id));
    return tokens.reduce((sum, t) => sum + t.change24h, 0) / (tokens.length || 1);
  }, [selectedTokenIds]);

  const avgChange30d = useMemo(() => {
    const tokens = selectedTokenIds.size === 0 ? MOCK_TOKENS : MOCK_TOKENS.filter((t) => selectedTokenIds.has(t.id));
    return tokens.reduce((sum, t) => sum + t.change30d, 0) / (tokens.length || 1);
  }, [selectedTokenIds]);

  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Top Row - Net Worth & Agent Wallet */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <NetWorthCard
              netWorthUsd={totalPortfolioValue}
              change24hPercent={avgChange24h}
              chartData={chartData}
            />
          </div>
          <div className="lg:col-span-1">
            <AgentWalletCard
              walletName="Main Agent"
              balanceUsd={0.0}
              walletAddress="US2VED77WY3MFUZ5KQPT7QXYL3V4HJKL"
              onRecharge={() => console.log("Recharge")}
              onRefresh={() => console.log("Refresh")}
            />
          </div>
        </div>

        {/* Token Holding Row */}
        <TokenHoldingRow
          tokens={MOCK_TOKENS}
          selectedTokenIds={selectedTokenIds}
          onToggleToken={handleToggleToken}
          onSelectAll={handleSelectAll}
          totalPortfolioValue={totalPortfolioValue}
        />

        {/* Tabs */}
        <Tabs defaultValue="portfolio" className="w-full">
          <TabsList className="w-full md:w-auto grid grid-cols-2 md:inline-flex bg-secondary rounded-xl p-1">
            <TabsTrigger
              value="portfolio"
              className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-8 py-2.5 font-medium"
            >
              PORTFOLIO
            </TabsTrigger>
            <TabsTrigger
              value="nft"
              className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-8 py-2.5 font-medium"
            >
              NFT
            </TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="mt-6 space-y-6">
            <PortfolioSummary
              selectedWorth={selectedWorth}
              change24hPercent={avgChange24h}
              change30dPercent={avgChange30d}
              coinCount={
                selectedTokenIds.size === 0
                  ? MOCK_TOKENS.length
                  : selectedTokenIds.size
              }
              chartData={chartData}
            />

            <PortfolioTable
              rows={tableRows}
              hideDust={hideDust}
              mergeChains={mergeChains}
              onToggleHideDust={() => setHideDust(!hideDust)}
              onToggleMergeChains={() => setMergeChains(!mergeChains)}
            />
          </TabsContent>

          <TabsContent value="nft" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-12 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-4xl">🖼️</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No NFTs Found
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your NFT collection will appear here once you acquire some.
                Start exploring marketplaces to find unique digital assets.
              </p>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
