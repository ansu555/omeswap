import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ExplorerTabsProps {
    activeTab: "tokens" | "pools" | "transactions";
    onTabChange: (value: "tokens" | "pools" | "transactions") => void;
}

export function ExplorerTabs({ activeTab, onTabChange }: ExplorerTabsProps) {
    return (
        <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as any)} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-3 sm:w-[400px]">
                <TabsTrigger value="tokens">Tokens</TabsTrigger>
                <TabsTrigger value="pools">Pools</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>
        </Tabs>
    );
}
