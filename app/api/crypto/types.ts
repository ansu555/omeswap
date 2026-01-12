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
