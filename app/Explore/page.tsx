"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MetricsBar } from "@/components/Explore/MetricsBar";
import { SummaryCard } from "@/components/Explore/SummaryCard";
import { ExplorerTabs } from "@/components/Explore/ExplorerTabs";
import { TokensTable, TokenRow } from "@/components/Explore/TokensTable";
import { PoolsTable, PoolRow } from "@/components/Explore/PoolsTable";
import { TransactionsTable, TransactionRow } from "@/components/Explore/TransactionsTable";
import { SearchBar } from "@/components/Explore/SearchBar";
import { TimeRangeSelect } from "@/components/Explore/TimeRangeSelect";
import { TableFilters } from "@/components/Explore/TableFilters";

// Mock data generators for pools and transactions (keeping these as CMC doesn't provide this data)
const mockPools: PoolRow[] = [
    {
        id: "1",
        rank: 1,
        token0: { name: "Ethereum", symbol: "ETH" },
        token1: { name: "USD Coin", symbol: "USDC" },
        fee: 0.3,
        tvl: 245000000,
        volume24h: 89000000,
        volume7d: 623000000,
        apr: 12.45,
    },
    {
        id: "2",
        rank: 2,
        token0: { name: "Ethereum", symbol: "ETH" },
        token1: { name: "Wrapped BTC", symbol: "WBTC" },
        fee: 0.3,
        tvl: 189000000,
        volume24h: 45000000,
        volume7d: 315000000,
        apr: 8.92,
    },
    {
        id: "3",
        rank: 3,
        token0: { name: "USD Coin", symbol: "USDC" },
        token1: { name: "Tether", symbol: "USDT" },
        fee: 0.01,
        tvl: 156000000,
        volume24h: 234000000,
        volume7d: 1638000000,
        apr: 4.21,
    },
    {
        id: "4",
        rank: 4,
        token0: { name: "Ethereum", symbol: "ETH" },
        token1: { name: "DAI", symbol: "DAI" },
        fee: 0.3,
        tvl: 98000000,
        volume24h: 32000000,
        volume7d: 224000000,
        apr: 10.15,
    },
    {
        id: "5",
        rank: 5,
        token0: { name: "Wrapped BTC", symbol: "WBTC" },
        token1: { name: "USD Coin", symbol: "USDC" },
        fee: 0.3,
        tvl: 87000000,
        volume24h: 28000000,
        volume7d: 196000000,
        apr: 9.67,
    },
];

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

const metrics = [
    { label: "Total Market Cap", value: "$1.30T", change: 2.15 },
    { label: "24h Volume", value: "$79.4B", change: -1.32 },
    { label: "BTC Dominance", value: "46.3%" },
    { label: "ETH Dominance", value: "17.4%" },
    { label: "Active Addresses", value: "1.2M", change: 5.67 },
];

const topGainers = [
    { name: "Shiba Inu", symbol: "SHIB", value: "", change: 15.30 },
    { name: "Dogecoin", symbol: "DOGE", value: "", change: 5.20 },
    { name: "Avalanche", symbol: "AVAX", value: "", change: 3.20 },
    { name: "BNB", symbol: "BNB", value: "", change: 2.50 },
    { name: "Chainlink", symbol: "LINK", value: "", change: 1.50 },
];

const topLosers = [
    { name: "Polkadot", symbol: "DOT", value: "", change: -2.10 },
    { name: "Polygon", symbol: "MATIC", value: "", change: -2.10 },
    { name: "XRP", symbol: "XRP", value: "", change: -1.50 },
    { name: "Ethereum", symbol: "ETH", value: "", change: -0.80 },
    { name: "Solana", symbol: "SOL", value: "", change: -0.50 },
];

const trending = [
    { name: "Tether", symbol: "USDT", value: "$1.00", change: 0 },
    { name: "Bitcoin", symbol: "BTC", value: "$29,324.52", change: 0 },
    { name: "Ethereum", symbol: "ETH", value: "$1,876.34", change: 0 },
    { name: "BNB", symbol: "BNB", value: "$240.56", change: 0 },
    { name: "XRP", symbol: "XRP", value: "$0.47", change: 0 },
];

const tokenFilters = [
    { id: "all", label: "All Cryptocurrencies" },
    { id: "favorites", label: "Favorites" },
    { id: "trending", label: "Trending" },
    { id: "gainers", label: "Top Gainers" },
    { id: "losers", label: "Top Losers" },
];

export default function Explorer() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"tokens" | "pools" | "transactions">("tokens");
    const [searchQuery, setSearchQuery] = useState("");
    const [timeRange, setTimeRange] = useState("24h");
    const [activeFilter, setActiveFilter] = useState("all");
    const [tokens, setTokens] = useState<TokenRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch cryptocurrency data from our API
    useEffect(() => {
        const fetchTokens = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch('/api/crypto?limit=100');

                if (!response.ok) {
                    throw new Error('Failed to fetch cryptocurrency data');
                }

                const data = await response.json();
                setTokens(data.tokens || []);
            } catch (err) {
                console.error('Error fetching tokens:', err);
                setError(err instanceof Error ? err.message : 'Failed to load data');
                setTokens([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTokens();
    }, []);

    const handleToggleFavorite = (id: string) => {
        setTokens((prev) =>
            prev.map((token) =>
                token.id === id ? { ...token, isFavorite: !token.isFavorite } : token
            )
        );
    };

    const filteredTokens = useMemo(() => {
        let result = tokens;

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (token) =>
                    token.name.toLowerCase().includes(query) ||
                    token.symbol.toLowerCase().includes(query)
            );
        }

        // Apply category filter
        switch (activeFilter) {
            case "favorites":
                result = result.filter((token) => token.isFavorite);
                break;
            case "gainers":
                result = [...result].sort((a, b) => b.change24h - a.change24h).slice(0, 10);
                break;
            case "losers":
                result = [...result].sort((a, b) => a.change24h - b.change24h).slice(0, 10);
                break;
            case "trending":
                result = [...result].sort((a, b) => b.volume24h - a.volume24h).slice(0, 10);
                break;
        }

        return result;
    }, [tokens, searchQuery, activeFilter]);

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
            {/* Metrics Bar */}
            <div className="pt-24">
                <MetricsBar metrics={metrics} />
            </div>

            <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SummaryCard title="Top Gainers" items={topGainers} type="gainers" />
                    <SummaryCard title="Top Losers" items={topLosers} type="losers" />
                    <SummaryCard title="Trending" items={trending} type="trending" />
                </div>

                {/* Explorer Section */}
                <div className="space-y-4">
                    {/* Tabs and Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <ExplorerTabs activeTab={activeTab} onTabChange={setActiveTab} />
                        <div className="flex items-center gap-3">
                            <TimeRangeSelect value={timeRange} onChange={setTimeRange} />
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
                            onFilterChange={setActiveFilter}
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
            </div>
        </div>
    );
}
