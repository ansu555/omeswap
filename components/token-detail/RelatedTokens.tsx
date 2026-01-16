"use client";

import Link from "next/link";

interface RelatedToken {
  id: string;
  name: string;
  ticker: string;
  price: number;
  change: number;
  score: number;
  color: string;
}

interface RelatedTokensProps {
  tokens?: RelatedToken[];
  title?: string;
}

const defaultTokens: RelatedToken[] = [
  { id: "bitcoin-cash", name: "Bitcoin Cash", ticker: "BCH", price: 609.29, change: -2.38, score: 7.2, color: "#8DC351" },
  { id: "monero", name: "Monero", ticker: "XMR", price: 651.68, change: 13.44, score: 8.0, color: "#FF6600" },
  { id: "zcash", name: "Zcash", ticker: "ZEC", price: 405.66, change: 1.4, score: 7.3, color: "#F4B728" },
  { id: "litecoin", name: "Litecoin", ticker: "LTC", price: 76.53, change: 0.88, score: 8.1, color: "#BFBBBB" },
  { id: "ethereum-classic", name: "Ethereum Classic", ticker: "ETC", price: 12.65, change: 3.59, score: 8.1, color: "#3AB83A" },
  { id: "kaspa", name: "Kaspa", ticker: "KAS", price: 0.048, change: 3.29, score: 6.7, color: "#49EACB" },
  { id: "beldex", name: "Beldex", ticker: "BDX", price: 0.091, change: 2.46, score: 8.0, color: "#00DC82" },
  { id: "decred", name: "Decred", ticker: "DCR", price: 19.63, change: 20.17, score: 7.0, color: "#2ED6A1" },
  { id: "ecash", name: "eCash", ticker: "XEC", price: 0.04117, change: 2.84, score: 6.9, color: "#0074C2" },
];

export function RelatedTokens({ tokens = defaultTokens, title = "You may also like" }: RelatedTokensProps) {
  return (
    <div className="space-y-4">
      <h2 className="dashboard-card-title">{title}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tokens.map((token) => (
          <Link
            href={`/token/${token.id}`}
            key={token.ticker}
            className="dashboard-card flex items-center gap-3 py-4 hover:bg-secondary/50 transition-colors cursor-pointer"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: token.color + "20", color: token.color }}
            >
              {token.ticker.slice(0, 1)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground truncate">{token.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-muted-foreground">{token.score}</span>
                <div className="w-8 h-1 rounded-full bg-primary" />
              </div>
            </div>

            <div className="text-right">
              <div className="font-mono text-foreground">
                ${token.price < 1 ? token.price.toFixed(token.price < 0.01 ? 4 : 3) : token.price.toFixed(2)}
              </div>
              <div className={token.change >= 0 ? "metric-change-positive" : "metric-change-negative"}>
                {token.change >= 0 ? "+" : ""}{token.change.toFixed(2)}%
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
