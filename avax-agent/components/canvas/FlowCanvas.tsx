'use client'

import { useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type NodeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useStore } from '@/store/useStore'
import BaseNodeComponent from '@/components/nodes/BaseNodeComponent'

const nodeTypes: NodeTypes = {
  avaxNode: BaseNodeComponent,
}

export default function FlowCanvas() {
  const {
    nodes, edges,
    onNodesChange, onEdgesChange, onConnect,
    addNodeToCanvas, selectNode,
  } = useStore()

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const type = e.dataTransfer.getData('application/avax-node-type')
      if (!type) return

      const bounds = e.currentTarget.getBoundingClientRect()
      const position = {
        x: e.clientX - bounds.left - 80,
        y: e.clientY - bounds.top - 30,
      }

      addNodeToCanvas(type, position)
    },
    [addNodeToCanvas]
  )

  return (
    <div className="flex-1 relative bg-gray-950" onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onPaneClick={() => selectNode(null)}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#ffffff30', strokeWidth: 1.5 },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} color="#ffffff10" gap={24} size={1} />
        <Controls
          className="!bg-gray-800 !border-white/10 !rounded-xl"
          showInteractive={false}
        />
        <MiniMap
          className="!bg-gray-800 !border-white/10 !rounded-xl"
          nodeColor={(n) => {
            const cat = (n.data as Record<string, unknown>)?.category as string
            return cat === 'data' ? '#3b82f6' : cat === 'logic' ? '#eab308' : cat === 'action' ? '#22c55e' : '#9ca3af'
          }}
          maskColor="#00000060"
        />
      </ReactFlow>

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-2xl mb-2">⛓️</p>
            <p className="text-white/30 text-sm">Drag blocks from the left panel</p>
            <p className="text-white/20 text-xs mt-1">or click a block to place it</p>
          </div>
        </div>
      )}
    </div>
  )
}
