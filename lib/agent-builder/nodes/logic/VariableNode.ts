import { BaseNode } from '../BaseNode'
import type { HandleDef, ConfigField, ExecutionContext } from '@/types/agent-builder-canvas'

export class VariableNode extends BaseNode {
  readonly type = 'variable'
  readonly label = 'Variable'
  readonly description = 'Passes through an input value, or emits a constant if no input is connected'
  readonly icon = 'Braces'
  readonly category = 'logic' as const
  readonly color = 'border-yellow-500'
  readonly bgColor = 'bg-yellow-950'

  readonly handles: HandleDef[] = [
    { id: 'value', label: 'Value In', position: 'left', type: 'target', dataType: 'any' },
    { id: 'value', label: 'Value Out', position: 'right', type: 'source', dataType: 'any' },
  ]

  readonly configSchema: ConfigField[] = [
    {
      key: 'constantType',
      label: 'Constant Type',
      type: 'select',
      options: ['number', 'string', 'boolean'],
      default: 'number',
    },
    {
      key: 'constantValue',
      label: 'Constant Value',
      type: 'text',
      default: '0',
      placeholder: 'Used when no input connected',
    },
  ]

  async execute(
    inputs: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    // If an upstream node provided a value, pass it through
    if (inputs.value !== undefined && inputs.value !== null) {
      context.addLog(`[Variable] Passing through: ${inputs.value}`)
      return { value: inputs.value }
    }

    // Otherwise use the constant
    const raw = (this.config.constantValue as string) ?? '0'
    const type = (this.config.constantType as string) ?? 'number'

    let value: unknown
    if (type === 'number') {
      value = parseFloat(raw)
      if (isNaN(value as number)) value = 0
    } else if (type === 'boolean') {
      value = raw === 'true' || raw === '1'
    } else {
      value = raw
    }

    context.addLog(`[Variable] Emitting constant: ${value}`)
    return { value }
  }
}
