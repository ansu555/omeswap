"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { StatsWidgetsGrid } from "@/components/explore/StatsWidget";
import { SummaryCard } from "@/components/explore/SummaryCard";
import { ExplorerTabs } from "@/components/explore/ExplorerTabs";
import { TokensTable, TokenRow } from "@/components/explore/TokensTable";
import { PoolsTable, PoolRow } from "@/components/explore/PoolsTable";
import { TransactionsTable, TransactionRow } from "@/components/explore/TransactionsTable";
import { SearchBar } from "@/components/explore/SearchBar";
import { TableFilters } from "@/components/explore/TableFilters";
import { useKryllTokens } from "@/hooks";
import { getTopGainers, getTopLosers, getTrending } from "@/lib/api/kryll";
import type { TokenCategory } from "@/types/kryll";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Mock data for pools
const mockPools: PoolRow[] = [
    {
        id: "1",
        rank: 1,
        token0: { name: "Ethereum", symbol: "ETH", imageUrl: "/tokens/eth.png" },
        token1: { name: "USD Coin", symbol: "USDC", imageUrl: "/tokens/usdc.png" },
        fee: 0.3,
        tvl: 128500000,
        volume24h: 45230000,
        volume7d: 312400000,
        apr: 12.4,
    },
    {
        id: "2",
        rank: 2,
        token0: { name: "Wrapped Bitcoin", symbol: "WBTC", imageUrl: "/tokens/wbtc.png" },
        token1: { name: "Ethereum", symbol: "ETH", imageUrl: "/tokens/eth.png" },
        fee: 0.3,
        tvl: 98400000,
        volume24h: 32100000,
        volume7d: 224700000,
        apr: 15.2,
    },
];

// Mock data for transactions
const mockTransactions: TransactionRow[] = [
    {
        id: "1",
        type: "swap",
        token0: { symbol: "ETH", amount: 2.5 },
        token1: { symbol: "USDC", amount: 4784.6 },
        totalValue: 4784.6,
        account: "0x1234567890abcdef1234567890abcdef12345678",
        timestamp: new Date(Date.now() - 2 * 60000),
        txHash: "0xabc123",
    },
    {
        id: "2",
        type: "add",
        token0: { symbol: "ETH", amount: 10 },
        token1: { symbol: "USDC", amount: 19138.4 },
        totalValue: 38276.8,
        account: "0xabcdef1234567890abcdef1234567890abcdef12",
        timestamp: new Date(Date.now() - 5 * 60000),
        txHash: "0xdef456",
    },
    {
        id: "3",
        type: "remove",
        token0: { symbol: "WBTC", amount: 0.5 },
        token1: { symbol: "ETH", amount: 8.2 },
        totalValue: 30456.2,
        account: "0x7890abcdef1234567890abcdef1234567890abcd",
        timestamp: new Date(Date.now() - 12 * 60000),
        txHash: "0x789abc",
    },
    {
        id: "4",
        type: "swap",
        token0: { symbol: "USDC", amount: 10000 },
        token1: { symbol: "DAI", amount: 9998.5 },
        totalValue: 10000,
        account: "0xef1234567890abcdef1234567890abcdef123456",
        timestamp: new Date(Date.now() - 25 * 60000),
        txHash: "0xcde789",
    },
    {
        id: "5",
        type: "swap",
        token0: { symbol: "SOL", amount: 50 },
        token1: { symbol: "USDC", amount: 7082 },
        totalValue: 7082,
        account: "0x567890abcdef1234567890abcdef1234567890ab",
        timestamp: new Date(Date.now() - 45 * 60000),
        txHash: "0xfgh012",
    },
];

const tokenFilters = [
    { id: "all", label: "All Cryptocurrencies" },
    { id: "ethereum", label: "Ethereum Ecosystem" },
    { id: "manta", label: "Manta Network" },
    { id: "mantle", label: "Mantle Ecosystem" },
    { id: "gainers", label: "Top Gainers" },
    { id: "losers", label: "Top Losers" },
    { id: "trending", label: "Trending" },
];

export default function Explorer() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"tokens" | "pools" | "transactions">("tokens");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<string>("all");
    const [category, setCategory] = useState<TokenCategory>("all");

    // Fetch tokens from Kryll API
    const { tokens: kryllTokens, isLoading, error } = useKryllTokens({
        limit: 100,
        page: 1,
        category: category,
        autoFetch: true,
    });

    // Convert Kryll tokens to TokenRow format
    const tokens: TokenRow[] = useMemo(() => {
        return kryllTokens.map((token, index) => ({
            id: token.id,
            rank: index + 1,
            name: token.name,
            symbol: token.symbol.toUpperCase(),
            price: token.current_price,
            change1h: 0, // Not provided by Kryll API
            change24h: token.price_change_percentage_24h_in_currency || 0,
            change7d: token.price_change_percentage_30d_in_currency || 0, // Use 30d as proxy
            volume24h: token.market_cap * 0.1, // Approximate
            marketCap: token.market_cap,
            circulatingSupply: 0, // Not provided by Kryll API
            sparklineData: [], // Not provided by Kryll API
            imageUrl: token.image,
            isFavorite: false,
        }));
    }, [kryllTokens]);

    // Get categorized lists for summary cards
    const gainers = useMemo(() => getTopGainers(kryllTokens, 10), [kryllTokens]);
    const losers = useMemo(() => getTopLosers(kryllTokens, 10), [kryllTokens]);
    const trending = useMemo(() => getTrending(kryllTokens, 10), [kryllTokens]);

    // Metrics for stats widgets
    const metrics = useMemo(() => {
        if (tokens.length === 0) return [];
        
        const totalMarketCap = tokens.reduce((sum, t) => sum + t.marketCap, 0);
        const avgChange24h = tokens.reduce((sum, t) => sum + t.change24h, 0) / tokens.length;
        const gainersCount = tokens.filter(t => t.change24h > 0).length;
        const losersCount = tokens.filter(t => t.change24h < 0).length;

        return [
            { label: "Total Market Cap", value: `$${(totalMarketCap / 1e9).toFixed(2)}B` },
            { label: "24h Change", value: `${avgChange24h > 0 ? '+' : ''}${avgChange24h.toFixed(2)}%` },
            { label: "Gainers", value: gainersCount.toString() },
            { label: "Losers", value: losersCount.toString() },
        ];
    }, [tokens]);

    // Filter tokens based on active filter
    const filteredTokens = useMemo(() => {
        let result = tokens;

        if (activeFilter === "gainers") {
            result = [...tokens].sort((a, b) => b.change24h - a.change24h).slice(0, 20);
        } else if (activeFilter === "losers") {
            result = [...tokens].sort((a, b) => a.change24h - b.change24h).slice(0, 20);
        } else if (activeFilter === "trending") {
            // Sort by Kryll sentiment and news
            result = [...tokens].sort((a, b) => {
                const tokenA = kryllTokens.find(t => t.id === a.id);
                const tokenB = kryllTokens.find(t => t.id === b.id);
                const scoreA = (tokenA?.news_last_7days || 0) + (tokenA?.sentiment || 0);
                const scoreB = (tokenB?.news_last_7days || 0) + (tokenB?.sentiment || 0);
                return scoreB - scoreA;
            }).slice(0, 20);
        } else if (["ethereum", "manta", "mantle"].includes(activeFilter)) {
            // Category is already filtered by API
            result = tokens;
        }

        // Apply search filter
        if (searchQuery) {
            result = result.filter((token) =>
                token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return result;
    }, [tokens, activeFilter, searchQuery]);

    const handleFilterChange = (filterId: string) => {
        setActiveFilter(filterId);
        
        // Update category for ecosystem filters
        if (["all", "ethereum", "manta", "mantle"].includes(filterId)) {
            setCategory(filterId as TokenCategory);
        }
    };

    const handleToggleFavorite = (id: string) => {
        // Favorites could be stored in localStorage
        console.log("Toggle favorite:", id);
    };

    const filteredPools = useMemo(() => {
        if (!searchQuery) return mockPools;
        const query = searchQuery.toLowerCase();
        return mockPools.filter(
            (pool) =>
                pool.token0.symbol.toLowerCase().includes(query) ||
                pool.token1.symbol.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    return (
        <div className="min-h-screen">
            <div className="max-w-[1600px] mx-auto px-4 md:px-6 pt-32 pb-6 space-y-6">
                {/* Show loading state */}
                {isLoading && (
                    <div className="space-y-4">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                )}

                {/* Show error state */}
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>
                            Failed to load tokens: {error.message || String(error)}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Show content when loaded */}
                {!isLoading && !error && (
                    <>
                        {/* Stats Widgets */}
                        <StatsWidgetsGrid metrics={metrics} />

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <SummaryCard title="Top Gainers" items={gainers} type="gainers" />
                            <SummaryCard title="Top Losers" items={losers} type="losers" />
                            <SummaryCard title="Trending" items={trending} type="trending" />
                        </div>

                        {/* Explorer Section */}
                        <div className="space-y-4">
                            {/* Tabs and Controls */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <ExplorerTabs activeTab={activeTab} onTabChange={setActiveTab} />
                                <div className="flex items-center gap-3">
                                    <SearchBar
                                        value={searchQuery}
                                        onChange={setSearchQuery}
                                        placeholder={
                                            activeTab === "tokens"
                                                ? "Search tokens..."
                                                : activeTab === "pools"
                                                    ? "Search pools..."
                                                    : "Search transactions..."
                                        }
                                    />
                                </div>
                            </div>

                            {/* Filters (for tokens tab) */}
                            {activeTab === "tokens" && (
                                <TableFilters
                                    activeFilter={activeFilter}
                                    onFilterChange={handleFilterChange}
                                    filters={tokenFilters}
                                />
                            )}

                            {/* Tables */}
                            <div className="glass-card rounded-lg overflow-hidden border bg-card/50">
                                {activeTab === "tokens" && (
                                    <TokensTable
                                        tokens={filteredTokens}
                                        onToggleFavorite={handleToggleFavorite}
                                        onRowClick={(token) => router.push(`/token/${token.id}`)}
                                        isLoading={isLoading}
                                    />
                                )}
                                {activeTab === "pools" && (
                                    <PoolsTable
                                        pools={filteredPools}
                                        onRowClick={(pool) => console.log("Pool clicked:", pool)}
                                    />
                                )}
                                {activeTab === "transactions" && (
                                    <TransactionsTable
                                        transactions={mockTransactions}
                                        onRowClick={(tx) => console.log("Transaction clicked:", tx)}
                                    />
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
