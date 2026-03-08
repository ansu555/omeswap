import { useQuery } from '@tanstack/react-query';
import { useAvalancheWallet } from './use-avalanche-wallet';
import { analyzeWallet, defaultAnalysisConfig } from '@/lib/api/wallet-analysis';
import type { WalletAnalysisRequest } from '@/types';

interface UseWalletAnalysisOptions {
  chains?: string[];
  includeNfts?: boolean;
  includeTransactions?: boolean;
  transactionLimit?: number;
  enabled?: boolean;
}

/**
 * Hook to fetch wallet analysis using React Query.
 * This version automatically handles:
 * - Request deduplication
 * - Caching
 * - Background refetching
 * - Loading and error states
 */
export function useWalletAnalysisQuery(options: UseWalletAnalysisOptions = {}) {
  const { address, isConnected } = useAvalancheWallet();

  const {
    chains = defaultAnalysisConfig.chains,
    includeNfts = defaultAnalysisConfig.include_nfts,
    includeTransactions = defaultAnalysisConfig.include_transactions,
    transactionLimit = defaultAnalysisConfig.transaction_limit,
    enabled = true,
  } = options;

  const query = useQuery({
    queryKey: ['wallet-analysis', address, chains, includeNfts, includeTransactions],
    queryFn: async () => {
      if (!address) {
        throw new Error('Wallet not connected');
      }

      console.log('Fetching wallet analysis for:', address);

      const request: WalletAnalysisRequest = {
        address,
        ...defaultAnalysisConfig,
        chains,
        include_nfts: includeNfts,
        include_transactions: includeTransactions,
        transaction_limit: transactionLimit,
      };

      const response = await analyzeWallet(request);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to analyze wallet');
      }
    },
    enabled: enabled && isConnected && !!address,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (formerly cacheTime)
    retry: 2,
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });

  return {
    data: query.data || null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    cacheHit: query.dataUpdatedAt > 0 && !query.isFetching,
    analysisTimeMs: 0, // React Query doesn't track this, but we could add it to the response
  };
}
