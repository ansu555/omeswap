"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowUpDown, ChevronDown, Settings, Check, Wallet, Search, AlertTriangle, RefreshCw, Info } from "lucide-react";
import { cn } from "@/lib/utils";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMantleWallet } from "@/hooks/use-mantle-wallet";

interface Token {
  symbol: string;
  name: string;
  color: string;
  balance: number;
  price: number;
  decimals: number;
}

interface PriceData {
  price: number;
  change24h: number;
  lastUpdated: Date;
}

const DEFAULT_TOKENS: Record<string, Token> = {
  tUSDC: {
    symbol: "tUSDC",
    name: "Test USDC",
    color: "#2775CA",
    balance: 0,
    price: 1.0,
    decimals: 6,
  },
  tUSDT: {
    symbol: "tUSDT",
    name: "Test USDT",
    color: "#26A17B",
    balance: 0,
    price: 1.0,
    decimals: 6,
  },
  MNT: {
    symbol: "MNT",
    name: "Mantle",
    color: "#000000",
    balance: 0,
    price: 0.75,
    decimals: 18,
  },
};

const SLIPPAGE_OPTIONS = ["0.1", "0.5", "1.0", "3.0"];

export function SwapCardDex() {
  const { address, isConnected } = useMantleWallet();

  // Token states
  const [tokens, setTokens] = useState<Record<string, Token>>(DEFAULT_TOKENS);
  const [payToken, setPayToken] = useState("tUSDC");
  const [receiveToken, setReceiveToken] = useState("tUSDT");
  const [payAmount, setPayAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");

  // Settings states
  const [slippage, setSlippage] = useState("0.5");
  const [customSlippage, setCustomSlippage] = useState("");

  // Modal states
  const [isPayTokenOpen, setIsPayTokenOpen] = useState(false);
  const [isReceiveTokenOpen, setIsReceiveTokenOpen] = useState(false);

  // Real-time price states
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<Date | null>(null);

  // Price impact state
  const [priceImpact, setPriceImpact] = useState<number>(0);

  // Transaction states
  const [isSwapping, setIsSwapping] = useState(false);

  const payTokenData = tokens[payToken];
  const receiveTokenData = tokens[receiveToken];

  const effectiveSlippage = customSlippage || slippage;

  // Fetch real-time prices
  const fetchPrices = useCallback(async () => {
    setIsLoadingPrices(true);
    try {
      // Simulate price fetch - in production, replace with actual API
      const newPrices: Record<string, PriceData> = {};
      Object.keys(DEFAULT_TOKENS).forEach((symbol) => {
        // Simulate small price fluctuations for demo
        const basePrice = DEFAULT_TOKENS[symbol]?.price || 1;
        const fluctuation = (Math.random() - 0.5) * 0.01; // +/- 0.5%
        newPrices[symbol] = {
          price: basePrice * (1 + fluctuation),
          change24h: (Math.random() - 0.5) * 4, // +/- 2%
          lastUpdated: new Date(),
        };
      });
      setPrices(newPrices);
      setLastPriceUpdate(new Date());

      // Update token prices
      setTokens(prev => {
        const updated = { ...prev };
        Object.keys(newPrices).forEach(symbol => {
          if (updated[symbol]) {
            updated[symbol] = { ...updated[symbol], price: newPrices[symbol].price };
          }
        });
        return updated;
      });
    } catch (error) {
      console.error("Failed to fetch prices:", error);
    } finally {
      setIsLoadingPrices(false);
    }
  }, []);

  // Real-time price polling
  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [fetchPrices]);

  // Calculate price impact
  const calculatePriceImpact = useCallback((inputAmount: string) => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      setPriceImpact(0);
      return 0;
    }

    const amount = parseFloat(inputAmount);
    // Simulate price impact based on amount (larger amounts = higher impact)
    // In production, this would come from the actual pool reserves
    const poolLiquidity = 100000; // Simulated pool liquidity
    const impact = (amount / poolLiquidity) * 100;
    setPriceImpact(impact);
    return impact;
  }, []);

  const payUsdValue = payAmount ? parseFloat(payAmount) * (payTokenData?.price || 0) : 0;
  const receiveUsdValue = receiveAmount ? parseFloat(receiveAmount) * (receiveTokenData?.price || 0) : 0;

  const handleSwapDirection = () => {
    setPayToken(receiveToken);
    setReceiveToken(payToken);
    setPayAmount(receiveAmount);
    setReceiveAmount(payAmount);
  };

  const handlePayAmountChange = (value: string) => {
    setPayAmount(value);
    if (value && parseFloat(value) > 0) {
      const payPrice = payTokenData?.price || 1;
      const receivePrice = receiveTokenData?.price || 1;
      const estimated = (parseFloat(value) * payPrice) / receivePrice;
      setReceiveAmount(estimated.toFixed(6));
      calculatePriceImpact(value);
    } else {
      setReceiveAmount("");
      setPriceImpact(0);
    }
  };

  const handleTokenSelect = (token: string, type: "pay" | "receive") => {
    if (type === "pay") {
      if (token === receiveToken) {
        setReceiveToken(payToken);
      }
      setPayToken(token);
      setIsPayTokenOpen(false);
    } else {
      if (token === payToken) {
        setPayToken(receiveToken);
      }
      setReceiveToken(token);
      setIsReceiveTokenOpen(false);
    }
    // Recalculate with new tokens
    if (payAmount) {
      handlePayAmountChange(payAmount);
    }
  };

  const handleMaxClick = () => {
    const maxAmount = payTokenData?.balance?.toString() || "0";
    handlePayAmountChange(maxAmount);
  };

  const handleSwap = async () => {
    if (!isConnected) return;

    setIsSwapping(true);
    try {
      // Simulate swap transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In production, execute actual swap transaction here
      console.log("Swap executed:", {
        from: payToken,
        to: receiveToken,
        amount: payAmount,
        slippage: effectiveSlippage,
      });

      // Clear inputs after successful swap
      setPayAmount("");
      setReceiveAmount("");
      setPriceImpact(0);
    } catch (error) {
      console.error("Swap failed:", error);
    } finally {
      setIsSwapping(false);
    }
  };

  const isValidSwap = payAmount && parseFloat(payAmount) > 0 && isConnected;
  const isHighPriceImpact = priceImpact > 1;
  const isVeryHighPriceImpact = priceImpact > 5;

  // Get price impact color
  const getPriceImpactColor = () => {
    if (priceImpact <= 0.5) return "text-green-500";
    if (priceImpact <= 1) return "text-yellow-500";
    if (priceImpact <= 5) return "text-orange-500";
    return "text-red-500";
  };

  const TokenSelectorModal = ({
    open,
    onOpenChange,
    type
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
            placeholder="Search by name or paste address"
            className="w-full bg-secondary/50 border border-border rounded-xl py-3 pl-10 pr-4 outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <div className="grid gap-2">
          {Object.values(tokens).map((token) => (
            <button
              key={token.symbol}
              onClick={() => handleTokenSelect(token.symbol, type)}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: token.color }}
                >
                  {token.symbol.slice(0, 2)}
                </div>
                <div className="text-left">
                  <div className="font-semibold">{token.symbol}</div>
                  <div className="text-xs text-muted-foreground group-hover:text-muted-foreground/80">
                    {token.name}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{token.balance.toFixed(4)}</div>
                <div className="text-xs text-muted-foreground">
                  ${(token.balance * token.price).toFixed(2)}
                </div>
                {(type === "pay" ? payToken : receiveToken) === token.symbol && (
                  <Check className="w-4 h-4 text-primary ml-auto mt-1" />
                )}
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="swap-card w-full max-w-md p-1 bg-card/80 backdrop-blur-xl rounded-2xl border border-border">
      {/* Header with Settings */}
      <div className="flex items-center justify-between p-5 pb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Swap</h2>
          {/* Real-time price indicator */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={fetchPrices}
                  disabled={isLoadingPrices}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RefreshCw className={cn("w-3 h-3", isLoadingPrices && "animate-spin")} />
                  <span className="hidden sm:inline">
                    {lastPriceUpdate ? `${Math.floor((Date.now() - lastPriceUpdate.getTime()) / 1000)}s ago` : "Loading..."}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Prices update every 10 seconds. Click to refresh now.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Settings Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-2 rounded-lg hover:bg-secondary/50 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-card border-border backdrop-blur-xl" align="end">
            <div className="space-y-4">
              <h4 className="font-medium leading-none">Transaction Settings</h4>

              {/* Slippage Tolerance */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Slippage Tolerance</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3 h-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Your transaction will revert if the price changes unfavorably by more than this percentage.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="text-sm font-medium text-primary">{effectiveSlippage}%</span>
                </div>

                <div className="flex items-center gap-2">
                  {SLIPPAGE_OPTIONS.map((val) => (
                    <button
                      key={val}
                      onClick={() => {
                        setSlippage(val);
                        setCustomSlippage("");
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                        slippage === val && !customSlippage
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-secondary/50 border-transparent hover:bg-secondary text-muted-foreground"
                      )}
                    >
                      {val}%
                    </button>
                  ))}
                </div>

                {/* Custom slippage input */}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Custom"
                    value={customSlippage}
                    onChange={(e) => setCustomSlippage(e.target.value)}
                    className="flex-1 bg-secondary/50 border border-border rounded-lg py-1.5 px-3 text-sm outline-none focus:border-primary/50 transition-colors"
                    min="0.01"
                    max="50"
                    step="0.1"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>

                {/* Slippage warnings */}
                {parseFloat(effectiveSlippage) < 0.1 && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-500/10 text-yellow-500 text-xs">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Your transaction may fail due to low slippage tolerance</span>
                  </div>
                )}
                {parseFloat(effectiveSlippage) > 5 && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-500/10 text-orange-500 text-xs">
                    <AlertTriangle className="w-3 h-3" />
                    <span>High slippage tolerance may result in unfavorable rates</span>
                  </div>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="p-4 pt-2 space-y-2">
        {/* Pay Section */}
        <div className="bg-secondary/30 rounded-xl p-4 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">You Pay</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Wallet className="w-3 h-3" />
                <span>{payTokenData?.balance.toFixed(4) || "0"}</span>
              </div>
              {payTokenData?.balance > 0 && (
                <button
                  onClick={handleMaxClick}
                  className="text-xs text-primary hover:text-primary/80 font-medium"
                >
                  MAX
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <input
              type="number"
              value={payAmount}
              onChange={(e) => handlePayAmountChange(e.target.value)}
              placeholder="0"
              className="flex-1 bg-transparent text-3xl font-medium outline-none placeholder:text-muted-foreground/50 w-full min-w-0"
            />

            <button
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
              onClick={() => setIsPayTokenOpen(true)}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: payTokenData?.color || "#666" }}
              >
                {payToken.slice(0, 2)}
              </div>
              <span className="font-semibold">{payToken}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="mt-2 text-sm text-muted-foreground">
            ${payUsdValue.toFixed(2)}
          </div>
        </div>

        {/* Swap Direction Button */}
        <div className="flex justify-center -my-1 relative z-10">
          <button
            onClick={handleSwapDirection}
            className="p-2 rounded-xl bg-secondary border border-border hover:bg-secondary/80 transition-colors"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* Receive Section */}
        <div className="bg-secondary/30 rounded-xl p-4 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">You Receive</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Wallet className="w-3 h-3" />
              <span>{receiveTokenData?.balance.toFixed(4) || "0"}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <input
              type="number"
              value={receiveAmount}
              readOnly
              placeholder="0"
              className="flex-1 bg-transparent text-3xl font-medium outline-none placeholder:text-muted-foreground/50 w-full min-w-0"
            />

            <button
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
              onClick={() => setIsReceiveTokenOpen(true)}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: receiveTokenData?.color || "#666" }}
              >
                {receiveToken.slice(0, 2)}
              </div>
              <span className="font-semibold">{receiveToken}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="mt-2 text-sm text-muted-foreground">
            ${receiveUsdValue.toFixed(2)}
          </div>
        </div>

        {/* Price Impact Warning */}
        {priceImpact > 0 && (
          <div className={cn(
            "flex items-center justify-between p-3 rounded-xl border",
            isVeryHighPriceImpact
              ? "bg-red-500/10 border-red-500/30"
              : isHighPriceImpact
                ? "bg-orange-500/10 border-orange-500/30"
                : "bg-secondary/30 border-border/50"
          )}>
            <div className="flex items-center gap-2">
              {isHighPriceImpact && <AlertTriangle className={cn("w-4 h-4", getPriceImpactColor())} />}
              <span className="text-sm text-muted-foreground">Price Impact</span>
            </div>
            <span className={cn("text-sm font-medium", getPriceImpactColor())}>
              {priceImpact < 0.01 ? "<0.01" : priceImpact.toFixed(2)}%
            </span>
          </div>
        )}

        {/* Exchange Rate Display */}
        {payAmount && receiveAmount && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
            <span className="text-sm text-muted-foreground">Rate</span>
            <span className="text-sm">
              1 {payToken} = {(parseFloat(receiveAmount) / parseFloat(payAmount)).toFixed(6)} {receiveToken}
            </span>
          </div>
        )}

        {/* Slippage Display */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
          <span className="text-sm text-muted-foreground">Max Slippage</span>
          <span className="text-sm">{effectiveSlippage}%</span>
        </div>

        {/* Action Button */}
        {!isConnected ? (
          <button className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors mt-4">
            Connect Wallet
          </button>
        ) : (
          <button
            disabled={!isValidSwap || isSwapping}
            onClick={handleSwap}
            className={cn(
              "w-full py-4 rounded-xl font-semibold transition-colors mt-4",
              isValidSwap && !isSwapping
                ? isVeryHighPriceImpact
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {isSwapping
              ? "Swapping..."
              : isVeryHighPriceImpact
                ? "Swap Anyway (High Impact)"
                : isValidSwap
                  ? "Swap"
                  : "Enter Amount"
            }
          </button>
        )}
      </div>

      {/* Token Selector Modals */}
      <TokenSelectorModal
        open={isPayTokenOpen}
        onOpenChange={setIsPayTokenOpen}
        type="pay"
      />
      <TokenSelectorModal
        open={isReceiveTokenOpen}
        onOpenChange={setIsReceiveTokenOpen}
        type="receive"
      />
    </div>
  );
}
