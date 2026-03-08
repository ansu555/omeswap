import { BaseNode } from '../BaseNode'
import type { HandleDef, ConfigField, ExecutionContext } from '@/types/agent-builder-canvas'

export class StartNode extends BaseNode {
  readonly type = 'start'
  readonly label = 'Start'
  readonly description = 'Entry point of the bot flow'
  readonly icon = 'Play'
  readonly category = 'flow' as const
  readonly color = 'border-gray-400'
  readonly bgColor = 'bg-gray-800'

  readonly handles: HandleDef[] = [
    { id: 'signal', label: 'Out', position: 'right', type: 'source', dataType: 'signal' },
  ]

  readonly configSchema: ConfigField[] = []

  async execute(
    _inputs: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    context.addLog('[Start] Bot started')
    return { signal: 'signal' }
  }
}
