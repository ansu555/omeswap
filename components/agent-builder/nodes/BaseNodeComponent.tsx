"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useStore } from "@/store/agent-builder";
import type {
  HandleDef,
  NodeCategory,
  NodeStatus,
} from "@/types/agent-builder-canvas";
import {
  TrendingUp,
  Wallet,
  ArrowLeftRight,
  GitBranch,
  Bell,
  Calculator,
  Timer,
  Repeat2,
  Target,
  BellRing,
  Play,
  Square,
  Merge,
  Clock,
  MapPin,
  Braces,
  History,
  BarChart2,
  Activity,
  Loader2,
  Circle,
} from "lucide-react";
import clsx from "clsx";

const ICONS: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  TrendingUp,
  Wallet,
  ArrowLeftRight,
  GitBranch,
  Bell,
  Calculator,
  Timer,
  Repeat2,
  Target,
  BellRing,
  Play,
  Square,
  Merge,
  Clock,
  MapPin,
  Braces,
  History,
  BarChart2,
  Activity,
};

// Left-border status strip colors
const STATUS_STRIP: Record<NodeStatus, string> = {
  idle: "bg-white/10",
  running: "bg-blue-400",
  success: "bg-green-400",
  error: "bg-red-400",
};

// Status glow for running/error states
const STATUS_GLOW: Record<NodeStatus, string> = {
  idle: "",
  running: "shadow-[0_0_12px_#3b82f620]",
  success: "",
  error: "shadow-[inset_0_0_8px_#ef444418]",
};

const CATEGORY_HANDLE_COLORS: Record<NodeCategory, string> = {
  data: "bg-blue-400",
  logic: "bg-yellow-400",
  action: "bg-green-400",
  flow: "bg-gray-400",
};

interface NodeData {
  nodeType: string;
  label: string;
  icon: string;
  category: NodeCategory;
  color: string;
  bgColor: string;
  handles: HandleDef[];
  status: NodeStatus;
  [key: string]: unknown;
}

function formatPill(v: unknown): string {
  if (v === null || v === undefined || v === "") return "";
  if (typeof v === "boolean") return v ? "on" : "off";
  if (typeof v === "number") return String(v);
  const s = String(v);
  // shorten addresses
  if (s.startsWith("0x") && s.length > 10) return `${s.slice(0, 6)}…`;
  return s.length > 12 ? s.slice(0, 12) + "…" : s;
}

function formatInlineValue(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "number") {
    return v.toLocaleString(undefined, { maximumFractionDigits: 4 });
  }
  if (typeof v === "boolean") return v ? "✓" : "✗";
  const s = String(v);
  if (s.startsWith("0x") && s.length > 10) return `${s.slice(0, 6)}…`;
  return s.length > 10 ? s.slice(0, 10) + "…" : s;
}

function BaseNodeComponent({ id, data, selected }: NodeProps) {
  const nodeData = data as NodeData;
  const { selectNode, nodeInstances, nodeExecutionData } = useStore();
  const instance = nodeInstances.get(id);
  const status: NodeStatus = instance?.status ?? "idle";
  const execData = nodeExecutionData.get(id);

  const Icon = ICONS[nodeData.icon] ?? Circle;
  const handleColor = CATEGORY_HANDLE_COLORS[nodeData.category];

  const leftHandles = nodeData.handles.filter((h) => h.position === "left");
  const rightHandles = nodeData.handles.filter((h) => h.position === "right");
  const rowCount = Math.max(leftHandles.length, rightHandles.length);
  const rows = Array.from({ length: rowCount }, (_, i) => ({
    left: leftHandles[i] ?? null,
    right: rightHandles[i] ?? null,
  }));

  // Config pills: first 3 non-empty config entries
  const configPills = instance
    ? instance.configSchema
        .slice(0, 3)
        .map((field) => {
          const val = formatPill(instance.config[field.key] ?? field.default);
          if (!val) return null;
          const label =
            field.label.length > 8
              ? field.label.slice(0, 8) + "…"
              : field.label;
          return { label, val };
        })
        .filter(Boolean)
    : [];

  return (
    <div
      className={clsx(
        "relative min-w-[200px] rounded-xl border-2 cursor-pointer select-none overflow-hidden",
        nodeData.bgColor,
        nodeData.color,
        STATUS_GLOW[status],
        selected && "ring-2 ring-white ring-offset-1 ring-offset-transparent",
      )}
      onClick={() => selectNode(id)}
    >
      {/* Left-border status strip */}
      <div
        className={clsx(
          "absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg transition-colors duration-300",
          STATUS_STRIP[status],
          status === "running" && "animate-pulse",
        )}
      />

      {/* Header */}
      <div className="flex items-center gap-2 pl-4 pr-3 py-2.5 rounded-t-[10px] border-b border-border/30">
        {status === "running" ? (
          <Loader2 size={16} className="text-primary animate-spin shrink-0" />
        ) : (
          <Icon size={16} className="text-foreground/60 shrink-0" />
        )}
        <span className="text-sm font-semibold text-foreground truncate flex-1">
          {nodeData.label}
        </span>
      </div>

      {/* Handle rows */}
      <div className="pl-1 pr-0 py-1">
        {rows.map((row, i) => {
          // inline last-run value for right (output) handle
          const outputVal =
            row.right && execData?.outputs[row.right.id] !== undefined
              ? formatInlineValue(execData.outputs[row.right.id])
              : null;

          return (
            <div
              key={i}
              className="relative flex items-center justify-between h-6 pl-3 pr-3"
            >
              {/* Left handle + label */}
              <div className="flex items-center gap-1.5">
                {row.left && (
                  <>
                    <Handle
                      id={row.left.id}
                      type="target"
                      position={Position.Left}
                      className={clsx(
                        "!relative !transform-none !top-auto !left-auto w-2 h-2 border-2 border-gray-900 shrink-0",
                        handleColor,
                      )}
                    />
                    <span className="text-xs text-muted-foreground leading-none">
                      {row.left.label}
                    </span>
                  </>
                )}
              </div>

              {/* Right handle + label + inline value */}
              <div className="flex items-center gap-1.5 ml-auto">
                {row.right && (
                  <>
                    {outputVal && (
                      <span className="text-[9px] text-muted-foreground/70 font-mono tabular-nums leading-none">
                        {outputVal}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground leading-none">
                      {row.right.label}
                    </span>
                    <Handle
                      id={row.right.id}
                      type="source"
                      position={Position.Right}
                      className={clsx(
                        "!relative !transform-none !top-auto !right-auto w-2 h-2 border-2 border-gray-900 shrink-0",
                        handleColor,
                      )}
                    />
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Config pills */}
      {configPills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-3 pb-2.5 pt-1 border-t border-border/20">
          {configPills.map((pill, i) =>
            pill ? (
              <span
                key={i}
                className="flex items-center gap-0.5 text-[9px] font-mono px-2 py-1 rounded-md bg-secondary/20 text-muted-foreground border border-border/30"
              >
                <span className="text-muted-foreground/60">{pill.label}:</span>
                <span className="text-foreground/75">{pill.val}</span>
              </span>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}

export default memo(BaseNodeComponent);
