import { NextResponse } from 'next/server';
import type { CMCResponse, TokenRow } from './types';

// Generate sparkline data (placeholder since CMC doesn't provide historical data in basic endpoint)
const generateSparklineData = (change7d: number): number[] => {
    const data: number[] = [];
    let value = 50;
    const trend = change7d > 0 ? 0.4 : 0.6;

    for (let i = 0; i < 24; i++) {
        value += (Math.random() - trend) * 5;
        data.push(Math.max(0, value));
    }
    return data;
};

// Transform CoinMarketCap data to TokenRow format
const transformCMCData = (cmcData: CMCResponse): TokenRow[] => {
    return cmcData.data.map((crypto) => ({
        id: crypto.id.toString(),
        rank: crypto.cmc_rank,
        name: crypto.name,
        symbol: crypto.symbol,
        imageUrl: `https://s2.coinmarketcap.com/static/img/coins/64x64/${crypto.id}.png`,
        price: crypto.quote.USD.price,
        change1h: crypto.quote.USD.percent_change_1h,
        change24h: crypto.quote.USD.percent_change_24h,
        change7d: crypto.quote.USD.percent_change_7d,
        marketCap: crypto.quote.USD.market_cap,
        volume24h: crypto.quote.USD.volume_24h,
        circulatingSupply: crypto.circulating_supply,
        sparklineData: generateSparklineData(crypto.quote.USD.percent_change_7d),
        isFavorite: false,
    }));
};

export async function GET(request: Request) {
    try {
        const apiKey = process.env.COINMARKETCAP_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'CoinMarketCap API key not configured' },
                { status: 500 }
            );
        }

        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit') || '100';
        const start = searchParams.get('start') || '1';

        // Fetch data from CoinMarketCap API
        const response = await fetch(
            `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=${start}&limit=${limit}&convert=USD`,
            {
                method: 'GET',
                headers: {
                    'X-CMC_PRO_API_KEY': apiKey,
                    'Accept': 'application/json',
                },
                // Cache for 5 minutes to avoid hitting rate limits
                next: { revalidate: 300 },
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error('CoinMarketCap API Error:', errorData);
            return NextResponse.json(
                { error: 'Failed to fetch cryptocurrency data', details: errorData },
                { status: response.status }
            );
        }

        const data: CMCResponse = await response.json();

        // Transform the data to match our TokenRow interface
        const tokens = transformCMCData(data);

        return NextResponse.json({
            tokens,
            status: data.status,
        });
    } catch (error) {
        console.error('Error fetching crypto data:', error);
        return NextResponse.json(
            { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
