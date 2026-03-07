import { BaseNode } from '../BaseNode'
import type { HandleDef, ConfigField, ExecutionContext } from '@/types'

export class MergeNode extends BaseNode {
  readonly type = 'merge'
  readonly label = 'Merge'
  readonly description = 'Waits for both inputs before emitting signal'
  readonly icon = 'Merge'
  readonly category = 'flow' as const
  readonly color = 'border-gray-400'
  readonly bgColor = 'bg-gray-800'

  readonly handles: HandleDef[] = [
    { id: 'a', label: 'A', position: 'left', type: 'target', dataType: 'any' },
    { id: 'b', label: 'B', position: 'left', type: 'target', dataType: 'any' },
    { id: 'signal', label: 'Out', position: 'right', type: 'source', dataType: 'signal' },
  ]

  readonly configSchema: ConfigField[] = []

  private received: Set<string> = new Set()

  async execute(
    inputs: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    if (inputs.a !== undefined) this.received.add('a')
    if (inputs.b !== undefined) this.received.add('b')

    const ready = this.received.has('a') && this.received.has('b')
    context.addLog(`[Merge] Received: ${[...this.received].join(', ')} — ready: ${ready}`)

    if (ready) {
      this.received.clear()
      return { signal: 'signal' }
    }

    return {}
  }
}
