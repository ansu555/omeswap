import { cn } from "@/lib/utils";

interface ExplorerTabsProps {
  activeTab: "tokens" | "pools" | "transactions";
  onTabChange: (tab: "tokens" | "pools" | "transactions") => void;
}

export const ExplorerTabs = ({ activeTab, onTabChange }: ExplorerTabsProps) => {
  const tabs = [
    { id: "tokens" as const, label: "Tokens" },
    { id: "pools" as const, label: "Pools" },
    { id: "transactions" as const, label: "Transactions" },
  ];

  return (
    <div className="flex items-center gap-6 border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "relative pb-3 text-base font-medium transition-colors",
            activeTab === tab.id
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
};
