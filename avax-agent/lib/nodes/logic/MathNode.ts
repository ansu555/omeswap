import { BaseNode } from '../BaseNode'
import type { HandleDef, ConfigField, ExecutionContext } from '@/types'

type Operation = 'add' | 'subtract' | 'multiply' | 'divide' | 'percent'

export class MathNode extends BaseNode {
  readonly type = 'math'
  readonly label = 'Math'
  readonly description = 'Performs arithmetic on two numeric inputs'
  readonly icon = 'Calculator'
  readonly category = 'logic' as const
  readonly color = 'border-yellow-500'
  readonly bgColor = 'bg-yellow-950'

  readonly handles: HandleDef[] = [
    { id: 'a', label: 'A', position: 'left', type: 'target', dataType: 'number' },
    { id: 'b', label: 'B', position: 'left', type: 'target', dataType: 'number' },
    { id: 'result', label: 'Result', position: 'right', type: 'source', dataType: 'number' },
  ]

  readonly configSchema: ConfigField[] = [
    {
      key: 'operation',
      label: 'Operation',
      type: 'select',
      options: ['add', 'subtract', 'multiply', 'divide', 'percent'],
      default: 'add',
    },
  ]

  async execute(
    inputs: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    const a = (inputs.a as number) ?? 0
    const b = (inputs.b as number) ?? 0
    const operation = (this.config.operation as Operation) || 'add'

    const ops: Record<Operation, (a: number, b: number) => number> = {
      add: (a, b) => a + b,
      subtract: (a, b) => a - b,
      multiply: (a, b) => a * b,
      divide: (a, b) => (b !== 0 ? a / b : 0),
      percent: (a, b) => (a / 100) * b,
    }

    const result = ops[operation](a, b)
    context.addLog(`[Math] ${a} ${operation} ${b} = ${result}`)
    return { result }
  }
}
