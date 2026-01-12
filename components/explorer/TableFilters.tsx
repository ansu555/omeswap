import { cn } from "@/lib/utils";

interface FilterOption {
    id: string;
    label: string;
}

interface TableFiltersProps {
    activeFilter: string;
    onFilterChange: (id: string) => void;
    filters: FilterOption[];
}

export function TableFilters({ activeFilter, onFilterChange, filters }: TableFiltersProps) {
    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map((filter) => (
                <button
                    key={filter.id}
                    onClick={() => onFilterChange(filter.id)}
                    className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border",
                        activeFilter === filter.id
                            ? "bg-primary/10 border-primary/20 text-primary"
                            : "bg-background border-border hover:bg-muted text-muted-foreground"
                    )}
                >
                    {filter.label}
                </button>
            ))}
        </div>
    );
}
