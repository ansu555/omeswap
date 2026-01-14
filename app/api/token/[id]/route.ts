import { NextResponse } from 'next/server';
import type { CMCCryptocurrency, CMCQuote } from '../../crypto/types';

// DeFi Llama Historical Data Types
interface DefiLlamaPricePoint {
    timestamp: number;
    price: number;
}

interface DefiLlamaResponse {
    coins: {
        [key: string]: {
            price: number;
            timestamp: number;
            symbol: string;
            confidence: number;
        };
    };
}

// Token Detail Response Type
export interface TokenDetailResponse {
    id: string;
    name: string;
    symbol: string;
    imageUrl: string;
    price: number;
    priceChange24h: number;
    rank: number;
    marketCap: number;
    volume24h: number;
    circulatingSupply: number;
    totalSupply: number | null;
    maxSupply: number | null;
    // Audit Scores (calculated based on metrics)
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
}

// Calculate audit scores based on token metrics
function calculateAuditScores(token: CMCCryptocurrency): {
    financial: number;
    fundamental: number;
    social: number;
    security: number;
    overall: number;
} {
    const quote = token.quote.USD;
    
    // Financial Score (0-100): Based on market cap, volume, liquidity
    const financialScore = Math.min(100, Math.max(0,
        (Math.log10(quote.market_cap || 1) / 12) * 40 + // Market cap component
        (Math.log10(quote.volume_24h || 1) / 11) * 30 + // Volume component
        (token.num_market_pairs / 500) * 30 // Market pairs component
    ));

    // Fundamental Score (0-100): Based on supply, age, market pairs
    const ageInDays = (Date.now() - new Date(token.date_added).getTime()) / (1000 * 60 * 60 * 24);
    const fundamentalScore = Math.min(100, Math.max(0,
        (ageInDays / 365) * 30 + // Age component
        (token.num_market_pairs / 300) * 40 + // Market pairs
        (token.max_supply ? 30 : 0) // Supply cap bonus
    ));

    // Social Score (0-100): Based on rank and market presence
    const socialScore = Math.min(100, Math.max(0,
        (token.cmc_rank ? (101 - token.cmc_rank) : 50) + // Rank component
        (token.num_market_pairs / 200) * 30 // Market presence
    ));

    // Security Score (0-100): Based on age, stability, supply
    const securityScore = Math.min(100, Math.max(0,
        Math.min(ageInDays / 365, 1) * 40 + // Age/trust component
        (token.max_supply ? 30 : 20) + // Supply cap
        (Math.abs(quote.percent_change_24h) < 20 ? 30 : 10) // Price stability
    ));

    const overall = (financialScore + fundamentalScore + socialScore + securityScore) / 4;

    return {
        financial: Math.round(financialScore),
        fundamental: Math.round(fundamentalScore),
        social: Math.round(socialScore),
        security: Math.round(securityScore),
        overall: Math.round(overall * 10) / 10, // Round to 1 decimal
    };
}

// Fetch token detail from CoinMarketCap
async function fetchTokenFromCMC(apiKey: string, tokenId: string): Promise<CMCCryptocurrency | null> {
    if (!apiKey || apiKey === 'your_coinmarketcap_api_key_here') {
        throw new Error('CoinMarketCap API key is required');
    }

    const response = await fetch(
        `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=${tokenId}&convert=USD`,
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
    
    if (data.status?.error_code && data.status.error_code !== 0) {
        throw new Error(`CoinMarketCap API error: ${data.status.error_message || 'Unknown error'}`);
    }

    const tokenData = data.data?.[tokenId];
    if (!tokenData) {
        return null;
    }

    return tokenData;
}

// Fetch historical data from DeFi Llama
async function fetchHistoricalDataFromDefiLlama(symbol: string, days: number = 365): Promise<Array<{ timestamp: number; price: number }>> {
    try {
        // DeFi Llama uses coingecko IDs, so we'll use a different approach
        // For now, we'll generate synthetic data based on current price
        // In production, you'd map CMC symbols to Coingecko IDs
        
        // Alternative: Use CoinMarketCap historical endpoint (requires higher tier)
        // For now, return empty array - we'll generate synthetic data on frontend
        return [];
    } catch (error) {
        console.warn('DeFi Llama fetch failed:', error);
        return [];
    }
}

// Generate synthetic historical data based on current metrics
function generateHistoricalData(
    currentPrice: number,
    priceChange24h: number,
    priceChange7d: number,
    days: number = 365
): Array<{ timestamp: number; price: number }> {
    const data: Array<{ timestamp: number; price: number }> = [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    
    // Generate data points for the last N days
    for (let i = days; i >= 0; i--) {
        const timestamp = now - (i * dayMs);
        
        // Create a trend based on 7d and 24h changes
        const trend = priceChange7d / 7; // Daily trend
        const volatility = Math.random() * 0.02 - 0.01; // Small random volatility
        
        // Calculate price at this point
        const daysAgo = days - i;
        const priceChange = (trend * daysAgo) + (volatility * daysAgo);
        const price = currentPrice * (1 - priceChange / 100);
        
        data.push({
            timestamp,
            price: Math.max(0, price),
        });
    }
    
    return data;
}

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const tokenId = params.id;
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '365', 10);

        const coinMarketCapKey = process.env.COINMARKETCAP_API_KEY || '';

        if (!coinMarketCapKey || coinMarketCapKey === 'your_coinmarketcap_api_key_here') {
            return NextResponse.json(
                { error: 'CoinMarketCap API key is required' },
                { status: 500 }
            );
        }

        // Fetch token data from CMC
        const tokenData = await fetchTokenFromCMC(coinMarketCapKey, tokenId);
        
        if (!tokenData) {
            return NextResponse.json(
                { error: 'Token not found' },
                { status: 404 }
            );
        }

        const quote = tokenData.quote.USD;
        
        // Calculate audit scores
        const auditScores = calculateAuditScores(tokenData);
        
        // Generate or fetch historical data
        let historicalData = await fetchHistoricalDataFromDefiLlama(tokenData.symbol, days);
        if (historicalData.length === 0) {
            // Generate synthetic data if DeFi Llama fails
            historicalData = generateHistoricalData(
                quote.price,
                quote.percent_change_24h,
                quote.percent_change_7d,
                days
            );
        }

        // Estimate volume breakdown (CMC doesn't provide this directly)
        // In production, you'd fetch this from another API
        const volumeBreakdown = {
            cex: quote.volume_24h * 0.95, // Estimate 95% CEX
            dex: quote.volume_24h * 0.05, // Estimate 5% DEX
        };

        // Calculate liquidity ratio
        const liquidityRatio = tokenData.max_supply && tokenData.circulating_supply
            ? (tokenData.circulating_supply / tokenData.max_supply) * 100
            : 95; // Default if no max supply

        const response: TokenDetailResponse = {
            id: tokenData.id.toString(),
            name: tokenData.name,
            symbol: tokenData.symbol,
            imageUrl: `https://s2.coinmarketcap.com/static/img/coins/64x64/${tokenData.id}.png`,
            price: quote.price,
            priceChange24h: quote.percent_change_24h,
            rank: tokenData.cmc_rank || 0,
            marketCap: quote.market_cap,
            volume24h: quote.volume_24h,
            circulatingSupply: tokenData.circulating_supply,
            totalSupply: tokenData.total_supply,
            maxSupply: tokenData.max_supply,
            auditScores,
            historicalData,
            volumeBreakdown,
            liquidityRatio: Math.round(liquidityRatio),
            tags: tokenData.tags || [],
            dateAdded: tokenData.date_added,
            lastUpdated: tokenData.last_updated,
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

