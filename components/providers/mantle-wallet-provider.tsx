"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mantle, mantleTestnet } from "wagmi/chains";
import dynamic from "next/dynamic";
import "@rainbow-me/rainbowkit/styles.css";

// Basic wagmi config without WalletConnect (avoids SSR localStorage issue)
const wagmiConfig = createConfig({
  chains: [mantle, mantleTestnet],
  transports: {
    [mantle.id]: http(),
    [mantleTestnet.id]: http(),
  },
  ssr: true,
});

// Lazy-load RainbowKit wrapper to avoid WalletConnect SSR localStorage issue
const RainbowKitWrapper = dynamic(
  () => import("./rainbowkit-wrapper").then((mod) => mod.RainbowKitWrapper),
  { ssr: false },
);

interface MantleWalletProviderProps {
  children: ReactNode;
  initialState?: any;
}

export function MantleWalletProvider({
  children,
  initialState,
}: MantleWalletProviderProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitWrapper>{children}</RainbowKitWrapper>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
