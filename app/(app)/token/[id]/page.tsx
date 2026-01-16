"use client";

import { useParams } from "next/navigation";

export default function TokenDetailPage() {
    const { id } = useParams();

    return (
        <div className="min-h-screen">
            <div className="pt-32 max-w-[1200px] mx-auto px-4 md:px-6">
                <div className="glass-card p-12 rounded-3xl border bg-card/50 backdrop-blur-xl relative overflow-hidden group">
                    {/* Animated background element */}
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-500" />

                    <div className="relative z-10 space-y-8">
                        <div className="space-y-2">
                            <h2 className="text-sm font-medium uppercase tracking-widest text-primary/80">Token Details</h2>
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground bg-clip-text text-transparent">
                                Token ID: <span className="text-primary">{id}</span>
                            </h1>
                        </div>

                        <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                            This page is a placeholder for the detailed information of the token with ID <span className="text-foreground font-mono">{id}</span>.
                            The full details including charts, historical data, and market analysis will be integrated here.
                        </p>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <div className="px-6 py-3 rounded-full bg-muted/50 border border-border/50 text-sm font-medium backdrop-blur-sm">
                                Status: <span className="text-success">Active</span>
                            </div>
                            <div className="px-6 py-3 rounded-full bg-muted/50 border border-border/50 text-sm font-medium backdrop-blur-sm">
                                Protocol: <span className="text-primary">Mantle</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
