import { BaseNode } from '../BaseNode'
import type { HandleDef, ConfigField, ExecutionContext } from '@/types/agent-builder-canvas'

export class PreviousValueNode extends BaseNode {
  readonly type = 'previous_value'
  readonly label = 'Previous Value'
  readonly description = 'Remembers the last input value across runs. Outputs the previous value on each tick after the first.'
  readonly icon = 'History'
  readonly category = 'logic' as const
  readonly color = 'border-yellow-500'
  readonly bgColor = 'bg-yellow-950'

  readonly handles: HandleDef[] = [
    { id: 'value',    label: 'Current',  position: 'left',  type: 'target', dataType: 'number' },
    { id: 'previous', label: 'Previous', position: 'right', type: 'source', dataType: 'number' },
    { id: 'current',  label: 'Current',  position: 'right', type: 'source', dataType: 'number' },
  ]

  readonly configSchema: ConfigField[] = []

  async execute(
    inputs: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    const current = inputs.value as number

    if (current === undefined || current === null) {
      context.addLog('[PrevValue] No input received', 'warn')
      return {}
    }

    const previous = this.config._stored as number | undefined

    // Store current for next run
    this.config._stored = current

    if (previous === undefined) {
      context.addLog(`[PrevValue] First run — stored ${current}, waiting for next tick`)
      // Don't emit — no previous value yet
      return {}
    }

    context.addLog(`[PrevValue] previous=${previous}  current=${current}`)
    return { previous, current }
  }
}
