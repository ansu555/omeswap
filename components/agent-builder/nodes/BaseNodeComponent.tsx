'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { useStore } from '@/store/agent-builder'
import type { HandleDef, NodeCategory, NodeStatus } from '@/types/agent-builder-canvas'
import {
  TrendingUp, Wallet, ArrowLeftRight, GitBranch, Bell, Calculator,
  Timer, Repeat2, Target, BellRing, Play, Square, Merge, Clock, MapPin, Braces, History,
  BarChart2, Activity,
  CheckCircle2, XCircle, Loader2, Circle,
} from 'lucide-react'
import clsx from 'clsx'

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  TrendingUp, Wallet, ArrowLeftRight, GitBranch, Bell, Calculator,
  Timer, Repeat2, Target, BellRing, Play, Square, Merge, Clock, MapPin, Braces, History,
  BarChart2, Activity,
}

const STATUS_ICON: Record<NodeStatus, React.ReactNode> = {
  idle: <Circle size={12} className="text-gray-500" />,
  running: <Loader2 size={12} className="text-blue-400 animate-spin" />,
  success: <CheckCircle2 size={12} className="text-green-400" />,
  error: <XCircle size={12} className="text-red-400" />,
}

const CATEGORY_HANDLE_COLORS: Record<NodeCategory, string> = {
  data: 'bg-blue-400',
  logic: 'bg-yellow-400',
  action: 'bg-green-400',
  flow: 'bg-gray-400',
}

interface NodeData {
  nodeType: string
  label: string
  icon: string
  category: NodeCategory
  color: string
  bgColor: string
  handles: HandleDef[]
  status: NodeStatus
  [key: string]: unknown
}

function BaseNodeComponent({ id, data, selected }: NodeProps) {
  const nodeData = data as NodeData
  const { selectNode, nodeInstances } = useStore()
  const instance = nodeInstances.get(id)
  const status: NodeStatus = instance?.status ?? 'idle'

  const Icon = ICONS[nodeData.icon] ?? Circle
  const handleColor = CATEGORY_HANDLE_COLORS[nodeData.category]

  const leftHandles = nodeData.handles.filter((h) => h.position === 'left')
  const rightHandles = nodeData.handles.filter((h) => h.position === 'right')
  const rowCount = Math.max(leftHandles.length, rightHandles.length)
  const rows = Array.from({ length: rowCount }, (_, i) => ({
    left: leftHandles[i] ?? null,
    right: rightHandles[i] ?? null,
  }))

  return (
    <div
      className={clsx(
        'relative min-w-[180px] rounded-xl border-2 shadow-lg cursor-pointer select-none',
        nodeData.bgColor,
        nodeData.color,
        selected && 'ring-2 ring-white ring-offset-1 ring-offset-transparent'
      )}
      onClick={() => selectNode(id)}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-t-[10px] border-b border-white/10">
        <Icon size={14} className="text-white/80 shrink-0" />
        <span className="text-xs font-semibold text-white truncate">{nodeData.label}</span>
        <span className="ml-auto">{STATUS_ICON[status]}</span>
      </div>

      {/* Handle rows — each row is a left/right pair */}
      <div className="px-0 py-1">
        {rows.map((row, i) => (
          <div key={i} className="relative flex items-center justify-between h-6 px-3">
            {/* Left handle + label */}
            <div className="flex items-center gap-1.5">
              {row.left && (
                <>
                  <Handle
                    id={row.left.id}
                    type="target"
                    position={Position.Left}
                    className={clsx('!relative !transform-none !top-auto !left-auto w-2 h-2 border-2 border-gray-900 shrink-0', handleColor)}
                  />
                  <span className="text-[9px] text-white/50 leading-none">{row.left.label}</span>
                </>
              )}
            </div>

            {/* Right handle + label */}
            <div className="flex items-center gap-1.5 ml-auto">
              {row.right && (
                <>
                  <span className="text-[9px] text-white/50 leading-none">{row.right.label}</span>
                  <Handle
                    id={row.right.id}
                    type="source"
                    position={Position.Right}
                    className={clsx('!relative !transform-none !top-auto !right-auto w-2 h-2 border-2 border-gray-900 shrink-0', handleColor)}
                  />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default memo(BaseNodeComponent)
