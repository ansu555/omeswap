import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio | Mantle Dex",
  description: "Portfolio overview for Mantle Dex users.",
};

export default function PortfolioPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12 text-center">
      <div className="max-w-3xl space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">Portfolio</h1>
        <p className="text-muted-foreground">This page is ready for your portfolio content.</p>
      </div>
    </main>
  );
}
