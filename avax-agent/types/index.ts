export type NodeCategory = 'data' | 'logic' | 'action' | 'flow'
export type NodeStatus = 'idle' | 'running' | 'success' | 'error'

export interface HandleDef {
  id: string
  label: string
  position: 'left' | 'right'
  type: 'source' | 'target'
  dataType: 'number' | 'boolean' | 'signal' | 'string' | 'any'
}

export interface ConfigField {
  key: string
  label: string
  type: 'text' | 'number' | 'select' | 'toggle'
  options?: string[]
  default?: unknown
  placeholder?: string
}

export interface OHLCVCandle {
  time: number    // unix seconds (candle open time)
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface ExecutionContext {
  walletAddress: string | null
  provider: unknown
  signer: unknown
  addLog: (msg: string, level?: 'info' | 'warn' | 'error') => void
  showToast: (message: string, level?: 'info' | 'warn' | 'error') => void
  addChartMarker: (marker: { time: number; label: string; color: string; shape: 'arrowUp' | 'arrowDown' | 'circle' }) => void
  backtestCandle?: OHLCVCandle
}

export interface LogEntry {
  id: string
  timestamp: Date
  nodeId: string
  nodeLabel: string
  message: string
  level: 'info' | 'warn' | 'error'
}
