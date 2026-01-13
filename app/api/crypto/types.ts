// CoinMarketCap API Response Types
export interface CMCQuote {
    price: number;
    volume_24h: number;
    volume_change_24h: number;
    percent_change_1h: number;
    percent_change_24h: number;
    percent_change_7d: number;
    market_cap: number;
    last_updated: string;
}

export interface CMCCryptocurrency {
    id: number;
    name: string;
    symbol: string;
    slug: string;
    cmc_rank: number;
    num_market_pairs: number;
    circulating_supply: number;
    total_supply: number;
    max_supply: number | null;
    last_updated: string;
    date_added: string;
    tags: string[];
    platform: any;
    quote: {
        USD: CMCQuote;
    };
}

export interface CMCResponse {
    data: CMCCryptocurrency[];
    status: {
        timestamp: string;
        error_code: number;
        error_message: string | null;
        elapsed: number;
        credit_count: number;
    };
}

// CoinGecko API Response Types
export interface CoinGeckoMarket {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    market_cap: number;
    market_cap_rank: number;
    fully_diluted_valuation: number | null;
    total_volume: number;
    high_24h: number;
    low_24h: number;
    price_change_24h: number;
    price_change_percentage_24h: number;
    price_change_percentage_1h_in_currency?: number;
    price_change_percentage_7d_in_currency?: number;
    market_cap_change_24h: number;
    market_cap_change_percentage_24h: number;
    circulating_supply: number;
    total_supply: number | null;
    max_supply: number | null;
    ath: number;
    ath_change_percentage: number;
    ath_date: string;
    atl: number;
    atl_change_percentage: number;
    atl_date: string;
    roi: any;
    last_updated: string;
    sparkline_in_7d?: {
        price: number[];
    };
}

// GeckoTerminal Pool Types
export interface GeckoTerminalPool {
    id: string;
    type: string;
    attributes: {
        name: string;
        address: string;
        base_token_price_usd: string;
        quote_token_price_usd: string;
        base_token_price_native_currency: string;
        quote_token_price_native_currency: string;
        pool_created_at: string;
        reserve_in_usd: string;
        fdv_usd: string;
        market_cap_usd: string | null;
        price_change_percentage: {
            h1: string;
            h24: string;
        };
        transactions: {
            h1: {
                buys: number;
                sells: number;
                buyers: number;
                sellers: number;
            };
            h24: {
                buys: number;
                sells: number;
                buyers: number;
                sellers: number;
            };
        };
        volume_usd: {
            h1: string;
            h24: string;
        };
    };
    relationships: {
        base_token: {
            data: {
                id: string;
                type: string;
            };
        };
        quote_token: {
            data: {
                id: string;
                type: string;
            };
        };
        dex: {
            data: {
                id: string;
                type: string;
            };
        };
    };
}

export interface GeckoTerminalToken {
    id: string;
    type: string;
    attributes: {
        address: string;
        name: string;
        symbol: string;
        decimals: number;
        total_supply: string;
        coingecko_coin_id: string | null;
        price_usd: string;
        fdv_usd: string;
        total_reserve_in_usd: string;
        volume_usd: {
            h24: string;
        };
        market_cap_usd: string | null;
    };
}

export interface GeckoTerminalResponse {
    data: GeckoTerminalPool[];
    included?: GeckoTerminalToken[];
}

// Frontend Token Row Type (matching existing interface)
export interface TokenRow {
    id: string;
    rank: number;
    name: string;
    symbol: string;
    imageUrl?: string;
    price: number;
    change1h: number;
    change24h: number;
    change7d: number;
    marketCap: number;
    volume24h: number;
    circulatingSupply: number;
    sparklineData: number[];
    isFavorite?: boolean;
}

// Pool Row Type
export interface PoolRow {
    id: string;
    rank: number;
    token0: { name: string; symbol: string };
    token1: { name: string; symbol: string };
    fee: number;
    tvl: number;
    volume24h: number;
    volume7d: number;
    apr: number;
}

// Summary Item Type
export interface SummaryItem {
    name: string;
    symbol: string;
    value: string;
    change?: number;
    imageUrl?: string;
}

// Metric Type
export interface Metric {
    label: string;
    value: string;
    change?: number;
}

// API Response Type
export interface CryptoAPIResponse {
    tokens: TokenRow[];
    pools?: PoolRow[];
    gainers?: SummaryItem[];
    losers?: SummaryItem[];
    trending?: SummaryItem[];
    metrics?: Metric[];
    status?: any;
}
