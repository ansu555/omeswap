"use client";

interface StatsCardProps {
  tvl?: string;
  marketCap?: string;
  fdv?: string;
  volume1d?: string;
}

export function StatsCard({
  tvl = "$0",
  marketCap = "$0",
  fdv = "$0",
  volume1d = "$0",
}: StatsCardProps) {
  const stats = [
    { label: "TVL", value: tvl },
    { label: "Market cap", value: marketCap },
    { label: "FDV", value: fdv },
    { label: "1 day volume", value: volume1d },
  ];

  return (
    <div className="dashboard-card">
      <h2 className="dashboard-card-title mb-6">Stats</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">{stat.label}</span>
            <span className="text-2xl md:text-3xl font-semibold tracking-tight">
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
