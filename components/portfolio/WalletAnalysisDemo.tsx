"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { analyzeWallet } from "@/lib/api/wallet-analysis";
import type { WalletAnalysisData } from "@/types";

/**
 * Standalone demo component to test wallet analysis API
 * This can be used independently without wallet connection
 */
export function WalletAnalysisDemo() {
  const [address, setAddress] = useState("0x418740ad926922f55091bd994e0355a02e4c71b0");
  const [data, setData] = useState<WalletAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await analyzeWallet({
        address,
        cache_ttl_minutes: 60,
        chains: ["ethereum", "polygon"],
        include_nfts: true,
        include_transactions: true,
        transaction_limit: 10,
        use_cache: true,
      });

      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || "Failed to analyze wallet");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Wallet Analysis Demo</CardTitle>
          <CardDescription>
            Test the wallet analysis API by entering any Ethereum address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter wallet address (0x...)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAnalyze} disabled={isLoading}>
              {isLoading ? "Analyzing..." : "Analyze"}
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
              Error: {error}
            </div>
          )}

          {data && (
            <div className="space-y-4 mt-6">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Portfolio Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold">
                      ${parseFloat(data.portfolio_summary.total_value_usd).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tokens</p>
                    <p className="text-2xl font-bold">{data.portfolio_summary.total_tokens}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Chains</p>
                    <p className="font-medium">
                      {data.portfolio_summary.chains_active.join(", ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Analysis Time</p>
                    <p className="font-medium">{data.analysis_time_ms}ms</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Token Balances</h3>
                <div className="space-y-2">
                  {data.token_balances.map((token, idx) => (
                    <div key={idx} className="p-3 bg-muted/50 rounded-lg flex justify-between">
                      <div>
                        <p className="font-medium">{token.token_symbol}</p>
                        <p className="text-xs text-muted-foreground capitalize">{token.chain}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {parseFloat(token.balance_formatted).toFixed(4)}
                        </p>
                        {token.value_usd && parseFloat(token.value_usd) > 0 && (
                          <p className="text-xs text-muted-foreground">
                            ${parseFloat(token.value_usd).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {data.recent_transactions.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Recent Transactions</h3>
                  <div className="space-y-2">
                    {data.recent_transactions.slice(0, 5).map((tx) => (
                      <div key={tx.tx_hash} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex justify-between">
                          <p className="text-xs font-mono">
                            {tx.tx_hash.slice(0, 10)}...{tx.tx_hash.slice(-8)}
                          </p>
                          <p className="text-xs capitalize">{tx.chain}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {tx.method_name || "Transfer"} •{" "}
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <details className="p-4 bg-muted/30 rounded-lg">
                <summary className="font-semibold cursor-pointer">Raw JSON Data</summary>
                <pre className="mt-2 p-4 bg-background rounded text-xs overflow-auto max-h-96">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
