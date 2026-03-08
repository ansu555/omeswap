'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/agent-builder'
import { PALETTE_NODES, CATEGORY_LABELS } from '@/lib/agent-builder/nodes/registry'
import type { NodeCategory } from '@/types/agent-builder-canvas'
import {
  TrendingUp, Wallet, ArrowLeftRight, GitBranch, Bell, Calculator,
  Timer, Repeat2, Target, BellRing, Play, Square, Merge, Clock,
  Search, ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen,
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
  flow: 'text-purple-400',
}

const CATEGORY_HEADER_COLORS: Record<NodeCategory, string> = {
  data: 'text-blue-400/60',
  logic: 'text-yellow-400/60',
  action: 'text-green-400/60',
  flow: 'text-purple-400/60',
}

export default function NodePalette() {
  const { addNodeToCanvas } = useStore()
  const [search, setSearch] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [collapsedCats, setCollapsedCats] = useState<Set<NodeCategory>>(new Set())
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [hoverTimer, setHoverTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const toggleCat = useCallback((cat: NodeCategory) => {
    setCollapsedCats((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }, [])

  const handleDragStart = useCallback((e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('application/avax-node-type', type)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleMouseEnter = useCallback((type: string) => {
    const t = setTimeout(() => setHoveredNode(type), 550)
    setHoverTimer(t)
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (hoverTimer) clearTimeout(hoverTimer)
    setHoveredNode(null)
  }, [hoverTimer])

  const grouped = useMemo(() => {
    const q = search.toLowerCase().trim()
    return PALETTE_NODES.reduce<Record<NodeCategory, typeof PALETTE_NODES>>(
      (acc, node) => {
        if (
          q &&
          !node.label.toLowerCase().includes(q) &&
          !node.description.toLowerCase().includes(q) &&
          !node.category.toLowerCase().includes(q)
        ) return acc
        if (!acc[node.category]) acc[node.category] = []
        acc[node.category].push(node)
        return acc
      },
      {} as Record<NodeCategory, typeof PALETTE_NODES>
    )
  }, [search])

  const totalFiltered = useMemo(
    () => Object.values(grouped).reduce((s, arr) => s + (arr?.length ?? 0), 0),
    [grouped]
  )

  if (sidebarCollapsed) {
    return (
      <motion.aside
        initial={{ width: 240 }}
        animate={{ width: 44 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="shrink-0 bg-gradient-to-b from-[#1a1a2e]/80 to-[#0d0d1a]/80 backdrop-blur-xl border-r border-purple-500/20 flex flex-col items-center py-3 gap-2.5 overflow-hidden"
      >
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="text-white/35 hover:text-white/70 transition-colors p-1"
          title="Expand panel"
        >
          <PanelLeftOpen size={15} />
        </button>
        <div className="w-5 h-px bg-purple-500/20" />
        {PALETTE_NODES.map((node) => {
          const Icon = ICONS[node.icon]
          return Icon ? (
            <button
              key={node.type}
              draggable
              onDragStart={(e) => handleDragStart(e, node.type)}
              onClick={() =>
                addNodeToCanvas(node.type, {
                  x: 300 + Math.random() * 100,
                  y: 200 + Math.random() * 100,
                })
              }
              title={node.label}
              className={clsx(
                'p-1.5 rounded-lg hover:bg-purple-500/15 transition-all cursor-grab active:cursor-grabbing',
                CATEGORY_COLORS[node.category]
              )}
            >
              <Icon size={13} />
            </button>
          ) : null
        })}
      </motion.aside>
    )
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut', delay: 0.05 }}
      className="w-60 shrink-0 bg-gradient-to-b from-[#1a1a2e]/80 to-[#0d0d1a]/80 backdrop-blur-xl border-r border-purple-500/20 overflow-y-auto flex flex-col"
    >
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-purple-500/20 flex items-center gap-2">
        <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider flex-1">Blocks</p>
        <button
          onClick={() => setSidebarCollapsed(true)}
          className="text-white/25 hover:text-white/60 transition-colors"
          title="Collapse panel"
        >
          <PanelLeftClose size={13} />
        </button>
      </div>

      {/* Search */}
      <div className="px-2.5 py-2 border-b border-purple-500/10">
        <div className="relative">
          <Search
            size={11}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search nodes…"
            className="w-full bg-white/5 border border-purple-500/15 rounded-lg pl-7 pr-2.5 py-1.5 text-[11px] text-white/70 placeholder-white/20 focus:outline-none focus:border-purple-500/40 transition-colors"
          />
        </div>
        <AnimatePresence>
          {search && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-[9px] text-white/25 mt-1 px-0.5"
            >
              {totalFiltered} {totalFiltered === 1 ? 'node' : 'nodes'} found
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Node groups */}
      <div className="flex-1 py-1.5">
        {CATEGORY_ORDER.map((cat) => {
          const catNodes = grouped[cat]
          if (!catNodes?.length) return null
          const isCatCollapsed = collapsedCats.has(cat)

          return (
            <div key={cat} className="mb-1">
              {/* Category header */}
              <button
                onClick={() => toggleCat(cat)}
                className="w-full flex items-center gap-1.5 px-3 py-1 hover:bg-white/[0.02] transition-colors group"
              >
                <span
                  className={clsx(
                    'text-[9px] font-bold uppercase tracking-widest flex-1 text-left',
                    CATEGORY_HEADER_COLORS[cat]
                  )}
                >
                  {CATEGORY_LABELS[cat]}
                </span>
                <span className="text-white/20 group-hover:text-white/40 transition-colors">
                  {isCatCollapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                </span>
              </button>

              {/* Nodes */}
              <AnimatePresence initial={false}>
                {!isCatCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="overflow-hidden px-2 space-y-0.5"
                  >
                    {catNodes.map((node) => {
                      const Icon = ICONS[node.icon]
                      const isTooltipVisible = hoveredNode === node.type

                      return (
                        <div key={node.type} className="relative">
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, node.type)}
                            onClick={() =>
                              addNodeToCanvas(node.type, {
                                x: 300 + Math.random() * 100,
                                y: 200 + Math.random() * 100,
                              })
                            }
                            onMouseEnter={() => handleMouseEnter(node.type)}
                            onMouseLeave={handleMouseLeave}
                            className={clsx(
                              'flex items-center gap-2 px-2 py-1.5 rounded-xl cursor-grab active:cursor-grabbing',
                              'border border-transparent hover:border-purple-500/25',
                              'hover:bg-purple-500/10 transition-all'
                            )}
                          >
                            {Icon && (
                              <div className={clsx('shrink-0', CATEGORY_COLORS[node.category])}>
                                <Icon size={13} />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-medium text-white/80 truncate">{node.label}</p>
                              <p className="text-[9px] text-white/30 truncate leading-tight">{node.description}</p>
                            </div>
                          </div>

                          {/* Hover tooltip */}
                          <AnimatePresence>
                            {isTooltipVisible && (
                              <motion.div
                                initial={{ opacity: 0, x: -6, scale: 0.97 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -6, scale: 0.97 }}
                                transition={{ duration: 0.13 }}
                                className="absolute left-full top-0 ml-2 z-50 w-52 pointer-events-none"
                              >
                                <div className="bg-[#1a1a35] border border-purple-500/30 rounded-xl p-3 shadow-xl shadow-black/60">
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                    {Icon && (
                                      <Icon size={11} className={CATEGORY_COLORS[node.category]} />
                                    )}
                                    <p className={clsx('text-[11px] font-semibold', CATEGORY_COLORS[node.category])}>
                                      {node.label}
                                    </p>
                                  </div>
                                  <p className="text-[10px] text-white/55 leading-relaxed mb-2">
                                    {node.description}
                                  </p>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[8px] uppercase tracking-widest text-white/20">
                                      {CATEGORY_LABELS[node.category]}
                                    </span>
                                    <span className="text-white/10">·</span>
                                    <span className="text-[8px] text-white/20">
                                      drag or click to add
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}

        {/* Empty search state */}
        {search && totalFiltered === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-6 text-[11px] text-white/25 text-center"
          >
            No nodes match &ldquo;{search}&rdquo;
          </motion.p>
        )}
      </div>
    </motion.aside>
  )
}
