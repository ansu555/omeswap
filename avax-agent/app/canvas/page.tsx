'use client'

import TopBar from '@/components/canvas/TopBar'
import NodePalette from '@/components/canvas/NodePalette'
import FlowCanvas from '@/components/canvas/FlowCanvas'
import ConfigPanel from '@/components/canvas/ConfigPanel'
import ToastContainer from '@/components/canvas/ToastContainer'
import ChartPanel from '@/components/canvas/ChartPanel'
import AgentSidebar from '@/components/canvas/AgentSidebar'
import { useStore } from '@/store/useStore'

export default function CanvasPage() {
  const { chartOpen, setChartOpen, agentOpen } = useStore()

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden">
      <TopBar />
      <div className="flex flex-1 min-h-0">
        <NodePalette />
        <FlowCanvas />
        <ConfigPanel />
        {agentOpen && <AgentSidebar />}
      </div>
      <ToastContainer />
      {chartOpen && <ChartPanel onClose={() => setChartOpen(false)} />}
    </div>
  )
}
