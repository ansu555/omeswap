"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { RefreshCw, Share2, TrendingUp, Droplet, DollarSign, BarChart3, ExternalLink } from "lucide-react";
import { SwapCardDex } from "@/components/trade/SwapCardDex";
import { useReadContract } from "wagmi";
import { formatEther, Address } from "viem";
import { CONTRACT_ADDRESSES, TOKENS } from "@/contracts/config";
import { MultiTokenLiquidityPoolsABI } from "@/contracts/abis";
import { avalanche } from '@/lib/chains/avalanche';
import { useAvalancheWallet } from "@/hooks/use-avalanche-wallet";
import { usePoolDetails } from "@/hooks/use-pool-details";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// Map pool IDs to token pairs (based on deployment)
const POOL_PAIRS: { [key: string]: { token0: string; token1: string } } = {
  "0": { token0: "USDC", token1: "USDTe" },
  "1": { token0: "WETHe", token1: "USDC" },
  "2": { token0: "WBTCe", token1: "WETHe" },
  "3": { token0: "DAIe", token1: "USDC" },
  "4": { token0: "LINKe", token1: "WETHe" },
  "5": { token0: "JOE", token1: "WETHe" },
  "6": { token0: "AAVEe", token1: "WETHe" },
  "7": { token0: "PNG", token1: "DAIe" },
  "8": { token0: "WBTCe", token1: "USDC" },
  "9": { token0: "WAVAX", token1: "USDC" },
};

export default function PoolPage() {
  const params = useParams();
  const poolId = Number(params.id);
  const router = useRouter();
  const { address, isConnected } = useAvalancheWallet();
  const [timeRange, setTimeRange] = useState("1D");
  const [showSwap, setShowSwap] = useState(false);

  const poolPair = POOL_PAIRS[poolId];
  const token0 = poolPair ? TOKENS[poolPair.token0] : null;
  const token1 = poolPair ? TOKENS[poolPair.token1] : null;

  // Use the real pool details hook
  const { poolInfo, transactions, isLoadingTxs, refetch } = usePoolDetails(
    poolId,
    poolPair?.token0 || 'USDC',
    poolPair?.token1 || 'USDTe'
  );

  // Get user position
  const { data: userPosition } = useReadContract({
    address: CONTRACT_ADDRESSES.POOLS as Address,
    abi: MultiTokenLiquidityPoolsABI,
    functionName: 'getUserPosition',
    args: [BigInt(poolId), address as Address],
    chainId: avalanche.id,
    query: {
      enabled: !!address,
    },
  });

  if (!poolPair || !token0 || !token1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Pool Not Found</h2>
          <Button onClick={() => router.push("/explore")}>← Back to Explore</Button>
        </div>
      </div>
    );
  }

  // Extract real pool data
  const { reserve0, reserve1, totalSupply, tvl, volume24h, fees24h, baseAPR } = poolInfo;
  const volume24hToken0 = (poolInfo as any).volume24hToken0 || 0;
  const volume24hToken1 = (poolInfo as any).volume24hToken1 || 0;

  // No reward APR for now (would need governance token implementation)
  const rewardAPR = 0;
  const totalAPR = baseAPR + rewardAPR;

  const userLPTokens = userPosition ? formatEther((userPosition as any)[0] || BigInt(0)) : '0';
  const userToken0 = userPosition ? formatEther((userPosition as any)[1] || BigInt(0)) : '0';
  const userToken1 = userPosition ? formatEther((userPosition as any)[2] || BigInt(0)) : '0';

  const reserve0Num = parseFloat(reserve0);
  const reserve1Num = parseFloat(reserve1);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <button onClick={() => router.push("/explore")} className="hover:text-foreground">
            Pools
          </button>
          <span>/</span>
          <span className="text-foreground">{token0.symbol} / {token1.symbol}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pool Header */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-background flex items-center justify-center text-lg font-bold">
                      {token0.symbol.substring(1, 2)}
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-success/30 to-success/10 border-2 border-background flex items-center justify-center text-lg font-bold">
                      {token1.symbol.substring(1, 2)}
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">{token0.symbol} / {token1.symbol}</h1>
                    <div className="flex items-center gap-3 mt-2">
                      {totalAPR > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <span className="text-success mr-1">●</span>
                          {totalAPR.toFixed(2)}% APR
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        Avalanche DEX
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        0.3% Fee
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => refetch()}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* TVL Display */}
              <div className="mb-6">
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <div className="text-4xl font-bold">${tvl >= 1000 ? (tvl / 1000).toFixed(2) + 'K' : tvl.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground mt-1">Total Value Locked</div>
                  </div>
                  {transactions.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                {/* Enhanced Chart Visualization */}
                {transactions.length > 0 ? (
                  <div className="space-y-4">
                    {/* Volume Chart */}
                    <div className="h-64 flex flex-col">
                      <div className="flex-1 flex items-end justify-between gap-1 mb-2">
                        {transactions.slice(0, 50).reverse().map((tx, i) => {
                          if (tx.type !== 'Swap') return null;
                          const amount = parseFloat(tx.token0Amount) + parseFloat(tx.token1Amount);
                          const maxAmount = Math.max(...transactions.filter(t => t.type === 'Swap').slice(0, 50).map(t => parseFloat(t.token0Amount) + parseFloat(t.token1Amount)));
                          const height = maxAmount > 0 ? (amount / maxAmount) * 100 : 5;

                          return (
                            <div
                              key={i}
                              className="flex-1 rounded-t bg-gradient-to-t from-primary to-primary/60 hover:from-primary hover:to-primary transition-all cursor-pointer group relative"
                              style={{ height: `${Math.max(height, 5)}%`, minHeight: '4px' }}
                              title={`Swap: ${parseFloat(tx.token0Amount).toFixed(2)} ${token0.symbol} → ${parseFloat(tx.token1Amount).toFixed(2)} ${token1.symbol}`}
                            >
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-background border border-border rounded text-xs opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                                {parseFloat(tx.token0Amount).toFixed(2)} {token0.symbol} → {parseFloat(tx.token1Amount).toFixed(2)} {token1.symbol}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                        <span>Older</span>
                        <span>Recent</span>
                      </div>
                    </div>

                    {/* Volume Breakdown */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">24H Volume ({token0.symbol})</div>
                        <div className="text-lg font-semibold">
                          {volume24hToken0 >= 1000 ? (volume24hToken0 / 1000).toFixed(2) + 'K' : volume24hToken0.toFixed(2)} {token0.symbol}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">24H Volume ({token1.symbol})</div>
                        <div className="text-lg font-semibold">
                          {volume24hToken1 >= 1000 ? (volume24hToken1 / 1000).toFixed(2) + 'K' : volume24hToken1.toFixed(2)} {token1.symbol}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center border border-dashed border-border rounded-lg">
                    <div className="text-center text-muted-foreground text-sm">
                      <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <div>No transaction history yet</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Time Range Buttons */}
              <div className="flex items-center gap-2 mb-6">
                {["1H", "1D", "1W", "1M", "1Y", "ALL"].map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setTimeRange(range)}
                    className="text-xs"
                  >
                    {range}
                  </Button>
                ))}
                <div className="flex-1" />
                {["Price", "Volume", "Liquidity"].map((tab) => (
                  <Button key={tab} variant="ghost" size="sm" className="text-xs">
                    {tab}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Transactions */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Transactions</h2>
                {isLoadingTxs && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Loading...
                  </div>
                )}
              </div>
              <div className="overflow-x-auto">
                {transactions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">{token0.symbol}</TableHead>
                        <TableHead className="text-right">{token1.symbol}</TableHead>
                        <TableHead className="text-right">Wallet</TableHead>
                        <TableHead className="text-right">Tx</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-muted-foreground text-sm">{tx.time}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                tx.type === "Swap" && "border-primary/50 text-primary",
                                tx.type === "Add" && "border-success/50 text-success",
                                tx.type === "Remove" && "border-destructive/50 text-destructive"
                              )}
                            >
                              {tx.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {parseFloat(tx.token0Amount).toFixed(4)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {parseFloat(tx.token1Amount).toFixed(4)}
                          </TableCell>
                          <TableCell className="text-right">
                            <a
                              href={`${'https://snowtrace.io'}/address/${tx.wallet}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline font-mono text-xs"
                            >
                              {tx.wallet.slice(0, 6)}...{tx.wallet.slice(-4)}
                            </a>
                          </TableCell>
                          <TableCell className="text-right">
                            <a
                              href={`${'https://snowtrace.io'}/tx/${tx.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <div className="text-sm">No transactions yet</div>
                    <div className="text-xs mt-1">Transactions will appear here once trading starts</div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="space-y-4">
            {/* Swap Interface or Action Buttons */}
            {showSwap ? (
              <Card className="p-0 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="font-semibold">Swap</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSwap(false)}
                  >
                    Close
                  </Button>
                </div>
                <div className="p-2">
                  <SwapCardDex />
                </div>
              </Card>
            ) : (
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-gradient-to-r from-primary to-primary/80"
                  onClick={() => setShowSwap(true)}
                >
                  🔄 Swap
                </Button>
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => router.push('/trade')}
                >
                  + Add liquidity
                </Button>
              </div>
            )}

            {/* APR Card */}
            <Card className="p-6 bg-gradient-to-br from-success/5 to-success/[0.02] border-success/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total APR</span>
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <div className="text-4xl font-bold text-success mb-4">{totalAPR.toFixed(2)}%</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base APR (from fees)</span>
                  <span className="font-medium">{baseAPR.toFixed(2)}%</span>
                </div>
                {rewardAPR > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reward APR</span>
                    <span className="font-medium text-success">{rewardAPR.toFixed(2)}%</span>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                APR calculated from actual fees earned in last 24h
              </div>
            </Card>

            {/* Pool Activity */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Pool Activity</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Transactions</span>
                  <span className="font-medium">{transactions.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Swaps (24H)</span>
                  <span className="font-medium">{transactions.filter(tx => tx.type === 'Swap' && Date.now() - tx.timestamp < 24 * 60 * 60 * 1000).length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">24H Volume</span>
                  <span className="font-medium">${volume24h >= 1000 ? (volume24h / 1000).toFixed(2) + 'K' : volume24h.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-border">
                  <div className="text-xs text-muted-foreground mb-2">Volume by Asset (24H)</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{token0.symbol}:</span>
                      <span className="font-medium">{volume24hToken0 >= 1000 ? (volume24hToken0 / 1000).toFixed(2) + 'K' : volume24hToken0.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{token1.symbol}:</span>
                      <span className="font-medium">{volume24hToken1 >= 1000 ? (volume24hToken1 / 1000).toFixed(2) + 'K' : volume24hToken1.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">24H Fees Earned</span>
                  <span className="font-medium text-success">${fees24h >= 1000 ? (fees24h / 1000).toFixed(2) + 'K' : fees24h.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fee Rate</span>
                  <span className="font-medium">0.3%</span>
                </div>
              </div>
            </Card>

            {/* Stats */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Stats</h3>
              <div className="space-y-4">
                {/* Pool Balances */}
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Pool balances</div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary/30 to-primary/10" />
                      <span className="text-sm font-medium">
                        {reserve0Num >= 1000 ? (reserve0Num / 1000).toFixed(1) + 'K' : reserve0Num.toFixed(2)} {token0.symbol}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-success/30 to-success/10" />
                      <span className="text-sm font-medium">
                        {reserve1Num >= 1000 ? (reserve1Num / 1000).toFixed(1) + 'K' : reserve1Num.toFixed(2)} {token1.symbol}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-success"
                      style={{ width: `${reserve0Num > 0 ? (reserve0Num / (reserve0Num + reserve1Num)) * 100 : 50}%` }}
                    />
                  </div>
                </div>

                {/* TVL */}
                <div className="pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground mb-1">TVL</div>
                  <div className="text-2xl font-bold">
                    ${tvl >= 1000000 ? (tvl / 1000000).toFixed(2) + 'M' : tvl >= 1000 ? (tvl / 1000).toFixed(2) + 'K' : tvl.toFixed(2)}
                  </div>
                </div>

                {/* 24H Volume */}
                <div className="pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground mb-1">24H volume</div>
                  <div className="text-2xl font-bold">
                    ${volume24h >= 1000000 ? (volume24h / 1000000).toFixed(2) + 'M' : volume24h >= 1000 ? (volume24h / 1000).toFixed(2) + 'K' : volume24h.toFixed(2)}
                  </div>
                </div>

                {/* 24H Fees */}
                <div className="pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground mb-1">24H fees</div>
                  <div className="text-2xl font-bold">
                    ${fees24h >= 1000 ? (fees24h / 1000).toFixed(2) + 'K' : fees24h.toFixed(2)}
                  </div>
                </div>

                {/* LP Tokens */}
                <div className="pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground mb-1">LP Tokens</div>
                  <div className="text-lg font-bold">{parseFloat(totalSupply).toFixed(2)}</div>
                </div>

                {/* User Position */}
                {isConnected && parseFloat(userLPTokens) > 0 && (
                  <div className="pt-4 border-t border-border bg-primary/5 -mx-6 -mb-6 mt-4 px-6 py-4 rounded-b-lg">
                    <div className="text-sm text-muted-foreground mb-2">Your Position</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>LP Tokens:</span>
                        <span className="font-medium">{parseFloat(userLPTokens).toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{token0.symbol}:</span>
                        <span className="font-medium">{parseFloat(userToken0).toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{token1.symbol}:</span>
                        <span className="font-medium">{parseFloat(userToken1).toFixed(4)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Pool Info */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Pool Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">Fee Tier</div>
                  <div className="font-medium">0.3%</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Pool ID</div>
                  <div className="font-medium font-mono">#{poolId}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Contract</div>
                  <a
                    href={`${'https://snowtrace.io'}/address/${CONTRACT_ADDRESSES.POOLS}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-mono text-xs"
                  >
                    {CONTRACT_ADDRESSES.POOLS.slice(0, 6)}...{CONTRACT_ADDRESSES.POOLS.slice(-4)}
                  </a>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Network</div>
                  <div className="font-medium">Avalanche Mainnet</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="lg:block hidden">
            <div className="sticky top-24">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => router.push('/trade')}
                  >
                    <Droplet className="w-4 h-4 mr-2" />
                    Add Liquidity
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => router.push('/trade')}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Swap Tokens
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    disabled={parseFloat(userLPTokens) === 0}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Remove Liquidity
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => router.push('/explore')}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View All Pools
                  </Button>
                </div>

                {/* Pool Details */}
                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="font-semibold text-sm mb-3">Pool Details</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Token 0:</span>
                      <span className="font-medium">{token0.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Token 1:</span>
                      <span className="font-medium">{token1.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reserve 0:</span>
                      <span className="font-medium">{parseFloat(reserve0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reserve 1:</span>
                      <span className="font-medium">{parseFloat(reserve1).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

