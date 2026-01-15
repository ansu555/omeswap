# Token Detail Page - Real Data Integration

## Overview
The token detail page now fetches real cryptocurrency data from CoinMarketCap API and CoinGecko API.

## Features Implemented

### 1. **Real Token Data from CoinMarketCap**
- Token price, market cap, volume, and rank
- Circulating supply, total supply, and max supply
- 24h price change percentage
- Real-time token metadata (tags, date added, etc.)
- Calculated audit scores based on token metrics

### 2. **Historical Price Data from CoinGecko**
- Real historical price data for popular tokens (Bitcoin, Ethereum, Tether, etc.)
- Supports multiple timeframes: 24h, 7d, 1m, 3m, 1y, max
- Falls back to synthetic data if token not mapped or API fails
- Interactive price charts with real data

### 3. **AI-Generated Analysis (Optional)**
- Fundamental analysis using OpenAI GPT-4
- Technical analysis with trading insights
- Falls back to default analysis if OpenAI API key not configured

## Setup Instructions

### 1. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Required: CoinMarketCap API Key
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key_here

# Optional: OpenAI API Key (for AI-generated analysis)
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Get API Keys

**CoinMarketCap API:**
1. Visit https://coinmarketcap.com/api/
2. Sign up for a free account
3. Get your API key from the dashboard
4. Free tier includes 10,000 calls/month

**OpenAI API (Optional):**
1. Visit https://platform.openai.com/api-keys
2. Create an account and add credits
3. Generate a new API key
4. Used for generating detailed token analysis

### 3. Test the Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to a token detail page using CoinMarketCap IDs:
   - Bitcoin: http://localhost:3000/token/1
   - Ethereum: http://localhost:3000/token/1027
   - Tether: http://localhost:3000/token/825
   - Solana: http://localhost:3000/token/5426
   - BNB: http://localhost:3000/token/1839

## API Routes

### GET `/api/token/[id]`
Fetches comprehensive token data from CoinMarketCap.

**Parameters:**
- `id` (path): CoinMarketCap token ID
- `days` (query, optional): Number of days for historical data (default: 365)

**Response:**
```json
{
  "id": "1",
  "name": "Bitcoin",
  "symbol": "BTC",
  "imageUrl": "https://...",
  "price": 45000,
  "priceChange24h": 2.5,
  "rank": 1,
  "marketCap": 850000000000,
  "volume24h": 25000000000,
  "circulatingSupply": 19000000,
  "totalSupply": 19000000,
  "maxSupply": 21000000,
  "auditScores": {
    "financial": 95,
    "fundamental": 89,
    "social": 100,
    "security": 83,
    "overall": 91.8
  },
  "historicalData": [...],
  "volumeBreakdown": {
    "cex": 23750000000,
    "dex": 1250000000
  },
  "liquidityRatio": 90,
  "tags": ["mineable", "pow", "sha-256"],
  "dateAdded": "2013-04-28T00:00:00.000Z",
  "lastUpdated": "2024-01-15T10:30:00.000Z"
}
```

### POST `/api/token/[id]/analysis`
Generates AI-powered fundamental and technical analysis.

**Request Body:**
```json
{
  "tokenName": "Bitcoin",
  "symbol": "BTC",
  "price": 45000,
  "marketCap": 850000000000,
  "volume24h": 25000000000,
  "priceChange24h": 2.5,
  "auditScores": {...},
  "tags": ["mineable", "pow"],
  "description": "Optional description"
}
```

**Response:**
```json
{
  "fundamental": "Bitcoin (BTC) is the world's first...",
  "technical": "Current Trend: Bullish\n\nThe token is showing..."
}
```

## Data Sources

### CoinMarketCap API
- **Endpoint:** `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest`
- **Purpose:** Token prices, market data, and metadata
- **Rate Limit:** 10,000 calls/month (free tier)
- **Cache:** 5 minutes

### CoinGecko API (Free, No Key Required)
- **Endpoint:** `https://api.coingecko.com/api/v3/coins/{id}/market_chart`
- **Purpose:** Historical price data
- **Rate Limit:** 10-30 calls/minute (free tier)
- **Cache:** 5 minutes

### OpenAI API (Optional)
- **Model:** GPT-4o-mini
- **Purpose:** AI-generated token analysis
- **Fallback:** Default template-based analysis

## Token ID Mapping

The following popular tokens have CoinGecko ID mappings for historical data:

| Token | CMC ID | CoinGecko ID |
|-------|--------|--------------|
| Bitcoin | 1 | bitcoin |
| Ethereum | 1027 | ethereum |
| Tether | 825 | tether |
| BNB | 1839 | binancecoin |
| Solana | 5426 | solana |
| Cardano | 2010 | cardano |
| USDC | 3408 | usd-coin |
| Polygon | 3890 | matic-network |
| Polkadot | 6636 | polkadot |
| Uniswap | 7083 | uniswap |

To add more token mappings, edit the `CMC_TO_COINGECKO_MAP` in [/app/api/token/[id]/route.ts](../app/api/token/[id]/route.ts).

## Error Handling

The implementation includes comprehensive error handling:

1. **Missing API Key:** Returns 500 error with clear message
2. **Token Not Found:** Returns 404 error
3. **API Failures:** Falls back to synthetic/default data
4. **Network Issues:** Shows user-friendly error messages
5. **Loading States:** Displays loading spinners during data fetch

## Performance Optimizations

- **Caching:** API responses cached for 5 minutes
- **Parallel Fetching:** Token data and analysis fetched simultaneously
- **Lazy Loading:** Historical data fetched on-demand per timeframe
- **Synthetic Fallback:** Generates realistic data when APIs fail

## Future Enhancements

1. Add more token ID mappings for historical data
2. Implement real volume breakdown (CEX vs DEX)
3. Add real TVL (Total Value Locked) data
4. Integrate social sentiment analysis
5. Add price alerts and notifications
6. Implement real-time WebSocket price updates
7. Cache optimization with Redis
8. Add more data providers for redundancy

## Troubleshooting

### "CoinMarketCap API key is required" Error
- Ensure `COINMARKETCAP_API_KEY` is set in `.env.local`
- Restart the development server after adding the key

### Historical Data Not Loading
- Check if the token has a CoinGecko mapping
- Add the mapping in `CMC_TO_COINGECKO_MAP`
- Fallback synthetic data will be used if unavailable

### Analysis Not Generated
- Check if `OPENAI_API_KEY` is set (optional)
- Default template-based analysis is used as fallback
- Check OpenAI API credits and rate limits

## License
This integration is part of the Mantle DEX project.
