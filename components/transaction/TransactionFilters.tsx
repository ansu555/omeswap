import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { TransactionType, SortOrder } from "@/app/Transaction/page";

interface TransactionFiltersProps {
  typeFilter: TransactionType | "ALL";
  setTypeFilter: (value: TransactionType | "ALL") => void;
  sortOrder: SortOrder;
  setSortOrder: (value: SortOrder) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  resultCount: number;
}

export const TransactionFilters = ({
  typeFilter,
  setTypeFilter,
  sortOrder,
  setSortOrder,
  searchQuery,
  setSearchQuery,
  resultCount,
}: TransactionFiltersProps) => {
  const typeOptions: { value: TransactionType | "ALL"; label: string }[] = [
    { value: "ALL", label: "All Types" },
    { value: "SWAP", label: "Swaps" },
    { value: "ADD_LIQUIDITY", label: "Add Liquidity" },
    { value: "REMOVE_LIQUIDITY", label: "Remove Liquidity" },
    { value: "POOL_CREATION", label: "Pool Creation" },
  ];

  const sortOptions: { value: SortOrder; label: string }[] = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "amount-high", label: "Amount: High → Low" },
    { value: "amount-low", label: "Amount: Low → High" },
  ];

  return (
    <div className="mb-6 space-y-4 animate-fade-in" style={{ animationDelay: "100ms" }}>
      {/* Search and Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tokens or pools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/30 border-border/50 focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Type Filter */}
        <Select
          value={typeFilter}
          onValueChange={(value) => setTypeFilter(value as TransactionType | "ALL")}
        >
          <SelectTrigger className="w-full sm:w-[180px] bg-muted/30 border-border/50">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Order */}
        <Select
          value={sortOrder}
          onValueChange={(value) => setSortOrder(value as SortOrder)}
        >
          <SelectTrigger className="w-full sm:w-[180px] bg-muted/30 border-border/50">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-muted/50 text-muted-foreground">
          {resultCount} transaction{resultCount !== 1 ? "s" : ""}
        </Badge>
        {typeFilter !== "ALL" && (
          <Badge
            variant="outline"
            className="border-primary/30 text-primary cursor-pointer hover:bg-primary/10 transition-colors"
            onClick={() => setTypeFilter("ALL")}
          >
            {typeFilter.replace("_", " ")} ✕
          </Badge>
        )}
      </div>
    </div>
  );
};
