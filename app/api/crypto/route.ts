import { NextResponse } from 'next/server';
import type {
    CoinGeckoMarket,
    GeckoTerminalResponse,
    TokenRow,
    PoolRow,
    SummaryItem,
    Metric,
    CryptoAPIResponse,
    CMCResponse,
    KryllResponse,
    KryllToken
} from './types';

// Generate sparkline data (placeholder since we need historical data)
const generateSparklineData = (change7d: number, sparkline?: number[]): number[] => {
    if (sparkline && sparkline.length > 0) {
        // Use actual sparkline if available, sample to 24 points
        const step = Math.floor(sparkline.length / 24);
        return sparkline.filter((_, i) => i % step === 0).slice(0, 24);
    }

    // Fallback: generate based on 7d change
    const data: number[] = [];
    let value = 50;
    const trend = change7d > 0 ? 0.4 : 0.6;

    for (let i = 0; i < 24; i++) {
        value += (Math.random() - trend) * 5;
        data.push(Math.max(0, value));
    }
    return data;
};

// Transform CoinGecko data to TokenRow format
const transformCoinGeckoData = (cgData: CoinGeckoMarket[]): TokenRow[] => {
    return cgData.map((coin, index) => ({
        id: coin.id,
        rank: coin.market_cap_rank || index + 1,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        imageUrl: coin.image,
        price: coin.current_price || 0,
        change1h: coin.price_change_percentage_1h_in_currency || 0,
        change24h: coin.price_change_percentage_24h || 0,
        change7d: coin.price_change_percentage_7d_in_currency || 0,
        marketCap: coin.market_cap || 0,
        volume24h: coin.total_volume || 0,
        circulatingSupply: coin.circulating_supply || 0,
        sparklineData: generateSparklineData(
            coin.price_change_percentage_7d_in_currency || 0,
            coin.sparkline_in_7d?.price
        ),
        isFavorite: false,
    }));
};

// Transform CoinMarketCap data to TokenRow format (Primary source)
const transformCMCData = (cmcData: CMCResponse): TokenRow[] => {
    if (!cmcData.data || !Array.isArray(cmcData.data)) {
        return [];
    }

    const tokens: TokenRow[] = [];

    for (const crypto of cmcData.data) {
        const quote = crypto.quote?.USD;
        if (!quote) {
            // Skip if no USD quote data
            continue;
        }

        tokens.push({
            id: crypto.id.toString(),
            rank: crypto.cmc_rank || 0,
            name: crypto.name || 'Unknown',
            symbol: crypto.symbol || 'UNKNOWN',
            imageUrl: `https://s2.coinmarketcap.com/static/img/coins/64x64/${crypto.id}.png`,
            price: quote.price || 0,
            change1h: quote.percent_change_1h || 0,
            change24h: quote.percent_change_24h || 0,
            change7d: quote.percent_change_7d || 0,
            marketCap: quote.market_cap || 0,
            volume24h: quote.volume_24h || 0,
            circulatingSupply: crypto.circulating_supply || 0,
            sparklineData: generateSparklineData(quote.percent_change_7d || 0),
            isFavorite: false,
        });
    }

    return tokens;
};

// Transform GeckoTerminal pools to PoolRow format
const transformGeckoTerminalPools = (gtData: GeckoTerminalResponse): PoolRow[] => {
    const pools: PoolRow[] = [];

    gtData.data.forEach((pool, index) => {
        // Find token info from included data
        const baseToken = gtData.included?.find(
            t => t.id === pool.relationships.base_token.data.id
        );
        const quoteToken = gtData.included?.find(
            t => t.id === pool.relationships.quote_token.data.id
        );

        if (baseToken && quoteToken) {
            const tvl = parseFloat(pool.attributes.reserve_in_usd) || 0;
            const volume24h = parseFloat(pool.attributes.volume_usd.h24) || 0;

            pools.push({
                id: pool.id,
                rank: index + 1,
                token0: {
                    name: baseToken.attributes.name,
                    symbol: baseToken.attributes.symbol.toUpperCase(),
                },
                token1: {
                    name: quoteToken.attributes.name,
                    symbol: quoteToken.attributes.symbol.toUpperCase(),
                },
                fee: 0.3, // Default, GeckoTerminal doesn't always provide this
                tvl,
                volume24h,
                volume7d: volume24h * 7, // Estimate
                apr: tvl > 0 ? (volume24h * 365 * 0.003 / tvl) * 100 : 0, // Rough estimate
            });
        }
    });

    return pools.sort((a, b) => b.tvl - a.tvl);
};

// Fetch from CoinGecko
async function fetchFromCoinGecko(apiKey: string): Promise<CoinGeckoMarket[]> {
    const headers: HeadersInit = {
        'Accept': 'application/json',
    };

    // Add API key if provided (CoinGecko free tier doesn't require it, but Pro does)
    if (apiKey && apiKey !== 'your_coingecko_api_key_here') {
        headers['x-cg-pro-api-key'] = apiKey;
    }

    const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h,24h,7d`,
        {
            method: 'GET',
            headers,
            next: { revalidate: 300 }, // Cache for 5 minutes
        }
    );

    if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const allCoins: CoinGeckoMarket[] = await response.json();

    // Filter for specific Avalanche ecosystem tokens
    const avaxEcosystemTokens = [
        
        'avalanche-2',               // Avalanche (AVAX)
        'weth',                      // Wrapped Ether (WETH)
        'joe',                       // Trader Joe (JOE)
        'benqi',                     // BENQI (QI)
        'pangolin',                  // Pangolin (PNG)
        'wrapped-avax',              // Wrapped AVAX (WAVAX)
        'usd-coin',                  // USDC
        'tether',                    // USDT
        'chainlink',                 // Chainlink (LINK)
        'aave',                      // Aave (AAVE)
        'curve-dao-token',           // Curve (CRV)
        'bitcoin',                   // Bitcoin (BTC)
        'ethereum',                  // Ethereum (ETH)
        'uniswap',                   // Uniswap (UNI)
        
        
        
        
    ];

    const avaxCoins = allCoins.filter(coin =>
        avaxEcosystemTokens.includes(coin.id.toLowerCase()) ||

        coin.symbol.toLowerCase() === 'wavax' ||
        
        coin.symbol.toLowerCase() === 'savax'
    );

    // Return filtered Avalanche ecosystem coins
    return avaxCoins;
}

// Fetch pools from GeckoTerminal
async function fetchPoolsFromGeckoTerminal(): Promise<GeckoTerminalResponse> {
    // Avalanche network ID on GeckoTerminal is 'avax'
    const response = await fetch(
        `https://api.geckoterminal.com/api/v2/networks/avax/pools?page=1`,
        {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            next: { revalidate: 300 }, // Cache for 5 minutes
        }
    );

    if (!response.ok) {
        throw new Error(`GeckoTerminal API error: ${response.status}`);
    }

    return await response.json();
}

// Fetch from CoinMarketCap (Primary source)
async function fetchFromCoinMarketCap(apiKey: string, limit: number = 100): Promise<CMCResponse> {
    if (!apiKey || apiKey === 'your_coinmarketcap_api_key_here') {
        throw new Error('CoinMarketCap API key is required');
    }

    const response = await fetch(
        `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=1&limit=${limit}&convert=USD`,
        {
            method: 'GET',
            headers: {
                'X-CMC_PRO_API_KEY': apiKey,
                'Accept': 'application/json',
            },
            next: { revalidate: 300 }, // Cache for 5 minutes
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`CoinMarketCap API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
}

// Fetch from Kryll X-Ray API
async function fetchFromKryll(): Promise<KryllToken[]> {
    const response = await fetch(
        'https://dapi.kryll.io/xray/list?limit=100&page=1',
        {
            method: 'GET',
            headers: {
                'Accept': '*/*',
                'Origin': 'https://app.kryll.io',
                'Referer': 'https://app.kryll.io/',
            },
            next: { revalidate: 300 },
        }
    );

    if (!response.ok) {
        throw new Error(`Kryll API error: ${response.status}`);
    }

    const json: KryllResponse = await response.json();
    return json.data.items;
}

// Transform Kryll data to TokenRow format
const transformKryllData = (kryllData: KryllToken[]): TokenRow[] => {
    return kryllData.map((coin, index) => ({
        id: coin.id,
        rank: index + 1,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        imageUrl: coin.image,
        price: coin.current_price || 0,
        change1h: 0,
        change24h: coin.price_change_percentage_24h_in_currency || 0,
        change7d: coin.price_change_percentage_30d_in_currency || 0,
        marketCap: coin.market_cap || 0,
        volume24h: 0,
        circulatingSupply: 0,
        sparklineData: generateSparklineData(coin.price_change_percentage_30d_in_currency || 0),
        isFavorite: false,
        auditScore: coin.audit_score || 0,
        sentiment: coin.sentiment || 0,
        newsCount: coin.news_last_7days || 0,
    }));
};

export async function GET(_request: Request) {
    try {
        const coinGeckoKey = process.env.COINGECKO_API_KEY || '';
        const coinMarketCapKey = process.env.COINMARKETCAP_API_KEY || '';

        let tokens: TokenRow[] = [];
        let pools: PoolRow[] = [];

        // Try Kryll first (no API key required)
        try {
            const kryllData = await fetchFromKryll();
            tokens = transformKryllData(kryllData);
        } catch (kryllError) {
            console.warn('Kryll fetch failed, falling back to CoinGecko:', kryllError);

            // Fallback to CoinGecko
            try {
                const cgData = await fetchFromCoinGecko(coinGeckoKey);
                tokens = transformCoinGeckoData(cgData);
            } catch (cgError) {
                console.warn('CoinGecko fetch failed, falling back to CoinMarketCap:', cgError);

                if (coinMarketCapKey) {
                    const cmcData = await fetchFromCoinMarketCap(coinMarketCapKey);
                    tokens = transformCMCData(cmcData);
                } else {
                    throw new Error('All API sources failed');
                }
            }
        }

        // Fetch pools from GeckoTerminal
        try {
            const gtData = await fetchPoolsFromGeckoTerminal();
            pools = transformGeckoTerminalPools(gtData);
        } catch (poolError) {
            console.warn('GeckoTerminal fetch failed:', poolError);
            pools = [];
        }

        // Helper function to format numbers with commas
        const formatNumberWithCommas = (num: number): string => {
            return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        };

        // Calculate metrics from token data
        const totalMarketCap = tokens.reduce((sum, t) => sum + t.marketCap, 0);
        const totalVolume24h = tokens.reduce((sum, t) => sum + t.volume24h, 0);

        const metrics: Metric[] = [
            {
                label: 'Total Market Cap',
                value: `$${formatNumberWithCommas(totalMarketCap / 1e9)}B`,
                change: tokens.length > 0 ? tokens.reduce((sum, t) => sum + t.change24h, 0) / tokens.length : 0
            },
            {
                label: '24h Volume',
                value: `$${formatNumberWithCommas(totalVolume24h / 1e6)}M`,
            },
            {
                label: 'Active Tokens',
                value: tokens.length.toLocaleString('en-US'),
            },
        ];

        // Calculate top gainers (top 5 by 24h change)
        const gainers: SummaryItem[] = [...tokens]
            .sort((a, b) => b.change24h - a.change24h)
            .slice(0, 5)
            .map(t => ({
                name: t.name,
                symbol: t.symbol,
                value: `$${t.price.toFixed(t.price < 1 ? 4 : 2)}`,
                change: t.change24h,
                imageUrl: t.imageUrl,
            }));

        // Calculate top losers (bottom 5 by 24h change)
        const losers: SummaryItem[] = [...tokens]
            .sort((a, b) => a.change24h - b.change24h)
            .slice(0, 5)
            .map(t => ({
                name: t.name,
                symbol: t.symbol,
                value: `$${t.price.toFixed(t.price < 1 ? 4 : 2)}`,
                change: t.change24h,
                imageUrl: t.imageUrl,
            }));

        // Calculate trending (top 5 by volume)
        const trending: SummaryItem[] = [...tokens]
            .sort((a, b) => b.volume24h - a.volume24h)
            .slice(0, 5)
            .map(t => ({
                name: t.name,
                symbol: t.symbol,
                value: `$${t.price.toFixed(t.price < 1 ? 4 : 2)}`,
                change: 0, // Trending doesn't show change
                imageUrl: t.imageUrl,
            }));

        const response: CryptoAPIResponse = {
            tokens,
            pools,
            gainers,
            losers,
            trending,
            metrics,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching crypto data:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
                tokens: [],
                pools: [],
                gainers: [],
                losers: [],
                trending: [],
                metrics: [],
            },
            { status: 500 }
        );
    }
}
