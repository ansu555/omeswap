import type { Node, Edge } from '@xyflow/react'
import type { BaseNode } from '@/lib/agent-builder/nodes/BaseNode'
import type { LogEntry, OHLCVCandle } from '@/types/agent-builder-canvas'
import { runBot } from '@/lib/agent-builder/engine/BotRunner'

export interface BacktestSummary {
  totalTicks: number
  markersPlaced: number
  signalsFired: number
  skippedNodes: string[]
  durationMs: number
}

type LogFn = (nodeId: string, nodeLabel: string, msg: string, level?: LogEntry['level']) => void
type StatusFn = (nodeId: string, status: BaseNode['status']) => void
type IOFn = (nodeId: string, inputs: Record<string, unknown>, outputs: Record<string, unknown>) => void
type ToastFn = (message: string, level?: 'info' | 'warn' | 'error') => void
type MarkerFn = (marker: { time: number; label: string; color: string; shape: 'arrowUp' | 'arrowDown' | 'circle' }) => void

export interface BacktestCallbacks {
  onLog: LogFn
  onStatus: StatusFn
  onIO: IOFn
  onToast: ToastFn
  onMarker: MarkerFn
  onProgress: (tick: number, total: number) => void
  stopRequested: () => boolean
}

// Node types that touch the blockchain — mock them in backtest
const MOCK_NODE_TYPES = new Set(['swap', 'wallet_balance', 'dex_price'])

export async function runBacktest(
  candles: OHLCVCandle[],
  nodes: Node[],
  edges: Edge[],
  nodeInstances: Map<string, BaseNode>,
  callbacks: BacktestCallbacks
): Promise<BacktestSummary> {
  const { onLog, onStatus, onIO, onToast, onMarker, onProgress, stopRequested } = callbacks
  const startTime = Date.now()

  // ── 1. Snapshot & wipe stateful keys from all instances ──────────────────
  // Keys prefixed with _ are cross-tick state (e.g. _stored, _count, _buffer)
  const stateSnapshot = new Map<string, Record<string, unknown>>()
  for (const [id, inst] of nodeInstances) {
    const snap: Record<string, unknown> = {}
    for (const k of Object.keys(inst.config)) {
      if (k.startsWith('_')) snap[k] = inst.config[k]
    }
    stateSnapshot.set(id, snap)
    // Wipe so the backtest starts fresh
    for (const k of Object.keys(snap)) {
      delete inst.config[k]
    }
  }

  // ── 2. Build wrapped instances (mock blockchain nodes) ────────────────────
  const wrappedInstances = new Map(nodeInstances)
  const skippedLabels = new Set<string>()

  for (const [id, inst] of nodeInstances) {
    const nodeType = (inst as BaseNode & { type: string }).type
    if (!MOCK_NODE_TYPES.has(nodeType)) continue

    skippedLabels.add(inst.label)

    // Create a proxy object that overrides execute() only
    const mockInst = Object.create(inst) as BaseNode
    mockInst.execute = async (_inputs, context) => {
      const candle = context.backtestCandle

      if (nodeType === 'swap') {
        context.addLog(`[SIMULATED] Swap skipped in backtest`, 'warn')
        return { txHash: '[SIMULATED]' }
      }
      if (nodeType === 'wallet_balance') {
        context.addLog(`[SIMULATED] Wallet balance = 0 in backtest`, 'info')
        return { balance: 0 }
      }
      if (nodeType === 'dex_price') {
        const price = candle?.close ?? 0
        context.addLog(`[SIMULATED] DEX price = ${price} (candle close)`, 'info')
        return { price }
      }
      return {}
    }

    wrappedInstances.set(id, mockInst)
  }

  // ── 3. Run the bot once per candle ────────────────────────────────────────
  let markersPlaced = 0
  let signalsFired = 0
  const total = candles.length

  for (let i = 0; i < total; i++) {
    if (stopRequested()) break

    const candle = candles[i]

    // Track markers and signals fired this tick
    const tickMarkers: unknown[] = []

    await runBot(
      nodes,
      edges,
      wrappedInstances,
      {
        walletAddress: null,
        provider: null,
        signer: null,
        addLog: () => {},
        showToast: () => {},
        addChartMarker: () => {},
        backtestCandle: candle,
      },
      onLog,
      onStatus,
      (nodeId, inputs, outputs) => {
        // Count signal outputs
        for (const v of Object.values(outputs)) {
          if (v === 'signal') signalsFired++
        }
        onIO(nodeId, inputs, outputs)
      },
      onToast,
      (marker) => {
        tickMarkers.push(marker)
        markersPlaced++
        onMarker(marker)
      }
    )

    onProgress(i + 1, total)
  }

  // ── 4. Restore original state keys ───────────────────────────────────────
  for (const [id, snap] of stateSnapshot) {
    const inst = nodeInstances.get(id)
    if (!inst) continue
    // Wipe any state accumulated during backtest, restore original
    for (const k of Object.keys(inst.config)) {
      if (k.startsWith('_')) delete inst.config[k]
    }
    Object.assign(inst.config, snap)
  }

  return {
    totalTicks: candles.length,
    markersPlaced,
    signalsFired,
    skippedNodes: Array.from(skippedLabels),
    durationMs: Date.now() - startTime,
  }
}
