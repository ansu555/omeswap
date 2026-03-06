'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/store/agent-builder'
import { X, Trash2, ArrowRight, ArrowLeft } from 'lucide-react'
import clsx from 'clsx'

const DATA_TYPE_COLORS: Record<string, string> = {
  number: 'text-blue-400 bg-blue-900/30 border-blue-700/40',
  boolean: 'text-yellow-400 bg-yellow-900/30 border-yellow-700/40',
  signal: 'text-green-400 bg-green-900/30 border-green-700/40',
  string: 'text-purple-400 bg-purple-900/30 border-purple-700/40',
  any: 'text-gray-400 bg-gray-900/30 border-gray-700/40',
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'number') return v.toLocaleString(undefined, { maximumFractionDigits: 6 })
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  if (typeof v === 'string' && v.startsWith('0x')) return `${v.slice(0, 10)}…`
  return String(v)
}

export default function ConfigPanel() {
  const { selectedNodeId, nodeInstances, updateNodeConfig, selectNode, removeNode, nodeExecutionData } = useStore()

  const instance = selectedNodeId ? nodeInstances.get(selectedNodeId) : null
  const [localConfig, setLocalConfig] = useState<Record<string, unknown>>({})

  useEffect(() => {
    if (instance) setLocalConfig({ ...instance.config })
  }, [selectedNodeId, instance])

  if (!instance || !selectedNodeId) {
    return (
      <aside className="w-64 shrink-0 bg-gray-900 border-l border-white/10 flex items-center justify-center">
        <p className="text-[11px] text-white/20 text-center px-4">
          Click a node on the canvas to configure it
        </p>
      </aside>
    )
  }

  function handleChange(key: string, value: unknown) {
    const next = { ...localConfig, [key]: value }
    setLocalConfig(next)
    updateNodeConfig(selectedNodeId!, next)
  }

  return (
    <aside className="w-64 shrink-0 bg-gray-900 border-l border-white/10 overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-white/10">
        <div className={clsx('w-2 h-2 rounded-full', instance.color.replace('border-', 'bg-'))} />
        <span className="text-sm font-semibold text-white flex-1 truncate">{instance.label}</span>
        <button
          onClick={() => { removeNode(selectedNodeId); selectNode(null) }}
          className="text-red-400/60 hover:text-red-400 transition-colors"
          title="Delete node"
        >
          <Trash2 size={13} />
        </button>
        <button
          onClick={() => selectNode(null)}
          className="text-white/30 hover:text-white/60 transition-colors"
        >
          <X size={13} />
        </button>
      </div>

      {/* Description */}
      <p className="px-3 py-2 text-[11px] text-white/40 border-b border-white/5">{instance.description}</p>

      {/* Config fields */}
      <div className="flex-1 px-3 py-3 space-y-4">
        {instance.configSchema.length === 0 ? (
          <p className="text-[11px] text-white/25">No configuration needed</p>
        ) : (
          instance.configSchema.map((field) => (
            <div key={field.key}>
              <label className="block text-[10px] font-medium text-white/50 mb-1 uppercase tracking-wide">
                {field.label}
              </label>

              {field.type === 'select' ? (
                <select
                  value={String(localConfig[field.key] ?? field.default ?? '')}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="w-full bg-black/40 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white/40 transition-colors"
                >
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === 'number' ? (
                <input
                  type="number"
                  value={String(localConfig[field.key] ?? field.default ?? 0)}
                  onChange={(e) => handleChange(field.key, parseFloat(e.target.value))}
                  className="w-full bg-black/40 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white/40 transition-colors"
                  placeholder={field.placeholder}
                />
              ) : field.type === 'toggle' ? (
                <button
                  onClick={() => handleChange(field.key, !localConfig[field.key])}
                  className={clsx(
                    'w-10 h-5 rounded-full transition-colors relative',
                    localConfig[field.key] ? 'bg-green-500' : 'bg-white/20'
                  )}
                >
                  <span
                    className={clsx(
                      'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
                      localConfig[field.key] ? 'translate-x-5' : 'translate-x-0.5'
                    )}
                  />
                </button>
              ) : (
                <input
                  type="text"
                  value={String(localConfig[field.key] ?? field.default ?? '')}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="w-full bg-black/40 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white/40 transition-colors"
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* Handles (ports) */}
      <div className="px-3 py-3 border-t border-white/5">
        <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Ports</p>
        <div className="space-y-1">
          {instance.handles.map((h) => (
            <div key={h.id} className="flex items-center gap-2">
              <span className="text-white/30">
                {h.type === 'target' ? <ArrowRight size={10} /> : <ArrowLeft size={10} />}
              </span>
              <span className="text-[10px] text-white/60 flex-1">{h.label}</span>
              <span className={clsx(
                'text-[9px] px-1.5 py-0.5 rounded border font-mono',
                DATA_TYPE_COLORS[h.dataType] ?? DATA_TYPE_COLORS.any
              )}>
                {h.dataType}
              </span>
              <span className="text-[9px] text-white/20">{h.type === 'target' ? 'in' : 'out'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Last run I/O */}
      {nodeExecutionData.get(selectedNodeId) && (() => {
        const { inputs, outputs } = nodeExecutionData.get(selectedNodeId)!
        const hasInputs = Object.keys(inputs).length > 0
        const hasOutputs = Object.keys(outputs).length > 0
        return (
          <div className="px-3 py-3 border-t border-white/5">
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Last Run</p>
            {hasInputs && (
              <div className="mb-2">
                <p className="text-[9px] text-white/30 mb-1 uppercase tracking-wide">Inputs</p>
                <div className="space-y-0.5">
                  {Object.entries(inputs).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-1.5 font-mono text-[10px]">
                      <span className="text-white/40">{k}:</span>
                      <span className="text-green-300 truncate">{formatValue(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {hasOutputs && (
              <div>
                <p className="text-[9px] text-white/30 mb-1 uppercase tracking-wide">Outputs</p>
                <div className="space-y-0.5">
                  {Object.entries(outputs).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-1.5 font-mono text-[10px]">
                      <span className="text-white/40">{k}:</span>
                      <span className="text-blue-300 truncate">{formatValue(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!hasInputs && !hasOutputs && (
              <p className="text-[10px] text-white/20">No data</p>
            )}
          </div>
        )
      })()}

      {/* Node ID footer */}
      <div className="px-3 py-2 border-t border-white/5">
        <p className="text-[9px] text-white/20 font-mono">{selectedNodeId}</p>
      </div>
    </aside>
  )
}
