"use client";

import { useState } from "react";
import { Coins, ChevronDown, Check, Loader2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMantleWallet } from "@/hooks/use-mantle-wallet";

interface MintableToken {
  symbol: string;
  name: string;
  color: string;
  decimals: number;
  maxMint: number;
  description: string;
}

const MINTABLE_TOKENS: MintableToken[] = [
  {
    symbol: "tUSDC",
    name: "Test USDC",
    color: "#2775CA",
    decimals: 6,
    maxMint: 10000,
    description: "Test USDC stablecoin for development",
  },
  {
    symbol: "tUSDT",
    name: "Test USDT",
    color: "#26A17B",
    decimals: 6,
    maxMint: 10000,
    description: "Test USDT stablecoin for development",
  },
];

interface MintTransaction {
  id: string;
  token: string;
  amount: number;
  txHash: string;
  timestamp: Date;
  status: "pending" | "confirmed" | "failed";
}

export function MintTokensCard() {
  const { address, isConnected, chain } = useMantleWallet();

  const [selectedToken, setSelectedToken] = useState<MintableToken>(MINTABLE_TOKENS[0]);
  const [amount, setAmount] = useState("");
  const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintHistory, setMintHistory] = useState<MintTransaction[]>([]);

  const handleMint = async () => {
    if (!isConnected || !amount || parseFloat(amount) <= 0) return;

    setIsMinting(true);

    const txId = `mint-${Date.now()}`;
    const newTx: MintTransaction = {
      id: txId,
      token: selectedToken.symbol,
      amount: parseFloat(amount),
      txHash: "",
      timestamp: new Date(),
      status: "pending",
    };

    setMintHistory(prev => [newTx, ...prev]);

    try {
      // Simulate minting transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate success
      const fakeTxHash = `0x${Math.random().toString(16).slice(2, 66)}`;

      setMintHistory(prev =>
        prev.map(tx =>
          tx.id === txId
            ? { ...tx, status: "confirmed" as const, txHash: fakeTxHash }
            : tx
        )
      );

      console.log("Minted:", {
        token: selectedToken.symbol,
        amount: amount,
      });

      setAmount("");
    } catch (error) {
      console.error("Mint failed:", error);
      setMintHistory(prev =>
        prev.map(tx =>
          tx.id === txId
            ? { ...tx, status: "failed" as const }
            : tx
        )
      );
    } finally {
      setIsMinting(false);
    }
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const isValidMint = amount && parseFloat(amount) > 0 && parseFloat(amount) <= selectedToken.maxMint && isConnected;

  const explorerUrl = chain?.blockExplorers?.default?.url || "https://explorer.sepolia.mantle.xyz";

  return (
    <div className="w-full max-w-md p-1 bg-card/80 backdrop-blur-xl rounded-2xl border border-border">
      {/* Header */}
      <div className="flex items-center gap-3 p-5 pb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
          <Coins className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Mint Test Tokens</h2>
          <p className="text-xs text-muted-foreground">Get tokens for testing on testnet</p>
        </div>
      </div>

      <div className="p-4 pt-2 space-y-4">
        {/* Token Selector */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Select Token</label>
          <button
            onClick={() => setIsTokenSelectorOpen(true)}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ backgroundColor: selectedToken.color }}
              >
                {selectedToken.symbol.slice(0, 2)}
              </div>
              <div className="text-left">
                <div className="font-semibold">{selectedToken.symbol}</div>
                <div className="text-xs text-muted-foreground">{selectedToken.name}</div>
              </div>
            </div>
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-muted-foreground">Amount to Mint</label>
            <span className="text-xs text-muted-foreground">Max: {selectedToken.maxMint.toLocaleString()}</span>
          </div>

          <div className="bg-secondary/30 rounded-xl p-4 border border-border/50">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              max={selectedToken.maxMint}
              className="w-full bg-transparent text-3xl font-medium outline-none placeholder:text-muted-foreground/50"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-muted-foreground">
                {selectedToken.symbol}
              </span>
              {parseFloat(amount) > selectedToken.maxMint && (
                <span className="text-xs text-red-500">Exceeds max mint amount</span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="flex items-center gap-2">
          {[100, 500, 1000, 5000].map((value) => (
            <button
              key={value}
              onClick={() => handleQuickAmount(value)}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-medium border transition-colors",
                amount === value.toString()
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-secondary/50 border-transparent hover:bg-secondary text-muted-foreground"
              )}
            >
              {value >= 1000 ? `${value / 1000}K` : value}
            </button>
          ))}
        </div>

        {/* Info Box */}
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <p className="text-xs text-blue-400">
            These are testnet tokens with no real value. Use them to test DEX features on Mantle Sepolia testnet.
          </p>
        </div>

        {/* Action Button */}
        {!isConnected ? (
          <button className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
            Connect Wallet
          </button>
        ) : (
          <button
            disabled={!isValidMint || isMinting}
            onClick={handleMint}
            className={cn(
              "w-full py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2",
              isValidMint && !isMinting
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {isMinting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Minting...
              </>
            ) : isValidMint ? (
              `Mint ${amount} ${selectedToken.symbol}`
            ) : (
              "Enter Amount"
            )}
          </button>
        )}

        {/* Recent Mints */}
        {mintHistory.length > 0 && (
          <div className="space-y-2 pt-2">
            <h3 className="text-sm font-medium text-muted-foreground">Recent Mints</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {mintHistory.slice(0, 5).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        tx.status === "confirmed"
                          ? "bg-green-500"
                          : tx.status === "pending"
                            ? "bg-yellow-500 animate-pulse"
                            : "bg-red-500"
                      )}
                    />
                    <span className="text-sm">
                      {tx.amount.toLocaleString()} {tx.token}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground capitalize">
                      {tx.status}
                    </span>
                    {tx.txHash && (
                      <a
                        href={`${explorerUrl}/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Token Selector Modal */}
      <Dialog open={isTokenSelectorOpen} onOpenChange={setIsTokenSelectorOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Select Token to Mint</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            {MINTABLE_TOKENS.map((token) => (
              <button
                key={token.symbol}
                onClick={() => {
                  setSelectedToken(token);
                  setIsTokenSelectorOpen(false);
                }}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-secondary/50 transition-colors group"
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
                      {token.description}
                    </div>
                  </div>
                </div>
                {selectedToken.symbol === token.symbol && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
