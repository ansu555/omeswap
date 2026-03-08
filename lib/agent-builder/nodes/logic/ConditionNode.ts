import { BaseNode } from '../BaseNode'
import type { HandleDef, ConfigField, ExecutionContext } from '@/types/agent-builder-canvas'

type Operator = '>' | '<' | '>=' | '<=' | '==' | '!='

export class ConditionNode extends BaseNode {
  readonly type = 'condition'
  readonly label = 'Condition'
  readonly description = 'Branches flow based on a numeric comparison'
  readonly icon = 'GitBranch'
  readonly category = 'logic' as const
  readonly color = 'border-yellow-500'
  readonly bgColor = 'bg-yellow-950'

  readonly handles: HandleDef[] = [
    { id: 'value',     label: 'Value',     position: 'left',  type: 'target', dataType: 'number' },
    { id: 'threshold', label: 'Threshold', position: 'left',  type: 'target', dataType: 'number' },
    { id: 'true',      label: 'True',      position: 'right', type: 'source', dataType: 'signal' },
    { id: 'false',     label: 'False',     position: 'right', type: 'source', dataType: 'signal' },
  ]

  readonly configSchema: ConfigField[] = [
    {
      key: 'operator',
      label: 'Operator',
      type: 'select',
      options: ['>', '<', '>=', '<=', '==', '!='],
      default: '>',
    },
    {
      key: 'threshold',
      label: 'Threshold',
      type: 'number',
      default: 0,
    },
  ]

  async execute(
    inputs: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    const value = inputs.value as number
    const operator = (this.config.operator as Operator) || '>'
    // Use connected input first, fall back to config value
    const threshold = inputs.threshold !== undefined
      ? (inputs.threshold as number)
      : ((this.config.threshold as number) ?? 0)

    const ops: Record<Operator, (a: number, b: number) => boolean> = {
      '>': (a, b) => a > b,
      '<': (a, b) => a < b,
      '>=': (a, b) => a >= b,
      '<=': (a, b) => a <= b,
      '==': (a, b) => a === b,
      '!=': (a, b) => a !== b,
    }

    const result = ops[operator](value, threshold)
    context.addLog(`[Condition] ${value} ${operator} ${threshold} → ${result}`)

    return { true: result ? 'signal' : null, false: !result ? 'signal' : null }
  }
}
