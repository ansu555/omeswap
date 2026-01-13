"use client";

import { TooltipProvider } from "@/components/ui/tooltip";

import { useState } from "react";
// Header is in layout.tsx
import { TransactionAnalytics } from "@/components/transaction/TransactionAnalytics";
import { TransactionTable } from "@/components/transaction/TransactionTable";
import { TransactionFilters } from "@/components/transaction/TransactionFilters";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export type TransactionType = "SWAP" | "ADD_LIQUIDITY" | "REMOVE_LIQUIDITY" | "POOL_CREATION";
export type SortOrder = "newest" | "oldest" | "amount-high" | "amount-low";

export interface Transaction {
    id: string;
    type: TransactionType;
    fromToken: string;
    toToken: string;
    fromAmount: number;
    toAmount: number;
    poolAddress: string;
    walletAddress: string;
    timestamp: Date;
    explorerUrl: string;
}

// Mock data
const mockTransactions: Transaction[] = [
    {
        id: "1",
        type: "SWAP",
        fromToken: "ALGO",
        toToken: "USDC",
        fromAmount: 1.0,
        toAmount: 13.659219,
        poolAddress: "JOEPFU...MXEFTM",
        walletAddress: "5izjev...dysme4",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
        explorerUrl: "#",
    },
    {
        id: "2",
        type: "SWAP",
        fromToken: "USDC",
        toToken: "USDt",
        fromAmount: 2.0,
        toAmount: 0.009186,
        poolAddress: "JOEPFU...MXEFTM",
        walletAddress: "5izjev...dysme4",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 31),
        explorerUrl: "#",
    },
    {
        id: "3",
        type: "SWAP",
        fromToken: "ALGO",
        toToken: "USDC",
        fromAmount: 1.0,
        toAmount: 13.659219,
        poolAddress: "JOEPFU...MXEFTM",
        walletAddress: "5izjev...dysme4",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 32),
        explorerUrl: "#",
    },
    {
        id: "4",
        type: "ADD_LIQUIDITY",
        fromToken: "ALGO",
        toToken: "USDC",
        fromAmount: 50.0,
        toAmount: 683.0,
        poolAddress: "5DPHOI...VJ7WPQ",
        walletAddress: "5izjev...dysme4",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35),
        explorerUrl: "#",
    },
    {
        id: "5",
        type: "POOL_CREATION",
        fromToken: "ALGO",
        toToken: "USDC",
        fromAmount: 100.0,
        toAmount: 1366.0,
        poolAddress: "5DPHOI...VJ7WPQ",
        walletAddress: "5izjev...dysme4",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40),
        explorerUrl: "#",
    },
    {
        id: "6",
        type: "SWAP",
        fromToken: "ALGO",
        toToken: "USDC",
        fromAmount: 25.5,
        toAmount: 348.15,
        poolAddress: "JOEPFU...MXEFTM",
        walletAddress: "5izjev...dysme4",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        explorerUrl: "#",
    },
    {
        id: "7",
        type: "REMOVE_LIQUIDITY",
        fromToken: "ALGO",
        toToken: "USDC",
        fromAmount: 10.0,
        toAmount: 136.6,
        poolAddress: "5DPHOI...VJ7WPQ",
        walletAddress: "5izjev...dysme4",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
        explorerUrl: "#",
    },
    {
        id: "8",
        type: "SWAP",
        fromToken: "USDC",
        toToken: "ALGO",
        fromAmount: 100.0,
        toAmount: 7.32,
        poolAddress: "JOEPFU...MXEFTM",
        walletAddress: "5izjev...dysme4",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
        explorerUrl: "#",
    },
];

const TransactionHistory = () => {
    const [typeFilter, setTypeFilter] = useState<TransactionType | "ALL">("ALL");
    const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredTransactions = mockTransactions
        .filter((tx) => {
            if (typeFilter !== "ALL" && tx.type !== typeFilter) return false;
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    tx.fromToken.toLowerCase().includes(query) ||
                    tx.toToken.toLowerCase().includes(query) ||
                    tx.poolAddress.toLowerCase().includes(query)
                );
            }
            return true;
        })
        .sort((a, b) => {
            switch (sortOrder) {
                case "newest":
                    return b.timestamp.getTime() - a.timestamp.getTime();
                case "oldest":
                    return a.timestamp.getTime() - b.timestamp.getTime();
                case "amount-high":
                    return b.fromAmount - a.fromAmount;
                case "amount-low":
                    return a.fromAmount - b.fromAmount;
                default:
                    return 0;
            }
        });

    // Calculate analytics
    const totalVolume = mockTransactions.reduce((sum, tx) => sum + tx.fromAmount, 0);
    const totalTransactions = mockTransactions.length;
    const last24hTransactions = mockTransactions.filter(
        (tx) => tx.timestamp.getTime() > Date.now() - 1000 * 60 * 60 * 24
    ).length;
    const avgTransaction = totalVolume / totalTransactions;

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-transparent relative z-10">

                <main className="container mx-auto px-4 py-8 pt-32 max-w-7xl">
                    {/* Page Header */}
                    <div className="flex flex-col gap-6 mb-8 animate-fade-in">
                        <div className="flex items-center gap-4">
                            <Link href="/">
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">Transaction History</h1>
                                <p className="text-muted-foreground text-sm mt-1">
                                    View all your transaction history across the platform
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Analytics Section */}
                    <TransactionAnalytics
                        totalVolume={totalVolume}
                        totalTransactions={totalTransactions}
                        last24hTransactions={last24hTransactions}
                        avgTransaction={avgTransaction}
                    />

                    {/* Filters */}
                    <TransactionFilters
                        typeFilter={typeFilter}
                        setTypeFilter={setTypeFilter}
                        sortOrder={sortOrder}
                        setSortOrder={setSortOrder}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        resultCount={filteredTransactions.length}
                    />

                    {/* Transaction Table */}
                    <TransactionTable transactions={filteredTransactions} />

                    {/* Footer Note */}
                    <div className="mt-6 text-right">
                        <span className="text-xs text-muted-foreground">Note: Testnet data</span>
                    </div>
                </main>
            </div>
        </TooltipProvider>
    );
};

export default TransactionHistory;
