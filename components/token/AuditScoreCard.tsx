"use client";

import { cn } from "@/lib/utils";

interface AuditScoreCardProps {
    label: string;
    score: number;
    isActive?: boolean;
    onClick?: () => void;
}

export const AuditScoreCard = ({ label, score, isActive, onClick }: AuditScoreCardProps) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-4 py-2 rounded-lg border transition-all",
                isActive
                    ? "bg-primary/20 border-primary text-foreground"
                    : "bg-muted/30 border-border/50 text-muted-foreground hover:border-primary/50"
            )}
        >
            <span className="text-sm font-medium">{label} </span>
            <span className="text-sm font-semibold">{score}%</span>
        </button>
    );
};

