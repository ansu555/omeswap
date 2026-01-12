interface Metric {
    label: string;
    value: string;
    change?: number;
}

interface MetricsBarProps {
    metrics: Metric[];
}

export function MetricsBar({ metrics }: MetricsBarProps) {
    return (
        <div className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center overflow-x-auto py-2 px-4 space-x-6 text-sm whitespace-nowrap scrollbar-hide">
                {metrics.map((metric, i) => (
                    <div key={i} className="flex items-center space-x-2">
                        <span className="text-muted-foreground">{metric.label}:</span>
                        <span className="font-medium text-foreground">{metric.value}</span>
                        {metric.change !== undefined && (
                            <span className={metric.change >= 0 ? "text-green-500" : "text-red-500"}>
                                {metric.change >= 0 ? "+" : ""}{metric.change}%
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
