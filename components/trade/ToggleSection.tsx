import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToggleSectionProps {
  label: string;
  isVisible: boolean;
  onToggle: () => void;
}

export function ToggleSection({ label, isVisible, onToggle }: ToggleSectionProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
        "border border-border/50 hover:border-primary/50",
        isVisible
          ? "bg-primary/20 text-primary border-primary/50"
          : "bg-card/50 text-muted-foreground hover:text-foreground hover:bg-card"
      )}
    >
      {isVisible ? (
        <>
          <EyeOff className="w-4 h-4" />
          Hide {label}
        </>
      ) : (
        <>
          <Eye className="w-4 h-4" />
          Show {label}
        </>
      )}
    </button>
  );
}
