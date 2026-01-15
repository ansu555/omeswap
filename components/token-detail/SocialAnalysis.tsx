"use client";

import { ThumbsUp, ThumbsDown } from "lucide-react";

interface SocialPlatform {
  name: string;
  icon: string;
  status: string;
  url: string;
  posts?: string;
  postsChange?: string;
  users?: string;
  usersChange?: string;
  usersLabel?: string;
  activeUsers?: string;
  subscribers?: string;
}

interface SocialAnalysisProps {
  sentiment?: number;
  platforms?: SocialPlatform[];
}

const defaultPlatforms: SocialPlatform[] = [
  {
    name: "twitter",
    icon: "𝕏",
    status: "GOOD",
    url: "x.com/bitcoin",
    posts: "29,807",
    postsChange: "+5",
    users: "8,262,800",
    usersChange: "+2,894",
  },
  {
    name: "coingecko",
    icon: "🦎",
    status: "GOOD",
    url: "coingecko.com/coins/bitcoin",
    users: "2,312,442",
    usersChange: "+794",
    usersLabel: "Users watching this token",
  },
  {
    name: "reddit",
    icon: "👽",
    status: "GOOD",
    url: "reddit.com/r/bitcoin",
    activeUsers: "0",
    subscribers: "8,036,005",
  },
];

export function SocialAnalysis({
  sentiment = 85,
  platforms = defaultPlatforms,
}: SocialAnalysisProps) {
  return (
    <div className="space-y-4">
      <div className="dashboard-card-header">
        <h2 className="dashboard-card-title">Social</h2>
        <button className="badge-status badge-neutral flex items-center gap-2">
          Tell me more
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="dashboard-card">
          <h3 className="text-sm text-muted-foreground text-center mb-3">Community sentiment</h3>
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Bad feeling</span>
            <span>Good feeling</span>
          </div>
          <div className="relative h-1.5 rounded-full overflow-hidden">
            <div className="absolute inset-0 gradient-bar" />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-foreground rounded-full border-2 border-background shadow-lg"
              style={{ left: `calc(${sentiment}% - 8px)` }}
            />
          </div>
        </div>

        <div className="dashboard-card flex flex-col items-center justify-center">
          <h3 className="text-sm text-muted-foreground mb-3">Share your opinion</h3>
          <div className="flex gap-4">
            <button className="p-3 rounded-full bg-secondary hover:bg-success/20 transition-colors">
              <ThumbsUp className="w-5 h-5 text-muted-foreground hover:text-success" />
            </button>
            <button className="p-3 rounded-full bg-secondary hover:bg-destructive/20 transition-colors">
              <ThumbsDown className="w-5 h-5 text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {platforms.map((platform) => (
          <div
            key={platform.name}
            className="dashboard-card flex flex-col md:flex-row items-start md:items-center justify-between py-4 gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xl">
                {platform.icon}
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Activity indicator for {platform.name}</div>
                <div className="text-success font-semibold">{platform.status}</div>
                <div className="text-xs text-muted-foreground">{platform.url}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-8">
              {/* Activity bars */}
              <div className="flex items-end gap-0.5">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-3 bg-primary/30 rounded-t-sm"
                    style={{ height: `${Math.random() * 24 + 8}px` }}
                  />
                ))}
              </div>

              <div className="flex gap-8 text-right">
                {platform.posts && (
                  <div>
                    <div className="text-xs text-muted-foreground">Posts</div>
                    <div className="font-mono text-foreground">
                      {platform.posts} <span className="text-success text-xs">{platform.postsChange}</span>
                    </div>
                  </div>
                )}
                {platform.users && (
                  <div>
                    <div className="text-xs text-muted-foreground">{platform.usersLabel || "Users"}</div>
                    <div className="font-mono text-foreground">
                      {platform.users} <span className="text-success text-xs">{platform.usersChange}</span>
                    </div>
                  </div>
                )}
                {platform.activeUsers !== undefined && (
                  <div>
                    <div className="text-xs text-muted-foreground">Active Users</div>
                    <div className="font-mono text-foreground">{platform.activeUsers}</div>
                  </div>
                )}
                {platform.subscribers && (
                  <div>
                    <div className="text-xs text-muted-foreground">Subscribers</div>
                    <div className="font-mono text-foreground">{platform.subscribers}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
