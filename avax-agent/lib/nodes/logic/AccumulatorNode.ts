import { BaseNode } from '../BaseNode'
import type { HandleDef, ConfigField, ExecutionContext } from '@/types'

export class AccumulatorNode extends BaseNode {
  readonly type = 'accumulator'
  readonly label = 'Accumulator'
  readonly description = 'Counts consecutive ticks where the condition holds (e.g. rising price). Resets to 0 when condition breaks.'
  readonly icon = 'BarChart2'
  readonly category = 'logic' as const
  readonly color = 'border-yellow-500'
  readonly bgColor = 'bg-yellow-950'

  readonly handles: HandleDef[] = [
    { id: 'value',     label: 'Value',     position: 'left',  type: 'target', dataType: 'number' },
    { id: 'count',     label: 'Count',     position: 'right', type: 'source', dataType: 'number' },
    { id: 'triggered', label: 'Triggered', position: 'right', type: 'source', dataType: 'signal' },
  ]

  readonly configSchema: ConfigField[] = [
    {
      key: 'mode',
      label: 'Mode',
      type: 'select',
      options: ['rising', 'falling', 'above', 'below'],
      default: 'rising',
    },
    {
      key: 'threshold',
      label: 'Threshold (above/below mode)',
      type: 'number',
      default: 0,
    },
    {
      key: 'triggerAt',
      label: 'Trigger after N consecutive ticks',
      type: 'number',
      default: 3,
    },
  ]

  async execute(
    inputs: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    const value = inputs.value as number
    if (value === undefined || value === null) {
      context.addLog('[Accumulator] No input', 'warn')
      return { count: 0, triggered: null }
    }

    const mode = (this.config.mode as string) || 'rising'
    const threshold = (this.config.threshold as number) ?? 0
    const triggerAt = (this.config.triggerAt as number) ?? 3

    const prev = this.config._prev as number | undefined
    let count = (this.config._count as number) ?? 0

    let conditionMet = false
    if (mode === 'rising') {
      conditionMet = prev !== undefined && value > prev
    } else if (mode === 'falling') {
      conditionMet = prev !== undefined && value < prev
    } else if (mode === 'above') {
      conditionMet = value > threshold
    } else if (mode === 'below') {
      conditionMet = value < threshold
    }

    if (conditionMet) {
      count++
    } else {
      count = 0
    }

    // Store state for next tick
    this.config._prev = value
    this.config._count = count

    const triggered = count >= triggerAt ? 'signal' : null
    context.addLog(`[Accumulator] mode=${mode} count=${count}/${triggerAt} → ${triggered ? 'TRIGGERED' : 'waiting'}`)

    return { count, triggered }
  }
}
