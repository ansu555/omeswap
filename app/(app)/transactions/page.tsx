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
import {
  useTransactionStore,
  useHydrateTransactionStore,
} from "@/store/transaction-store";

export type TransactionType =
  | "SWAP"
  | "ADD_LIQUIDITY"
  | "REMOVE_LIQUIDITY"
  | "POOL_CREATION"
  | "MINT";
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
  source?: string;
  dex?: string;
}

// Transaction data

const TransactionHistory = () => {
  useHydrateTransactionStore();
  const storedTransactions = useTransactionStore((s) => s.transactions);
  const [typeFilter, setTypeFilter] = useState<TransactionType | "ALL">("ALL");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [searchQuery, setSearchQuery] = useState("");

  // Map stored transactions to the page Transaction shape
  const allTransactions: Transaction[] = storedTransactions.map((tx) => ({
    id: tx.id,
    type: tx.type as TransactionType,
    fromToken: tx.fromToken,
    toToken: tx.toToken,
    fromAmount: tx.fromAmount,
    toAmount: tx.toAmount,
    poolAddress: tx.txHash,
    walletAddress: tx.walletAddress,
    timestamp: new Date(tx.timestamp),
    explorerUrl: tx.explorerUrl,
    source: tx.source,
    dex: tx.dex,
  }));

  const filteredTransactions = allTransactions
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
  const totalVolume = allTransactions.reduce(
    (sum, tx) => sum + tx.fromAmount,
    0,
  );
  const totalTransactions = allTransactions.length;
  const last24hTransactions = allTransactions.filter(
    (tx) => tx.timestamp.getTime() > Date.now() - 1000 * 60 * 60 * 24,
  ).length;
  const avgTransaction =
    totalTransactions > 0 ? totalVolume / totalTransactions : 0;

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
                <h1 className="text-2xl font-bold text-foreground">
                  Transaction History
                </h1>
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
            <span className="text-xs text-muted-foreground">
              Note: Testnet data
            </span>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
};

export default TransactionHistory;
