"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import Image from "next/image";

interface TokenHeaderProps {
  name: string;
  ticker: string;
  chain: string;
  price: number;
  priceChange24h: number;
  overallScore: number;
  imageUrl?: string;
}

export function TokenHeader({
  name,
  ticker,
  chain,
  price,
  priceChange24h,
  overallScore,
  imageUrl,
}: TokenHeaderProps) {
  const isPositive = priceChange24h >= 0;

  return (
    <div className="flex items-center justify-between gap-6 flex-wrap">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-3xl font-bold shadow-lg overflow-hidden">
          {imageUrl ? (
            <Image src={imageUrl} alt={name} width={64} height={64} className="w-full h-full object-cover" />
          ) : (
            <span className="text-primary">{ticker.slice(0, 1)}</span>
          )}
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">{name}</h1>
            <span className="text-xl font-mono text-primary">${ticker}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="token-badge">{chain}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="metric-value">
            ${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: price < 1 ? 6 : 2 })}
          </div>
          <div className={`flex items-center justify-end gap-1 ${isPositive ? "metric-change-positive" : "metric-change-negative"}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {isPositive ? "+" : ""}{priceChange24h.toFixed(2)}%
          </div>
        </div>

        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center glow-primary">
            <span className="text-3xl font-bold font-mono text-primary">{overallScore.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
