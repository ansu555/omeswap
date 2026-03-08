import type { Node, Edge } from '@xyflow/react'

export type WorkflowTemplate = {
  id: string
  name: string
  description: string
  tags: string[]
  nodes: Node[]
  edges: Edge[]
  configs: Record<string, Record<string, unknown>>
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  // ─────────────────────────────────────────────
  // 1. BTC Momentum Tracker
  // ─────────────────────────────────────────────
  {
    id: 'tpl_momentum',
    name: 'BTC Momentum Tracker',
    description: 'Fetches BTC price every 10s. Marks chart green when price is rising, red when falling.',
    tags: ['beginner', 'chart', 'btc'],
    nodes: [
      {
        id: 'schedule_trigger_1', type: 'avaxNode', position: { x: -260, y: 0 },
        data: { nodeType: 'schedule_trigger', label: 'Schedule Trigger', icon: 'Clock', category: 'flow', color: 'border-orange-400', bgColor: 'bg-orange-950', handles: [{ id: 'signal', label: 'Out', position: 'right', type: 'source', dataType: 'signal' }], status: 'idle' },
      },
      {
        id: 'price_feed_2', type: 'avaxNode', position: { x: -60, y: 0 },
        data: { nodeType: 'price_feed', label: 'Price Feed', icon: 'TrendingUp', category: 'data', color: 'border-blue-500', bgColor: 'bg-blue-950', handles: [{ id: 'price', label: 'Price', position: 'right', type: 'source', dataType: 'number' }], status: 'idle' },
      },
      {
        id: 'previous_value_3', type: 'avaxNode', position: { x: 180, y: 0 },
        data: { nodeType: 'previous_value', label: 'Previous Value', icon: 'History', category: 'logic', color: 'border-yellow-500', bgColor: 'bg-yellow-950', handles: [{ id: 'value', label: 'Current', position: 'left', type: 'target', dataType: 'number' }, { id: 'previous', label: 'Previous', position: 'right', type: 'source', dataType: 'number' }, { id: 'current', label: 'Current', position: 'right', type: 'source', dataType: 'number' }], status: 'idle' },
      },
      {
        id: 'condition_4', type: 'avaxNode', position: { x: 420, y: 0 },
        data: { nodeType: 'condition', label: 'Condition', icon: 'GitBranch', category: 'logic', color: 'border-yellow-500', bgColor: 'bg-yellow-950', handles: [{ id: 'value', label: 'Value', position: 'left', type: 'target', dataType: 'number' }, { id: 'threshold', label: 'Threshold', position: 'left', type: 'target', dataType: 'number' }, { id: 'true', label: 'True', position: 'right', type: 'source', dataType: 'signal' }, { id: 'false', label: 'False', position: 'right', type: 'source', dataType: 'signal' }], status: 'idle' },
      },
      {
        id: 'add_chart_marker_5', type: 'avaxNode', position: { x: 660, y: -60 },
        data: { nodeType: 'add_chart_marker', label: 'Add Chart Marker', icon: 'MapPin', category: 'action', color: 'border-purple-500', bgColor: 'bg-purple-950', handles: [{ id: 'signal', label: 'Signal', position: 'left', type: 'target', dataType: 'signal' }, { id: 'price', label: 'Price', position: 'left', type: 'target', dataType: 'number' }], status: 'idle' },
      },
      {
        id: 'add_chart_marker_6', type: 'avaxNode', position: { x: 660, y: 60 },
        data: { nodeType: 'add_chart_marker', label: 'Add Chart Marker', icon: 'MapPin', category: 'action', color: 'border-purple-500', bgColor: 'bg-purple-950', handles: [{ id: 'signal', label: 'Signal', position: 'left', type: 'target', dataType: 'signal' }, { id: 'price', label: 'Price', position: 'left', type: 'target', dataType: 'number' }], status: 'idle' },
      },
    ],
    edges: [
      { id: 'e1', source: 'price_feed_2', sourceHandle: 'price', target: 'previous_value_3', targetHandle: 'value', animated: true },
      { id: 'e2', source: 'previous_value_3', sourceHandle: 'current', target: 'condition_4', targetHandle: 'value', animated: true },
      { id: 'e3', source: 'previous_value_3', sourceHandle: 'previous', target: 'condition_4', targetHandle: 'threshold', animated: true },
      { id: 'e4', source: 'condition_4', sourceHandle: 'true', target: 'add_chart_marker_5', targetHandle: 'signal', animated: true },
      { id: 'e5', source: 'condition_4', sourceHandle: 'false', target: 'add_chart_marker_6', targetHandle: 'signal', animated: true },
    ],
    configs: {
      schedule_trigger_1: { interval: 10, maxRuns: 0 },
      price_feed_2: { tokenId: 'bitcoin', currency: 'usd' },
      previous_value_3: {},
      condition_4: { operator: '>', threshold: 0 },
      add_chart_marker_5: { label: 'Rising', color: '#22c55e', shape: 'arrowUp', useCurrentPrice: true, priceSymbol: 'BTCUSDT' },
      add_chart_marker_6: { label: 'Falling', color: '#ef4444', shape: 'arrowDown', useCurrentPrice: true, priceSymbol: 'BTCUSDT' },
    },
  },

  // ─────────────────────────────────────────────
  // 2. MA Crossover Signal
  // ─────────────────────────────────────────────
  {
    id: 'tpl_ma_crossover',
    name: 'MA Crossover Signal',
    description: 'Tracks BTC every 30s. Emits a Buy signal when price crosses above SMA-20, Sell when it crosses below.',
    tags: ['intermediate', 'chart', 'btc', 'sma'],
    nodes: [
      {
        id: 'schedule_trigger_1', type: 'avaxNode', position: { x: -260, y: 0 },
        data: { nodeType: 'schedule_trigger', label: 'Schedule Trigger', icon: 'Clock', category: 'flow', color: 'border-orange-400', bgColor: 'bg-orange-950', handles: [{ id: 'signal', label: 'Out', position: 'right', type: 'source', dataType: 'signal' }], status: 'idle' },
      },
      {
        id: 'price_feed_2', type: 'avaxNode', position: { x: -60, y: 0 },
        data: { nodeType: 'price_feed', label: 'Price Feed', icon: 'TrendingUp', category: 'data', color: 'border-blue-500', bgColor: 'bg-blue-950', handles: [{ id: 'price', label: 'Price', position: 'right', type: 'source', dataType: 'number' }], status: 'idle' },
      },
      {
        id: 'moving_average_3', type: 'avaxNode', position: { x: 180, y: 0 },
        data: { nodeType: 'moving_average', label: 'Moving Average', icon: 'Activity', category: 'logic', color: 'border-yellow-500', bgColor: 'bg-yellow-950', handles: [{ id: 'value', label: 'Price', position: 'left', type: 'target', dataType: 'number' }, { id: 'ma', label: 'MA Value', position: 'right', type: 'source', dataType: 'number' }, { id: 'crossUp', label: 'Cross Up', position: 'right', type: 'source', dataType: 'signal' }, { id: 'crossDown', label: 'Cross Down', position: 'right', type: 'source', dataType: 'signal' }, { id: 'aboveMA', label: 'Above MA', position: 'right', type: 'source', dataType: 'signal' }, { id: 'belowMA', label: 'Below MA', position: 'right', type: 'source', dataType: 'signal' }], status: 'idle' },
      },
      {
        id: 'add_chart_marker_4', type: 'avaxNode', position: { x: 460, y: -80 },
        data: { nodeType: 'add_chart_marker', label: 'Add Chart Marker', icon: 'MapPin', category: 'action', color: 'border-purple-500', bgColor: 'bg-purple-950', handles: [{ id: 'signal', label: 'Signal', position: 'left', type: 'target', dataType: 'signal' }, { id: 'price', label: 'Price', position: 'left', type: 'target', dataType: 'number' }], status: 'idle' },
      },
      {
        id: 'add_chart_marker_5', type: 'avaxNode', position: { x: 460, y: 40 },
        data: { nodeType: 'add_chart_marker', label: 'Add Chart Marker', icon: 'MapPin', category: 'action', color: 'border-purple-500', bgColor: 'bg-purple-950', handles: [{ id: 'signal', label: 'Signal', position: 'left', type: 'target', dataType: 'signal' }, { id: 'price', label: 'Price', position: 'left', type: 'target', dataType: 'number' }], status: 'idle' },
      },
      {
        id: 'notification_6', type: 'avaxNode', position: { x: 460, y: 160 },
        data: { nodeType: 'notification', label: 'Notification', icon: 'Bell', category: 'action', color: 'border-green-500', bgColor: 'bg-green-950', handles: [{ id: 'signal', label: 'Signal', position: 'left', type: 'target', dataType: 'signal' }], status: 'idle' },
      },
    ],
    edges: [
      { id: 'e1', source: 'price_feed_2', sourceHandle: 'price', target: 'moving_average_3', targetHandle: 'value', animated: true },
      { id: 'e2', source: 'moving_average_3', sourceHandle: 'crossUp', target: 'add_chart_marker_4', targetHandle: 'signal', animated: true },
      { id: 'e3', source: 'moving_average_3', sourceHandle: 'crossDown', target: 'add_chart_marker_5', targetHandle: 'signal', animated: true },
      { id: 'e4', source: 'moving_average_3', sourceHandle: 'crossUp', target: 'notification_6', targetHandle: 'signal', animated: true },
    ],
    configs: {
      schedule_trigger_1: { interval: 30, maxRuns: 0 },
      price_feed_2: { tokenId: 'bitcoin', currency: 'usd' },
      moving_average_3: { type: 'SMA', period: 20 },
      add_chart_marker_4: { label: 'Buy Signal', color: '#22c55e', shape: 'arrowUp', useCurrentPrice: true, priceSymbol: 'BTCUSDT' },
      add_chart_marker_5: { label: 'Sell Signal', color: '#ef4444', shape: 'arrowDown', useCurrentPrice: true, priceSymbol: 'BTCUSDT' },
      notification_6: { message: 'MA Crossover Buy Signal detected!', type: 'toast' },
    },
  },

  // ─────────────────────────────────────────────
  // 3. Momentum Confirmed Buy
  // ─────────────────────────────────────────────
  {
    id: 'tpl_momentum_confirmed',
    name: 'Momentum Confirmed Buy',
    description: 'Only fires after 3 consecutive rising ticks — filters single-tick noise. Marks chart and notifies on strong momentum.',
    tags: ['intermediate', 'accumulator', 'btc'],
    nodes: [
      {
        id: 'schedule_trigger_1', type: 'avaxNode', position: { x: -260, y: 0 },
        data: { nodeType: 'schedule_trigger', label: 'Schedule Trigger', icon: 'Clock', category: 'flow', color: 'border-orange-400', bgColor: 'bg-orange-950', handles: [{ id: 'signal', label: 'Out', position: 'right', type: 'source', dataType: 'signal' }], status: 'idle' },
      },
      {
        id: 'price_feed_2', type: 'avaxNode', position: { x: -60, y: 0 },
        data: { nodeType: 'price_feed', label: 'Price Feed', icon: 'TrendingUp', category: 'data', color: 'border-blue-500', bgColor: 'bg-blue-950', handles: [{ id: 'price', label: 'Price', position: 'right', type: 'source', dataType: 'number' }], status: 'idle' },
      },
      {
        id: 'accumulator_3', type: 'avaxNode', position: { x: 180, y: 0 },
        data: { nodeType: 'accumulator', label: 'Accumulator', icon: 'BarChart2', category: 'logic', color: 'border-yellow-500', bgColor: 'bg-yellow-950', handles: [{ id: 'value', label: 'Value', position: 'left', type: 'target', dataType: 'number' }, { id: 'count', label: 'Count', position: 'right', type: 'source', dataType: 'number' }, { id: 'triggered', label: 'Triggered', position: 'right', type: 'source', dataType: 'signal' }], status: 'idle' },
      },
      {
        id: 'add_chart_marker_4', type: 'avaxNode', position: { x: 420, y: -60 },
        data: { nodeType: 'add_chart_marker', label: 'Add Chart Marker', icon: 'MapPin', category: 'action', color: 'border-purple-500', bgColor: 'bg-purple-950', handles: [{ id: 'signal', label: 'Signal', position: 'left', type: 'target', dataType: 'signal' }, { id: 'price', label: 'Price', position: 'left', type: 'target', dataType: 'number' }], status: 'idle' },
      },
      {
        id: 'notification_5', type: 'avaxNode', position: { x: 420, y: 60 },
        data: { nodeType: 'notification', label: 'Notification', icon: 'Bell', category: 'action', color: 'border-green-500', bgColor: 'bg-green-950', handles: [{ id: 'signal', label: 'Signal', position: 'left', type: 'target', dataType: 'signal' }], status: 'idle' },
      },
    ],
    edges: [
      { id: 'e1', source: 'price_feed_2', sourceHandle: 'price', target: 'accumulator_3', targetHandle: 'value', animated: true },
      { id: 'e2', source: 'accumulator_3', sourceHandle: 'triggered', target: 'add_chart_marker_4', targetHandle: 'signal', animated: true },
      { id: 'e3', source: 'accumulator_3', sourceHandle: 'triggered', target: 'notification_5', targetHandle: 'signal', animated: true },
    ],
    configs: {
      schedule_trigger_1: { interval: 15, maxRuns: 0 },
      price_feed_2: { tokenId: 'bitcoin', currency: 'usd' },
      accumulator_3: { mode: 'rising', threshold: 0, triggerAt: 3 },
      add_chart_marker_4: { label: 'Strong Buy', color: '#3b82f6', shape: 'arrowUp', useCurrentPrice: true, priceSymbol: 'BTCUSDT' },
      notification_5: { message: '3 consecutive rising ticks — strong momentum!', type: 'toast' },
    },
  },

  // ─────────────────────────────────────────────
  // 4. DCA Bot (Dollar Cost Average)
  // ─────────────────────────────────────────────
  {
    id: 'tpl_dca',
    name: 'DCA Bot',
    description: 'Swaps a fixed USDC amount to AVAX every hour on Trader Joe — no conditions, pure dollar-cost averaging.',
    tags: ['trading', 'swap', 'avax', 'dca'],
    nodes: [
      {
        id: 'schedule_trigger_1', type: 'avaxNode', position: { x: -200, y: 0 },
        data: { nodeType: 'schedule_trigger', label: 'Schedule Trigger', icon: 'Clock', category: 'flow', color: 'border-orange-400', bgColor: 'bg-orange-950', handles: [{ id: 'signal', label: 'Out', position: 'right', type: 'source', dataType: 'signal' }], status: 'idle' },
      },
      {
        id: 'swap_2', type: 'avaxNode', position: { x: 60, y: 0 },
        data: { nodeType: 'swap', label: 'Swap', icon: 'ArrowLeftRight', category: 'action', color: 'border-green-500', bgColor: 'bg-green-950', handles: [{ id: 'signal', label: 'Signal', position: 'left', type: 'target', dataType: 'signal' }, { id: 'txHash', label: 'Tx Hash', position: 'right', type: 'source', dataType: 'string' }], status: 'idle' },
      },
      {
        id: 'notification_3', type: 'avaxNode', position: { x: 300, y: 0 },
        data: { nodeType: 'notification', label: 'Notification', icon: 'Bell', category: 'action', color: 'border-green-500', bgColor: 'bg-green-950', handles: [{ id: 'signal', label: 'Signal', position: 'left', type: 'target', dataType: 'signal' }], status: 'idle' },
      },
    ],
    edges: [
      { id: 'e1', source: 'schedule_trigger_1', sourceHandle: 'signal', target: 'swap_2', targetHandle: 'signal', animated: true },
      { id: 'e2', source: 'swap_2', sourceHandle: 'txHash', target: 'notification_3', targetHandle: 'signal', animated: true },
    ],
    configs: {
      schedule_trigger_1: { interval: 3600, maxRuns: 0 },
      swap_2: { dex: 'traderjoe', tokenIn: 'USDC.e', tokenOut: 'WAVAX', amount: '10', slippage: 0.5 },
      notification_3: { message: 'DCA swap executed!', type: 'toast' },
    },
  },
]
