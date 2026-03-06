"use client";

import { useState, useEffect } from "react";
import {
  useStore,
  listWorkflows,
  type SavedWorkflow,
} from "@/store/agent-builder";
import { WORKFLOW_TEMPLATES } from "@/lib/agent-builder/templates";
import { X, Save, FolderOpen, Trash2, FolderX, Sparkles } from "lucide-react";
import clsx from "clsx";

interface Props {
  onClose: () => void;
}

type Tab = "mine" | "templates";

const TAG_COLORS: Record<string, string> = {
  beginner: "bg-green-900/40 text-green-400 border-green-700/40",
  intermediate: "bg-yellow-900/40 text-yellow-400 border-yellow-700/40",
  trading: "bg-red-900/40 text-red-400 border-red-700/40",
  chart: "bg-blue-900/40 text-blue-400 border-blue-700/40",
  btc: "bg-orange-900/40 text-orange-400 border-orange-700/40",
  avax: "bg-red-900/40 text-red-400 border-red-700/40",
  sma: "bg-purple-900/40 text-purple-400 border-purple-700/40",
  dca: "bg-teal-900/40 text-teal-400 border-teal-700/40",
  swap: "bg-green-900/40 text-green-400 border-green-700/40",
  accumulator: "bg-yellow-900/40 text-yellow-400 border-yellow-700/40",
};

export default function WorkflowManager({ onClose }: Props) {
  const {
    saveWorkflow,
    loadWorkflow,
    deleteWorkflow,
    loadTemplate,
    clearCanvas,
    nodes,
  } = useStore();
  const [tab, setTab] = useState<Tab>("templates");
  const [workflows, setWorkflows] = useState<SavedWorkflow[]>([]);
  const [saveName, setSaveName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    setWorkflows(listWorkflows());
  }, []);

  function handleSave() {
    if (!saveName.trim()) return;
    saveWorkflow(saveName);
    setSaveName("");
    setWorkflows(listWorkflows());
  }

  function handleLoad(id: string) {
    loadWorkflow(id);
    onClose();
  }

  function handleDelete(id: string) {
    deleteWorkflow(id);
    setConfirmDelete(null);
    setWorkflows(listWorkflows());
  }

  function handleLoadTemplate(id: string) {
    loadTemplate(id);
    onClose();
  }

  function handleClear() {
    clearCanvas();
    setConfirmClear(false);
    onClose();
  }

  function formatDate(ms: number) {
    return new Date(ms).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/15 rounded-2xl shadow-2xl w-[520px] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <FolderOpen size={16} className="text-white/60" />
          <span className="text-sm font-semibold text-white">Workflows</span>
          <button
            onClick={onClose}
            className="ml-auto text-white/30 hover:text-white/70 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 px-5">
          {(
            [
              ["templates", "Templates", <Sparkles size={12} />],
              ["mine", "My Workflows", <FolderOpen size={12} />],
            ] as const
          ).map(([id, label, icon]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={clsx(
                "flex items-center gap-1.5 text-xs px-3 py-2.5 border-b-2 transition-colors -mb-px",
                tab === id
                  ? "border-red-400 text-white"
                  : "border-transparent text-white/40 hover:text-white/70",
              )}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* ── TEMPLATES TAB ── */}
        {tab === "templates" && (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {WORKFLOW_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                className="rounded-xl border border-white/10 bg-white/5 hover:border-white/20 transition-colors"
              >
                <div className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <p className="text-xs font-semibold text-white">
                      {tpl.name}
                    </p>
                    <button
                      onClick={() => handleLoadTemplate(tpl.id)}
                      className="shrink-0 text-[10px] px-2.5 py-1 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors"
                    >
                      Use Template
                    </button>
                  </div>
                  <p className="text-[11px] text-white/45 mb-2 leading-relaxed">
                    {tpl.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {tpl.tags.map((tag) => (
                      <span
                        key={tag}
                        className={clsx(
                          "text-[9px] px-1.5 py-0.5 rounded border font-mono",
                          TAG_COLORS[tag] ??
                            "bg-white/5 text-white/30 border-white/10",
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="text-[9px] px-1.5 py-0.5 rounded border bg-white/5 text-white/30 border-white/10 font-mono ml-auto">
                      {tpl.nodes.length} nodes
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── MY WORKFLOWS TAB ── */}
        {tab === "mine" && (
          <>
            {/* Save current */}
            <div className="px-5 py-4 border-b border-white/10">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">
                Save current canvas ({nodes.length} nodes)
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  placeholder="Workflow name…"
                  className="flex-1 bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder-white/25 focus:outline-none focus:border-white/40"
                />
                <button
                  onClick={handleSave}
                  disabled={!saveName.trim() || nodes.length === 0}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-30 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  <Save size={12} />
                  Save
                </button>
              </div>
              {nodes.length === 0 && (
                <p className="text-[10px] text-yellow-400/60 mt-1.5">
                  Canvas is empty — nothing to save
                </p>
              )}
            </div>

            {/* Saved list */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
              {workflows.length === 0 ? (
                <div className="text-center py-10">
                  <FolderOpen
                    size={28}
                    className="text-white/15 mx-auto mb-2"
                  />
                  <p className="text-xs text-white/25">
                    No saved workflows yet
                  </p>
                  <p className="text-[10px] text-white/15 mt-1">
                    Build something and save it here
                  </p>
                </div>
              ) : (
                workflows.map((wf) => (
                  <div
                    key={wf.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/8 hover:border-white/15 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">
                        {wf.name}
                      </p>
                      <p className="text-[10px] text-white/35 mt-0.5">
                        {wf.nodes.length} nodes · {wf.edges.length} edges ·{" "}
                        {formatDate(wf.savedAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleLoad(wf.id)}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-colors shrink-0"
                    >
                      Load
                    </button>
                    {confirmDelete === wf.id ? (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleDelete(wf.id)}
                          className="text-[10px] px-2 py-1 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-[10px] px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white/70 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(wf.id)}
                        className="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-white/10">
              {confirmClear ? (
                <div className="flex items-center gap-2">
                  <p className="text-xs text-white/50 flex-1">
                    Clear canvas and start fresh?
                  </p>
                  <button
                    onClick={handleClear}
                    className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white/70 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="flex items-center gap-1.5 text-xs text-white/30 hover:text-red-400 transition-colors"
                >
                  <FolderX size={13} />
                  Clear canvas
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
