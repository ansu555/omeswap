"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface SimilarToken {
    id: string;
    name: string;
    symbol: string;
    imageUrl: string;
    price: number;
    priceChange24h: number;
    auditScore: number;
}

interface SimilarTokensProps {
    tokens: SimilarToken[];
    onTokenClick?: (tokenId: string) => void;
}

export const SimilarTokens = ({ tokens, onTokenClick }: SimilarTokensProps) => {
    const formatPrice = (price: number) => {
        if (price >= 1000) {
            return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        if (price >= 1) {
            return `$${price.toFixed(2)}`;
        }
        return `$${price.toFixed(4)}`;
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold">You may also like</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tokens.map((token) => (
                    <button
                        key={token.id}
                        onClick={() => onTokenClick?.(token.id)}
                        className="glass-card rounded-lg p-4 border bg-card/50 hover:bg-card/70 transition-all text-left group"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="relative w-10 h-10 rounded-full bg-muted overflow-hidden">
                                {token.imageUrl ? (
                                    <Image
                                        src={token.imageUrl}
                                        alt={token.name}
                                        width={40}
                                        height={40}
                                        className="rounded-full"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                                        {token.symbol.slice(0, 2)}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate group-hover:text-primary transition-colors">
                                    {token.name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {token.symbol}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold mb-1">{formatPrice(token.price)}</p>
                                <p className={cn(
                                    "text-xs",
                                    token.priceChange24h >= 0 ? "text-green-500" : "text-red-500"
                                )}>
                                    {token.priceChange24h >= 0 ? "+" : ""}{token.priceChange24h.toFixed(2)}%
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold">{token.auditScore.toFixed(1)}</p>
                                <p className="text-xs text-muted-foreground">Score</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

