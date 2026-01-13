import { useState, useCallback } from 'react';
import { analyzeWallet, defaultAnalysisConfig } from '@/lib/api/wallet-analysis';
import type { WalletAnalysisData, WalletAnalysisRequest } from '@/types';

interface UseCustomAddressAnalysisReturn {
  data: WalletAnalysisData | null;
  isLoading: boolean;
  error: Error | null;
  analyzeAddress: (address: string, chains: string[]) => Promise<void>;
  currentAddress: string | null;
  cacheHit: boolean;
  analysisTimeMs: number;
}

/**
 * Hook for analyzing custom wallet addresses (not connected wallet)
 * Allows users to manually input and analyze any Ethereum address
 */
export function useCustomAddressAnalysis(): UseCustomAddressAnalysisReturn {
  const [data, setData] = useState<WalletAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);
  const [cacheHit, setCacheHit] = useState(false);
  const [analysisTimeMs, setAnalysisTimeMs] = useState(0);

  const analyzeAddress = useCallback(async (address: string, chains: string[]) => {
    setIsLoading(true);
    setError(null);
    setCurrentAddress(address);

    try {
      console.log('Analyzing custom address:', address, 'on chains:', chains);

      const request: WalletAnalysisRequest = {
        address,
        ...defaultAnalysisConfig,
        chains,
        include_nfts: true,
        include_transactions: true,
        transaction_limit: 100,
      };

      const response = await analyzeWallet(request);

      if (response.success && response.data) {
        setData(response.data);
        setCacheHit(response.metadata.cache_hit);
        setAnalysisTimeMs(response.metadata.analysis_time_ms);
        console.log('Analysis complete:', response.data.portfolio_summary);
      } else {
        throw new Error(response.error || 'Failed to analyze wallet');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      console.error('Wallet analysis error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    data,
    isLoading,
    error,
    analyzeAddress,
    currentAddress,
    cacheHit,
    analysisTimeMs,
  };
}
