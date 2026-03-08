"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/store/agent-builder";
import { X, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import clsx from "clsx";

const DATA_TYPE_COLORS: Record<string, string> = {
  number: "text-blue-400 bg-blue-900/30 border-blue-700/40",
  boolean: "text-yellow-400 bg-yellow-900/30 border-yellow-700/40",
  signal: "text-green-400 bg-green-900/30 border-green-700/40",
  string: "text-purple-400 bg-purple-900/30 border-purple-700/40",
  any: "text-gray-400 bg-gray-900/30 border-gray-700/40",
};

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "number")
    return v.toLocaleString(undefined, { maximumFractionDigits: 6 });
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "string" && v.startsWith("0x")) return `${v.slice(0, 10)}…`;
  return String(v);
}

export default function ConfigPanel() {
  const {
    selectedNodeId,
    nodeInstances,
    updateNodeConfig,
    selectNode,
    removeNode,
    nodeExecutionData,
  } = useStore();

  const instance = selectedNodeId ? nodeInstances.get(selectedNodeId) : null;
  const [localConfig, setLocalConfig] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (instance) setLocalConfig({ ...instance.config });
  }, [selectedNodeId, instance]);

  if (!instance || !selectedNodeId) {
    return null;
  }

  function handleChange(key: string, value: unknown) {
    const next = { ...localConfig, [key]: value };
    setLocalConfig(next);
    updateNodeConfig(selectedNodeId!, next);
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
      className="w-72 shrink-0 bg-gradient-to-b from-secondary/10 to-background/20 backdrop-blur-md border-l border-border/50 overflow-y-auto flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
        <div
          className={clsx(
            "w-2.5 h-2.5 rounded-full flex-shrink-0",
            instance.color.replace("border-", "bg-"),
          )}
        />
        <span className="text-sm font-semibold text-foreground flex-1 truncate">
          {instance.label}
        </span>
        <button
          onClick={() => {
            removeNode(selectedNodeId);
            selectNode(null);
          }}
          className="text-destructive/60 hover:text-destructive transition-colors"
          title="Delete node"
        >
          <Trash2 size={16} />
        </button>
        <button
          onClick={() => selectNode(null)}
          className="text-foreground/30 hover:text-foreground/60 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Description */}
      <p className="px-4 py-2.5 text-xs text-muted-foreground border-b border-border/20">
        {instance.description}
      </p>

      {/* Config fields */}
      <div className="flex-1 px-4 py-4 space-y-4">
        {instance.configSchema.length === 0 ? (
          <p className="text-xs text-muted-foreground/50">
            No configuration needed
          </p>
        ) : (
          instance.configSchema.map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                {field.label}
              </label>

              {field.type === "select" ? (
                <select
                  value={String(localConfig[field.key] ?? field.default ?? "")}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="w-full bg-secondary/30 border border-border/40 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                >
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : field.type === "number" ? (
                <input
                  type="number"
                  value={String(localConfig[field.key] ?? field.default ?? 0)}
                  onChange={(e) =>
                    handleChange(field.key, parseFloat(e.target.value))
                  }
                  className="w-full bg-secondary/30 border border-border/40 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder={field.placeholder}
                />
              ) : field.type === "toggle" ? (
                <button
                  onClick={() =>
                    handleChange(field.key, !localConfig[field.key])
                  }
                  className={clsx(
                    "w-11 h-6 rounded-full transition-colors relative",
                    localConfig[field.key] ? "bg-primary" : "bg-secondary/40",
                  )}
                >
                  <span
                    className={clsx(
                      "absolute top-0.5 w-5 h-5 bg-background rounded-full shadow transition-transform",
                      localConfig[field.key]
                        ? "translate-x-5"
                        : "translate-x-0.5",
                    )}
                  />
                </button>
              ) : (
                <input
                  type="text"
                  value={String(localConfig[field.key] ?? field.default ?? "")}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="w-full bg-secondary/30 border border-border/40 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* Handles (ports) */}
      <div className="px-4 py-3 border-t border-border/20">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
          Ports
        </p>
        <div className="space-y-1.5">
          {instance.handles.map((h) => (
            <div key={h.id} className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground/40 flex-shrink-0">
                {h.type === "target" ? (
                  <ArrowRight size={14} />
                ) : (
                  <ArrowLeft size={14} />
                )}
              </span>
              <span className="text-muted-foreground flex-1">{h.label}</span>
              <span
                className={clsx(
                  "text-[10px] px-2 py-0.5 rounded border font-mono",
                  DATA_TYPE_COLORS[h.dataType] ?? DATA_TYPE_COLORS.any,
                )}
              >
                {h.dataType}
              </span>
              <span className="text-[10px] text-muted-foreground/40 flex-shrink-0">
                {h.type === "target" ? "in" : "out"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Last run I/O */}
      {nodeExecutionData.get(selectedNodeId) &&
        (() => {
          const { inputs, outputs } = nodeExecutionData.get(selectedNodeId)!;
          const hasInputs = Object.keys(inputs).length > 0;
          const hasOutputs = Object.keys(outputs).length > 0;
          return (
            <div className="px-4 py-3 border-t border-border/20">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                Last Run
              </p>
              {hasInputs && (
                <div className="mb-3">
                  <p className="text-[10px] text-muted-foreground/50 mb-1.5 uppercase tracking-wide">
                    Inputs
                  </p>
                  <div className="space-y-1">
                    {Object.entries(inputs).map(([k, v]) => (
                      <div
                        key={k}
                        className="flex items-center gap-1.5 font-mono text-xs"
                      >
                        <span className="text-muted-foreground/60">{k}:</span>
                        <span className="text-success/80 truncate">
                          {formatValue(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {hasOutputs && (
                <div>
                  <p className="text-[10px] text-muted-foreground/50 mb-1.5 uppercase tracking-wide">
                    Outputs
                  </p>
                  <div className="space-y-1">
                    {Object.entries(outputs).map(([k, v]) => (
                      <div
                        key={k}
                        className="flex items-center gap-1.5 font-mono text-xs"
                      >
                        <span className="text-muted-foreground/60">{k}:</span>
                        <span className="text-primary/80 truncate">
                          {formatValue(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {!hasInputs && !hasOutputs && (
                <p className="text-xs text-muted-foreground/40">No data</p>
              )}
            </div>
          );
        })()}

      {/* Node ID footer */}
      <div className="px-3 py-2 border-t border-purple-500/5">
        <p className="text-[9px] text-white/20 font-mono">{selectedNodeId}</p>
      </div>
    </motion.aside>
  );
}
