"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, ChevronDown, Settings, AlertTriangle, RefreshCw, Info, Percent } from "lucide-react";
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

export function AddLiquidityCard() {
  const { address, isConnected } = useMantleWallet();

  // Token states
  const [tokens, setTokens] = useState<Record<string, Token>>(DEFAULT_TOKENS);
  const [token0, setToken0] = useState("tUSDC");
  const [token1, setToken1] = useState("tUSDT");
  const [amount0, setAmount0] = useState("");
  const [amount1, setAmount1] = useState("");

  // Settings states
  const [slippage, setSlippage] = useState("0.5");
  const [customSlippage, setCustomSlippage] = useState("");

  // Modal states
  const [isToken0Open, setIsToken0Open] = useState(false);
  const [isToken1Open, setIsToken1Open] = useState(false);

  // Real-time price states
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<Date | null>(null);

  // Price impact state
  const [priceImpact, setPriceImpact] = useState<number>(0);

  // Transaction states
  const [isAdding, setIsAdding] = useState(false);

  // Pool states
  const [poolShare, setPoolShare] = useState<number>(0);
  const [estimatedLPTokens, setEstimatedLPTokens] = useState<string>("0");

  const token0Data = tokens[token0];
  const token1Data = tokens[token1];

  const effectiveSlippage = customSlippage || slippage;

  // Fetch real-time prices
  const fetchPrices = useCallback(async () => {
    setIsLoadingPrices(true);
    try {
      const newTokens = { ...tokens };
      Object.keys(newTokens).forEach((symbol) => {
        const basePrice = DEFAULT_TOKENS[symbol]?.price || 1;
        const fluctuation = (Math.random() - 0.5) * 0.01;
        newTokens[symbol] = {
          ...newTokens[symbol],
          price: basePrice * (1 + fluctuation),
        };
      });
      setTokens(newTokens);
      setLastPriceUpdate(new Date());
    } catch (error) {
      console.error("Failed to fetch prices:", error);
    } finally {
      setIsLoadingPrices(false);
    }
  }, [tokens]);

  // Real-time price polling
  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
  }, []);

  // Calculate price impact and pool share
  const calculateMetrics = useCallback((a0: string, a1: string) => {
    if (!a0 || !a1 || parseFloat(a0) <= 0 || parseFloat(a1) <= 0) {
      setPriceImpact(0);
      setPoolShare(0);
      setEstimatedLPTokens("0");
      return;
    }

    const amount0Val = parseFloat(a0);
    const amount1Val = parseFloat(a1);

    // Simulate pool metrics
    const totalPoolValue = 100000; // Simulated total pool value
    const addedValue = amount0Val * (token0Data?.price || 1) + amount1Val * (token1Data?.price || 1);

    const share = (addedValue / (totalPoolValue + addedValue)) * 100;
    setPoolShare(share);

    // Simulate LP tokens
    const lpTokens = Math.sqrt(amount0Val * amount1Val);
    setEstimatedLPTokens(lpTokens.toFixed(6));

    // Calculate price impact
    const impact = (addedValue / totalPoolValue) * 100 * 0.1; // Simplified impact calculation
    setPriceImpact(impact);
  }, [token0Data, token1Data]);

  const handleAmount0Change = (value: string) => {
    setAmount0(value);
    if (value && parseFloat(value) > 0) {
      // For stable pairs, amounts should be roughly equal
      const price0 = token0Data?.price || 1;
      const price1 = token1Data?.price || 1;
      const equivalent = (parseFloat(value) * price0) / price1;
      setAmount1(equivalent.toFixed(6));
      calculateMetrics(value, equivalent.toFixed(6));
    } else {
      setAmount1("");
      calculateMetrics("", "");
    }
  };

  const handleAmount1Change = (value: string) => {
    setAmount1(value);
    if (value && parseFloat(value) > 0) {
      const price0 = token0Data?.price || 1;
      const price1 = token1Data?.price || 1;
      const equivalent = (parseFloat(value) * price1) / price0;
      setAmount0(equivalent.toFixed(6));
      calculateMetrics(equivalent.toFixed(6), value);
    } else {
      setAmount0("");
      calculateMetrics("", "");
    }
  };

  const handleTokenSelect = (token: string, type: "token0" | "token1") => {
    if (type === "token0") {
      if (token === token1) {
        setToken1(token0);
      }
      setToken0(token);
      setIsToken0Open(false);
    } else {
      if (token === token0) {
        setToken0(token1);
      }
      setToken1(token);
      setIsToken1Open(false);
    }
    // Reset amounts when tokens change
    setAmount0("");
    setAmount1("");
  };

  const handleAddLiquidity = async () => {
    if (!isConnected) return;

    setIsAdding(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log("Liquidity added:", {
        token0,
        amount0,
        token1,
        amount1,
        slippage: effectiveSlippage,
      });

      setAmount0("");
      setAmount1("");
      setPriceImpact(0);
      setPoolShare(0);
    } catch (error) {
      console.error("Add liquidity failed:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const isValidAdd = amount0 && amount1 && parseFloat(amount0) > 0 && parseFloat(amount1) > 0 && isConnected;
  const isHighPriceImpact = priceImpact > 1;

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
    type: "token0" | "token1";
  }) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>Select a token</DialogTitle>
        </DialogHeader>
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
                  <div className="text-xs text-muted-foreground">
                    {token.name}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{token.balance.toFixed(4)}</div>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="w-full max-w-md p-1 bg-card/80 backdrop-blur-xl rounded-2xl border border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-5 pb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Add Liquidity</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={fetchPrices}
                  disabled={isLoadingPrices}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RefreshCw className={cn("w-3 h-3", isLoadingPrices && "animate-spin")} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh prices</p>
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

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Custom"
                    value={customSlippage}
                    onChange={(e) => setCustomSlippage(e.target.value)}
                    className="flex-1 bg-secondary/50 border border-border rounded-lg py-1.5 px-3 text-sm outline-none focus:border-primary/50 transition-colors"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>

                {parseFloat(effectiveSlippage) > 5 && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-500/10 text-orange-500 text-xs">
                    <AlertTriangle className="w-3 h-3" />
                    <span>High slippage may result in unfavorable rates</span>
                  </div>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="p-4 pt-2 space-y-2">
        {/* Token 0 Input */}
        <div className="bg-secondary/30 rounded-xl p-4 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Token 1</span>
            <span className="text-xs text-muted-foreground">
              Balance: {token0Data?.balance.toFixed(4) || "0"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <input
              type="number"
              value={amount0}
              onChange={(e) => handleAmount0Change(e.target.value)}
              placeholder="0"
              className="flex-1 bg-transparent text-2xl font-medium outline-none placeholder:text-muted-foreground/50 w-full min-w-0"
            />

            <button
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
              onClick={() => setIsToken0Open(true)}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: token0Data?.color || "#666" }}
              >
                {token0.slice(0, 2)}
              </div>
              <span className="font-semibold">{token0}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Plus Icon */}
        <div className="flex justify-center -my-1 relative z-10">
          <div className="p-2 rounded-xl bg-secondary border border-border">
            <Plus className="w-4 h-4" />
          </div>
        </div>

        {/* Token 1 Input */}
        <div className="bg-secondary/30 rounded-xl p-4 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Token 2</span>
            <span className="text-xs text-muted-foreground">
              Balance: {token1Data?.balance.toFixed(4) || "0"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <input
              type="number"
              value={amount1}
              onChange={(e) => handleAmount1Change(e.target.value)}
              placeholder="0"
              className="flex-1 bg-transparent text-2xl font-medium outline-none placeholder:text-muted-foreground/50 w-full min-w-0"
            />

            <button
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
              onClick={() => setIsToken1Open(true)}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: token1Data?.color || "#666" }}
              >
                {token1.slice(0, 2)}
              </div>
              <span className="font-semibold">{token1}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Pool Info */}
        {(amount0 || amount1) && (
          <div className="space-y-2 mt-4">
            {/* Price Impact */}
            <div className={cn(
              "flex items-center justify-between p-3 rounded-xl border",
              isHighPriceImpact ? "bg-orange-500/10 border-orange-500/30" : "bg-secondary/30 border-border/50"
            )}>
              <div className="flex items-center gap-2">
                {isHighPriceImpact && <AlertTriangle className={cn("w-4 h-4", getPriceImpactColor())} />}
                <span className="text-sm text-muted-foreground">Price Impact</span>
              </div>
              <span className={cn("text-sm font-medium", getPriceImpactColor())}>
                {priceImpact < 0.01 ? "<0.01" : priceImpact.toFixed(2)}%
              </span>
            </div>

            {/* Pool Share */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Share of Pool</span>
              </div>
              <span className="text-sm font-medium">
                {poolShare < 0.01 ? "<0.01" : poolShare.toFixed(2)}%
              </span>
            </div>

            {/* Estimated LP Tokens */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
              <span className="text-sm text-muted-foreground">LP Tokens Received</span>
              <span className="text-sm font-medium">{estimatedLPTokens}</span>
            </div>

            {/* Slippage */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
              <span className="text-sm text-muted-foreground">Max Slippage</span>
              <span className="text-sm">{effectiveSlippage}%</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        {!isConnected ? (
          <button className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors mt-4">
            Connect Wallet
          </button>
        ) : (
          <button
            disabled={!isValidAdd || isAdding}
            onClick={handleAddLiquidity}
            className={cn(
              "w-full py-4 rounded-xl font-semibold transition-colors mt-4",
              isValidAdd && !isAdding
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {isAdding
              ? "Adding Liquidity..."
              : isValidAdd
                ? "Add Liquidity"
                : "Enter Amounts"
            }
          </button>
        )}
      </div>

      {/* Token Selector Modals */}
      <TokenSelectorModal
        open={isToken0Open}
        onOpenChange={setIsToken0Open}
        type="token0"
      />
      <TokenSelectorModal
        open={isToken1Open}
        onOpenChange={setIsToken1Open}
        type="token1"
      />
    </div>
  );
}
