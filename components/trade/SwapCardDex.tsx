"use client";

import { useState } from "react";
import { ArrowUpDown, ChevronDown, Settings, Check, Wallet, Search, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDexSwap } from "@/hooks/use-dex-swap";
import { useMantleWallet } from "@/hooks/use-mantle-wallet";
import { TOKENS, TOKEN_LIST } from "@/contracts/config";
import MantleWalletConnect from "@/components/features/mantle/mantle-wallet-connect";
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
import { mantleTestnet } from "@/lib/chains/mantle";

type SwapMode = "swap" | "limit" | "buy" | "sell";

export function SwapCardDex() {
  const { isConnected, chain } = useMantleWallet();
  const {
    tokenIn,
    setTokenIn,
    tokenOut,
    setTokenOut,
    amountIn,
    setAmountIn,
    slippage,
    setSlippage,
    estimatedOutput,
    balance,
    hasLiquidity,
    poolExists,
    needsApproval,
    approveAndSwap,
    isLoading,
    isSuccess,
    hash,
    error,
  } = useDexSwap();

  const [mode, setMode] = useState<SwapMode>("swap");
  const [isPayTokenOpen, setIsPayTokenOpen] = useState(false);
  const [isReceiveTokenOpen, setIsReceiveTokenOpen] = useState(false);

  const payTokenData = TOKENS[tokenIn];
  const receiveTokenData = TOKENS[tokenOut];

  const handleSwapDirection = () => {
    const temp = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(temp);
  };

  const handleTokenSelect = (symbol: string, type: "pay" | "receive") => {
    if (type === "pay") {
      if (symbol === tokenOut) {
        setTokenOut(tokenIn);
      }
      setTokenIn(symbol);
      setIsPayTokenOpen(false);
    } else {
      if (symbol === tokenIn) {
        setTokenIn(tokenOut);
      }
      setTokenOut(symbol);
      setIsReceiveTokenOpen(false);
    }
  };

  const hasValidAmount = amountIn && parseFloat(amountIn) > 0;
  const hasSufficientBalance = parseFloat(balance) >= parseFloat(amountIn || '0');
  const isValidSwap =
    hasValidAmount &&
    hasSufficientBalance &&
    hasLiquidity &&
    poolExists &&
    parseFloat(estimatedOutput) > 0;
  const isWrongNetwork = isConnected && chain?.id !== mantleTestnet.id;

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
        <div className="grid gap-2 max-h-96 overflow-y-auto">
          {TOKEN_LIST.map((token) => (
            <button
              key={token.symbol}
              onClick={() => handleTokenSelect(token.symbol, type)}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                  {token.symbol.substring(1, 2)}
                </div>
                <div className="text-left">
                  <div className="font-semibold">{token.symbol}</div>
                  <div className="text-xs text-muted-foreground group-hover:text-muted-foreground/80">
                    {token.name}
                  </div>
                </div>
              </div>
              {(type === "pay" ? tokenIn : tokenOut) === token.symbol && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );

  if (!isConnected) {
    return (
      <div className="swap-card w-full max-w-md p-8 text-center">
        <h3 className="text-xl font-semibold mb-4">Connect Your Wallet</h3>
        <p className="text-muted-foreground mb-6">
          Connect your wallet to start swapping tokens on Mantle DEX
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
          Please switch to Mantle Sepolia Testnet to use this DEX
        </p>
        <div className="text-sm text-muted-foreground">
          Current: {chain?.name} (ID: {chain?.id})<br />
          Required: Mantle Sepolia Testnet (ID: {mantleTestnet.id})
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

        <div className="flex items-center gap-2 pl-2 shrink-0">
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
      </div>

      <div className="p-4 pt-2 space-y-2">
        {/* Pay Section */}
        <div className="token-input-section">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Pay</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Wallet className="w-3 h-3" />
              <span>{parseFloat(balance).toFixed(4)} {payTokenData.symbol}</span>
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

            <button
              className="token-selector"
              onClick={() => setIsPayTokenOpen(true)}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                {payTokenData.symbol.substring(1, 2)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-semibold">{payTokenData.symbol}</div>
                <div className="text-xs text-muted-foreground">{payTokenData.name}</div>
              </div>
              <div className="text-left sm:hidden font-semibold">
                {payTokenData.symbol}
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
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
            <span className="text-sm text-muted-foreground">Receive (estimated)</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <input
              type="number"
              value={estimatedOutput}
              readOnly
              placeholder="0"
              className="flex-1 bg-transparent text-3xl font-medium outline-none placeholder:text-muted-foreground/50 w-full min-w-0"
            />

            <button
              className="token-selector"
              onClick={() => setIsReceiveTokenOpen(true)}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                {receiveTokenData.symbol.substring(1, 2)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-semibold">{receiveTokenData.symbol}</div>
                <div className="text-xs text-muted-foreground">{receiveTokenData.name}</div>
              </div>
              <div className="text-left sm:hidden font-semibold">
                {receiveTokenData.symbol}
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          </div>

          {estimatedOutput !== '0' && (
            <div className="mt-2 text-sm text-muted-foreground">
              Price Impact: ~0.3% fee
            </div>
          )}
        </div>

        {/* Action Button - Combined Approve & Swap */}
        <button
          onClick={(e) => {
            e.preventDefault();
            console.log('Button clicked', { isValidSwap, isLoading, hasLiquidity, poolExists, estimatedOutput });
            if (isValidSwap && !isLoading) {
              approveAndSwap();
            }
          }}
          disabled={!isValidSwap || isLoading}
          className="swap-action-btn mt-4"
        >
          {isLoading 
            ? (needsApproval ? "Approving..." : "Swapping...") 
            : isValidSwap 
              ? (needsApproval ? `Approve & Swap ${payTokenData.symbol}` : "Swap")
              : !hasLiquidity || !poolExists 
                ? "No Liquidity" 
                : parseFloat(estimatedOutput) === 0 
                  ? "Enter Amount" 
                  : "Enter Amount"
          }
        </button>
        

        {/* Success Message */}
        {isSuccess && hash && (
          <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm text-success font-medium">✅ Transaction Successful!</span>
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

        {/* Error Message */}
        {error && (
          <div className="mt-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <div className="font-medium mb-1">Transaction Error</div>
            <div className="text-xs">{error}</div>
          </div>
        )}

        {/* Info Messages */}
        {parseFloat(balance) < parseFloat(amountIn || '0') && amountIn && (
          <div className="mt-2 text-sm text-destructive">
            Insufficient balance
          </div>
        )}
        {amountIn && parseFloat(amountIn) > 0 && !poolExists && (
          <div className="mt-2 text-sm text-warning">
            Pool does not exist. Create pool first or select different tokens.
          </div>
        )}
        {amountIn && parseFloat(amountIn) > 0 && poolExists && !hasLiquidity && (
          <div className="mt-2 text-sm text-warning">
            Pool exists but has no liquidity. Add liquidity first.
          </div>
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

