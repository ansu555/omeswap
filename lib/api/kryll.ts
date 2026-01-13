import type { KryllApiResponse, TokenCategory } from '@/types/kryll';

const KRYLL_API_BASE = 'https://dapi.kryll.io/xray';

const CATEGORY_MAPPING: Record<TokenCategory, string | null> = {
  all: null,
  ethereum: 'Ethereum Ecosystem',
  manta: 'Manta Network Ecosystem',
  mantle: 'Mantle Ecosystem',
};

export async function fetchKryllTokens(
  limit: number = 100,
  page: number = 1,
  category?: TokenCategory
): Promise<KryllApiResponse> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    page: page.toString(),
  });

  // Add category if specified and not 'all'
  if (category && category !== 'all') {
    const categoryName = CATEGORY_MAPPING[category];
    if (categoryName) {
      params.append('cat', categoryName);
    }
  }

  const url = `${KRYLL_API_BASE}/list?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      'accept': '*/*',
      'origin': 'https://app.kryll.io',
      'referer': 'https://app.kryll.io/',
    },
  });

  if (!response.ok) {
    throw new Error(`Kryll API request failed: ${response.statusText}`);
  }

  return response.json();
}

// Helper to get top gainers (24h)
export function getTopGainers(tokens: any[], limit: number = 10) {
  return [...tokens]
    .sort((a, b) => b.price_change_percentage_24h_in_currency - a.price_change_percentage_24h_in_currency)
    .slice(0, limit);
}

// Helper to get top losers (24h)
export function getTopLosers(tokens: any[], limit: number = 10) {
  return [...tokens]
    .sort((a, b) => a.price_change_percentage_24h_in_currency - b.price_change_percentage_24h_in_currency)
    .slice(0, limit);
}

// Helper to get by market cap
export function getByMarketCap(tokens: any[], limit: number = 10) {
  return [...tokens]
    .sort((a, b) => b.market_cap - a.market_cap)
    .slice(0, limit);
}

// Helper to get trending (by news + sentiment)
export function getTrending(tokens: any[], limit: number = 10) {
  return [...tokens]
    .sort((a, b) => {
      const scoreA = (a.news_last_7days || 0) * 0.5 + (a.sentiment || 0) * 0.5;
      const scoreB = (b.news_last_7days || 0) * 0.5 + (b.sentiment || 0) * 0.5;
      return scoreB - scoreA;
    })
    .slice(0, limit);
}
