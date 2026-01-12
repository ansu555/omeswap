import { useState } from "react";
import { ArrowUpDown, ChevronDown, Settings, Check, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const isValidSwap = payAmount && parseFloat(payAmount) > 0;

  return (
    <div className="swap-card w-full max-w-md p-1">
      {/* Mode Selector */}
      <div className="flex items-center justify-between p-4 pb-2 gap-2">
        <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1">
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

        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="autopilot-btn whitespace-nowrap">Auto-Pilot</button>
          <button className="settings-btn">
            <Settings className="w-4 h-4" />
          </button>
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
              className="flex-1 bg-transparent text-3xl font-medium outline-none placeholder:text-muted-foreground/50"
            />

            <button className="token-selector">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                payTokenData.color === "algo" 
                  ? "bg-token-algo text-black" 
                  : "bg-token-usdc text-white"
              )}>
                {payToken === "ALGO" ? "◆" : "$"}
              </div>
              <div className="text-left">
                <div className="font-semibold flex items-center gap-1">
                  {payToken}
                  <Check className="w-3 h-3 text-success" />
                </div>
                <div className="text-xs text-muted-foreground">{payTokenData.name}</div>
              </div>
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
              className="flex-1 bg-transparent text-3xl font-medium outline-none placeholder:text-muted-foreground/50"
            />

            <button className="token-selector">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                receiveTokenData.color === "algo" 
                  ? "bg-token-algo text-black" 
                  : "bg-token-usdc text-white"
              )}>
                {receiveToken === "ALGO" ? "◆" : "$"}
              </div>
              <div className="text-left">
                <div className="font-semibold flex items-center gap-1">
                  {receiveToken}
                  <Check className="w-3 h-3 text-success" />
                </div>
                <div className="text-xs text-muted-foreground">{receiveTokenData.name}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
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
    </div>
  );
}
