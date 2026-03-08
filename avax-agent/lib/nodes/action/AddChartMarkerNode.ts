import { BaseNode } from '../BaseNode'
import type { HandleDef, ConfigField, ExecutionContext } from '@/types'

export class AddChartMarkerNode extends BaseNode {
  readonly type = 'add_chart_marker'
  readonly label = 'Add Chart Marker'
  readonly description = 'Adds a marker to the chart at the current time'
  readonly icon = 'MapPin'
  readonly category = 'action' as const
  readonly color = 'border-purple-500'
  readonly bgColor = 'bg-purple-950'

  readonly handles: HandleDef[] = [
    { id: 'signal', label: 'Signal', position: 'left', type: 'target', dataType: 'signal' },
    { id: 'price', label: 'Price', position: 'left', type: 'target', dataType: 'number' },
  ]

  readonly configSchema: ConfigField[] = [
    {
      key: 'label',
      label: 'Marker Label',
      type: 'text',
      default: 'Swap',
    },
    {
      key: 'color',
      label: 'Color',
      type: 'select',
      options: ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#a855f7', '#ffffff'],
      default: '#22c55e',
    },
    {
      key: 'shape',
      label: 'Shape',
      type: 'select',
      options: ['arrowUp', 'arrowDown', 'circle'],
      default: 'arrowUp',
    },
    {
      key: 'useCurrentPrice',
      label: 'Use Current Price',
      type: 'toggle',
      default: false,
    },
    {
      key: 'priceSymbol',
      label: 'Price Symbol (Binance)',
      type: 'select',
      options: ['AVAXUSDT', 'BTCUSDT', 'ETHUSDT', 'JOEUSDT'],
      default: 'AVAXUSDT',
    },
  ]

  async execute(
    inputs: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    if (!inputs.signal) return {}

    const label = (this.config.label as string) || 'Swap'
    const color = (this.config.color as string) || '#22c55e'
    const shape = (this.config.shape as 'arrowUp' | 'arrowDown' | 'circle') || 'arrowUp'
    const useCurrentPrice = !!this.config.useCurrentPrice
    const priceSymbol = (this.config.priceSymbol as string) || 'AVAXUSDT'

    const time = context.backtestCandle?.time ?? Math.floor(Date.now() / 1000)

    // Resolve price: toggle → fetch Binance ticker, else use price input
    let price: number | undefined = inputs.price as number | undefined
    if (useCurrentPrice) {
      try {
        const res = await fetch(
          `https://api.binance.com/api/v3/ticker/price?symbol=${priceSymbol}`
        )
        const data = await res.json() as { price: string }
        price = parseFloat(data.price)
        context.addLog(`[Marker] Current price ${priceSymbol}: ${price}`)
      } catch {
        context.addLog(`[Marker] Failed to fetch current price, marker placed without price`, 'warn')
      }
    }

    context.addChartMarker({ time, label, color, shape })
    context.addLog(`[Marker] Added "${label}" marker at ${new Date().toLocaleTimeString()}${price !== undefined ? ` @ ${price}` : ''}`)

    return { price: price ?? null }
  }
}
