"use client";

import { useState } from "react";
import { Coins, ExternalLink, RefreshCw } from "lucide-react";
import { useTokenMint } from "@/hooks/use-token-mint";
import { useMantleWallet } from "@/hooks/use-mantle-wallet";
import { TOKENS, TOKEN_LIST } from "@/contracts/config";
import MantleWalletConnect from "@/components/features/mantle/mantle-wallet-connect";
import { mantleTestnet } from "@/lib/chains/mantle";

export function MintTokensCard() {
  const { isConnected, chain } = useMantleWallet();
  const [minting, setMinting] = useState<{ [key: string]: boolean }>({});
  const [lastMinted, setLastMinted] = useState<{ [key: string]: string }>({});

  const TokenMintRow = ({ tokenSymbol }: { tokenSymbol: string }) => {
    const { balance, mint, isLoading, isSuccess, hash, refetchBalance } = useTokenMint(tokenSymbol);
    const token = TOKENS[tokenSymbol];

    const handleMint = async (amount: string) => {
      setMinting({ ...minting, [tokenSymbol]: true });
      await mint(amount);
      await refetchBalance();
      setLastMinted({ ...lastMinted, [tokenSymbol]: hash || '' });
      setMinting({ ...minting, [tokenSymbol]: false });
    };

    return (
      <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 hover:bg-secondary/30 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            {token.symbol.substring(1, 2)}
          </div>
          <div>
            <div className="font-semibold">{token.symbol}</div>
            <div className="text-xs text-muted-foreground">
              Balance: {parseFloat(balance).toFixed(2)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isSuccess && lastMinted[tokenSymbol] && (
            <a
              href={`${mantleTestnet.blockExplorers.default.url}/tx/${lastMinted[tokenSymbol]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-success hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <button
            onClick={() => handleMint('1000')}
            disabled={isLoading || minting[tokenSymbol]}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading || minting[tokenSymbol] ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              "Mint 1,000"
            )}
          </button>
          <button
            onClick={() => handleMint('10000')}
            disabled={isLoading || minting[tokenSymbol]}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading || minting[tokenSymbol] ? "..." : "10K"}
          </button>
        </div>
      </div>
    );
  };

  if (!isConnected) {
    return (
      <div className="swap-card w-full max-w-2xl p-8 text-center">
        <Coins className="w-12 h-12 mx-auto mb-4 text-primary" />
        <h3 className="text-xl font-semibold mb-4">Mint Test Tokens</h3>
        <p className="text-muted-foreground mb-6">
          Connect your wallet to mint test tokens for the DEX
        </p>
        <MantleWalletConnect variant="default" />
      </div>
    );
  }

  if (chain?.id !== mantleTestnet.id) {
    return (
      <div className="swap-card w-full max-w-2xl p-8 text-center">
        <h3 className="text-xl font-semibold mb-4 text-destructive">Wrong Network</h3>
        <p className="text-muted-foreground">
          Please switch to Mantle Sepolia Testnet
        </p>
      </div>
    );
  }

  return (
    <div className="swap-card w-full p-1">
      <div className="p-5">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Coins className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Mint Test Tokens</h3>
            <p className="text-sm text-muted-foreground">
              Get free test tokens to try out the DEX
            </p>
          </div>
        </div>

        <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div className="flex gap-2">
            <div className="text-blue-500 text-2xl">ℹ️</div>
            <div className="text-sm text-blue-500">
              <strong>Test Tokens Only:</strong> These tokens have no real value and are only for testing purposes on Mantle Sepolia Testnet. You can mint as many as you need!
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {TOKEN_LIST.map((token) => (
            <TokenMintRow key={token.symbol} tokenSymbol={token.symbol} />
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/30 rounded-xl">
          <h4 className="font-semibold mb-2 text-sm">Quick Start Guide:</h4>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Mint some test tokens (at least 2 different types)</li>
            <li>Go to "Add Liquidity" to create or join a pool</li>
            <li>Use the "Swap" tab to trade tokens</li>
            <li>Check your positions and earned fees</li>
          </ol>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              // Mint all tokens sequentially
              TOKEN_LIST.forEach((token, index) => {
                setTimeout(() => {
                  const { mint } = useTokenMint(token.symbol);
                  mint('1000');
                }, index * 1000);
              });
            }}
            className="flex-1 py-3 px-4 rounded-xl font-medium bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90 transition-opacity"
          >
            🚀 Mint All Tokens (1K each)
          </button>
        </div>
      </div>
    </div>
  );
}

