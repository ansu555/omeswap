import { cn } from "@/lib/utils";

interface TableFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  filters: { id: string; label: string }[];
}

export const TableFilters = ({
  activeFilter,
  onFilterChange,
  filters,
}: TableFiltersProps) => {
  return (
    <div className="flex items-center gap-4">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={cn(
            "text-sm font-medium transition-colors",
            activeFilter === filter.id
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};
