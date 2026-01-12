'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';
import { mantle, mantleTestnet } from '@/lib/chains/mantle';

// Create a query client for React Query
const queryClient = new QueryClient();

// Configure wagmi with Mantle chains
const config = createConfig({
  chains: [mantle, mantleTestnet],
  connectors: [
    injected(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
    }),
  ],
  transports: {
    [mantle.id]: http(),
    [mantleTestnet.id]: http(),
  },
  ssr: true,
});

interface MantleWalletProviderProps {
  children: ReactNode;
}

export function MantleWalletProvider({ children }: MantleWalletProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
