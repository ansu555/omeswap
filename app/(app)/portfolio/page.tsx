"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NetWorthCard } from "@/components/portfolio/NetWorthCard";
import { AgentWalletCard } from "@/components/portfolio/AgentWalletCard";
import { TokenHoldingRow } from "@/components/portfolio/TokenHoldingRow";
import { PortfolioSummary } from "@/components/portfolio/PortfolioSummary";
import { PortfolioTable, type PortfolioRow } from "@/components/portfolio/PortfolioTable";
import { AddressManager } from "@/components/portfolio/AddressManager";
import { useMantleWallet, useWalletAnalysis, useCustomAddressAnalysis } from "@/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

// Generate chart data based on current value
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
  const { address: connectedAddress, isConnected } = useMantleWallet();
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const [hideDust, setHideDust] = useState(true); // Hide dust by default
  const [mergeChains, setMergeChains] = useState(true);
  
  // Connected wallet analysis
  const { 
    data: connectedData, 
    isLoading: connectedLoading, 
    error: connectedError 
  } = useWalletAnalysis({
    autoFetch: isConnected && !useCustomAddress,
    chains: ['ethereum', 'polygon'],
  });

  // Custom address analysis
  const {
    data: customData,
    isLoading: customLoading,
    error: customError,
    analyzeAddress,
    currentAddress: customAddress,
  } = useCustomAddressAnalysis();

  // Determine which data source to use
  const walletData = useCustomAddress ? customData : connectedData;
  const isLoading = useCustomAddress ? customLoading : connectedLoading;
  const error = useCustomAddress ? customError : connectedError;
  const currentAddress = useCustomAddress ? customAddress : connectedAddress;

  // Handle address selection from AddressManager
  const handleSelectAddress = (address: string, chains: string[]) => {
    setUseCustomAddress(true);
    analyzeAddress(address, chains);
  };

  // Switch back to connected wallet
  useEffect(() => {
    if (isConnected && !useCustomAddress && connectedAddress) {
      // Auto-analyze connected wallet
    }
  }, [isConnected, useCustomAddress, connectedAddress]);

  // Convert API data to UI format
  const tokens = useMemo(() => {
    if (!walletData?.token_balances) return [];
    
    return walletData.token_balances
      .map((token, index) => ({
        id: `${token.chain}-${token.token_symbol}-${index}`,
        chain: token.chain,
        symbol: token.token_symbol,
        amount: token.balance_formatted,
        priceUsd: parseFloat(token.price_usd || '0'),
        change24h: parseFloat(token.price_change_24h || '0'),
        change30d: 0, // Not available from API
        imageUrl: token.logo_url || undefined,
        valueUsd: token.value_usd ? parseFloat(token.value_usd) : 0,
      }))
      .sort((a, b) => b.valueUsd - a.valueUsd); // Sort by value, highest first
  }, [walletData]);

  // Calculate total portfolio value from real data
  const totalPortfolioValue = useMemo(() => {
    if (!walletData?.portfolio_summary) return 0;
    return parseFloat(walletData.portfolio_summary.total_value_usd);
  }, [walletData]);

  // Chart data based on real portfolio value
  const chartData = useMemo(
    () => generateChartData(totalPortfolioValue, totalPortfolioValue * 0.05, 30),
    [totalPortfolioValue]
  );

  // Calculate average 24h change from real data
  const avgChange24h = useMemo(() => {
    if (tokens.length === 0) return 0;
    return tokens.reduce((sum, t) => sum + t.change24h, 0) / tokens.length;
  }, [tokens]);

  // Calculate average 30d change (using 24h as approximation)
  const avgChange30d = useMemo(() => {
    return avgChange24h * 2; // Approximate
  }, [avgChange24h]);

  // Table rows from real data
  const tableRows: PortfolioRow[] = useMemo(() => {
    let filteredTokens = tokens;
    
    // Hide dust tokens (value < $0.01 or no price data)
    if (hideDust) {
      filteredTokens = tokens.filter(token => token.valueUsd >= 0.01);
    }
    
    return filteredTokens.map((token) => ({
      id: token.id,
      chain: token.chain,
      coin: token.symbol,
      amount: token.amount,
      priceUsd: token.priceUsd,
      change24hPercent: token.change24h,
      change30dPercent: token.change30d || token.change24h * 2,
      holdingUsd: parseFloat(token.amount) * token.priceUsd,
      newsCount: Math.floor(Math.random() * 10),
      imageUrl: token.imageUrl,
    }));
  }, [tokens, hideDust]);

  if (!isConnected && !useCustomAddress) {
    return (
      <div className="min-h-screen pt-24">
        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Address Manager for non-connected users */}
          <div className="flex justify-end mb-4">
            <AddressManager 
              currentAddress={currentAddress || null}
              onSelectAddress={handleSelectAddress}
            />
          </div>

          <Card>
            <CardContent className="pt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-4xl">👛</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Connect Your Wallet or Add an Address
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Connect your wallet or use the "Add Address" button above to analyze any 
                  Ethereum address across multiple chains.
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24">
        <main className="container mx-auto px-4 py-8 space-y-8">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24">
        <main className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load wallet data: {error.message}
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Address Manager Bar */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {currentAddress && (
              <div className="text-sm">
                <span className="text-muted-foreground">Analyzing:</span>{" "}
                <span className="font-mono font-medium">
                  {currentAddress.slice(0, 10)}...{currentAddress.slice(-8)}
                </span>
              </div>
            )}
            {isConnected && useCustomAddress && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUseCustomAddress(false)}
              >
                Switch to Connected Wallet
              </Button>
            )}
          </div>
          <AddressManager 
            currentAddress={currentAddress || null}
            onSelectAddress={handleSelectAddress}
          />
        </div>

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
              walletName="Main Agent"
              balanceUsd={0.0}
              walletAddress="US2VED77WY3MFUZ5KQPT7QXYL3V4HJKL"
              onRecharge={() => console.log("Recharge")}
              onRefresh={() => console.log("Refresh")}
            />
          </div>
        </div>

        {/* Token Holding Row */}
        {tokens.length > 0 && (
          <TokenHoldingRow
            tokens={hideDust ? tokens.filter(t => t.valueUsd >= 0.01) : tokens}
            selectedTokenIds={new Set()}
            onToggleToken={() => {}}
            onSelectAll={() => {}}
            totalPortfolioValue={totalPortfolioValue}
          />
        )}

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
              selectedWorth={totalPortfolioValue}
              change24hPercent={avgChange24h}
              change30dPercent={avgChange30d}
              coinCount={hideDust ? tableRows.length : tokens.length}
              chartData={chartData}
            />

            {tableRows.length > 0 && (
              <PortfolioTable
                rows={tableRows}
                hideDust={hideDust}
                mergeChains={mergeChains}
                onToggleHideDust={() => setHideDust(!hideDust)}
                onToggleMergeChains={() => setMergeChains(!mergeChains)}
              />
            )}
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
                NFT Gallery
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {walletData?.nft_holdings && walletData.nft_holdings.length > 0
                  ? `You have ${walletData.nft_holdings.length} NFT(s) in your wallet.`
                  : "Your NFT collection will appear here once you acquire some."}
              </p>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
