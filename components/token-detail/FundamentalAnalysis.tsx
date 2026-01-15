"use client";

import { CheckCircle } from "lucide-react";

interface NewsItem {
  time: string;
  title: string;
  score: number;
  sentiment: "bullish" | "bearish";
}

interface FundamentalAnalysisProps {
  description?: string;
  relatedNews?: NewsItem[];
  country?: string;
  website?: string;
  whitepaper?: boolean;
  maturityMonths?: number;
}

const defaultRelatedNews: NewsItem[] = [
  { time: "6:00 pm", title: "Iran Revolutionary Guard moved ne...", score: 8.5, sentiment: "bearish" },
  { time: "4:32 pm", title: "Binance Launches Regulated Gold ...", score: 7.5, sentiment: "bullish" },
  { time: "11:19 am", title: "Stablecoin Transactions Soared 72...", score: 7.5, sentiment: "bullish" },
  { time: "6:20 pm", title: "Stablecoin payments company Rain...", score: 7.5, sentiment: "bullish" },
  { time: "10:04 pm", title: "A7A5 becomes fastest-growing stab...", score: 7.5, sentiment: "bullish" },
];

export function FundamentalAnalysis({
  description = "Bitcoin is the world's first decentralized cryptocurrency, created in 2009 by the pseudonymous Satoshi Nakamoto. It enables peer-to-peer electronic cash transactions without intermediaries like banks or governments, operating on a blockchain secured by Proof of Work mining and the SHA-256 cryptographic algorithm. With a fixed supply cap of 21 million coins and programmatic halvings every four years that reduce miner rewards, Bitcoin is designed as a deflationary digital asset often called \"digital gold.\"",
  relatedNews = defaultRelatedNews,
  country = "Unknown",
  website = "bitcoin.org",
  whitepaper = true,
  maturityMonths = 183,
}: FundamentalAnalysisProps) {
  return (
    <div className="space-y-4">
      <div className="dashboard-card-header">
        <h2 className="dashboard-card-title">Fundamental</h2>
        <button className="badge-status badge-neutral flex items-center gap-2">
          Tell me more
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="dashboard-card">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Related news</h3>
            <div className="space-y-3">
              {relatedNews.map((news, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-14 flex-shrink-0">{news.time}</span>
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </div>
                  <span className="text-sm text-foreground flex-1 truncate">{news.title}</span>
                  <span className={`text-sm font-medium ${news.score >= 8 ? "text-success" : "text-primary"}`}>
                    {news.score.toFixed(1)}
                  </span>
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden flex-shrink-0">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(news.score / 10) * 100}%` }}
                    />
                  </div>
                  <div className="flex-shrink-0">
                    {news.sentiment === "bullish" ? (
                      <svg className="w-5 h-5 text-success" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z"/>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-destructive" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z"/>
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="dashboard-card">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Project</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="token-badge text-xs">Country</span>
                <span className="text-sm text-foreground">{country}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="token-badge text-xs">Website</span>
                <span className="text-sm text-foreground flex items-center gap-1">
                  {website}
                  <CheckCircle className="w-4 h-4 text-success" />
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="token-badge text-xs">Whitepaper</span>
                <span className="text-sm text-foreground flex items-center gap-1">
                  {whitepaper ? "Yes" : "No"}
                  {whitepaper && <CheckCircle className="w-4 h-4 text-success" />}
                </span>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Maturity: {maturityMonths} months</h3>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Project</span>
              <span>Median</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill bg-primary" style={{ width: `${Math.min(95, (maturityMonths / 200) * 100)}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
