import { BaseNode } from '../BaseNode'
import type { HandleDef, ConfigField, ExecutionContext } from '@/types/agent-builder-canvas'

export class PriceFeedNode extends BaseNode {
  readonly type = 'price_feed'
  readonly label = 'Price Feed'
  readonly description = 'Fetches live token price from CoinGecko'
  readonly icon = 'TrendingUp'
  readonly category = 'data' as const
  readonly color = 'border-blue-500'
  readonly bgColor = 'bg-blue-950'

  readonly handles: HandleDef[] = [
    { id: 'price', label: 'Price', position: 'right', type: 'source', dataType: 'number' },
  ]

  readonly configSchema: ConfigField[] = [
    {
      key: 'tokenId',
      label: 'Token',
      type: 'select',
      options: ['avalanche-2', 'bitcoin', 'ethereum', 'joe-token', 'pangolin', 'usd-coin'],
      default: 'avalanche-2',
    },
    {
      key: 'currency',
      label: 'Currency',
      type: 'select',
      options: ['usd', 'eth', 'btc'],
      default: 'usd',
    },
  ]

  async execute(
    _inputs: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    const tokenId = (this.config.tokenId as string) || 'avalanche-2'
    const currency = (this.config.currency as string) || 'usd'

    // In backtest mode, use the injected candle price instead of live API
    if (context.backtestCandle) {
      context.addLog(`[PriceFeed] [BACKTEST] price = ${context.backtestCandle.close}`)
      return { price: context.backtestCandle.close }
    }

    context.addLog(`[PriceFeed] Fetching ${tokenId} price in ${currency}...`)

    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=${currency}`
    )
    const data = await res.json()
    const price = data[tokenId]?.[currency] ?? 0

    context.addLog(`[PriceFeed] ${tokenId} = ${price} ${currency}`)
    return { price }
  }
}
