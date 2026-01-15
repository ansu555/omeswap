import { NextResponse } from 'next/server';

// Kryll API Response Types
interface KryllApiResponse {
    status: string;
    code: number;
    data: {
        id: string;
        symbol: string;
        name: string;
        tokenLogo: string;
        description: string;
        hashtag: string | null;
        global_score: number;
        financial: {
            score: number;
            market: {
                price: number;
                marketcap: number;
                volume_24h: number | null;
                circulating_supply: number | null;
                total_supply: number | null;
                history: {
                    monthly: Array<[number, number]>;
                    daily: Array<[number, number]>;
                };
            };
            liquidity?: any;
        };
        fundamental: {
            score: number;
            [key: string]: any;
        };
        social: {
            score: number;
            [key: string]: any;
        };
        security: {
            score: number;
            [key: string]: any;
        };
    };
}

// Token Detail Response Type
export interface TokenDetailResponse {
    id: string;
    name: string;
    symbol: string;
    imageUrl: string;
    description: string;
    price: number;
    priceChange24h: number;
    rank: number;
    marketCap: number;
    volume24h: number;
    circulatingSupply: number;
    totalSupply: number | null;
    maxSupply: number | null;
    // Audit Scores from Kryll
    auditScores: {
        financial: number;
        fundamental: number;
        social: number;
        security: number;
        overall: number;
    };
    // Historical price data
    historicalData: Array<{
        timestamp: number;
        price: number;
    }>;
    // Volume breakdown
    volumeBreakdown: {
        cex: number;
        dex: number;
    };
    // Additional metrics
    liquidityRatio: number;
    tags: string[];
    dateAdded: string;
    lastUpdated: string;
    // Raw Kryll data for advanced analysis
    kryllData?: {
        financial: any;
        fundamental: any;
        social: any;
        security: any;
    };
}

// Fetch token data from Kryll API
async function fetchTokenFromKryll(tokenSlug: string): Promise<KryllApiResponse | null> {
    try {
        const response = await fetch(
            `https://dapi.kryll.io/xray/audit/${tokenSlug}`,
            {
                method: 'GET',
                headers: {
                    'accept': '*/*',
                    'accept-language': 'en-US,en;q=0.9',
                    'origin': 'https://app.kryll.io',
                    'referer': 'https://app.kryll.io/',
                },
                next: { revalidate: 300 }, // Cache for 5 minutes
            }
        );

        if (!response.ok) {
            console.warn(`Kryll API error for ${tokenSlug}: ${response.status}`);
            return null;
        }

        const data: KryllApiResponse = await response.json();
        
        if (data.status !== 'OK' || data.code !== 200) {
            console.warn(`Kryll API returned non-OK status for ${tokenSlug}`);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error fetching from Kryll API:', error);
        return null;
    }
}

// Map common token IDs/names to Kryll slugs
function getKryllSlug(tokenId: string): string {
    // Convert numeric IDs or names to Kryll-compatible slugs
    const slugMap: Record<string, string> = {
        '1': 'bitcoin',
        'bitcoin': 'bitcoin',
        'btc': 'bitcoin',
        '1027': 'ethereum',
        'ethereum': 'ethereum',
        'eth': 'ethereum',
        '825': 'tether',
        'tether': 'tether',
        'usdt': 'tether',
        '1839': 'binancecoin',
        'bnb': 'binancecoin',
        '5426': 'solana',
        'solana': 'solana',
        'sol': 'solana',
        '52': 'ripple',
        'xrp': 'ripple',
        '3408': 'usd-coin',
        'usdc': 'usd-coin',
        '74': 'dogecoin',
        'doge': 'dogecoin',
        '2010': 'cardano',
        'ada': 'cardano',
        '5805': 'avalanche-2',
        'avax': 'avalanche-2',
        '1958': 'tron',
        'trx': 'tron',
        '6636': 'polkadot',
        'dot': 'polkadot',
        '11419': 'toncoin',
        'ton': 'toncoin',
        '3890': 'polygon',
        'matic': 'polygon',
        '4687': 'binance-usd',
        'busd': 'binance-usd',
        '7083': 'uniswap',
        'uni': 'uniswap',
    };

    const normalized = tokenId.toLowerCase().trim();
    return slugMap[normalized] || normalized;
}

// Calculate price change from historical data
function calculatePriceChange24h(historicalData: Array<[number, number]>): number {
    if (!historicalData || historicalData.length < 2) return 0;
    
    const dailyData = historicalData.filter(([timestamp]) => {
        const dayMs = 24 * 60 * 60 * 1000;
        return Date.now() - timestamp < 30 * dayMs; // Last 30 days
    });
    
    if (dailyData.length < 2) return 0;
    
    const latestPrice = dailyData[dailyData.length - 1][1];
    const yesterdayPrice = dailyData[dailyData.length - 2][1];
    
    if (yesterdayPrice === 0) return 0;
    return ((latestPrice - yesterdayPrice) / yesterdayPrice) * 100;
}

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const tokenId = params.id;
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '365', 10);

        // Get Kryll slug for the token
        const kryllSlug = getKryllSlug(tokenId);
        
        // Fetch data from Kryll API
        const kryllData = await fetchTokenFromKryll(kryllSlug);
        
        if (!kryllData || !kryllData.data) {
            return NextResponse.json(
                { error: 'Token not found' },
                { status: 404 }
            );
        }

        const data = kryllData.data;
        
        // Convert historical data from Kryll format
        const historicalData: Array<{ timestamp: number; price: number }> = [];
        
        // Use daily history if available, otherwise monthly
        const historyData = data.financial.market.history?.daily || data.financial.market.history?.monthly || [];
        
        for (const [timestamp, price] of historyData) {
            historicalData.push({ timestamp, price });
        }
        
        // Calculate 24h price change
        const priceChange24h = calculatePriceChange24h(historyData);
        
        // Estimate volume breakdown (Kryll doesn't provide this directly)
        const volume24h = data.financial.market.volume_24h || 0;
        const volumeBreakdown = {
            cex: volume24h * 0.95, // Estimate 95% CEX
            dex: volume24h * 0.05, // Estimate 5% DEX
        };

        // Calculate liquidity ratio
        const circulatingSupply = data.financial.market.circulating_supply || 0;
        const totalSupply = data.financial.market.total_supply || 0;
        const liquidityRatio = totalSupply > 0 ? (circulatingSupply / totalSupply) * 100 : 100;

        // Determine rank from marketcap (approximate - would need full market data)
        // For now, use a simple heuristic based on market cap
        const marketCap = data.financial.market.marketcap || 0;
        let estimatedRank = 100;
        if (marketCap > 1000000000000) estimatedRank = 1; // >1T = top
        else if (marketCap > 100000000000) estimatedRank = 5; // >100B
        else if (marketCap > 10000000000) estimatedRank = 20; // >10B
        else if (marketCap > 1000000000) estimatedRank = 50; // >1B
        else estimatedRank = 100;

        const response: TokenDetailResponse = {
            id: data.id,
            name: data.name,
            symbol: data.symbol.toUpperCase(),
            imageUrl: data.tokenLogo || `https://via.placeholder.com/64?text=${data.symbol.toUpperCase()}`,
            description: data.description || '',
            price: data.financial.market.price || 0,
            priceChange24h: priceChange24h,
            rank: estimatedRank,
            marketCap: data.financial.market.marketcap || 0,
            volume24h: volume24h,
            circulatingSupply: circulatingSupply,
            totalSupply: totalSupply,
            maxSupply: totalSupply, // Kryll doesn't distinguish max from total
            auditScores: {
                financial: Math.round(data.financial.score),
                fundamental: Math.round(data.fundamental.score),
                social: Math.round(data.social.score),
                security: Math.round(data.security.score),
                overall: Math.round(data.global_score * 10) / 10,
            },
            historicalData: historicalData.slice(-days), // Limit to requested days
            volumeBreakdown,
            liquidityRatio: Math.round(liquidityRatio),
            tags: data.hashtag ? [data.hashtag] : [],
            dateAdded: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // Fallback
            lastUpdated: new Date().toISOString(),
            // Include raw Kryll data for advanced analysis
            kryllData: {
                financial: data.financial,
                fundamental: data.fundamental,
                social: data.social,
                security: data.security,
            },
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching token detail:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

