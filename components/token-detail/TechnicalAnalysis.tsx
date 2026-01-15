"use client";

import { Info, TrendingUp } from "lucide-react";

function IndicatorSlider({
  leftLabel,
  rightLabel,
  value,
  showIcon = false,
}: {
  leftLabel: string;
  rightLabel: string;
  value: number;
  showIcon?: boolean;
}) {
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-muted-foreground mb-2">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div className="relative h-1.5 rounded-full overflow-hidden">
        <div className="absolute inset-0 gradient-bar" />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-foreground rounded-full border-2 border-background shadow-lg flex items-center justify-center"
          style={{ left: `calc(${value}% - 8px)` }}
        >
          {showIcon && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
              <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                <path d="M0 5L8 0L16 5L8 10L0 5Z" fill="hsl(var(--foreground))" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AnalysisCard({
  title,
  value,
  valueColor,
  icon,
  children,
}: {
  title: string;
  value: string;
  valueColor: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="dashboard-card flex flex-col items-center justify-center py-6">
      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
        {title}
        <Info className="w-3.5 h-3.5" />
      </div>
      <div className={`text-xl font-semibold ${valueColor}`}>{value}</div>
      {icon && <div className="mt-2">{icon}</div>}
      {children && <div className="w-full mt-4 px-4">{children}</div>}
    </div>
  );
}

interface TechnicalAnalysisProps {
  direction?: number;
  trend?: "Bullish" | "Bearish" | "Neutral";
  opportunity?: "Buy" | "Sell" | "Neutral";
  marketState?: string;
}

export function TechnicalAnalysis({
  direction = 65,
  trend = "Bullish",
  opportunity = "Neutral",
  marketState = "In transition",
}: TechnicalAnalysisProps) {
  const trendColor = trend === "Bullish" ? "text-success" : trend === "Bearish" ? "text-destructive" : "text-foreground";

  return (
    <div className="space-y-4">
      <div className="dashboard-card-header">
        <h2 className="dashboard-card-title">Technical Analysis</h2>
        <button className="badge-status badge-neutral flex items-center gap-2">
          Tell me more
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="dashboard-card">
        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-4">
          General Direction
          <Info className="w-3.5 h-3.5" />
        </div>
        <IndicatorSlider
          leftLabel="Bearish"
          rightLabel="Bullish"
          value={direction}
          showIcon
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AnalysisCard
          title="Current Trend"
          value={trend}
          valueColor={trendColor}
          icon={
            <div className={trendColor}>
              <TrendingUp className="w-8 h-8" />
            </div>
          }
        />

        <AnalysisCard
          title="Potential Opportunity"
          value={opportunity}
          valueColor="text-foreground"
        >
          <IndicatorSlider leftLabel="Buy" rightLabel="Sell" value={50} />
        </AnalysisCard>

        <AnalysisCard
          title="Market State"
          value={marketState}
          valueColor="text-primary"
        >
          <div className="w-full">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Transition</span>
              <span>Trend</span>
              <span>Upcoming Move</span>
            </div>
            <div className="relative h-1.5 rounded-full overflow-hidden">
              <div className="absolute inset-0 gradient-bar" />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-foreground rounded-full border-2 border-background shadow-lg"
                style={{ left: "calc(60% - 8px)" }}
              />
            </div>
          </div>
        </AnalysisCard>
      </div>
    </div>
  );
}
