"use client";

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { avalanche } from '@/lib/chains/avalanche';
import '@rainbow-me/rainbowkit/styles.css';

// Create a query client for React Query
const queryClient = new QueryClient();

// Configure wagmi with Avalanche chains using RainbowKit's getDefaultConfig
const config = getDefaultConfig({
  appName: 'Omeswap',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [avalanche],
  ssr: true,
});

interface MantleWalletProviderProps {
  children: ReactNode;
  initialState?: any;
}

export function AvalancheWalletProvider({ children, initialState }: AvalancheWalletProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitWrapper>{children}</RainbowKitWrapper>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
