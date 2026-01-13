// Kryll API Types
export interface KryllToken {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h_in_currency: number;
  price_change_percentage_30d_in_currency: number;
  market_cap: number;
  audit_score: number;
  news_last_7days: number;
  sentiment: number;
}

export interface KryllApiResponse {
  status: string;
  code: number;
  data: {
    items: KryllToken[];
    total?: number;
    page?: number;
  };
}

export type TokenCategory = 'all' | 'ethereum' | 'manta' | 'mantle';
