"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, TrendingDown, Wallet, Clock } from "lucide-react";
import { useWalletAnalysis } from "@/hooks";
import type { TokenBalance } from "@/types";

export function WalletAnalysisPanel() {
  const { data, isLoading, error, refetch, cacheHit, analysisTimeMs } = useWalletAnalysis({
    autoFetch: true,
    chains: ['ethereum', 'polygon'],
  });

  const handleRefresh = () => {
    console.log('Manual refresh triggered');
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load wallet analysis: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Analysis
          </CardTitle>
          <CardDescription>Connect your wallet to view detailed analysis</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { portfolio_summary, token_balances, recent_transactions } = data;

  // Filter out tokens with zero or null value
  const valuableTokens = token_balances.filter(
    (token) => token.value_usd && parseFloat(token.value_usd) > 0
  );

  return (
    <div className="space-y-6">
      {/* Portfolio Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Portfolio Overview
              </CardTitle>
              <CardDescription>
                {portfolio_summary.chains_active.length} chain(s) • {portfolio_summary.unique_tokens} unique token(s)
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {cacheHit && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Cached
                </Badge>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
              <p className="text-3xl font-bold">
                ${parseFloat(portfolio_summary.total_value_usd).toFixed(2)}
              </p>
            </div>

            {/* Chains Active */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Active Chains</p>
              <div className="flex flex-wrap gap-2">
                {portfolio_summary.chains_active.map((chain) => (
                  <Badge key={chain} variant="secondary" className="capitalize">
                    {chain}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Value by Chain */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Value by Chain</p>
              <div className="space-y-2">
                {Object.entries(portfolio_summary.value_by_chain).map(([chain, value]) => {
                  const numValue = parseFloat(value);
                  if (numValue === 0) return null;
                  
                  return (
                    <div key={chain} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{chain}</span>
                      <span className="text-sm font-medium">${numValue.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token Balances */}
      <Card>
        <CardHeader>
          <CardTitle>Token Holdings</CardTitle>
          <CardDescription>
            {valuableTokens.length} token(s) with value
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {valuableTokens.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tokens with value found
              </p>
            ) : (
              valuableTokens.map((token, index) => (
                <TokenBalanceRow key={`${token.chain}-${token.token_address}-${index}`} token={token} />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      {recent_transactions && recent_transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Last {recent_transactions.length} transaction(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recent_transactions.slice(0, 5).map((tx) => (
                <div
                  key={tx.tx_hash}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={tx.status ? "default" : "destructive"}>
                        {tx.status ? "Success" : "Failed"}
                      </Badge>
                      <span className="text-sm font-mono">
                        {tx.tx_hash.slice(0, 10)}...{tx.tx_hash.slice(-8)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tx.method_name || 'Transfer'} • {new Date(tx.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{tx.value} ETH</p>
                    <p className="text-xs text-muted-foreground">
                      Fee: {parseFloat(tx.tx_fee).toFixed(6)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Metadata */}
      <div className="text-xs text-muted-foreground text-center">
        Analysis completed in {analysisTimeMs}ms
        {cacheHit && ' (from cache)'}
      </div>
    </div>
  );
}

function TokenBalanceRow({ token }: { token: TokenBalance }) {
  const value = token.value_usd ? parseFloat(token.value_usd) : 0;
  const priceChange = token.price_change_24h ? parseFloat(token.price_change_24h) : 0;
  const isPositiveChange = priceChange >= 0;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3">
        {token.logo_url ? (
          <img src={token.logo_url} alt={token.token_symbol} className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <span className="text-xs font-bold">{token.token_symbol.slice(0, 2)}</span>
          </div>
        )}
        <div>
          <p className="font-medium">{token.token_symbol}</p>
          <p className="text-xs text-muted-foreground">
            {token.token_name} • <span className="capitalize">{token.chain}</span>
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium">${value.toFixed(2)}</p>
        <div className="flex items-center gap-1 justify-end">
          <p className="text-xs">{parseFloat(token.balance_formatted).toFixed(4)}</p>
          {priceChange !== 0 && (
            <span className={`text-xs flex items-center ${isPositiveChange ? 'text-green-500' : 'text-red-500'}`}>
              {isPositiveChange ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(priceChange).toFixed(2)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
