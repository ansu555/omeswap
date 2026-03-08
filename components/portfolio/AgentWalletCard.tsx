import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap, RefreshCw, Copy, Check } from "lucide-react";
import { useState } from "react";

interface AgentWalletCardProps {
  walletName: string;
  balanceUsd: number;
  walletAddress?: string;
  onRecharge: () => void;
  onRefresh: () => void;
}

export function AgentWalletCard({
  balanceUsd,
  walletAddress,
  onRecharge,
  onRefresh,
}: AgentWalletCardProps) {
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCopy = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass-card rounded-2xl p-6 h-full"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-primary/20">
          <Zap className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-primary font-medium">Agent Wallet</h3>
        <span className="ml-auto px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
          testnet
        </span>
      </div>

      <div className="glass-card rounded-xl p-4 mb-4">
        <p className="text-muted-foreground text-sm mb-1">Balance</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-foreground">
            {balanceUsd.toFixed(4)}
          </span>
          <span className="text-muted-foreground">AVAX</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Min: 0.100</span>
          <span>Avail: {balanceUsd.toFixed(3)}</span>
        </div>
      </div>

      {walletAddress && (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleCopy}
          className="w-full glass-card rounded-xl p-3 mb-4 flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="font-mono">{truncateAddress(walletAddress)}</span>
          {copied ? (
            <Check className="w-4 h-4 text-success" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </motion.button>
      )}

      <div className="flex gap-3">
        <Button
          onClick={onRecharge}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
        >
          <span className="mr-2">+</span> Recharge
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          className="border-border hover:bg-muted"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </Button>
      </div>
    </motion.div>
  );
}
