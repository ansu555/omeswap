import { cn } from "@/lib/utils";

interface TimeRangeSelectProps {
    value: string;
    onChange: (value: string) => void;
}

export function TimeRangeSelect({ value, onChange }: TimeRangeSelectProps) {
    const options = [
        { label: "1H", value: "1h" },
        { label: "1D", value: "24h" },
        { label: "1W", value: "7d" },
        { label: "1M", value: "30d" },
        { label: "1Y", value: "1y" },
    ];

    return (
        <div className="flex items-center bg-card border rounded-lg p-1">
            {options.map((option) => (
                <button
                    key={option.value}
                    onClick={() => onChange(option.value)}
                    className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                        value === option.value
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}
