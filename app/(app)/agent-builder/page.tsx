"use client";

import TopBar from "@/components/agent-builder/canvas/TopBar";
import NodePalette from "@/components/agent-builder/canvas/NodePalette";
import FlowCanvas from "@/components/agent-builder/canvas/FlowCanvas";
import ConfigPanel from "@/components/agent-builder/canvas/ConfigPanel";
import ToastContainer from "@/components/agent-builder/canvas/ToastContainer";
import ChartPanel from "@/components/agent-builder/canvas/ChartPanel";
import AgentSidebar from "@/components/agent-builder/canvas/AgentSidebar";
import { useStore } from "@/store/agent-builder";

export default function AgentBuilderPage() {
  const { chartOpen, setChartOpen, agentOpen } = useStore();

  return (
    <div className="flex flex-col h-full bg-gray-950 text-white overflow-hidden pt-16">
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
  );
}
