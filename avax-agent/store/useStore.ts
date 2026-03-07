'use client'

import { create } from 'zustand'
import {
  type Node,
  type Edge,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from '@xyflow/react'
import { BaseNode } from '@/lib/nodes/BaseNode'
import { createNodeInstance } from '@/lib/nodes/registry'
import { WORKFLOW_TEMPLATES } from '@/lib/templates'
import type { LogEntry } from '@/types'
import type { BacktestSummary } from '@/lib/backtest/BacktestRunner'

export type ChartMarker = {
  time: number
  label: string
  color: string
  shape: 'arrowUp' | 'arrowDown' | 'circle'
}

export type SavedWorkflow = {
  id: string
  name: string
  savedAt: number // unix ms
  nodes: Node[]
  edges: Edge[]
  configs: Record<string, Record<string, unknown>>
}

const WORKFLOWS_KEY = 'avax-agent-workflows'

export function listWorkflows(): SavedWorkflow[] {
  try {
    return JSON.parse(localStorage.getItem(WORKFLOWS_KEY) ?? '[]') as SavedWorkflow[]
  } catch { return [] }
}

function persistWorkflows(list: SavedWorkflow[]) {
  try { localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(list)) } catch {}
}

interface BotStore {
  // React Flow state
  nodes: Node[]
  edges: Edge[]
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void

  // Node instances (type-safe execution layer)
  nodeInstances: Map<string, BaseNode>
  addNodeToCanvas: (type: string, position: { x: number; y: number }) => string
  removeNode: (id: string) => void
  updateNodeConfig: (id: string, config: Record<string, unknown>) => void

  // Selection
  selectedNodeId: string | null
  selectNode: (id: string | null) => void

  // Wallet
  walletAddress: string | null
  isConnected: boolean
  setWallet: (address: string | null) => void

  // Bot execution
  botRunning: boolean
  setBotRunning: (running: boolean) => void

  // Last run I/O per node
  nodeExecutionData: Map<string, { inputs: Record<string, unknown>; outputs: Record<string, unknown> }>
  setNodeExecutionData: (id: string, inputs: Record<string, unknown>, outputs: Record<string, unknown>) => void
  clearExecutionData: () => void

  // Toast notifications
  toasts: { id: string; message: string; level: 'info' | 'warn' | 'error' }[]
  addToast: (message: string, level?: 'info' | 'warn' | 'error') => void
  removeToast: (id: string) => void

  // Chart panel
  chartOpen: boolean
  setChartOpen: (open: boolean) => void

  // Agent sidebar
  agentOpen: boolean
  setAgentOpen: (open: boolean) => void

  // Chart markers (injected by AddChartMarkerNode)
  chartMarkers: ChartMarker[]
  addChartMarker: (marker: ChartMarker) => void
  clearChartMarkers: () => void

  // Logs
  logs: LogEntry[]
  addLog: (nodeId: string, nodeLabel: string, message: string, level?: LogEntry['level']) => void
  clearLogs: () => void

  // Named workflow library (localStorage)
  saveWorkflow: (name: string) => void
  loadWorkflow: (id: string) => void
  deleteWorkflow: (id: string) => void
  loadTemplate: (templateId: string) => void
  clearCanvas: () => void

  // Backtesting
  backtestMode: boolean
  setBacktestMode: (v: boolean) => void
  backtestConfig: { symbol: string; interval: string; startDate: string; endDate: string }
  setBacktestConfig: (patch: Partial<BotStore['backtestConfig']>) => void
  backtestSummary: BacktestSummary | null
  setBacktestSummary: (s: BacktestSummary | null) => void
  backtestProgress: { tick: number; total: number } | null
  setBacktestProgress: (p: { tick: number; total: number } | null) => void
}

let nodeCounter = 0

// Session storage helpers
const SESSION_KEY = 'avax-agent-workflow'

function saveToSession(nodes: Node[], edges: Edge[], nodeInstances: Map<string, BaseNode>) {
  try {
    const configs: Record<string, Record<string, unknown>> = {}
    nodeInstances.forEach((inst, id) => { configs[id] = inst.config })
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ nodes, edges, configs }))
  } catch {}
}

function loadFromSession(): { nodes: Node[]; edges: Edge[]; nodeInstances: Map<string, BaseNode>; counter: number } | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const { nodes, edges, configs } = JSON.parse(raw) as {
      nodes: Node[]
      edges: Edge[]
      configs: Record<string, Record<string, unknown>>
    }
    const nodeInstances = new Map<string, BaseNode>()
    let counter = 0
    for (const node of nodes) {
      const type = node.data?.nodeType as string
      if (!type) continue
      try {
        const inst = createNodeInstance(type, node.id)
        if (configs[node.id]) inst.setConfig(configs[node.id])
        nodeInstances.set(node.id, inst)
        // track highest counter to avoid ID collisions
        const match = node.id.match(/_(\d+)$/)
        if (match) counter = Math.max(counter, parseInt(match[1]))
      } catch {}
    }
    return { nodes, edges, nodeInstances, counter }
  } catch {
    return null
  }
}

const saved = typeof window !== 'undefined' ? loadFromSession() : null
if (saved) nodeCounter = saved.counter

export const useStore = create<BotStore>((set, get) => ({
  nodes: saved?.nodes ?? [],
  edges: saved?.edges ?? [],
  nodeInstances: saved?.nodeInstances ?? new Map(),
  selectedNodeId: null,
  walletAddress: null,
  isConnected: false,
  botRunning: false,
  nodeExecutionData: new Map(),
  toasts: [],
  chartOpen: false,
  agentOpen: false,
  chartMarkers: [],
  logs: [],
  backtestMode: false,
  backtestConfig: {
    symbol: 'AVAXUSDT',
    interval: '1h',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
  },
  backtestSummary: null,
  backtestProgress: null,

  onNodesChange: (changes) =>
    set((s) => {
      const nodes = applyNodeChanges(changes, s.nodes)
      saveToSession(nodes, s.edges, s.nodeInstances)
      return { nodes }
    }),

  onEdgesChange: (changes) =>
    set((s) => {
      const edges = applyEdgeChanges(changes, s.edges)
      saveToSession(s.nodes, edges, s.nodeInstances)
      return { edges }
    }),

  onConnect: (connection) =>
    set((s) => {
      const edges = addEdge({ ...connection, animated: true }, s.edges)
      saveToSession(s.nodes, edges, s.nodeInstances)
      return { edges }
    }),

  addNodeToCanvas: (type, position) => {
    const id = `${type}_${++nodeCounter}`
    const instance = createNodeInstance(type, id)

    const rfNode: Node = {
      id,
      type: 'avaxNode',
      position,
      data: {
        nodeType: type,
        label: instance.label,
        icon: instance.icon,
        category: instance.category,
        color: instance.color,
        bgColor: instance.bgColor,
        handles: instance.handles,
        status: instance.status,
      },
    }

    set((s) => {
      const nodes = [...s.nodes, rfNode]
      const nodeInstances = new Map(s.nodeInstances).set(id, instance)
      saveToSession(nodes, s.edges, nodeInstances)
      return { nodes, nodeInstances }
    })
    return id
  },

  removeNode: (id) => {
    const instances = new Map(get().nodeInstances)
    instances.delete(id)
    set((s) => {
      const nodes = s.nodes.filter((n) => n.id !== id)
      const edges = s.edges.filter((e) => e.source !== id && e.target !== id)
      saveToSession(nodes, edges, instances)
      return {
        nodes,
        edges,
        nodeInstances: instances,
        selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
      }
    })
  },

  updateNodeConfig: (id, config) => {
    const { nodes, edges } = get()
    const instances = new Map(get().nodeInstances)
    const inst = instances.get(id)
    if (inst) {
      inst.setConfig(config)
      instances.set(id, inst)
    }
    saveToSession(nodes, edges, instances)
    set({ nodeInstances: instances })
  },

  selectNode: (id) => set({ selectedNodeId: id }),

  setWallet: (address) =>
    set({ walletAddress: address, isConnected: !!address }),

  setBotRunning: (running) => set({ botRunning: running }),

  setNodeExecutionData: (id, inputs, outputs) =>
    set((s) => {
      const m = new Map(s.nodeExecutionData)
      m.set(id, { inputs, outputs })
      return { nodeExecutionData: m }
    }),

  clearExecutionData: () => set({ nodeExecutionData: new Map() }),

  addToast: (message, level = 'info') => {
    const id = `toast_${Date.now()}_${Math.random()}`
    set((s) => ({ toasts: [...s.toasts, { id, message, level }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, 4000)
  },

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  setChartOpen: (open) => set({ chartOpen: open }),

  setAgentOpen: (open) => set({ agentOpen: open }),

  addChartMarker: (marker) =>
    set((s) => ({ chartMarkers: [...s.chartMarkers, marker] })),

  clearChartMarkers: () => set({ chartMarkers: [] }),

  addLog: (nodeId, nodeLabel, message, level = 'info') =>
    set((s) => ({
      logs: [
        ...s.logs,
        {
          id: `${Date.now()}_${Math.random()}`,
          timestamp: new Date(),
          nodeId,
          nodeLabel,
          message,
          level,
        },
      ],
    })),

  clearLogs: () => set({ logs: [] }),

  saveWorkflow: (name) => {
    const { nodes, edges, nodeInstances } = get()
    const configs: Record<string, Record<string, unknown>> = {}
    nodeInstances.forEach((inst, id) => { configs[id] = inst.config })
    const workflow: SavedWorkflow = {
      id: `wf_${Date.now()}`,
      name: name.trim() || 'Untitled',
      savedAt: Date.now(),
      nodes,
      edges,
      configs,
    }
    const list = listWorkflows().filter((w) => w.name !== workflow.name)
    persistWorkflows([workflow, ...list])
  },

  loadWorkflow: (id) => {
    const workflow = listWorkflows().find((w) => w.id === id)
    if (!workflow) return
    const newInstances = new Map<string, BaseNode>()
    let counter = 0
    for (const node of workflow.nodes) {
      const type = node.data?.nodeType as string
      if (!type) continue
      try {
        const inst = createNodeInstance(type, node.id)
        if (workflow.configs[node.id]) inst.setConfig(workflow.configs[node.id])
        newInstances.set(node.id, inst)
        const match = node.id.match(/_(\d+)$/)
        if (match) counter = Math.max(counter, parseInt(match[1]))
      } catch {}
    }
    nodeCounter = counter
    saveToSession(workflow.nodes, workflow.edges, newInstances)
    set({
      nodes: workflow.nodes,
      edges: workflow.edges,
      nodeInstances: newInstances,
      selectedNodeId: null,
      nodeExecutionData: new Map(),
    })
  },

  deleteWorkflow: (id) => {
    persistWorkflows(listWorkflows().filter((w) => w.id !== id))
  },

  loadTemplate: (templateId) => {
    const tpl = WORKFLOW_TEMPLATES.find((t) => t.id === templateId)
    if (!tpl) return
    const newInstances = new Map<string, BaseNode>()
    let counter = 0
    for (const node of tpl.nodes) {
      const type = node.data?.nodeType as string
      if (!type) continue
      try {
        const inst = createNodeInstance(type, node.id)
        if (tpl.configs[node.id]) inst.setConfig(tpl.configs[node.id])
        newInstances.set(node.id, inst)
        const match = node.id.match(/_(\d+)$/)
        if (match) counter = Math.max(counter, parseInt(match[1]))
      } catch {}
    }
    nodeCounter = counter
    saveToSession(tpl.nodes, tpl.edges, newInstances)
    set({
      nodes: tpl.nodes,
      edges: tpl.edges,
      nodeInstances: newInstances,
      selectedNodeId: null,
      nodeExecutionData: new Map(),
    })
  },

  clearCanvas: () => {
    nodeCounter = 0
    saveToSession([], [], new Map())
    set({ nodes: [], edges: [], nodeInstances: new Map(), selectedNodeId: null, nodeExecutionData: new Map() })
  },

  setBacktestMode: (v) => set({ backtestMode: v }),
  setBacktestConfig: (patch) => set((s) => ({ backtestConfig: { ...s.backtestConfig, ...patch } })),
  setBacktestSummary: (s) => set({ backtestSummary: s }),
  setBacktestProgress: (p) => set({ backtestProgress: p }),
}))
