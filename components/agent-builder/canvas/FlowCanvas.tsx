"use client";

import { useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useStore } from "@/store/agent-builder";
import BaseNodeComponent from "@/components/agent-builder/nodes/BaseNodeComponent";
import { LayoutTemplate, Bot, Play, Circle } from "lucide-react";
import clsx from "clsx";

const nodeTypes: NodeTypes = {
  avaxNode: BaseNodeComponent,
};

export default function FlowCanvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNodeToCanvas,
    selectNode,
    setWorkflowsOpen,
    setAgentOpen,
    botRunning,
    logs,
  } = useStore();

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("application/avax-node-type");
      if (!type) return;

      const bounds = e.currentTarget.getBoundingClientRect();
      const position = {
        x: e.clientX - bounds.left - 80,
        y: e.clientY - bounds.top - 30,
      };

      addNodeToCanvas(type, position);
    },
    [addNodeToCanvas],
  );

  // Last run timestamp from most recent log entry
  const lastRunTime = useMemo(() => {
    if (logs.length === 0) return null;
    const last = logs[logs.length - 1];
    return last.timestamp.toLocaleTimeString();
  }, [logs]);

  // AVAX exposure: sum amountIn from all swap nodes
  const avaxExposure = useMemo(() => {
    let total = 0;
    for (const node of nodes) {
      const nodeType = (node.data as Record<string, unknown>)
        ?.nodeType as string;
      if (nodeType === "swap" || nodeType === "limit_order") {
        const id = node.id;
        // read from nodeInstances via store — accessed indirectly through node.data config
        const config = (node.data as Record<string, unknown>)?.config as
          | Record<string, unknown>
          | undefined;
        if (config?.amountIn) total += parseFloat(String(config.amountIn)) || 0;
      }
    }
    return total;
  }, [nodes]);

  // Complexity label
  const complexity = useMemo(() => {
    const n = nodes.length;
    if (n === 0) return null;
    if (n <= 5) return { label: "Simple", color: "text-green-400" };
    if (n <= 12) return { label: "Moderate", color: "text-yellow-400" };
    return { label: "Complex", color: "text-orange-400" };
  }, [nodes.length]);

  return (
    <div
      className="flex-1 relative bg-[#05050f] flex flex-col"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="flex-1 relative">
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
            style: { stroke: "#5227FF40", strokeWidth: 1.5 },
          }}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            color={botRunning ? "#5227FF50" : "#5227FF30"}
            gap={24}
            size={1}
            className={botRunning ? "canvas-pulse" : ""}
          />
          <Controls
            className="!bg-black/70 !backdrop-blur-xl !border-purple-500/15 !rounded-xl"
            showInteractive={false}
          />
          <MiniMap
            className="!bg-black/70 !backdrop-blur-xl !border-purple-500/15 !rounded-xl"
            nodeColor={(n) => {
              const cat = (n.data as Record<string, unknown>)
                ?.category as string;
              return cat === "data"
                ? "#3b82f6"
                : cat === "logic"
                  ? "#eab308"
                  : cat === "action"
                    ? "#22c55e"
                    : "#a855f7";
            }}
            maskColor="#00000070"
          />
        </ReactFlow>

        {/* Empty state quick-start */}
        <AnimatePresence>
          {nodes.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="text-center pointer-events-auto">
                <p className="text-foreground/60 text-sm mb-1 font-medium">
                  Start building your trading strategy
                </p>
                <p className="text-muted-foreground/50 text-xs mb-8">
                  or drag a node from the left panel
                </p>

                <div className="flex items-stretch gap-3">
                  {/* Browse Templates */}
                  <button
                    onClick={() => setWorkflowsOpen(true)}
                    className="flex flex-col items-center gap-3 px-6 py-5 rounded-2xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 hover:border-purple-500/35 transition-all group w-36"
                  >
                    <LayoutTemplate
                      size={22}
                      className="text-primary/60 group-hover:text-primary transition-colors"
                    />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground/80 transition-colors">
                        Browse Templates
                      </p>
                      <p className="text-[9px] text-muted-foreground/50 mt-0.5">
                        Pre-built strategies
                      </p>
                    </div>
                  </button>

                  {/* AI Build */}
                  <button
                    onClick={() => setAgentOpen(true)}
                    className="flex flex-col items-center gap-3 px-6 py-5 rounded-2xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 hover:border-purple-500/35 transition-all group w-36"
                  >
                    <Bot
                      size={22}
                      className="text-primary/60 group-hover:text-primary transition-colors"
                    />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground/80 transition-colors">
                        AI Build
                      </p>
                      <p className="text-[9px] text-muted-foreground/50 mt-0.5">
                        Describe your strategy
                      </p>
                    </div>
                  </button>

                  {/* Quick Start */}
                  <button
                    onClick={() => addNodeToCanvas("start", { x: 200, y: 200 })}
                    className="flex flex-col items-center gap-3 px-6 py-5 rounded-2xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 hover:border-purple-500/35 transition-all group w-36"
                  >
                    <Play
                      size={22}
                      className="text-primary/60 group-hover:text-primary transition-colors"
                    />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground/80 transition-colors">
                        Quick Start
                      </p>
                      <p className="text-[9px] text-muted-foreground/50 mt-0.5">
                        Add Start node
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom status bar */}
      <div className="h-7 shrink-0 border-t border-border/30 bg-background/50 flex items-center px-4 gap-4 text-xs font-mono text-muted-foreground/60">
        {/* Node + edge count */}
        <div className="flex items-center gap-1.5">
          <Circle
            size={6}
            className={clsx(
              botRunning ? "text-green-400 animate-pulse" : "text-white/20",
            )}
          />
          <span>{nodes.length} nodes</span>
          <span className="text-white/15">·</span>
          <span>{edges.length} edges</span>
        </div>

        {lastRunTime && (
          <>
            <span className="text-white/10">|</span>
            <span>Last run: {lastRunTime}</span>
          </>
        )}

        {avaxExposure > 0 && (
          <>
            <span className="text-white/10">|</span>
            <span
              className={
                avaxExposure > 5 ? "text-amber-400/70" : "text-white/25"
              }
            >
              Exposure: {avaxExposure.toFixed(4)} AVAX
            </span>
          </>
        )}

        {complexity && (
          <>
            <span className="text-white/10">|</span>
            <span className={complexity.color + "/60"}>{complexity.label}</span>
          </>
        )}

        <div className="flex-1" />

        <span className="text-white/15">? for shortcuts</span>
      </div>
    </div>
  );
}
