"use client";

import { useState } from "react";
import { ArrowUpDown, ChevronDown, Settings, Check, Wallet, Search } from "lucide-react";
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

type SwapMode = "swap" | "limit" | "buy" | "sell";

interface Token {
  symbol: string;
  name: string;
  color: "algo" | "usdc";
  balance: number;
  usdValue: number;
}

const TOKENS: Record<string, Token> = {
  ALGO: {
    symbol: "ALGO",
    name: "Algorand",
    color: "algo",
    balance: 19.3905,
    usdValue: 1.799483,
  },
  USDC: {
    symbol: "USDC",
    name: "USDC",
    color: "usdc",
    balance: 10.7756,
    usdValue: 0.999968,
  },
};

export function SwapCard() {
  const [mode, setMode] = useState<SwapMode>("swap");
  const [payToken, setPayToken] = useState("ALGO");
  const [receiveToken, setReceiveToken] = useState("USDC");
  const [payAmount, setPayAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");

  // Modal states
  const [isPayTokenOpen, setIsPayTokenOpen] = useState(false);
  const [isReceiveTokenOpen, setIsReceiveTokenOpen] = useState(false);

  const payTokenData = TOKENS[payToken];
  const receiveTokenData = TOKENS[receiveToken];

  const payUsdValue = payAmount ? parseFloat(payAmount) * payTokenData.usdValue : 0;
  const receiveUsdValue = receiveAmount ? parseFloat(receiveAmount) * receiveTokenData.usdValue : 0;

  const handleSwapDirection = () => {
    setPayToken(receiveToken);
    setReceiveToken(payToken);
    setPayAmount(receiveAmount);
    setReceiveAmount(payAmount);
  };

  const handlePayAmountChange = (value: string) => {
    setPayAmount(value);
    if (value) {
      const estimated = (parseFloat(value) * payTokenData.usdValue) / receiveTokenData.usdValue;
      setReceiveAmount(estimated.toFixed(6));
    } else {
      setReceiveAmount("");
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
  };

  const isValidSwap = payAmount && parseFloat(payAmount) > 0;

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
          {Object.values(TOKENS).map((token) => (
            <button
              key={token.symbol}
              onClick={() => handleTokenSelect(token.symbol, type)}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                  token.color === "algo" ? "bg-token-algo text-black" : "bg-token-usdc text-white"
                )}>
                  {token.symbol === "ALGO" ? "◆" : "$"}
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
    <div className="swap-card w-full max-w-md p-1">
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
            >
              {m}
              {m === "limit" && (
                <span className="ml-1 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                  V2
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 pl-2 shrink-0">
          <button className="autopilot-btn whitespace-nowrap hidden sm:block">Auto-Pilot</button>

          <Popover>
            <PopoverTrigger asChild>
              <button className="settings-btn mr-1">
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
                    {["0.1", "0.5", "1.0", "Auto"].map((val) => (
                      <button
                        key={val}
                        onClick={() => setSlippage(val === "Auto" ? "0.5" : val)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                          (val === "Auto" && slippage === "0.5") || slippage === val
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-secondary/50 border-transparent hover:bg-secondary text-muted-foreground"
                        )}
                      >
                        {val === "Auto" ? "Auto" : `${val}%`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="p-4 pt-2 space-y-2">
        {/* Pay Section */}
        <div className="token-input-section">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Pay</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Wallet className="w-3 h-3" />
              <span>{payTokenData.balance.toFixed(4)} {payToken}</span>
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
              className="token-selector"
              onClick={() => setIsPayTokenOpen(true)}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                payTokenData.color === "algo"
                  ? "bg-token-algo text-black"
                  : "bg-token-usdc text-white"
              )}>
                {payToken === "ALGO" ? "◆" : "$"}
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-semibold flex items-center gap-1">
                  {payToken}
                  <Check className="w-3 h-3 text-success" />
                </div>
                <div className="text-xs text-muted-foreground">{payTokenData.name}</div>
              </div>
              <div className="text-left sm:hidden font-semibold">
                {payToken}
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
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
            className="swap-direction-btn"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* Receive Section */}
        <div className="token-input-section">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Receive</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Wallet className="w-3 h-3" />
              <span>{receiveTokenData.balance.toFixed(4)} {receiveToken}</span>
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
              className="token-selector"
              onClick={() => setIsReceiveTokenOpen(true)}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                receiveTokenData.color === "algo"
                  ? "bg-token-algo text-black"
                  : "bg-token-usdc text-white"
              )}>
                {receiveToken === "ALGO" ? "◆" : "$"}
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-semibold flex items-center gap-1">
                  {receiveToken}
                  <Check className="w-3 h-3 text-success" />
                </div>
                <div className="text-xs text-muted-foreground">{receiveTokenData.name}</div>
              </div>
              <div className="text-left sm:hidden font-semibold">
                {receiveToken}
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          </div>

          <div className="mt-2 text-sm text-muted-foreground">
            ${receiveUsdValue.toFixed(2)}
          </div>
        </div>

        {/* Action Button */}
        <button
          disabled={!isValidSwap}
          className="swap-action-btn mt-4"
        >
          {isValidSwap ? "Swap" : "Enter Amount"}
        </button>
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
