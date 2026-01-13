import { useState, useEffect, useCallback } from 'react';
import { fetchKryllTokens } from '@/lib/api/kryll';
import type { KryllToken, TokenCategory } from '@/types/kryll';

interface UseKryllTokensOptions {
  limit?: number;
  page?: number;
  category?: TokenCategory;
  autoFetch?: boolean;
}

interface UseKryllTokensReturn {
  tokens: KryllToken[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useKryllTokens(options: UseKryllTokensOptions = {}): UseKryllTokensReturn {
  const {
    limit = 100,
    page = 1,
    category = 'all',
    autoFetch = true,
  } = options;

  const [tokens, setTokens] = useState<KryllToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTokens = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchKryllTokens(limit, page, category);
      
      if (response.status === 'OK' && response.data.items) {
        setTokens(response.data.items);
      } else {
        throw new Error('Failed to fetch tokens');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      console.error('Kryll API error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [limit, page, category]);

  useEffect(() => {
    if (autoFetch) {
      fetchTokens();
    }
  }, [autoFetch, fetchTokens]);

  return {
    tokens,
    isLoading,
    error,
    refetch: fetchTokens,
  };
}
