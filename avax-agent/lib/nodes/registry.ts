import { BaseNode } from './BaseNode'
import { PriceFeedNode } from './data/PriceFeedNode'
import { WalletBalanceNode } from './data/WalletBalanceNode'
import { DEXPriceNode } from './data/DEXPriceNode'
import { ConditionNode } from './logic/ConditionNode'
import { ThresholdAlertNode } from './logic/ThresholdAlertNode'
import { MathNode } from './logic/MathNode'
import { DelayNode } from './logic/DelayNode'
import { VariableNode } from './logic/VariableNode'
import { PreviousValueNode } from './logic/PreviousValueNode'
import { AccumulatorNode } from './logic/AccumulatorNode'
import { MovingAverageNode } from './logic/MovingAverageNode'
import { SwapNode } from './action/SwapNode'
import { LimitOrderNode } from './action/LimitOrderNode'
import { NotificationNode } from './action/NotificationNode'
import { AddChartMarkerNode } from './action/AddChartMarkerNode'
import { StartNode } from './flow/StartNode'
import { EndNode } from './flow/EndNode'
import { MergeNode } from './flow/MergeNode'
import { ScheduleTriggerNode } from './flow/ScheduleTriggerNode'
import type { NodeCategory } from '@/types'

export interface NodeRegistryEntry {
  cls: new (id: string) => BaseNode
  // Metadata snapshot for the palette (before instantiation)
  meta: {
    type: string
    label: string
    description: string
    icon: string
    category: NodeCategory
    color: string
    bgColor: string
  }
}

// Create one instance to read static metadata (no side effects in constructor)
function meta(cls: new (id: string) => BaseNode): NodeRegistryEntry['meta'] {
  const inst = new cls('__meta__')
  return {
    type: inst.type,
    label: inst.label,
    description: inst.description,
    icon: inst.icon,
    category: inst.category,
    color: inst.color,
    bgColor: inst.bgColor,
  }
}

export const NODE_REGISTRY: Record<string, NodeRegistryEntry> = {
  price_feed:     { cls: PriceFeedNode,     meta: meta(PriceFeedNode) },
  wallet_balance: { cls: WalletBalanceNode, meta: meta(WalletBalanceNode) },
  dex_price:      { cls: DEXPriceNode,      meta: meta(DEXPriceNode) },
  condition:      { cls: ConditionNode,     meta: meta(ConditionNode) },
  threshold:      { cls: ThresholdAlertNode, meta: meta(ThresholdAlertNode) },
  math:           { cls: MathNode,          meta: meta(MathNode) },
  delay:          { cls: DelayNode,         meta: meta(DelayNode) },
  variable:       { cls: VariableNode,      meta: meta(VariableNode) },
  previous_value:  { cls: PreviousValueNode,  meta: meta(PreviousValueNode) },
  accumulator:     { cls: AccumulatorNode,    meta: meta(AccumulatorNode) },
  moving_average:  { cls: MovingAverageNode,  meta: meta(MovingAverageNode) },
  swap:           { cls: SwapNode,          meta: meta(SwapNode) },
  limit_order:    { cls: LimitOrderNode,    meta: meta(LimitOrderNode) },
  notification:     { cls: NotificationNode,     meta: meta(NotificationNode) },
  add_chart_marker: { cls: AddChartMarkerNode,  meta: meta(AddChartMarkerNode) },
  start:            { cls: StartNode,            meta: meta(StartNode) },
  end:              { cls: EndNode,              meta: meta(EndNode) },
  merge:            { cls: MergeNode,            meta: meta(MergeNode) },
  schedule_trigger: { cls: ScheduleTriggerNode,  meta: meta(ScheduleTriggerNode) },
}

export function createNodeInstance(type: string, id: string): BaseNode {
  const entry = NODE_REGISTRY[type]
  if (!entry) throw new Error(`Unknown node type: ${type}`)
  const inst = new entry.cls(id)
  inst.init()
  return inst
}

export const PALETTE_NODES = Object.values(NODE_REGISTRY).map((e) => e.meta)

export const CATEGORY_LABELS: Record<NodeCategory, string> = {
  data: 'Data Sources',
  logic: 'Logic',
  action: 'Actions',
  flow: 'Flow Control',
}
