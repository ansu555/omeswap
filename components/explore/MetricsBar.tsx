import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricItem {
  label: string;
  value: string;
  change?: number;
}

interface MetricsBarProps {
  metrics: MetricItem[];
}

export const MetricsBar = ({ metrics }: MetricsBarProps) => {
  return (
    <div className="w-full border-b border-border bg-card/50">
      <div className="flex items-center justify-between gap-8 px-6 py-4 overflow-x-auto scrollbar-hide">
        {metrics.map((metric, index) => (
          <div key={metric.label} className="flex items-center gap-6 min-w-fit">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {metric.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-foreground whitespace-nowrap">
                  {metric.value}
                </span>
                {metric.change !== undefined && (
                  <span
                    className={`flex items-center gap-0.5 text-xs font-medium ${
                      metric.change >= 0 ? "text-success" : "text-destructive"
                    }`}
                  >
                    {metric.change >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {metric.change >= 0 ? "+" : ""}
                    {metric.change.toFixed(2)}%
                  </span>
                )}
              </div>
            </div>
            {index < metrics.length - 1 && (
              <div className="h-8 w-px bg-border hidden md:block" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
