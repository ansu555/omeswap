import { NextResponse } from 'next/server';

interface AnalysisRequest {
    tokenName: string;
    symbol: string;
    price: number;
    marketCap: number;
    volume24h: number;
    priceChange24h: number;
    auditScores: {
        financial: number;
        fundamental: number;
        social: number;
        security: number;
    };
    tags: string[];
    description?: string;
}

export async function POST(request: Request) {
    try {
        const body: AnalysisRequest = await request.json();
        const { tokenName, symbol, price, marketCap, volume24h, priceChange24h, auditScores, tags, description } = body;

        const openAIApiKey = process.env.OPENAI_API_KEY;

        if (!openAIApiKey || openAIApiKey === 'your_openai_api_key_here') {
            // Return default analysis if OpenAI key is not set
            return NextResponse.json({
                fundamental: generateDefaultFundamentalAnalysis(tokenName, symbol, tags),
                technical: generateDefaultTechnicalAnalysis(priceChange24h, auditScores),
            });
        }

        // Generate Fundamental Analysis
        const fundamentalPrompt = `Write a comprehensive fundamental analysis for ${tokenName} (${symbol}), a cryptocurrency with the following metrics:
- Current Price: $${price.toLocaleString()}
- Market Cap: $${marketCap.toLocaleString()}
- 24h Volume: $${volume24h.toLocaleString()}
- 24h Price Change: ${priceChange24h > 0 ? '+' : ''}${priceChange24h.toFixed(2)}%
- Audit Scores: Financial: ${auditScores.financial}%, Fundamental: ${auditScores.fundamental}%, Social: ${auditScores.social}%, Security: ${auditScores.security}%
- Tags: ${tags.join(', ')}

${description ? `Additional context: ${description}` : ''}

Provide a detailed fundamental analysis covering:
1. What the token is and its purpose
2. Key technical features and blockchain technology
3. Tokenomics and supply mechanics
4. Market position and adoption
5. Recent developments and future outlook

Write in a professional, informative tone suitable for investors. Keep it comprehensive but concise (300-500 words).`;

        // Generate Technical Analysis
        const technicalPrompt = `Provide a technical analysis for ${tokenName} (${symbol}) based on:
- Current Price: $${price.toLocaleString()}
- 24h Price Change: ${priceChange24h > 0 ? '+' : ''}${priceChange24h.toFixed(2)}%
- Market Cap: $${marketCap.toLocaleString()}
- 24h Volume: $${volume24h.toLocaleString()}
- Financial Score: ${auditScores.financial}%
- Security Score: ${auditScores.security}%

Analyze:
1. Current market trend (Bullish/Bearish/Neutral)
2. Trading opportunities and potential entry/exit points
3. Market state and volatility assessment
4. Key support and resistance levels (if applicable)
5. Risk factors

Provide a concise technical analysis (200-300 words) with actionable insights.`;

        // Call OpenAI API for both analyses
        const [fundamentalResponse, technicalResponse] = await Promise.all([
            fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openAIApiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a professional cryptocurrency analyst providing detailed, accurate, and insightful analysis.',
                        },
                        {
                            role: 'user',
                            content: fundamentalPrompt,
                        },
                    ],
                    temperature: 0.7,
                    max_tokens: 800,
                }),
            }),
            fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openAIApiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a professional cryptocurrency technical analyst providing actionable trading insights.',
                        },
                        {
                            role: 'user',
                            content: technicalPrompt,
                        },
                    ],
                    temperature: 0.7,
                    max_tokens: 500,
                }),
            }),
        ]);

        let fundamental = generateDefaultFundamentalAnalysis(tokenName, symbol, tags);
        let technical = generateDefaultTechnicalAnalysis(priceChange24h, auditScores);

        if (fundamentalResponse.ok) {
            const fundamentalData = await fundamentalResponse.json();
            fundamental = fundamentalData.choices?.[0]?.message?.content || fundamental;
        }

        if (technicalResponse.ok) {
            const technicalData = await technicalResponse.json();
            technical = technicalData.choices?.[0]?.message?.content || technical;
        }

        return NextResponse.json({
            fundamental,
            technical,
        });
    } catch (error) {
        console.error('Error generating analysis:', error);
        
        // Return default analysis on error
        const body = await request.json().catch(() => ({}));
        return NextResponse.json({
            fundamental: generateDefaultFundamentalAnalysis(
                body.tokenName || 'Token',
                body.symbol || 'TKN',
                body.tags || []
            ),
            technical: generateDefaultTechnicalAnalysis(
                body.priceChange24h || 0,
                body.auditScores || { financial: 50, fundamental: 50, social: 50, security: 50 }
            ),
        });
    }
}

// Default analysis generators (fallback when OpenAI is not available)
function generateDefaultFundamentalAnalysis(tokenName: string, symbol: string, tags: string[]): string {
    return `${tokenName} (${symbol}) is a cryptocurrency${tags.length > 0 ? ` in the ${tags.slice(0, 2).join(' and ')} categories` : ''}. 

As a digital asset, ${tokenName} operates on blockchain technology, enabling decentralized transactions and value transfer. The token's fundamental value stems from its utility within its ecosystem, network effects, and adoption by users and developers.

Key aspects of ${tokenName} include its blockchain infrastructure, consensus mechanism, and tokenomics. The project aims to provide value through its use cases, whether as a medium of exchange, store of value, or utility token within a specific platform or protocol.

Market adoption and community support are crucial factors for ${tokenName}'s long-term success. The token's performance is influenced by broader market trends, regulatory developments, and technological advancements in the blockchain space.

Investors should consider the project's roadmap, team, partnerships, and real-world applications when evaluating ${tokenName}'s fundamental prospects.`;
}

function generateDefaultTechnicalAnalysis(priceChange24h: number, auditScores: { financial: number; security: number }): string {
    const trend = priceChange24h > 5 ? 'Bullish' : priceChange24h < -5 ? 'Bearish' : 'Neutral';
    const opportunity = priceChange24h > 0 ? 'Buy' : priceChange24h < -3 ? 'Sell' : 'Neutral';
    
    return `Current Trend: ${trend}

The token is showing ${Math.abs(priceChange24h).toFixed(2)}% ${priceChange24h > 0 ? 'gains' : 'losses'} over the past 24 hours, indicating ${trend.toLowerCase()} momentum.

Potential Opportunity: ${opportunity}

Based on current metrics, the token presents a ${opportunity.toLowerCase()} opportunity. The financial score of ${auditScores.financial}% and security score of ${auditScores.security}% suggest ${auditScores.financial > 70 ? 'strong' : auditScores.financial > 50 ? 'moderate' : 'weak'} fundamentals.

Market State: ${trend === 'Bullish' ? 'Uptrend' : trend === 'Bearish' ? 'Downtrend' : 'Consolidation'}

The market is currently in a ${trend.toLowerCase()} phase. Traders should monitor key support and resistance levels, volume patterns, and broader market sentiment when making trading decisions.`;
}



---
