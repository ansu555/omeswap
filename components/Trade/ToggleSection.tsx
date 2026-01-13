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
        "toggle-btn flex items-center gap-2",
        isVisible && "toggle-btn-active"
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
