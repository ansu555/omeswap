"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StatsWidgetsGrid } from "@/components/explore/StatsWidget";
import { SummaryCard } from "@/components/explore/SummaryCard";
import { ExplorerTabs } from "@/components/explore/ExplorerTabs";
import { TokensTable, TokenRow } from "@/components/explore/TokensTable";
import { PoolsTable, PoolRow } from "@/components/explore/PoolsTable";
import { TransactionsTable, TransactionRow } from "@/components/explore/TransactionsTable";
import { SearchBar } from "@/components/explore/SearchBar";
import { TableFilters } from "@/components/explore/TableFilters";
import { useDexPools } from "@/hooks/use-dex-pools";

// Mock data for transactions only
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
    { id: "favorites", label: "Favorites" },
    { id: "trending", label: "Trending" },
    { id: "gainers", label: "Top Gainers" },
    { id: "losers", label: "Top Losers" },
];

export default function Explorer() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"tokens" | "pools" | "transactions">("tokens");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [tokens, setTokens] = useState<TokenRow[]>([]);
    const [pools, setPools] = useState<PoolRow[]>([]);
    const [gainers, setGainers] = useState<any[]>([]);
    const [losers, setLosers] = useState<any[]>([]);
    const [trending, setTrending] = useState<any[]>([]);
    const [metrics, setMetrics] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Fetch DEX pools from smart contracts
    const { pools: dexPools, poolCount } = useDexPools();

    // Fetch cryptocurrency data from our API
    useEffect(() => {
        const fetchTokens = async () => {
            try {
                setIsLoading(true);

                const response = await fetch('/api/crypto?limit=100');

                if (!response.ok) {
                    throw new Error('Failed to fetch cryptocurrency data');
                }

                const data = await response.json();
                setTokens(data.tokens || []);
                
                // Combine API pools with DEX pools
                const apiPools = data.pools || [];
                setPools(apiPools);
                
                setGainers(data.gainers || []);
                setLosers(data.losers || []);
                setTrending(data.trending || []);
                setMetrics(data.metrics || []);
            } catch (err) {
                console.error('Error fetching tokens:', err);
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
        // Convert DEX pools to PoolRow format
        const dexPoolRows: PoolRow[] = dexPools.map((pool) => ({
            id: String(pool.poolId), // Use poolId directly as string
            rank: pool.poolId + 1,
            token0: {
                name: pool.token0.name,
                symbol: pool.token0.symbol,
            },
            token1: {
                name: pool.token1.name,
                symbol: pool.token1.symbol,
            },
            fee: 0.3, // 0.3% fee
            tvl: pool.tvl,
            volume24h: pool.volume24h,
            volume7d: pool.volume7d,
            apr: pool.apr,
        }));

        // Combine API pools with DEX pools
        const allPools = [...dexPoolRows, ...pools];

        if (!searchQuery) return allPools;
        const query = searchQuery.toLowerCase();
        return allPools.filter(
            (pool) =>
                pool.token0.symbol.toLowerCase().includes(query) ||
                pool.token1.symbol.toLowerCase().includes(query)
        );
    }, [searchQuery, pools, dexPools]);

    return (
        <div className="min-h-screen">
            <div className="max-w-[1600px] mx-auto px-4 md:px-6 pt-6 pb-6 space-y-6">
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
                                onRowClick={(pool) => {
                                    console.log('Pool clicked:', pool);
                                    // Use pool.id directly (it's already the pool ID number)
                                    router.push(`/pool/${pool.id}`);
                                }}
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
