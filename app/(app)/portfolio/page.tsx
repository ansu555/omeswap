"use client";

export const dynamic = "force-dynamic";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NetWorthCard } from "@/components/portfolio/NetWorthCard";
import { AgentWalletCard } from "@/components/portfolio/AgentWalletCard";
import { TokenHoldingRow } from "@/components/portfolio/TokenHoldingRow";
import { PortfolioSummary } from "@/components/portfolio/PortfolioSummary";
import {
  PortfolioTable,
  type PortfolioRow,
} from "@/components/portfolio/PortfolioTable";
import { useAvalancheWallet } from "@/hooks/use-avalanche-wallet";
import { useTokenBalances } from "@/hooks/use-token-balances";
import { TOKEN_ADDRESSES } from "@/contracts/config";

// Token logo mapping
const TOKEN_LOGOS: Record<string, string> = {
  WAVAX: "https://cryptologos.cc/logos/avalanche-avax-logo.png?v=035",
  USDC: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=035",
  "USDC.e": "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=035",
  "USDT.e": "https://cryptologos.cc/logos/tether-usdt-logo.png?v=035",
  "DAI.e":
    "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png?v=035",
  "WETH.e": "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=035",
  "WBTC.e": "https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png?v=035",
  "LINK.e": "https://cryptologos.cc/logos/chainlink-link-logo.png?v=035",
  JOE: "https://s2.coinmarketcap.com/static/img/coins/64x64/11396.png",
  PNG: "https://s2.coinmarketcap.com/static/img/coins/64x64/8422.png",
  "AAVE.e": "https://cryptologos.cc/logos/aave-aave-logo.png?v=035",
};

// Symbol to CoinGecko ID mapping
const SYMBOL_TO_COINGECKO: Record<string, string> = {
  WAVAX: "avalanche-2",
  USDC: "usd-coin",
  "USDC.e": "usd-coin",
  "USDT.e": "tether",
  "DAI.e": "dai",
  "WETH.e": "ethereum",
  "WBTC.e": "wrapped-bitcoin",
  "LINK.e": "chainlink",
  JOE: "joe",
  PNG: "pangolin",
  "AAVE.e": "aave",
};

// Generate chart data
const generateChartData = (
  baseValue: number,
  variance: number,
  points: number,
) => {
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
  const { address, isConnected, balance } = useAvalancheWallet();
  const { balances } = useTokenBalances(address);
  const [selectedTokenIds, setSelectedTokenIds] = useState<Set<string>>(
    new Set(),
  );
  const [hideDust, setHideDust] = useState(false);
  const [mergeChains, setMergeChains] = useState(true);
  const [tokenPrices, setTokenPrices] = useState<
    Record<string, { price: number; change24h: number; change7d: number }>
  >({});
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);

  // Fetch token prices
  useEffect(() => {
    async function fetchPrices() {
      try {
        const response = await fetch("/api/crypto?source=coingecko&limit=100");
        const data = await response.json();

        if (data.tokens) {
          const priceMap: Record<
            string,
            { price: number; change24h: number; change7d: number }
          > = {};

          // Map CoinGecko IDs to our token symbols
          Object.entries(SYMBOL_TO_COINGECKO).forEach(([symbol, geckoId]) => {
            const token = data.tokens.find((t: any) => t.id === geckoId);
            if (token) {
              priceMap[symbol] = {
                price: token.price || 0,
                change24h: token.change24h || 0,
                change7d: token.change7d || 0,
              };
            }
          });

          setTokenPrices(priceMap);
        }
      } catch (error) {
        console.error("Error fetching token prices:", error);
      } finally {
        setIsLoadingPrices(false);
      }
    }

    fetchPrices();
    // Refresh prices every 30 seconds
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  // Build token list from real balances
  const tokens = useMemo(() => {
    if (!isConnected || !address) return [];

    return Object.entries(TOKEN_ADDRESSES)
      .map(([key, tokenInfo]) => {
        const balance = balances[key] || "0";
        const numBalance = parseFloat(balance);

        // Skip tokens with zero balance (optional: remove this to show all)
        if (numBalance === 0) return null;

        const priceData = tokenPrices[tokenInfo.symbol] || {
          price: 0,
          change24h: 0,
          change7d: 0,
        };

        return {
          id: `${key}-avalanche`,
          chain: "avalanche",
          symbol: tokenInfo.symbol,
          amount: balance,
          priceUsd: priceData.price,
          change24h: priceData.change24h,
          change30d: priceData.change7d, // Using 7d as proxy for 30d
          imageUrl:
            TOKEN_LOGOS[tokenInfo.symbol] || "https://via.placeholder.com/64",
        };
      })
      .filter(Boolean) as Array<{
      id: string;
      chain: string;
      symbol: string;
      amount: string;
      priceUsd: number;
      change24h: number;
      change30d: number;
      imageUrl: string;
    }>;
  }, [address, isConnected, balances, tokenPrices]);

  const totalPortfolioValue = useMemo(() => {
    return tokens.reduce((sum, token) => {
      return sum + parseFloat(token.amount) * token.priceUsd;
    }, 0);
  }, [tokens]);

  const selectedWorth = useMemo(() => {
    if (selectedTokenIds.size === 0) return totalPortfolioValue;
    return tokens
      .filter((t) => selectedTokenIds.has(t.id))
      .reduce(
        (sum, token) => sum + parseFloat(token.amount) * token.priceUsd,
        0,
      );
  }, [selectedTokenIds, totalPortfolioValue, tokens]);

  // Chart data
  const chartData = useMemo(
    () =>
      generateChartData(totalPortfolioValue, totalPortfolioValue * 0.05, 30),
    [totalPortfolioValue],
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

  const handleSelectAll = useCallback(() => {
    setSelectedTokenIds((prev) => {
      if (prev.size === tokens.length) {
        return new Set();
      }
      return new Set(tokens.map((t) => t.id));
    });
  }, [tokens]);

  const tableRows: PortfolioRow[] = useMemo(() => {
    const filteredTokens =
      selectedTokenIds.size === 0
        ? tokens
        : tokens.filter((t) => selectedTokenIds.has(t.id));

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
  }, [selectedTokenIds, tokens]);

  const avgChange24h = useMemo(() => {
    const filtered =
      selectedTokenIds.size === 0
        ? tokens
        : tokens.filter((t) => selectedTokenIds.has(t.id));
    return (
      filtered.reduce((sum, t) => sum + t.change24h, 0) / (filtered.length || 1)
    );
  }, [selectedTokenIds, tokens]);

  const avgChange30d = useMemo(() => {
    const filtered =
      selectedTokenIds.size === 0
        ? tokens
        : tokens.filter((t) => selectedTokenIds.has(t.id));
    return (
      filtered.reduce((sum, t) => sum + t.change30d, 0) / (filtered.length || 1)
    );
  }, [selectedTokenIds, tokens]);

  // Calculate native AVAX balance in USD
  const avaxBalanceUsd = useMemo(() => {
    if (!balance) return 0;
    const avaxPrice = tokenPrices["WAVAX"]?.price || 0;
    const avaxAmount = parseFloat(balance.formatted);
    return avaxAmount * avaxPrice;
  }, [balance, tokenPrices]);

  // Format wallet address for display
  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  // Show loading or connect wallet message
  if (!isConnected) {
    return (
      <div className="min-h-screen pt-24">
        <main className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-12 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-4xl">👛</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Please connect your Avalanche wallet to view your portfolio and
              token holdings.
            </p>
          </motion.div>
        </main>
      </div>
    );
  }

  if (isLoadingPrices) {
    return (
      <div className="min-h-screen pt-24">
        <main className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-12 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center animate-pulse">
              <span className="text-4xl">⏳</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Loading Portfolio...
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Fetching your token balances and current prices.
            </p>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Top Row - Net Worth & Agent Wallet */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2 h-full">
            <NetWorthCard
              netWorthUsd={totalPortfolioValue}
              change24hPercent={avgChange24h}
              chartData={chartData}
            />
          </div>
          <div className="lg:col-span-1 h-full">
            <AgentWalletCard
              walletName="Connected Wallet"
              balanceUsd={avaxBalanceUsd}
              walletAddress={shortAddress}
              onRecharge={() => console.log("Recharge")}
              onRefresh={() => console.log("Refresh")}
            />
          </div>
        </div>

        {/* Token Holding Row */}
        <TokenHoldingRow
          tokens={tokens}
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
                  ? tokens.length
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
