import type { WalletAnalysisRequest, WalletAnalysisResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function analyzeWallet(
  request: WalletAnalysisRequest
): Promise<WalletAnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/wallet/analyze`, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

export const defaultAnalysisConfig: Partial<WalletAnalysisRequest> = {
  cache_ttl_minutes: 60,
  chains: ['ethereum', 'polygon', 'avalanche'],
  include_nfts: true,
  include_transactions: true,
  transaction_limit: 100,
  use_cache: true,
};
