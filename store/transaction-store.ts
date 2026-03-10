"use client";

import { create } from "zustand";
import { useEffect } from "react";

const STORAGE_KEY = "omeswap-transactions";

export type TransactionType =
  | "SWAP"
  | "ADD_LIQUIDITY"
  | "REMOVE_LIQUIDITY"
  | "MINT"
  | "APPROVAL";

export type TransactionSource =
  | "dex-swap"
  | "dex-aggregator"
  | "liquidity"
  | "token-mint"
  | "agent-builder";

export interface StoredTransaction {
  id: string;
  type: TransactionType;
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
  txHash: string;
  walletAddress: string;
  timestamp: number; // ms since epoch
  source: TransactionSource;
  dex?: string;
  explorerUrl: string;
}

interface TransactionStore {
  transactions: StoredTransaction[];
  _hydrated: boolean;
  addTransaction: (tx: Omit<StoredTransaction, "id" | "explorerUrl">) => void;
  clearTransactions: () => void;
  _hydrate: () => void;
}

function persist(txs: StoredTransaction[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(txs));
  } catch {
    /* SSR or storage full */
  }
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  transactions: [],
  _hydrated: false,

  _hydrate: () => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const txs = JSON.parse(stored) as StoredTransaction[];
        set({ transactions: txs, _hydrated: true });
      } else {
        set({ _hydrated: true });
      }
    } catch {
      set({ _hydrated: true });
    }
  },

  addTransaction: (tx) =>
    set((state) => {
      if (state.transactions.some((t) => t.txHash === tx.txHash)) return state;

      const newTx: StoredTransaction = {
        ...tx,
        id: crypto.randomUUID(),
        explorerUrl: `https://snowtrace.io/tx/${tx.txHash}`,
      };
      const updated = [newTx, ...state.transactions];
      persist(updated);
      return { transactions: updated };
    }),

  clearTransactions: () => {
    persist([]);
    return set({ transactions: [] });
  },
}));

/** Hook to hydrate the store from localStorage on mount. Call once near the app root or on the transactions page. */
export function useHydrateTransactionStore() {
  const hydrate = useTransactionStore((s) => s._hydrate);
  const hydrated = useTransactionStore((s) => s._hydrated);
  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrate, hydrated]);
}
