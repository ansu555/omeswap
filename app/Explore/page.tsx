"use client";

import { useState, useMemo } from "react";
import { MetricsBar } from "@/components/Explore/MetricsBar";
import { SummaryCard } from "@/components/Explore/SummaryCard";
import { ExplorerTabs } from "@/components/Explore/ExplorerTabs";
import { TokensTable, TokenRow } from "@/components/Explore/TokensTable";
import { PoolsTable, PoolRow } from "@/components/Explore/PoolsTable";
import { TransactionsTable, TransactionRow } from "@/components/Explore/TransactionsTable";
import { SearchBar } from "@/components/Explore/SearchBar";
import { TimeRangeSelect } from "@/components/Explore/TimeRangeSelect";
import { TableFilters } from "@/components/Explore/TableFilters";

// Mock data generators
const generateSparklineData = (positive: boolean): number[] => {
    const data: number[] = [];
    let value = 50 + Math.random() * 50;
    for (let i = 0; i < 24; i++) {
        value += (Math.random() - (positive ? 0.4 : 0.6)) * 10;
        data.push(Math.max(0, value));
    }
    return data;
};

const mockTokens: TokenRow[] = [
    {
        id: "1",
        rank: 1,
        name: "Bitcoin",
        symbol: "BTC",
        price: 29376.81,
        change1h: 0.29,
        change24h: 0.29,
        change7d: -0.93,
        marketCap: 570123456789,
        volume24h: 25123456789,
        circulatingSupply: 19000000,
        sparklineData: generateSparklineData(false),
        isFavorite: true,
    },
    {
        id: "2",
        rank: 2,
        name: "Ethereum",
        symbol: "ETH",
        price: 1913.84,
        change1h: -0.07,
        change24h: -4.19,
        change7d: 3.42,
        marketCap: 225987654321,
        volume24h: 15987654321,
        circulatingSupply: 120000000,
        sparklineData: generateSparklineData(true),
        isFavorite: true,
    },
    {
        id: "3",
        rank: 3,
        name: "Tether",
        symbol: "USDT",
        price: 0.9998,
        change1h: 0.00,
        change24h: 2.25,
        change7d: 0.93,
        marketCap: 83456789012,
        volume24h: 45678901234,
        circulatingSupply: 83456789012,
        sparklineData: generateSparklineData(true),
    },
    {
        id: "4",
        rank: 4,
        name: "BNB",
        symbol: "BNB",
        price: 232.86,
        change1h: 0.20,
        change24h: 1.07,
        change7d: -3.04,
        marketCap: 37123456789,
        volume24h: 2123456789,
        circulatingSupply: 154533345,
        sparklineData: generateSparklineData(false),
    },
    {
        id: "5",
        rank: 5,
        name: "XRP",
        symbol: "XRP",
        price: 0.47,
        change1h: -0.19,
        change24h: -1.58,
        change7d: -0.89,
        marketCap: 24567890123,
        volume24h: 1567890123,
        circulatingSupply: 52544091958,
        sparklineData: generateSparklineData(false),
    },
    {
        id: "6",
        rank: 6,
        name: "Cardano",
        symbol: "ADA",
        price: 0.31,
        change1h: 0.37,
        change24h: 2.90,
        change7d: -2.56,
        marketCap: 10987654321,
        volume24h: 567890123,
        circulatingSupply: 35401496384,
        sparklineData: generateSparklineData(false),
    },
    {
        id: "7",
        rank: 7,
        name: "Dogecoin",
        symbol: "DOGE",
        price: 0.07,
        change1h: 0.37,
        change24h: 5.09,
        change7d: 9.06,
        marketCap: 9876543210,
        volume24h: 1234567890,
        circulatingSupply: 145000000000,
        sparklineData: generateSparklineData(true),
    },
    {
        id: "8",
        rank: 8,
        name: "Solana",
        symbol: "SOL",
        price: 141.64,
        change1h: -0.19,
        change24h: 0.19,
        change7d: 4.2,
        marketCap: 86000000000,
        volume24h: 181700000,
        circulatingSupply: 607000000,
        sparklineData: generateSparklineData(true),
    },
    {
        id: "9",
        rank: 9,
        name: "Polygon",
        symbol: "MATIC",
        price: 0.58,
        change1h: -0.31,
        change24h: -2.10,
        change7d: -4.20,
        marketCap: 5678901234,
        volume24h: 234567890,
        circulatingSupply: 9800000000,
        sparklineData: generateSparklineData(false),
    },
    {
        id: "10",
        rank: 10,
        name: "Avalanche",
        symbol: "AVAX",
        price: 12.45,
        change1h: 0.52,
        change24h: 3.20,
        change7d: 5.80,
        marketCap: 4567890123,
        volume24h: 345678901,
        circulatingSupply: 366000000,
        sparklineData: generateSparklineData(true),
    },
];

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
    const [activeTab, setActiveTab] = useState<"tokens" | "pools" | "transactions">("tokens");
    const [searchQuery, setSearchQuery] = useState("");
    const [timeRange, setTimeRange] = useState("24h");
    const [activeFilter, setActiveFilter] = useState("all");
    const [tokens, setTokens] = useState(mockTokens);

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
                                onRowClick={(token) => console.log("Token clicked:", token)}
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
