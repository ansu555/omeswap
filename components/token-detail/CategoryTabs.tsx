"use client";

import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  categories: {
    id: string;
    label: string;
    score: number;
  }[];
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

export function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="flex items-stretch glass-card rounded-3xl overflow-hidden">
      {categories.map((category) => {
        const isActive = category.id === activeCategory;
        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              "flex-1 px-6 py-3 text-sm font-medium transition-all duration-300 relative",
              isActive
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            <span>{category.label}</span>
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}
