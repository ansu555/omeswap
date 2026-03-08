import { OHLCVCandle } from '@/types/agent-builder-canvas'

const MAX_CANDLES = 10_000
const BINANCE_LIMIT = 1000 // max per request

// Interval duration in milliseconds for pagination
const INTERVAL_MS: Record<string, number> = {
  '1m':  60_000,
  '5m':  300_000,
  '15m': 900_000,
  '1h':  3_600_000,
  '4h':  14_400_000,
  '1d':  86_400_000,
}

export async function fetchBinanceHistory(
  symbol: string,
  interval: string,
  startMs: number,
  endMs: number
): Promise<OHLCVCandle[]> {
  const intervalMs = INTERVAL_MS[interval]
  if (!intervalMs) throw new Error(`Unknown interval: ${interval}`)

  const estimatedCount = Math.ceil((endMs - startMs) / intervalMs)
  if (estimatedCount > MAX_CANDLES) {
    throw new Error(
      `Date range would fetch ~${estimatedCount.toLocaleString()} candles — max is ${MAX_CANDLES.toLocaleString()}. ` +
      `Please shorten the range or use a larger interval.`
    )
  }

  const candles: OHLCVCandle[] = []
  let cursor = startMs

  while (cursor < endMs) {
    const url = new URL('https://api.binance.com/api/v3/klines')
    url.searchParams.set('symbol', symbol)
    url.searchParams.set('interval', interval)
    url.searchParams.set('startTime', String(cursor))
    url.searchParams.set('endTime', String(endMs))
    url.searchParams.set('limit', String(BINANCE_LIMIT))

    const res = await fetch(url.toString())
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Binance API error ${res.status}: ${body}`)
    }

    // Each element: [openTime, open, high, low, close, volume, closeTime, ...]
    const data = await res.json() as [number, string, string, string, string, string, ...unknown[]][]

    if (data.length === 0) break

    for (const k of data) {
      candles.push({
        time:   Math.floor(k[0] / 1000), // ms → seconds
        open:   parseFloat(k[1]),
        high:   parseFloat(k[2]),
        low:    parseFloat(k[3]),
        close:  parseFloat(k[4]),
        volume: parseFloat(k[5]),
      })
    }

    // Advance cursor past the last candle
    const lastOpenMs = data[data.length - 1][0]
    cursor = lastOpenMs + intervalMs

    // Stop if we got fewer than the limit (reached the end)
    if (data.length < BINANCE_LIMIT) break
  }

  // Deduplicate by time and sort
  const seen = new Set<number>()
  const deduped = candles.filter((c) => {
    if (seen.has(c.time)) return false
    seen.add(c.time)
    return true
  })
  deduped.sort((a, b) => a.time - b.time)

  return deduped
}
