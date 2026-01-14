// Global type definitions for Mantle Dex

export interface Token {
  id: string;
  symbol: string;
  name?: string;
  price: number;
  change24h: number;
  imageUrl?: string;
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
}

export interface NavItem {
  label: string;
  href?: string;
  dropdown?: { label: string; href: string }[];
}

// Wallet Analysis API Types
export interface TokenBalance {
  chain: string;
  token_address: string | null;
  token_name: string;
  token_symbol: string;
  token_decimals: number;
  balance_raw: string;
  balance_formatted: string;
  token_standard: string;
  logo_url: string | null;
  price_usd: string | null;
  value_usd: string | null;
  price_change_24h: string | null;
  market_cap: string | null;
  volume_24h: string | null;
}

export interface NFTHolding {
  chain: string;
  token_address: string;
  token_id: string;
  name: string | null;
  description: string | null;
  image_url: string | null;
  collection_name: string | null;
  token_standard: string;
  floor_price_usd: string | null;
  last_sale_price_usd: string | null;
}

export interface Transaction {
  chain: string;
  tx_hash: string;
  block_number: number;
  timestamp: string;
  from_address: string;
  to_address: string;
  value: string;
  gas_used: number;
  gas_price: string;
  tx_fee: string;
  status: boolean;
  token_transfers: any[];
  nft_transfers: any[];
  method_name: string | null;
  tx_type: string | null;
  is_error: boolean;
}

export interface TopAsset {
  asset_type: string;
  chain: string;
  symbol: string;
  name: string;
  balance: string;
  value_usd: string;
  allocation_percentage: string;
  price_usd: string;
  price_change_24h: string;
}

export interface PortfolioSummaryData {
  wallet_address: string;
  total_value_usd: string;
  total_tokens: number;
  total_nfts: number;
  chains_active: string[];
  value_by_chain: Record<string, string>;
  top_assets: TopAsset[];
  unique_tokens: number;
  unique_nft_collections: number;
  total_token_value: string;
  total_nft_value: string;
  snapshot_time: string;
}

export interface WalletAnalysisData {
  address: string;
  chains_analyzed: string[];
  token_balances: TokenBalance[];
  nft_holdings: NFTHolding[];
  recent_transactions: Transaction[];
  portfolio_summary: PortfolioSummaryData;
  cache_hit: boolean;
  analysis_time_ms: number;
}

export interface WalletAnalysisResponse {
  success: boolean;
  data: WalletAnalysisData | null;
  error: string | null;
  metadata: {
    cache_hit: boolean;
    analysis_time_ms: number;
  };
}

export interface WalletAnalysisRequest {
  address: string;
  cache_ttl_minutes?: number;
  chains?: string[];
  include_nfts?: boolean;
  include_transactions?: boolean;
  transaction_limit?: number;
  use_cache?: boolean;
}
