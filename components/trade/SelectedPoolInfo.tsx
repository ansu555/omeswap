"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Droplet,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  RefreshCw,
  ExternalLink,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useMantleWallet } from "@/hooks/use-mantle-wallet";

interface PoolData {
  token0Reserve: number;
  token1Reserve: number;
  totalLiquidity: number;
  volume24h: number;
  fees24h: number;
  apy: number;
  priceChange24h: number;
  lastUpdated: Date;
}

interface Transaction {
  id: string;
  type: "swap" | "add_liquidity" | "remove_liquidity";
  token0: string;
  token1: string;
  amount0: number;
  amount1: number;
  account: string;
  txHash: string;
  timestamp: Date;
  status: "confirmed" | "pending" | "failed";
}

interface SelectedPoolInfoProps {
  token0Symbol: string;
  token1Symbol: string;
}

const TOKEN_COLORS: Record<string, string> = {
  tUSDC: "#2775CA",
  tUSDT: "#26A17B",
  MNT: "#000000",
};

export function SelectedPoolInfo({ token0Symbol, token1Symbol }: SelectedPoolInfoProps) {
  const { chain } = useMantleWallet();

  // Pool state
  const [poolData, setPoolData] = useState<PoolData>({
    token0Reserve: 50000,
    token1Reserve: 50000,
    totalLiquidity: 100000,
    volume24h: 15420,
    fees24h: 46.26,
    apy: 12.5,
    priceChange24h: 0.15,
    lastUpdated: new Date(),
  });

  // Transaction history state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  // Price state
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [price, setPrice] = useState(1.0);

  // Fetch pool data with real-time updates
  const fetchPoolData = useCallback(async () => {
    setIsLoadingPrices(true);
    try {
      // Simulate fetching pool data
      await new Promise(resolve => setTimeout(resolve, 500));

      // Simulate price fluctuations
      const fluctuation = (Math.random() - 0.5) * 0.02;
      const newPrice = 1 + fluctuation;

      setPrice(newPrice);
      setPoolData(prev => ({
        ...prev,
        token0Reserve: prev.token0Reserve * (1 + (Math.random() - 0.5) * 0.01),
        token1Reserve: prev.token1Reserve * (1 + (Math.random() - 0.5) * 0.01),
        volume24h: prev.volume24h * (1 + (Math.random() - 0.5) * 0.05),
        priceChange24h: (Math.random() - 0.5) * 4,
        lastUpdated: new Date(),
      }));
    } catch (error) {
      console.error("Failed to fetch pool data:", error);
    } finally {
      setIsLoadingPrices(false);
    }
  }, []);

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    setIsLoadingTransactions(true);
    try {
      // Simulate fetching transactions
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate mock transactions
      const mockTxs: Transaction[] = Array.from({ length: 10 }, (_, i) => ({
        id: `tx-${Date.now()}-${i}`,
        type: ["swap", "add_liquidity", "remove_liquidity"][Math.floor(Math.random() * 3)] as Transaction["type"],
        token0: token0Symbol,
        token1: token1Symbol,
        amount0: Math.random() * 1000,
        amount1: Math.random() * 1000,
        account: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
        txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
        timestamp: new Date(Date.now() - Math.random() * 86400000),
        status: "confirmed",
      }));

      setTransactions(mockTxs);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [token0Symbol, token1Symbol]);

  // Real-time polling
  useEffect(() => {
    fetchPoolData();
    fetchTransactions();

    const poolInterval = setInterval(fetchPoolData, 10000);
    const txInterval = setInterval(fetchTransactions, 30000);

    return () => {
      clearInterval(poolInterval);
      clearInterval(txInterval);
    };
  }, [fetchPoolData, fetchTransactions]);

  const token0Percent = (poolData.token0Reserve / (poolData.token0Reserve + poolData.token1Reserve)) * 100;
  const token1Percent = 100 - token0Percent;

  const explorerUrl = chain?.blockExplorers?.default?.url || "https://explorer.sepolia.mantle.xyz";

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getTypeLabel = (type: Transaction["type"]) => {
    switch (type) {
      case "swap":
        return { label: "Swap", color: "bg-blue-500/10 text-blue-500" };
      case "add_liquidity":
        return { label: "Add", color: "bg-green-500/10 text-green-500" };
      case "remove_liquidity":
        return { label: "Remove", color: "bg-orange-500/10 text-orange-500" };
    }
  };

  const displayedTransactions = showAllTransactions ? transactions : transactions.slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Pool Overview Card */}
      <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
              <Droplet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{token0Symbol}/{token1Symbol}</h3>
                <Badge variant="outline" className="text-xs">
                  0.3% fee
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Last updated: {formatTimeAgo(poolData.lastUpdated)}</span>
                <button
                  onClick={fetchPoolData}
                  disabled={isLoadingPrices}
                  className="hover:text-primary transition-colors"
                >
                  <RefreshCw className={cn("w-3 h-3", isLoadingPrices && "animate-spin")} />
                </button>
              </div>
            </div>
          </div>

          {/* Price Change */}
          <div className={cn(
            "flex items-center gap-1.5 text-sm",
            poolData.priceChange24h >= 0 ? "text-green-500" : "text-red-500"
          )}>
            {poolData.priceChange24h >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="font-medium">
              {poolData.priceChange24h >= 0 ? "+" : ""}{poolData.priceChange24h.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Current Price */}
        <div className="mb-6 p-4 rounded-xl bg-secondary/30 border border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Price</span>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold">{price.toFixed(6)}</span>
            <span className="text-muted-foreground ml-2">{token1Symbol} per {token0Symbol}</span>
          </div>
        </div>

        {/* Reserve Visualization */}
        <div className="space-y-4 mb-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: TOKEN_COLORS[token0Symbol] || "#6366f1" }}
                />
                <span className="font-medium">{token0Symbol}</span>
              </div>
              <span className="text-muted-foreground">{token0Percent.toFixed(1)}%</span>
            </div>
            <div className="relative h-3 rounded-full bg-muted/50 overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${token0Percent}%`,
                  backgroundColor: TOKEN_COLORS[token0Symbol] || "#6366f1",
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: TOKEN_COLORS[token1Symbol] || "#22c55e" }}
                />
                <span className="font-medium">{token1Symbol}</span>
              </div>
              <span className="text-muted-foreground">{token1Percent.toFixed(1)}%</span>
            </div>
            <div className="relative h-3 rounded-full bg-muted/50 overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${token1Percent}%`,
                  backgroundColor: TOKEN_COLORS[token1Symbol] || "#22c55e",
                }}
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-primary/5 to-primary/[0.02] rounded-xl p-4 border border-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {token0Symbol}
              </p>
            </div>
            <p className="text-xl font-bold">{poolData.token0Reserve.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/5 to-green-500/[0.02] rounded-xl p-4 border border-green-500/10">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {token1Symbol}
              </p>
            </div>
            <p className="text-xl font-bold">{poolData.token1Reserve.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          </div>

          <div className="bg-secondary/30 rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Volume 24h
              </p>
            </div>
            <p className="text-xl font-bold">${poolData.volume24h.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>

          <div className="bg-secondary/30 rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-primary" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                APY
              </p>
            </div>
            <p className="text-xl font-bold text-green-500">{poolData.apy.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Transaction History Card */}
      <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <h3 className="font-semibold">Recent Transactions</h3>
          <button
            onClick={fetchTransactions}
            disabled={isLoadingTransactions}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 text-sm hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={cn("w-3 h-3", isLoadingTransactions && "animate-spin")} />
            Refresh
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {isLoadingTransactions ? "Loading transactions..." : "No transactions yet"}
          </div>
        ) : (
          <>
            <div className="divide-y divide-border/50">
              {displayedTransactions.map((tx) => {
                const typeInfo = getTypeLabel(tx.type);
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Badge className={cn("text-xs", typeInfo.color)}>
                        {typeInfo.label}
                      </Badge>
                      <div>
                        <div className="text-sm font-medium">
                          {tx.type === "swap" ? (
                            <>{tx.amount0.toFixed(2)} {tx.token0} → {tx.amount1.toFixed(2)} {tx.token1}</>
                          ) : tx.type === "add_liquidity" ? (
                            <>+{tx.amount0.toFixed(2)} {tx.token0} / +{tx.amount1.toFixed(2)} {tx.token1}</>
                          ) : (
                            <>-{tx.amount0.toFixed(2)} {tx.token0} / -{tx.amount1.toFixed(2)} {tx.token1}</>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {tx.account}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(tx.timestamp)}
                      </span>
                      <a
                        href={`${explorerUrl}/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {transactions.length > 5 && (
              <button
                onClick={() => setShowAllTransactions(!showAllTransactions)}
                className="w-full p-3 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors flex items-center justify-center gap-2 border-t border-border/50"
              >
                {showAllTransactions ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show All ({transactions.length} transactions)
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
