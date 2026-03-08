"use client";

import { useState } from "react";
import { ArrowUpDown, ChevronDown, Settings, Check, Wallet, Search, ExternalLink, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDexAggregator, DexSource } from "@/hooks/use-dex-aggregator";
import { useAvalancheWallet } from "@/hooks/use-avalanche-wallet";
import { TOKEN_LIST, TOKEN_ADDRESSES } from "@/contracts/config";
import { useTokenBalances } from "@/hooks/use-token-balances";
import AvalancheWalletConnect from "@/components/features/avalanche/avalanche-wallet-connect";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { avalanche } from '@/lib/chains/avalanche';

type SwapMode = "swap" | "limit" | "buy" | "sell";

const DEX_LABELS: Record<DexSource, { name: string; color: string }> = {
  traderjoe_v2: { name: 'Trader Joe', color: 'text-orange-400' },
  traderjoe: { name: 'Trader Joe V1', color: 'text-orange-300' },
  pangolin: { name: 'Pangolin', color: 'text-pink-400' },
};

export function SwapCardDex() {
  const { isConnected, chain, address } = useAvalancheWallet();

  const [mode, setMode] = useState<SwapMode>("swap");
  const [tokenIn, setTokenIn] = useState<string>('WAVAX');
  const [tokenOut, setTokenOut] = useState<string>('USDC'); // USDC.e — best V1 liquidity
  const [amountIn, setAmountIn] = useState<string>('');
  const [slippage, setSlippage] = useState<number>(0.5);
  const [isPayTokenOpen, setIsPayTokenOpen] = useState(false);
  const [isReceiveTokenOpen, setIsReceiveTokenOpen] = useState(false);

  const { balances: walletBalances } = useTokenBalances(address);

  const {
    quotes,
    selectedDex,
    setSelectedDex,
    estimatedOutput,
    balance,
    needsApproval,
    executeSwap,
    isApproving,
    isLoading,
    isSuccess,
    hash,
    error,
    isLoadingQuotes,
  } = useDexAggregator(tokenIn, tokenOut, amountIn, slippage);

  // tokenIn/tokenOut are object KEYS (e.g. 'WAVAX', 'nUSDC'), not symbols
  const payToken = TOKEN_ADDRESSES[tokenIn] ?? TOKEN_LIST[0];
  const receiveToken = TOKEN_ADDRESSES[tokenOut] ?? TOKEN_LIST[1];

  const handleSwapDirection = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn('');
  };

  const handleTokenSelect = (symbol: string, type: "pay" | "receive") => {
    if (type === "pay") {
      if (symbol === tokenOut) setTokenOut(tokenIn);
      setTokenIn(symbol);
      setIsPayTokenOpen(false);
    } else {
      if (symbol === tokenIn) setTokenIn(tokenOut);
      setTokenOut(symbol);
      setIsReceiveTokenOpen(false);
    }
    setAmountIn('');
  };

  const hasValidAmount = amountIn && parseFloat(amountIn) > 0;
  const hasSufficientBalance = parseFloat(balance) >= parseFloat(amountIn || '0');
  const hasQuote = quotes.length > 0 && parseFloat(estimatedOutput) > 0;
  const isValidSwap = hasValidAmount && hasSufficientBalance && hasQuote;
  const isWrongNetwork = isConnected && chain?.id !== avalanche.id;

  const TokenIcon = ({ symbol }: { symbol: string }) => (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
      {symbol.charAt(0)}
    </div>
  );

  const TokenSelectorModal = ({
    open,
    onOpenChange,
    type,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: "pay" | "receive";
  }) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>Select a token</DialogTitle>
        </DialogHeader>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search by name or symbol"
            className="w-full bg-secondary/50 border border-border rounded-xl py-3 pl-10 pr-4 outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <div className="grid gap-1 max-h-96 overflow-y-auto">
          {Object.entries(TOKEN_ADDRESSES)
            .sort(([keyA], [keyB]) => {
              // Sort tokens with non-zero balance to the top
              const balA = parseFloat(walletBalances[keyA] ?? '0');
              const balB = parseFloat(walletBalances[keyB] ?? '0');
              return balB - balA;
            })
            .map(([key, token]) => {
              const bal = walletBalances[key];
              const hasBalance = bal && parseFloat(bal) > 0;
              const isSelected = (type === "pay" ? tokenIn : tokenOut) === key;
              return (
                <button
                  key={key}
                  onClick={() => handleTokenSelect(key, type)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <TokenIcon symbol={token.symbol} />
                    <div className="text-left">
                      <div className="font-semibold">{token.symbol}</div>
                      <div className="text-xs text-muted-foreground">{token.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasBalance && (
                      <span className="text-sm font-mono text-foreground">
                        {parseFloat(bal!).toFixed(4)}
                      </span>
                    )}
                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                  </div>
                </button>
              );
            })}
        </div>
      </DialogContent>
    </Dialog>
  );

  if (!isConnected) {
    return (
      <div className="swap-card w-full max-w-md p-8 text-center">
        <h3 className="text-xl font-semibold mb-4">Connect Your Wallet</h3>
        <p className="text-muted-foreground mb-6">
          Connect your wallet to swap tokens on Avalanche
        </p>
        <AvalancheWalletConnect variant="default" />
      </div>
    );
  }

  if (isWrongNetwork) {
    return (
      <div className="swap-card w-full max-w-md p-8 text-center">
        <h3 className="text-xl font-semibold mb-4 text-destructive">Wrong Network</h3>
        <p className="text-muted-foreground mb-6">
          Please switch to Avalanche Mainnet to use this DEX
        </p>
        <div className="text-sm text-muted-foreground">
          Current: {chain?.name} (ID: {chain?.id})<br />
          Required: Avalanche Mainnet (ID: {avalanche.id})
        </div>
      </div>
    );
  }

  return (
    <div className="swap-card w-full p-1">
      {/* Mode Selector */}
      <div className="flex items-center justify-between p-5 pb-2 gap-3">
        <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1 overflow-x-auto scrollbar-hide">
          {(["swap", "limit", "buy", "sell"] as SwapMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "mode-tab capitalize whitespace-nowrap",
                mode === m ? "mode-tab-active" : "mode-tab-inactive"
              )}
              disabled={m !== "swap"}
            >
              {m}
              {m === "limit" && (
                <span className="ml-1 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                  Soon
                </span>
              )}
            </button>
          ))}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <button className="settings-btn mr-1 shrink-0">
              <Settings className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-card border-border backdrop-blur-xl" align="end">
            <div className="space-y-4">
              <h4 className="font-medium leading-none">Transaction Settings</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Slippage Tolerance</span>
                  <span className="text-sm font-medium text-primary">{slippage}%</span>
                </div>
                <div className="flex items-center gap-2">
                  {[0.1, 0.5, 1.0].map((val) => (
                    <button
                      key={val}
                      onClick={() => setSlippage(val)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                        slippage === val
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-secondary/50 border-transparent hover:bg-secondary text-muted-foreground"
                      )}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="p-4 pt-2 space-y-2">
        {/* Pay Section */}
        <div className="token-input-section">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Pay</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Wallet className="w-3 h-3" />
              <span>{parseFloat(balance).toFixed(4)} {payToken.symbol}</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <input
              type="number"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              placeholder="0"
              className="flex-1 bg-transparent text-3xl font-medium outline-none placeholder:text-muted-foreground/50 w-full min-w-0"
            />
            <button className="token-selector" onClick={() => setIsPayTokenOpen(true)}>
              <TokenIcon symbol={payToken.symbol} />
              <div className="text-left hidden sm:block">
                <div className="font-semibold">{payToken.symbol}</div>
                <div className="text-xs text-muted-foreground">{payToken.name}</div>
              </div>
              <div className="text-left sm:hidden font-semibold">{payToken.symbol}</div>
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          </div>
        </div>

        {/* Swap Direction Button */}
        <div className="flex justify-center -my-1 relative z-10">
          <button onClick={handleSwapDirection} className="swap-direction-btn">
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* Receive Section */}
        <div className="token-input-section">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Receive (estimated)</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <input
              type="number"
              value={isLoadingQuotes ? '' : estimatedOutput}
              readOnly
              placeholder={isLoadingQuotes ? 'Fetching...' : '0'}
              className="flex-1 bg-transparent text-3xl font-medium outline-none placeholder:text-muted-foreground/50 w-full min-w-0"
            />
            <button className="token-selector" onClick={() => setIsReceiveTokenOpen(true)}>
              <TokenIcon symbol={receiveToken.symbol} />
              <div className="text-left hidden sm:block">
                <div className="font-semibold">{receiveToken.symbol}</div>
                <div className="text-xs text-muted-foreground">{receiveToken.name}</div>
              </div>
              <div className="text-left sm:hidden font-semibold">{receiveToken.symbol}</div>
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          </div>
        </div>

        {/* Route Selector */}
        {hasValidAmount && (
          <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <Zap className="w-3 h-3" />
              <span>Best Route</span>
            </div>

            {isLoadingQuotes ? (
              <div className="text-xs text-muted-foreground animate-pulse">Fetching quotes...</div>
            ) : quotes.length === 0 ? (
              <div className="text-xs text-muted-foreground">No liquidity found for this pair</div>
            ) : (
              <div className="space-y-1.5">
                {quotes.map((quote) => {
                  const label = DEX_LABELS[quote.dex];
                  const isSelected = selectedDex === quote.dex;
                  return (
                    <button
                      key={quote.dex}
                      onClick={() => setSelectedDex(quote.dex)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                        isSelected
                          ? "bg-primary/10 border border-primary/30"
                          : "hover:bg-muted/50 border border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {isSelected && <Check className="w-3 h-3 text-primary" />}
                        {!isSelected && <div className="w-3 h-3" />}
                        <span className={cn("font-medium", label.color)}>{label.name}</span>
                        {quote.isBest && (
                          <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-medium">
                            Best
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-xs">
                        {parseFloat(quote.amountOutFormatted).toFixed(6)} {receiveToken.symbol}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Path display */}
            {quotes.find(q => q.dex === selectedDex)?.path && (
              <div className="text-[10px] text-muted-foreground/60 flex items-center gap-1 mt-1">
                {quotes
                  .find(q => q.dex === selectedDex)!
                  .path.map((addr, i, arr) => {
                    const token = TOKEN_LIST.find(
                      t => t.address.toLowerCase() === addr.toLowerCase()
                    );
                    return (
                      <span key={addr} className="flex items-center gap-1">
                        <span>{token?.symbol ?? addr.slice(0, 6)}</span>
                        {i < arr.length - 1 && <span>→</span>}
                      </span>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => { if (isValidSwap && !isLoading) executeSwap(); }}
          disabled={!isValidSwap || isLoading}
          className="swap-action-btn mt-4"
        >
          {isLoading
            ? isApproving
              ? `Approving ${payToken.symbol}...`
              : 'Swapping...'
            : !hasValidAmount
              ? 'Enter Amount'
              : !hasSufficientBalance
                ? 'Insufficient Balance'
                : !hasQuote
                  ? 'No Liquidity'
                  : needsApproval
                    ? `Approve ${payToken.symbol} on ${DEX_LABELS[selectedDex].name}`
                    : `Swap via ${DEX_LABELS[selectedDex].name}`}
        </button>

        {/* Success */}
        {isSuccess && hash && (
          <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm text-success font-medium">Swap Successful!</span>
              <a
                href={`https://snowtrace.io/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                View <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <div className="font-medium mb-1">Transaction Error</div>
            <div className="text-xs">{error}</div>
          </div>
        )}

        {/* Warnings */}
        {hasValidAmount && !hasSufficientBalance && (
          <div className="mt-2 text-sm text-destructive">Insufficient balance</div>
        )}
      </div>

      <TokenSelectorModal open={isPayTokenOpen} onOpenChange={setIsPayTokenOpen} type="pay" />
      <TokenSelectorModal open={isReceiveTokenOpen} onOpenChange={setIsReceiveTokenOpen} type="receive" />
    </div>
  );
}
