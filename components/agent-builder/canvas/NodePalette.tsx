'use client'

import { useCallback } from 'react'
import { useStore } from '@/store/agent-builder'
import { PALETTE_NODES, CATEGORY_LABELS } from '@/lib/agent-builder/nodes/registry'
import type { NodeCategory } from '@/types/agent-builder-canvas'
import {
  TrendingUp, Wallet, ArrowLeftRight, GitBranch, Bell, Calculator,
  Timer, Repeat2, Target, BellRing, Play, Square, Merge, Clock,
} from 'lucide-react'
import clsx from 'clsx'

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  TrendingUp, Wallet, ArrowLeftRight, GitBranch, Bell, Calculator,
  Timer, Repeat2, Target, BellRing, Play, Square, Merge, Clock,
}

const CATEGORY_ORDER: NodeCategory[] = ['flow', 'data', 'logic', 'action']

const CATEGORY_COLORS: Record<NodeCategory, string> = {
  data: 'text-blue-400',
  logic: 'text-yellow-400',
  action: 'text-green-400',
  flow: 'text-gray-400',
}

export default function NodePalette() {
  const { addNodeToCanvas } = useStore()

  const handleDragStart = useCallback(
    (e: React.DragEvent, type: string) => {
      e.dataTransfer.setData('application/avax-node-type', type)
      e.dataTransfer.effectAllowed = 'move'
    },
    []
  )

  const grouped = PALETTE_NODES.reduce<Record<NodeCategory, typeof PALETTE_NODES>>(
    (acc, node) => {
      if (!acc[node.category]) acc[node.category] = []
      acc[node.category].push(node)
      return acc
    },
    {} as Record<NodeCategory, typeof PALETTE_NODES>
  )

  return (
    <aside className="w-56 shrink-0 bg-gray-900 border-r border-white/10 overflow-y-auto flex flex-col">
      <div className="px-3 py-3 border-b border-white/10">
        <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Blocks</p>
        <p className="text-[10px] text-white/25 mt-0.5">Drag onto canvas</p>
      </div>

      <div className="flex-1 py-2">
        {CATEGORY_ORDER.map((cat) => {
          const catNodes = grouped[cat]
          if (!catNodes?.length) return null
          return (
            <div key={cat} className="mb-3">
              <p className={clsx('px-3 py-1 text-[9px] font-bold uppercase tracking-wider', CATEGORY_COLORS[cat])}>
                {CATEGORY_LABELS[cat]}
              </p>
              <div className="space-y-0.5 px-2">
                {catNodes.map((node) => {
                  const Icon = ICONS[node.icon]
                  return (
                    <div
                      key={node.type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, node.type)}
                      onClick={() => addNodeToCanvas(node.type, { x: 300 + Math.random() * 100, y: 200 + Math.random() * 100 })}
                      className={clsx(
                        'flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-grab active:cursor-grabbing',
                        'border border-transparent hover:border-white/20',
                        'hover:bg-white/5 transition-colors group'
                      )}
                      title={node.description}
                    >
                      {Icon && (
                        <div className={clsx('shrink-0', CATEGORY_COLORS[node.category])}>
                          <Icon size={13} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium text-white/80 truncate">{node.label}</p>
                        <p className="text-[9px] text-white/30 truncate">{node.description.slice(0, 30)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
