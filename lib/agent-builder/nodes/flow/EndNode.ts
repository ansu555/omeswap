import { BaseNode } from '../BaseNode'
import type { HandleDef, ConfigField, ExecutionContext } from '@/types/agent-builder-canvas'

export class EndNode extends BaseNode {
  readonly type = 'end'
  readonly label = 'End'
  readonly description = 'Terminal node — flow stops here'
  readonly icon = 'Square'
  readonly category = 'flow' as const
  readonly color = 'border-gray-400'
  readonly bgColor = 'bg-gray-800'

  readonly handles: HandleDef[] = [
    { id: 'signal', label: 'In', position: 'left', type: 'target', dataType: 'any' },
  ]

  readonly configSchema: ConfigField[] = []

  async execute(
    _inputs: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    context.addLog('[End] Flow complete')
    return {}
  }
}
