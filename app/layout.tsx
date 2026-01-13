import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { BackgroundPaths } from "@/components/layout/background-paths";
import { MantleWalletProvider } from "@/components/providers/mantle-wallet-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mantle Dex",
  description: "Mantle Dex Application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <MantleWalletProvider>
            <BackgroundPaths />
            <Header />
            {children}
          </MantleWalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
