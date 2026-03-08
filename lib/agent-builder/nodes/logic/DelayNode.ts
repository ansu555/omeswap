import { BaseNode } from '../BaseNode'
import type { HandleDef, ConfigField, ExecutionContext } from '@/types/agent-builder-canvas'

export class DelayNode extends BaseNode {
  readonly type = 'delay'
  readonly label = 'Delay'
  readonly description = 'Waits N seconds before passing the signal'
  readonly icon = 'Timer'
  readonly category = 'logic' as const
  readonly color = 'border-yellow-500'
  readonly bgColor = 'bg-yellow-950'

  readonly handles: HandleDef[] = [
    { id: 'signal', label: 'In', position: 'left', type: 'target', dataType: 'signal' },
    { id: 'signal_out', label: 'Out', position: 'right', type: 'source', dataType: 'signal' },
  ]

  readonly configSchema: ConfigField[] = [
    {
      key: 'seconds',
      label: 'Delay (seconds)',
      type: 'number',
      default: 5,
    },
  ]

  async execute(
    inputs: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    const seconds = (this.config.seconds as number) || 5
    context.addLog(`[Delay] Waiting ${seconds}s...`)
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000))
    context.addLog(`[Delay] Done waiting`)
    return { signal_out: inputs.signal }
  }
}
