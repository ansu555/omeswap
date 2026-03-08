import { BaseNode } from '../BaseNode'
import type { HandleDef, ConfigField, ExecutionContext } from '@/types/agent-builder-canvas'

export class MovingAverageNode extends BaseNode {
  readonly type = 'moving_average'
  readonly label = 'Moving Average'
  readonly description = 'Calculates SMA or EMA over N ticks. Outputs the MA value and a crossover signal when price crosses the MA.'
  readonly icon = 'Activity'
  readonly category = 'logic' as const
  readonly color = 'border-yellow-500'
  readonly bgColor = 'bg-yellow-950'

  readonly handles: HandleDef[] = [
    { id: 'value',     label: 'Price',       position: 'left',  type: 'target', dataType: 'number' },
    { id: 'ma',        label: 'MA Value',    position: 'right', type: 'source', dataType: 'number' },
    { id: 'crossUp',   label: 'Cross Up',    position: 'right', type: 'source', dataType: 'signal' },
    { id: 'crossDown', label: 'Cross Down',  position: 'right', type: 'source', dataType: 'signal' },
    { id: 'aboveMA',   label: 'Above MA',    position: 'right', type: 'source', dataType: 'signal' },
    { id: 'belowMA',   label: 'Below MA',    position: 'right', type: 'source', dataType: 'signal' },
  ]

  readonly configSchema: ConfigField[] = [
    {
      key: 'type',
      label: 'MA Type',
      type: 'select',
      options: ['SMA', 'EMA'],
      default: 'SMA',
    },
    {
      key: 'period',
      label: 'Period (ticks)',
      type: 'number',
      default: 14,
    },
  ]

  async execute(
    inputs: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    const value = inputs.value as number
    if (value === undefined || value === null) {
      context.addLog('[MA] No input', 'warn')
      return {}
    }

    const maType = (this.config.type as string) || 'SMA'
    const period = Math.max(1, (this.config.period as number) || 14)

    // Rolling buffer of prices
    const buffer = ((this.config._buffer as number[]) ?? []).concat(value)
    if (buffer.length > period) buffer.shift()
    this.config._buffer = buffer

    const prevMA = this.config._prevMA as number | undefined

    let ma: number | null = null

    if (maType === 'SMA') {
      if (buffer.length < period) {
        context.addLog(`[MA] Warming up SMA: ${buffer.length}/${period} ticks`)
        this.config._prevMA = undefined
        return {}
      }
      ma = buffer.reduce((sum, v) => sum + v, 0) / period

    } else {
      // EMA: needs at least 1 value; seeds from first price
      const k = 2 / (period + 1)
      if (prevMA === undefined) {
        // First tick — seed EMA with current price
        ma = value
      } else {
        ma = value * k + prevMA * (1 - k)
      }
    }

    this.config._prevMA = ma

    // Crossover detection
    const prevAbove = this.config._prevAbove as boolean | undefined
    const currentAbove = value > ma
    let crossUp: string | null = null
    let crossDown: string | null = null

    if (prevAbove !== undefined) {
      if (!prevAbove && currentAbove) crossUp = 'signal'
      if (prevAbove && !currentAbove) crossDown = 'signal'
    }
    this.config._prevAbove = currentAbove

    context.addLog(
      `[MA] ${maType}(${period}) = ${ma.toFixed(4)}  price ${value}  ${crossUp ? '↑ CROSS UP' : crossDown ? '↓ CROSS DOWN' : currentAbove ? 'above' : 'below'}`
    )

    return {
      ma,
      crossUp,
      crossDown,
      aboveMA: currentAbove ? 'signal' : null,
      belowMA: !currentAbove ? 'signal' : null,
    }
  }
}
