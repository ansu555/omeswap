"use client";

import { Gauge } from "@/components/ui/gauge";

interface ScoreCardProps {
  label: string;
  score: number;
}

// Score-based color thresholds
const scoreColors = {
  emerald: { primary: "#10b981", secondary: "#10b98133" },    // 95-100
  forest: { primary: "#22c55e", secondary: "#22c55e33" },     // 85-94
  chartreuse: { primary: "#84cc16", secondary: "#84cc1633" }, // 75-84
  yellow: { primary: "#eab308", secondary: "#eab30833" },     // 65-74
  orange: { primary: "#f97316", secondary: "#f9731633" },     // 50-64
  red: { primary: "#ef4444", secondary: "#ef444433" },        // 0-49
};

function getScoreColor(score: number) {
  if (score >= 95) return { colors: scoreColors.forest, text: "text-green-500" };
  if (score >= 85) return { colors: scoreColors.emerald, text: "text-emerald-500" };
  if (score >= 75) return { colors: scoreColors.chartreuse, text: "text-lime-500" };
  if (score >= 65) return { colors: scoreColors.yellow, text: "text-yellow-500" };
  if (score >= 50) return { colors: scoreColors.orange, text: "text-orange-500" };
  return { colors: scoreColors.red, text: "text-red-500" };
}

export function ScoreCard({ label, score }: ScoreCardProps) {
  const { colors, text } = getScoreColor(score);

  return (
    <div className="dashboard-card flex flex-col items-center justify-center py-6">
      <span className="text-sm text-muted-foreground mb-3">{label}</span>
      <div className="relative">
        <Gauge
          size="large"
          value={score}
          colors={colors}
          showValue={false}
        />
        <div
          className={`absolute inset-0 flex items-center justify-center text-2xl font-bold font-mono ${text}`}
        >
          {score}
        </div>
      </div>
    </div>
  );
}
