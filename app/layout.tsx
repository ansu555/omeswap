import type { Metadata } from "next";
import { Header } from "./components/Header";
import BackgroundPaths from "./components/BackgroundPaths";
import { MantleWalletProvider } from "@/components/providers/mantle-wallet-provider";
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
    <html lang="en">
      <body>
        <MantleWalletProvider>
          <BackgroundPaths />
          <Header />
          {children}
        </MantleWalletProvider>
      </body>
    </html>
  );
}
