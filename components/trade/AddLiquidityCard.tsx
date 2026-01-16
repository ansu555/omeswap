"use client";

import { useState } from "react";
import { Plus, Settings, ExternalLink, Info } from "lucide-react";
import { useLiquidity } from "@/hooks/use-liquidity";
import { useMantleWallet } from "@/hooks/use-mantle-wallet";
import { TOKENS } from "@/contracts/config";
import MantleWalletConnect from "@/components/features/mantle/mantle-wallet-connect";
import { mantleTestnet } from "@/lib/chains/mantle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AddLiquidityCard() {
  const { isConnected, chain } = useMantleWallet();
  const [token0Symbol, setToken0Symbol] = useState<string>('tUSDC');
  const [token1Symbol, setToken1Symbol] = useState<string>('tUSDT');

  const {
    amount0,
    setAmount0,
    amount1,
    setAmount1,
    balance0,
    balance1,
    poolInfo,
    userPosition,
    needsApproval0,
    needsApproval1,
    approveToken0,
    approveToken1,
    addLiquidity,
    getQuote,
    isLoading,
    isSuccess,
    hash,
    error,
  } = useLiquidity(token0Symbol, token1Symbol);

  const token0 = TOKENS[token0Symbol];
  const token1 = TOKENS[token1Symbol];

  const handleAmount0Change = (value: string) => {
    setAmount0(value);
    if (value && poolInfo) {
      const quoted = getQuote(value, true);
      setAmount1(quoted);
    }
  };

  const handleAmount1Change = (value: string) => {
    setAmount1(value);
    if (value && poolInfo) {
      const quoted = getQuote(value, false);
      setAmount0(quoted);
    }
  };

  const isValidLiquidity = 
    amount0 && 
    amount1 && 
    parseFloat(amount0) > 0 && 
    parseFloat(amount1) > 0 &&
    parseFloat(balance0) >= parseFloat(amount0) &&
    parseFloat(balance1) >= parseFloat(amount1);

  const isWrongNetwork = isConnected && chain?.id !== mantleTestnet.id;

  if (!isConnected) {
    return (
      <div className="swap-card w-full max-w-md p-8 text-center">
        <h3 className="text-xl font-semibold mb-4">Connect Your Wallet</h3>
        <p className="text-muted-foreground mb-6">
          Connect your wallet to provide liquidity
        </p>
        <MantleWalletConnect variant="default" />
      </div>
    );
  }

  if (isWrongNetwork) {
    return (
      <div className="swap-card w-full max-w-md p-8 text-center">
        <h3 className="text-xl font-semibold mb-4 text-destructive">Wrong Network</h3>
        <p className="text-muted-foreground mb-6">
          Please switch to Mantle Sepolia Testnet
        </p>
      </div>
    );
  }

  return (
    <div className="swap-card w-full p-1">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Add Liquidity</h3>
          <Settings className="w-5 h-5 text-muted-foreground" />
        </div>

        {/* Pool Info */}
        {poolInfo && (
          <div className="mb-4 p-3 bg-secondary/30 rounded-xl space-y-1">
            <div className="text-xs text-muted-foreground">Pool Reserves</div>
            <div className="flex justify-between text-sm">
              <span>{token0Symbol}: {parseFloat(poolInfo.reserve0).toFixed(2)}</span>
              <span>{token1Symbol}: {parseFloat(poolInfo.reserve1).toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Token Selection */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Token 1</label>
            <Select value={token0Symbol} onValueChange={setToken0Symbol}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(TOKENS).map((symbol) => (
                  <SelectItem key={symbol} value={symbol}>
                    {symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Token 2</label>
            <Select value={token1Symbol} onValueChange={setToken1Symbol}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(TOKENS).map((symbol) => (
                  <SelectItem key={symbol} value={symbol}>
                    {symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Token 0 Input */}
        <div className="token-input-section mb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{token0.symbol}</span>
            <span className="text-xs text-muted-foreground">
              Balance: {parseFloat(balance0).toFixed(4)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={amount0}
              onChange={(e) => handleAmount0Change(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-2xl font-medium outline-none placeholder:text-muted-foreground/50"
            />
            <button
              onClick={() => setAmount0(balance0)}
              className="text-xs text-primary hover:text-primary/80 font-medium"
            >
              MAX
            </button>
          </div>
        </div>

        <div className="flex justify-center -my-1">
          <div className="w-8 h-8 rounded-full bg-background border-2 border-border flex items-center justify-center">
            <Plus className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        {/* Token 1 Input */}
        <div className="token-input-section mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{token1.symbol}</span>
            <span className="text-xs text-muted-foreground">
              Balance: {parseFloat(balance1).toFixed(4)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={amount1}
              onChange={(e) => handleAmount1Change(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-2xl font-medium outline-none placeholder:text-muted-foreground/50"
            />
            <button
              onClick={() => setAmount1(balance1)}
              className="text-xs text-primary hover:text-primary/80 font-medium"
            >
              MAX
            </button>
          </div>
        </div>

        {/* User Position */}
        {userPosition && parseFloat(userPosition.liquidity) > 0 && (
          <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="text-xs text-muted-foreground mb-2">Your Position</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>LP Tokens:</span>
                <span className="font-medium">{parseFloat(userPosition.liquidity).toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span>{token0Symbol}:</span>
                <span className="font-medium">{parseFloat(userPosition.token0Amount).toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span>{token1Symbol}:</span>
                <span className="font-medium">{parseFloat(userPosition.token1Amount).toFixed(4)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {needsApproval0 && (
            <button
              onClick={approveToken0}
              disabled={!amount0 || isLoading}
              className="w-full py-3 px-4 rounded-xl font-medium bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Approving..." : `Approve ${token0.symbol}`}
            </button>
          )}
          
          {needsApproval1 && (
            <button
              onClick={approveToken1}
              disabled={!amount1 || isLoading}
              className="w-full py-3 px-4 rounded-xl font-medium bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Approving..." : `Approve ${token1.symbol}`}
            </button>
          )}
          
          {!needsApproval0 && !needsApproval1 && (
            <button
              onClick={(e) => {
                e.preventDefault();
                console.log('Add Liquidity button clicked', { isValidLiquidity, isLoading, amount0, amount1 });
                if (isValidLiquidity && !isLoading) {
                  addLiquidity();
                }
              }}
              disabled={!isValidLiquidity || isLoading}
              className="swap-action-btn w-full"
            >
              {isLoading ? "Adding Liquidity..." : isValidLiquidity ? "Add Liquidity" : "Enter Amounts"}
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <div className="font-medium mb-1">Transaction Error</div>
            <div className="text-xs">{error}</div>
          </div>
        )}

        {/* Success Message */}
        {isSuccess && hash && (
          <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm text-success font-medium">✅ Liquidity Added!</span>
              <a
                href={`${mantleTestnet.blockExplorers.default.url}/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                View <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-4 p-3 bg-muted/30 rounded-xl flex gap-2">
          <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground">
            By adding liquidity, you'll earn 0.3% of all trades on this pair proportional to your share of the pool.
          </div>
        </div>
      </div>
    </div>
  );
}

