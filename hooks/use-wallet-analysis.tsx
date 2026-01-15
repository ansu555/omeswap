import { useState, useEffect, useCallback, useRef } from 'react';
import { useMantleWallet } from './use-mantle-wallet';
import { analyzeWallet, defaultAnalysisConfig } from '@/lib/api/wallet-analysis';
import type { WalletAnalysisData, WalletAnalysisRequest } from '@/types';

interface UseWalletAnalysisOptions {
  autoFetch?: boolean;
  chains?: string[];
  includeNfts?: boolean;
  includeTransactions?: boolean;
  transactionLimit?: number;
}

interface UseWalletAnalysisReturn {
  data: WalletAnalysisData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  cacheHit: boolean;
  analysisTimeMs: number;
}

export function useWalletAnalysis(
  options: UseWalletAnalysisOptions = {}
): UseWalletAnalysisReturn {
  const { address, isConnected } = useMantleWallet();
  const [data, setData] = useState<WalletAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [cacheHit, setCacheHit] = useState(false);
  const [analysisTimeMs, setAnalysisTimeMs] = useState(0);
  
  // Track if we've already fetched for this address to prevent duplicates
  const fetchedAddressRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);

  const {
    autoFetch = true,
    chains = defaultAnalysisConfig.chains,
    includeNfts = defaultAnalysisConfig.include_nfts,
    includeTransactions = defaultAnalysisConfig.include_transactions,
    transactionLimit = defaultAnalysisConfig.transaction_limit,
  } = options;

  const fetchAnalysis = useCallback(async (force = false) => {
    if (!address) {
      setError(new Error('Wallet not connected'));
      return;
    }

    // Prevent duplicate calls
    if (isFetchingRef.current) {
      console.log('Already fetching, skipping duplicate call');
      return;
    }

    // Skip if we already fetched this address (unless forced)
    if (!force && fetchedAddressRef.current === address) {
      console.log('Already fetched data for this address, skipping');
      return;
    }

    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const request: WalletAnalysisRequest = {
        address,
        ...defaultAnalysisConfig,
        chains,
        include_nfts: includeNfts,
        include_transactions: includeTransactions,
        transaction_limit: transactionLimit,
      };

      console.log('Fetching wallet analysis for:', address);
      const response = await analyzeWallet(request);

      if (response.success && response.data) {
        setData(response.data);
        setCacheHit(response.metadata.cache_hit);
        setAnalysisTimeMs(response.metadata.analysis_time_ms);
        fetchedAddressRef.current = address;
      } else {
        throw new Error(response.error || 'Failed to analyze wallet');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      console.error('Wallet analysis error:', error);

      // Fallback to demo data so UI is not blank
      setData({
        portfolio_summary: {
          total_value_usd: '0',
          total_tokens: 0,
          total_nfts: 0,
        },
        token_balances: [],
        nft_holdings: [],
        transactions: [],
      });

      setError(error);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [address, chains, includeNfts, includeTransactions, transactionLimit]);

  // Manual refetch that forces a new call
  const refetch = useCallback(async () => {
    await fetchAnalysis(true);
  }, [fetchAnalysis]);

  useEffect(() => {
    if (autoFetch && isConnected && address && address !== fetchedAddressRef.current) {
      fetchAnalysis(false);
    }
  }, [autoFetch, isConnected, address, fetchAnalysis]);

  return {
    data,
    isLoading,
    error,
    refetch,
    cacheHit,
    analysisTimeMs,
  };
}
