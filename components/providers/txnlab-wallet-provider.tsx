'use client';

import { createContext, useContext } from 'react';

interface WalletContextType {
  activeAccount: string | null;
}

const WalletContext = createContext<WalletContextType>({ activeAccount: null });

export function TxnLabWalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WalletContext.Provider value={{ activeAccount: null }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletConnection() {
  return useContext(WalletContext);
}
