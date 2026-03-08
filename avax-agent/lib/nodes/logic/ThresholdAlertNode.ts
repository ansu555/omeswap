import { BaseNode } from '../BaseNode'
import type { HandleDef, ConfigField, ExecutionContext } from '@/types'

export class ThresholdAlertNode extends BaseNode {
  readonly type = 'threshold'
  readonly label = 'Threshold Alert'
  readonly description = 'Triggers when a value crosses a threshold'
  readonly icon = 'Bell'
  readonly category = 'logic' as const
  readonly color = 'border-yellow-500'
  readonly bgColor = 'bg-yellow-950'

  readonly handles: HandleDef[] = [
    { id: 'value', label: 'Value', position: 'left', type: 'target', dataType: 'number' },
    { id: 'triggered', label: 'Triggered', position: 'right', type: 'source', dataType: 'boolean' },
  ]

  readonly configSchema: ConfigField[] = [
    {
      key: 'direction',
      label: 'Direction',
      type: 'select',
      options: ['above', 'below'],
      default: 'above',
    },
    {
      key: 'threshold',
      label: 'Threshold Value',
      type: 'number',
      default: 0,
    },
  ]

  async execute(
    inputs: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    const value = inputs.value as number
    const direction = (this.config.direction as string) || 'above'
    const threshold = (this.config.threshold as number) ?? 0

    const triggered =
      direction === 'above' ? value > threshold : value < threshold

    context.addLog(
      `[Threshold] ${value} is ${direction} ${threshold}? ${triggered}`
    )

    return { triggered }
  }
}
