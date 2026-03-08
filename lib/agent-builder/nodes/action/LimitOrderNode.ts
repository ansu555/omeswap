import { BaseNode } from '../BaseNode'
import type { HandleDef, ConfigField, ExecutionContext } from '@/types/agent-builder-canvas'

export class LimitOrderNode extends BaseNode {
  readonly type = 'limit_order'
  readonly label = 'Limit Order'
  readonly description = 'Triggers a swap when price hits a target'
  readonly icon = 'Target'
  readonly category = 'action' as const
  readonly color = 'border-green-500'
  readonly bgColor = 'bg-green-950'

  readonly handles: HandleDef[] = [
    { id: 'price', label: 'Current Price', position: 'left', type: 'target', dataType: 'number' },
    { id: 'executed', label: 'Executed', position: 'right', type: 'source', dataType: 'boolean' },
  ]

  readonly configSchema: ConfigField[] = [
    {
      key: 'targetPrice',
      label: 'Target Price',
      type: 'number',
      default: 0,
    },
    {
      key: 'direction',
      label: 'Trigger When',
      type: 'select',
      options: ['price_above', 'price_below'],
      default: 'price_below',
    },
    {
      key: 'tokenIn',
      label: 'Token In',
      type: 'select',
      options: ['WAVAX', 'USDC.e', 'USDT.e', 'JOE', 'PNG'],
      default: 'WAVAX',
    },
    {
      key: 'tokenOut',
      label: 'Token Out',
      type: 'select',
      options: ['WAVAX', 'USDC.e', 'USDT.e', 'JOE', 'PNG'],
      default: 'USDC.e',
    },
  ]

  async execute(
    inputs: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    const currentPrice = inputs.price as number
    const targetPrice = (this.config.targetPrice as number) || 0
    const direction = (this.config.direction as string) || 'price_below'

    const shouldExecute =
      direction === 'price_below'
        ? currentPrice <= targetPrice
        : currentPrice >= targetPrice

    context.addLog(
      `[LimitOrder] Price ${currentPrice}, target ${targetPrice} (${direction}) → execute: ${shouldExecute}`
    )

    return { executed: shouldExecute }
  }
}
