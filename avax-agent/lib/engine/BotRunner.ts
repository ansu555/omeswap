import type { Node, Edge } from '@xyflow/react'
import type { BaseNode } from '@/lib/nodes/BaseNode'
import type { ExecutionContext, LogEntry } from '@/types'

type LogFn = (nodeId: string, nodeLabel: string, msg: string, level?: LogEntry['level']) => void
type StatusFn = (nodeId: string, status: BaseNode['status']) => void
type IOFn = (nodeId: string, inputs: Record<string, unknown>, outputs: Record<string, unknown>) => void
type ToastFn = (message: string, level?: 'info' | 'warn' | 'error') => void
type MarkerFn = (marker: { time: number; label: string; color: string; shape: 'arrowUp' | 'arrowDown' | 'circle' }) => void

function topologicalSort(nodes: Node[], edges: Edge[]): string[] {
  const inDegree: Record<string, number> = {}
  const adj: Record<string, string[]> = {}

  for (const n of nodes) {
    inDegree[n.id] = 0
    adj[n.id] = []
  }
  for (const e of edges) {
    adj[e.source].push(e.target)
    inDegree[e.target] = (inDegree[e.target] || 0) + 1
  }

  const queue = nodes.filter((n) => inDegree[n.id] === 0).map((n) => n.id)
  const order: string[] = []

  while (queue.length) {
    const curr = queue.shift()!
    order.push(curr)
    for (const next of adj[curr]) {
      inDegree[next]--
      if (inDegree[next] === 0) queue.push(next)
    }
  }

  return order
}

export async function runBot(
  nodes: Node[],
  edges: Edge[],
  nodeInstances: Map<string, BaseNode>,
  context: ExecutionContext,
  onLog: LogFn,
  onStatus: StatusFn,
  onIO: IOFn,
  onToast: ToastFn,
  onMarker: MarkerFn = () => {}
) {
  const order = topologicalSort(nodes, edges)
  const outputs: Record<string, Record<string, unknown>> = {}

  for (const nodeId of order) {
    const instance = nodeInstances.get(nodeId)
    if (!instance) continue

    // Collect inputs from connected edges
    const inputs: Record<string, unknown> = {}
    for (const edge of edges) {
      if (edge.target === nodeId) {
        const sourceOutputs = outputs[edge.source] || {}
        const handleId = edge.targetHandle || 'signal'
        const sourceHandle = edge.sourceHandle || 'signal'
        if (sourceOutputs[sourceHandle] !== undefined) {
          inputs[handleId] = sourceOutputs[sourceHandle]
        }
      }
    }

    onStatus(nodeId, 'running')
    instance.setStatus('running')

    try {
      const nodeContext: ExecutionContext = {
        ...context,
        addLog: (msg, level = 'info') =>
          onLog(nodeId, instance.label, msg, level),
        showToast: (msg, level = 'info') =>
          onToast(msg, level),
        addChartMarker: (marker) =>
          onMarker(marker),
      }

      const result = await instance.execute(inputs, nodeContext)
      outputs[nodeId] = result
      onIO(nodeId, inputs, result)
      instance.setStatus('success')
      onStatus(nodeId, 'success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      onLog(nodeId, instance.label, `Error: ${msg}`, 'error')
      instance.setStatus('error')
      onStatus(nodeId, 'error')
      // Stop on error
      break
    }
  }
}
