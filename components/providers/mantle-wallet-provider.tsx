'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { mantle, mantleTestnet } from 'wagmi/chains';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

// Create a query client for React Query
const queryClient = new QueryClient();

// Configure wagmi with Mantle chains using RainbowKit's getDefaultConfig
const config = getDefaultConfig({
  appName: 'Mantle Dex',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [mantle, mantleTestnet],
  ssr: true,
});

interface MantleWalletProviderProps {
  children: ReactNode;
  initialState?: any;
}

export function MantleWalletProvider({ children, initialState }: MantleWalletProviderProps) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()} modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
