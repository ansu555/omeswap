import { NextResponse } from 'next/server';
import type {
    CoinGeckoMarket,
    GeckoTerminalResponse,
    TokenRow,
    PoolRow,
    SummaryItem,
    Metric,
    CryptoAPIResponse,
    CMCResponse
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

    // Filter for specific Mantle ecosystem tokens
    const mantleEcosystemTokens = [
        'mantle',                    // Mantle (MNT)
        'weth',                      // Wrapped Ether (WETH)
        'wrapped-steth',             // Wrapped stETH (wstETH)
        'ethena',                    // Ethena (ENA)
        'fbtc',                      // Ignition FBTC (fBTC)
        'solv-btc',                  // Solv BTC (solvBTC)
        'meth',                      // mETH
        'mantle-inu',                // Mantle Inu (MINU)
        'stakestone-ether',          // StakeStone ETH (STONE)
        'usdlr',                     // USDLR
        'ktx-finance',               // KTX Finance (KTC)
        'aperture-finance',          // Aperture Finance (APTR)
        'lqdx',                      // Reddex (LQDX)
        'bladeswap',                 // Blades (BLADE) - using bladeswap as potential ID
        'davos-protocol',            // Davos USD (DUSD)
        'vertex-protocol',           // Vertex (VRTX)
        'tether',                    // USDT (Bridged)
        'chainlink',                 // LINK (Bridged)
        'usd-coin',                  // USDC/AXLUSDC
    ];

    const mantleCoins = allCoins.filter(coin =>
        mantleEcosystemTokens.includes(coin.id.toLowerCase()) ||
        coin.name.toLowerCase().includes('mantle') ||
        coin.symbol.toLowerCase() === 'musd' ||
        coin.symbol.toLowerCase() === 'mi4' ||
        coin.symbol.toLowerCase() === 'axlusdc'
    );

    // Return filtered Mantle ecosystem coins
    return mantleCoins;
}

// Fetch pools from GeckoTerminal
async function fetchPoolsFromGeckoTerminal(): Promise<GeckoTerminalResponse> {
    // Mantle network ID on GeckoTerminal is 'mantle'
    const response = await fetch(
        `https://api.geckoterminal.com/api/v2/networks/mantle/pools?page=1`,
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

    const data = await response.json();
    
    // Check for API errors in response
    if (data.status?.error_code && data.status.error_code !== 0) {
        throw new Error(`CoinMarketCap API error: ${data.status.error_message || 'Unknown error'}`);
    }

    return data;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '100', 10);

        const coinGeckoKey = process.env.COINGECKO_API_KEY || '';
        const coinMarketCapKey = process.env.COINMARKETCAP_API_KEY || '';

        let tokens: TokenRow[] = [];
        let pools: PoolRow[] = [];

        // Try CoinMarketCap first (Primary source)
        if (coinMarketCapKey && coinMarketCapKey !== 'your_coinmarketcap_api_key_here') {
            try {
                const cmcData = await fetchFromCoinMarketCap(coinMarketCapKey, limit);
                tokens = transformCMCData(cmcData);

                // Fetch pools from GeckoTerminal (still using GeckoTerminal for pools)
                try {
                    const gtData = await fetchPoolsFromGeckoTerminal();
                    pools = transformGeckoTerminalPools(gtData);
                } catch (poolError) {
                    console.warn('GeckoTerminal fetch failed:', poolError);
                    pools = []; // Empty pools on error
                }
            } catch (cmcError) {
                console.warn('CoinMarketCap fetch failed, falling back to CoinGecko:', cmcError);
                
                // Fallback to CoinGecko
                try {
                    const cgData = await fetchFromCoinGecko(coinGeckoKey);
                    tokens = transformCoinGeckoData(cgData);

                    // Fetch pools from GeckoTerminal
                    try {
                        const gtData = await fetchPoolsFromGeckoTerminal();
                        pools = transformGeckoTerminalPools(gtData);
                    } catch (poolError) {
                        console.warn('GeckoTerminal fetch failed:', poolError);
                        pools = []; // Empty pools on error
                    }
                } catch (cgError) {
                    throw new Error('Both CoinMarketCap and CoinGecko failed. Please check your API keys.');
                }
            }
        } else {
            // No CMC key, try CoinGecko
            try {
                const cgData = await fetchFromCoinGecko(coinGeckoKey);
                tokens = transformCoinGeckoData(cgData);

                // Fetch pools from GeckoTerminal
                try {
                    const gtData = await fetchPoolsFromGeckoTerminal();
                    pools = transformGeckoTerminalPools(gtData);
                } catch (poolError) {
                    console.warn('GeckoTerminal fetch failed:', poolError);
                    pools = []; // Empty pools on error
                }
            } catch (cgError) {
                throw new Error('CoinMarketCap API key is required. Please set COINMARKETCAP_API_KEY in your .env file.');
            }
        }

        // Calculate metrics from token data
        const totalMarketCap = tokens.reduce((sum, t) => sum + t.marketCap, 0);
        const totalVolume24h = tokens.reduce((sum, t) => sum + t.volume24h, 0);

        const metrics: Metric[] = [
            {
                label: 'Total Market Cap',
                value: `$${(totalMarketCap / 1e9).toFixed(2)}B`,
                change: tokens.length > 0 ? tokens.reduce((sum, t) => sum + t.change24h, 0) / tokens.length : 0
            },
            {
                label: '24h Volume',
                value: `$${(totalVolume24h / 1e6).toFixed(2)}M`,
            },
            {
                label: 'Active Tokens',
                value: tokens.length.toString(),
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
