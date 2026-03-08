"use client";

import TopBar from "@/components/agent-builder/canvas/TopBar";
import NodePalette from "@/components/agent-builder/canvas/NodePalette";
import FlowCanvas from "@/components/agent-builder/canvas/FlowCanvas";
import ConfigPanel from "@/components/agent-builder/canvas/ConfigPanel";
import ToastContainer from "@/components/agent-builder/canvas/ToastContainer";
import ChartPanel from "@/components/agent-builder/canvas/ChartPanel";
import AgentSidebar from "@/components/agent-builder/canvas/AgentSidebar";
import { useStore } from "@/store/agent-builder";
import LiquidEther from "@/components/ui/liquid-ether";

export default function AgentBuilderPage() {
  const { chartOpen, setChartOpen, agentOpen } = useStore();

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* LiquidEther background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
        <LiquidEther
          colors={["#5227FF", "#FF9FFC", "#B19EEF"]}
          mouseForce={15}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.4}
          autoIntensity={1.5}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full overflow-hidden">
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
    </div>
  );
}
