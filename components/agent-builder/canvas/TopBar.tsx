"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/agent-builder";
import { runBot } from "@/lib/agent-builder/engine/BotRunner";
import { fetchBinanceHistory } from "@/lib/agent-builder/backtest/fetchHistory";
import { runBacktest } from "@/lib/agent-builder/backtest/BacktestRunner";
import { ScheduleTriggerNode } from "@/lib/agent-builder/nodes/flow/ScheduleTriggerNode";
import { useAvalancheWallet } from "@/hooks/use-avalanche-wallet";
import { ethers } from "ethers";
import {
  Play,
  Square,
  ChevronDown,
  ChevronUp,
  Trash2,
  Clock,
  LineChart,
  FolderOpen,
  Timer,
  Download,
  AlertCircle,
  Info,
  AlertTriangle,
} from "lucide-react";
import clsx from "clsx";
import WorkflowManager from "./WorkflowManager";
import BacktestConfigStrip from "./BacktestConfigStrip";
import BacktestSummaryModal from "./BacktestSummaryModal";
import type { LogEntry } from "@/types/agent-builder-canvas";

type LogFilter = "all" | "info" | "warn" | "error";

export default function TopBar() {
  const {
    walletAddress,
    setWallet,
    botRunning,
    setBotRunning,
    nodes,
    edges,
    nodeInstances,
    addLog,
    clearLogs,
    logs,
    setNodeExecutionData,
    clearExecutionData,
    addToast,
    chartOpen,
    setChartOpen,
    addChartMarker,
    clearChartMarkers,
    backtestMode,
    setBacktestMode,
    backtestConfig,
    setBacktestSummary,
    setBacktestProgress,
    workflowsOpen,
    setWorkflowsOpen,
    selectNode,
  } = useStore();
  const { address: connectedAddress, isConnected: walletConnected } =
    useAvalancheWallet();

  const [showLogs, setShowLogs] = useState(false);
  const [logFilter, setLogFilter] = useState<LogFilter>("all");
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const stopRequestedRef = useRef(false);

  useEffect(() => {
    setWallet(connectedAddress ?? null);

    let cancelled = false;

    async function syncSignerFromConnectedWallet() {
      if (
        !walletConnected ||
        !connectedAddress ||
        typeof window === "undefined" ||
        !window.ethereum
      ) {
        setProvider(null);
        setSigner(null);
        return;
      }

      try {
        const p = new ethers.BrowserProvider(window.ethereum);
        const s = await p.getSigner();
        if (!cancelled) {
          setProvider(p);
          setSigner(s);
        }
      } catch {
        if (!cancelled) {
          setProvider(null);
          setSigner(null);
        }
      }
    }

    syncSignerFromConnectedWallet();

    return () => {
      cancelled = true;
    };
  }, [connectedAddress, walletConnected, setWallet]);

  function getScheduleNode(): ScheduleTriggerNode | null {
    for (const [, inst] of nodeInstances) {
      if (inst instanceof ScheduleTriggerNode) return inst;
    }
    return null;
  }

  async function executeOnce(context: Parameters<typeof runBot>[3]) {
    await runBot(
      nodes,
      edges,
      nodeInstances,
      context,
      (nodeId, nodeLabel, msg, level) => addLog(nodeId, nodeLabel, msg, level),
      () => {},
      (nodeId, inputs, outputs) =>
        setNodeExecutionData(nodeId, inputs, outputs),
      (message, level) => addToast(message, level),
      (marker) => addChartMarker(marker),
    );
  }

  async function handleRun() {
    if (botRunning) {
      stopRequestedRef.current = true;
      setBotRunning(false);
      return;
    }

    stopRequestedRef.current = false;
    setBotRunning(true);
    clearLogs();
    clearExecutionData();

    const context = {
      walletAddress,
      provider,
      signer,
      addLog: () => {},
      showToast: () => {},
      addChartMarker: () => {},
    };

    const scheduleNode = getScheduleNode();

    if (scheduleNode) {
      scheduleNode.reset();
      while (!stopRequestedRef.current) {
        if (!scheduleNode.shouldContinue()) {
          addLog(
            "",
            "Scheduler",
            `Max runs (${scheduleNode.getMaxRuns()}) reached — stopping`,
          );
          break;
        }
        await executeOnce(context);
        if (stopRequestedRef.current) break;
        const intervalMs = scheduleNode.getInterval() * 1000;
        addLog("", "Scheduler", `Next run in ${scheduleNode.getInterval()}s…`);
        await new Promise<void>((resolve) => {
          const id = setTimeout(resolve, intervalMs);
          const poll = setInterval(() => {
            if (stopRequestedRef.current) {
              clearTimeout(id);
              clearInterval(poll);
              resolve();
            }
          }, 200);
          setTimeout(() => clearInterval(poll), intervalMs + 500);
        });
      }
      addLog("", "Scheduler", "Schedule stopped");
    } else {
      try {
        await executeOnce(context);
      } catch {
        // errors handled inside runBot
      }
    }

    setBotRunning(false);
  }

  async function handleBacktest() {
    if (botRunning) {
      stopRequestedRef.current = true;
      setBotRunning(false);
      return;
    }

    const { symbol, interval, startDate, endDate } = backtestConfig;
    if (!startDate || !endDate || startDate >= endDate) {
      addToast("Invalid date range for backtest", "error");
      return;
    }

    stopRequestedRef.current = false;
    setBotRunning(true);
    clearLogs();
    clearExecutionData();
    setBacktestProgress(null);
    setBacktestSummary(null);

    if (!chartOpen) setChartOpen(true);
    clearChartMarkers();

    try {
      addToast(`Fetching ${symbol} ${interval} history…`, "info");
      const candles = await fetchBinanceHistory(
        symbol,
        interval,
        new Date(startDate).getTime(),
        new Date(endDate).getTime() + 86_400_000,
      );
      addToast(
        `Loaded ${candles.length.toLocaleString()} candles — running backtest…`,
        "info",
      );

      const summary = await runBacktest(candles, nodes, edges, nodeInstances, {
        onLog: (nodeId, nodeLabel, msg, level) =>
          addLog(nodeId, nodeLabel, msg, level),
        onStatus: () => {},
        onIO: (nodeId, inputs, outputs) =>
          setNodeExecutionData(nodeId, inputs, outputs),
        onToast: (msg, level) => addToast(msg, level),
        onMarker: (marker) => addChartMarker(marker),
        onProgress: (tick, total) => setBacktestProgress({ tick, total }),
        stopRequested: () => stopRequestedRef.current,
      });

      setBacktestSummary(summary);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Backtest failed", "error");
    } finally {
      setBacktestProgress(null);
      setBotRunning(false);
    }
  }

  const handleExportLogs = useCallback(() => {
    const text = logs
      .map(
        (l) =>
          `[${l.timestamp.toLocaleTimeString()}] ${l.level.toUpperCase()} ${l.nodeLabel ? `[${l.nodeLabel}] ` : ""}${l.message}`,
      )
      .join("\n");
    navigator.clipboard
      .writeText(text)
      .then(() => addToast("Logs copied to clipboard", "info"));
  }, [logs, addToast]);

  const handleLogRowClick = useCallback(
    (log: LogEntry) => {
      if (log.nodeId) selectNode(log.nodeId);
    },
    [selectNode],
  );

  const filteredLogs =
    logFilter === "all" ? logs : logs.filter((l) => l.level === logFilter);

  const schedNode = getScheduleNode();
  const isScheduled = !!schedNode;

  const LOG_FILTER_ICON: Record<LogFilter, React.ReactNode> = {
    all: null,
    info: <Info size={11} />,
    warn: <AlertTriangle size={11} />,
    error: <AlertCircle size={11} />,
  };

  return (
    <>
      {workflowsOpen && (
        <WorkflowManager onClose={() => setWorkflowsOpen(false)} />
      )}
      <BacktestSummaryModal />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={clsx(
          "flex flex-col border-b backdrop-blur-xl",
          "bg-background/50",
          backtestMode
            ? "border-b-2 border-b-amber-500/70"
            : "border-b border-border/60",
        )}
      >
        {/* Main toolbar row */}
        <div className="flex items-center gap-2 px-4 py-2.5">
          {/* ── ZONE 1: Brand + Mode ── */}
          <div className="flex items-center">
            {/* Mode toggle */}
            <div className="flex rounded-full border border-border/50 overflow-hidden">
              <button
                onClick={() => setBacktestMode(false)}
                className={clsx(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  !backtestMode
                    ? "bg-success/20 text-success"
                    : "text-muted-foreground hover:text-foreground/60",
                )}
              >
                Live
              </button>
              <button
                onClick={() => setBacktestMode(true)}
                className={clsx(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  backtestMode
                    ? "bg-warning/20 text-warning"
                    : "text-muted-foreground hover:text-foreground/60",
                )}
              >
                Backtest
              </button>
            </div>
          </div>

          {/* Zone 1 / Zone 2 divider */}
          <div className="w-px h-5 bg-border/60 mx-1.5" />

          {/* ── ZONE 2: Execution ── */}
          {backtestMode ? (
            <button
              onClick={handleBacktest}
              disabled={nodes.length === 0}
              className={clsx(
                "flex items-center gap-2 px-5 py-1.5 rounded-full text-sm font-semibold transition-all disabled:opacity-40",
                botRunning
                  ? "bg-destructive hover:bg-destructive/90 text-foreground"
                  : "bg-warning hover:bg-warning/90 text-foreground",
              )}
            >
              {botRunning ? (
                <>
                  <Square size={14} /> Stop
                </>
              ) : (
                <>
                  <Timer size={14} /> Run Backtest
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleRun}
              disabled={nodes.length === 0}
              className={clsx(
                "flex items-center gap-2 px-5 py-1.5 rounded-full text-xs font-semibold transition-all disabled:opacity-40",
                botRunning
                  ? "bg-destructive hover:bg-destructive/90 text-foreground"
                  : isScheduled
                    ? "bg-warning hover:bg-warning/90 text-foreground"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground",
              )}
            >
              {botRunning ? (
                <>
                  <Square size={14} /> Stop
                </>
              ) : isScheduled ? (
                <>
                  <Clock size={14} /> Run (every {schedNode!.getInterval()}s)
                </>
              ) : (
                <>
                  <Play size={14} /> Run Bot
                </>
              )}
            </button>
          )}

          {/* Zone 2 / Zone 3 divider */}
          <div className="w-px h-5 bg-border/50 mx-1.5" />

          {/* ── ZONE 3: Utilities ── */}
          <div className="flex items-center gap-1.5 flex-1">
            {/* Chart toggle */}
            <button
              onClick={() => setChartOpen(!chartOpen)}
              className={clsx(
                "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all",
                chartOpen
                  ? "bg-primary/20 border-primary/40 text-primary"
                  : "text-muted-foreground hover:text-foreground border-border/50 hover:border-primary/40 hover:bg-primary/10",
              )}
            >
              <LineChart size={14} />
              Chart
            </button>

            {/* Logs toggle */}
            <button
              onClick={() => setShowLogs((v) => !v)}
              className={clsx(
                "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all",
                showLogs
                  ? "bg-primary/20 border-primary/40 text-primary"
                  : "text-muted-foreground hover:text-foreground border-border/50 hover:border-primary/40 hover:bg-primary/10",
              )}
            >
              Logs
              {logs.length > 0 && (
                <span
                  className={clsx(
                    "text-[8px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center font-mono font-medium",
                    logs.some((l) => l.level === "error")
                      ? "bg-destructive/30 text-destructive"
                      : logs.some((l) => l.level === "warn")
                        ? "bg-warning/30 text-warning"
                        : "bg-secondary/30 text-muted-foreground",
                  )}
                >
                  {logs.length}
                </span>
              )}
              {showLogs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {/* Workflows */}
            <button
              onClick={() => setWorkflowsOpen(true)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border/50 hover:border-primary/40 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all"
            >
              <FolderOpen size={14} />
              Workflows
            </button>

            <div className="flex-1" />
          </div>
        </div>

        {/* Backtest config strip */}
        {backtestMode && <BacktestConfigStrip />}

        {/* Log drawer */}
        <AnimatePresence>
          {showLogs && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden border-t border-border/60 bg-background/80"
            >
              {/* Log toolbar */}
              <div className="flex items-center gap-2 px-4 py-1.5 sticky top-0 bg-background/90 backdrop-blur border-b border-border/50">
                <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider flex-1">
                  Execution Log
                </span>

                {/* Filter tabs */}
                <div className="flex items-center gap-0.5">
                  {(["all", "info", "warn", "error"] as LogFilter[]).map(
                    (f) => (
                      <button
                        key={f}
                        onClick={() => setLogFilter(f)}
                        className={clsx(
                          "flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors",
                          logFilter === f
                            ? f === "error"
                              ? "bg-destructive/30 text-destructive"
                              : f === "warn"
                                ? "bg-warning/30 text-warning"
                                : "bg-primary/30 text-primary"
                            : "text-muted-foreground/50 hover:text-muted-foreground",
                        )}
                      >
                        {LOG_FILTER_ICON[f]}
                        <span className="capitalize">{f}</span>
                        {f !== "all" && (
                          <span className="text-[9px] opacity-60">
                            ({logs.filter((l) => l.level === f).length})
                          </span>
                        )}
                      </button>
                    ),
                  )}
                </div>

                <div className="w-px h-3.5 bg-border/50" />

                {/* Export */}
                <button
                  onClick={handleExportLogs}
                  disabled={logs.length === 0}
                  title="Copy logs to clipboard"
                  className="text-muted-foreground/50 hover:text-muted-foreground transition-colors disabled:opacity-30"
                >
                  <Download size={14} />
                </button>

                {/* Clear */}
                <button
                  onClick={clearLogs}
                  title="Clear logs"
                  className="text-muted-foreground/50 hover:text-destructive transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Log entries */}
              <div className="max-h-44 overflow-y-auto">
                {filteredLogs.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-muted-foreground/50 font-mono">
                    {logFilter === "all"
                      ? "No logs yet"
                      : `No ${logFilter} logs`}
                  </p>
                ) : (
                  <div className="px-1 pb-1.5 space-y-px font-mono text-xs">
                    {filteredLogs.map((log) => (
                      <button
                        key={log.id}
                        onClick={() => handleLogRowClick(log)}
                        className={clsx(
                          "w-full text-left flex items-start gap-2.5 px-3 py-1 rounded transition-colors",
                          "hover:bg-white/5",
                          log.nodeId ? "cursor-pointer" : "cursor-default",
                          log.level === "error"
                            ? "text-destructive"
                            : log.level === "warn"
                              ? "text-warning"
                              : "text-muted-foreground",
                        )}
                      >
                        <span className="text-muted-foreground/40 shrink-0 tabular-nums">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                        {log.nodeLabel && (
                          <span className="text-muted-foreground/50 shrink-0">
                            [{log.nodeLabel}]
                          </span>
                        )}
                        <span className="truncate">{log.message}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
