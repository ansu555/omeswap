'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/agent-builder'
import { connectMetaMask } from '@/lib/agent-builder/avalanche/provider'
import { runBot } from '@/lib/agent-builder/engine/BotRunner'
import { fetchBinanceHistory } from '@/lib/agent-builder/backtest/fetchHistory'
import { runBacktest } from '@/lib/agent-builder/backtest/BacktestRunner'
import { ScheduleTriggerNode } from '@/lib/agent-builder/nodes/flow/ScheduleTriggerNode'
import { ethers } from 'ethers'
import Image from 'next/image'
import {
  Wallet, Play, Square, ChevronDown, ChevronUp, Trash2, Clock,
  LineChart, FolderOpen, Bot, Timer, Download, AlertCircle, Info, AlertTriangle,
} from 'lucide-react'
import clsx from 'clsx'
import WorkflowManager from './WorkflowManager'
import BacktestConfigStrip from './BacktestConfigStrip'
import BacktestSummaryModal from './BacktestSummaryModal'
import type { LogEntry } from '@/types/agent-builder-canvas'

type LogFilter = 'all' | 'info' | 'warn' | 'error'

export default function TopBar() {
  const {
    walletAddress, isConnected, setWallet,
    botRunning, setBotRunning,
    nodes, edges, nodeInstances,
    addLog, clearLogs, logs,
    setNodeExecutionData, clearExecutionData, addToast,
    chartOpen, setChartOpen, addChartMarker, clearChartMarkers,
    agentOpen, setAgentOpen,
    backtestMode, setBacktestMode,
    backtestConfig,
    setBacktestSummary, setBacktestProgress,
    workflowsOpen, setWorkflowsOpen,
    selectNode,
  } = useStore()

  const [showLogs, setShowLogs] = useState(false)
  const [logFilter, setLogFilter] = useState<LogFilter>('all')
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const stopRequestedRef = useRef(false)

  async function handleConnect() {
    try {
      const { provider: p, signer: s, address } = await connectMetaMask()
      setProvider(p)
      setSigner(s)
      setWallet(address)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Connection failed')
    }
  }

  function getScheduleNode(): ScheduleTriggerNode | null {
    for (const [, inst] of nodeInstances) {
      if (inst instanceof ScheduleTriggerNode) return inst
    }
    return null
  }

  async function executeOnce(context: Parameters<typeof runBot>[3]) {
    await runBot(
      nodes,
      edges,
      nodeInstances,
      context,
      (nodeId, nodeLabel, msg, level) => addLog(nodeId, nodeLabel, msg, level),
      () => {},
      (nodeId, inputs, outputs) => setNodeExecutionData(nodeId, inputs, outputs),
      (message, level) => addToast(message, level),
      (marker) => addChartMarker(marker)
    )
  }

  async function handleRun() {
    if (botRunning) {
      stopRequestedRef.current = true
      setBotRunning(false)
      return
    }

    stopRequestedRef.current = false
    setBotRunning(true)
    clearLogs()
    clearExecutionData()

    const context = {
      walletAddress,
      provider,
      signer,
      addLog: () => {},
      showToast: () => {},
      addChartMarker: () => {},
    }

    const scheduleNode = getScheduleNode()

    if (scheduleNode) {
      scheduleNode.reset()
      while (!stopRequestedRef.current) {
        if (!scheduleNode.shouldContinue()) {
          addLog('', 'Scheduler', `Max runs (${scheduleNode.getMaxRuns()}) reached — stopping`)
          break
        }
        await executeOnce(context)
        if (stopRequestedRef.current) break
        const intervalMs = scheduleNode.getInterval() * 1000
        addLog('', 'Scheduler', `Next run in ${scheduleNode.getInterval()}s…`)
        await new Promise<void>((resolve) => {
          const id = setTimeout(resolve, intervalMs)
          const poll = setInterval(() => {
            if (stopRequestedRef.current) { clearTimeout(id); clearInterval(poll); resolve() }
          }, 200)
          setTimeout(() => clearInterval(poll), intervalMs + 500)
        })
      }
      addLog('', 'Scheduler', 'Schedule stopped')
    } else {
      try {
        await executeOnce(context)
      } catch {
        // errors handled inside runBot
      }
    }

    setBotRunning(false)
  }

  async function handleBacktest() {
    if (botRunning) {
      stopRequestedRef.current = true
      setBotRunning(false)
      return
    }

    const { symbol, interval, startDate, endDate } = backtestConfig
    if (!startDate || !endDate || startDate >= endDate) {
      addToast('Invalid date range for backtest', 'error')
      return
    }

    stopRequestedRef.current = false
    setBotRunning(true)
    clearLogs()
    clearExecutionData()
    setBacktestProgress(null)
    setBacktestSummary(null)

    if (!chartOpen) setChartOpen(true)
    clearChartMarkers()

    try {
      addToast(`Fetching ${symbol} ${interval} history…`, 'info')
      const candles = await fetchBinanceHistory(
        symbol,
        interval,
        new Date(startDate).getTime(),
        new Date(endDate).getTime() + 86_400_000
      )
      addToast(`Loaded ${candles.length.toLocaleString()} candles — running backtest…`, 'info')

      const summary = await runBacktest(
        candles,
        nodes,
        edges,
        nodeInstances,
        {
          onLog: (nodeId, nodeLabel, msg, level) => addLog(nodeId, nodeLabel, msg, level),
          onStatus: () => {},
          onIO: (nodeId, inputs, outputs) => setNodeExecutionData(nodeId, inputs, outputs),
          onToast: (msg, level) => addToast(msg, level),
          onMarker: (marker) => addChartMarker(marker),
          onProgress: (tick, total) => setBacktestProgress({ tick, total }),
          stopRequested: () => stopRequestedRef.current,
        }
      )

      setBacktestSummary(summary)
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Backtest failed', 'error')
    } finally {
      setBacktestProgress(null)
      setBotRunning(false)
    }
  }

  const handleExportLogs = useCallback(() => {
    const text = logs
      .map((l) => `[${l.timestamp.toLocaleTimeString()}] ${l.level.toUpperCase()} ${l.nodeLabel ? `[${l.nodeLabel}] ` : ''}${l.message}`)
      .join('\n')
    navigator.clipboard.writeText(text).then(() => addToast('Logs copied to clipboard', 'info'))
  }, [logs, addToast])

  const handleLogRowClick = useCallback((log: LogEntry) => {
    if (log.nodeId) selectNode(log.nodeId)
  }, [selectNode])

  const filteredLogs = logFilter === 'all' ? logs : logs.filter((l) => l.level === logFilter)

  const shortAddr = walletAddress
    ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
    : null

  const schedNode = getScheduleNode()
  const isScheduled = !!schedNode

  const LOG_FILTER_ICON: Record<LogFilter, React.ReactNode> = {
    all: null,
    info: <Info size={11} />,
    warn: <AlertTriangle size={11} />,
    error: <AlertCircle size={11} />,
  }

  return (
    <>
      {workflowsOpen && <WorkflowManager onClose={() => setWorkflowsOpen(false)} />}
      <BacktestSummaryModal />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={clsx(
          'flex flex-col border-b backdrop-blur-xl',
          'bg-gradient-to-r from-[#1a1a2e]/90 to-[#16162a]/90',
          backtestMode
            ? 'border-b-amber-500/60 border-b-2 border-purple-500/20'
            : 'border-b border-purple-500/20'
        )}
      >
        {/* Main toolbar row */}
        <div className="flex items-center gap-2 px-4 py-2.5">

          {/* ── ZONE 1: Brand + Mode ── */}
          <div className="flex items-center gap-2.5">
            <Image
              src="https://imgproxy-mainnet.routescan.io/naGNKvPom3Ah-x1tNtKXo9mfx8W_FosTjkTywwUjYe0/pr:thumb_32/aHR0cHM6Ly9jbXMtY2RuLmF2YXNjYW4uY29tL2NtczIvQXZhbGFuY2hlQXZheC40N2JlNjJlOGFiZmYuc3Zn"
              alt="AVAX"
              width={28}
              height={28}
              className="rounded-lg shrink-0"
            />
            <span className="text-white font-semibold text-sm tracking-tight whitespace-nowrap">AVAX Bot Builder</span>

            {/* Mode toggle */}
            <div className="flex rounded-full border border-purple-500/20 overflow-hidden ml-1">
              <button
                onClick={() => setBacktestMode(false)}
                className={clsx(
                  'px-3 py-1 text-[11px] font-medium transition-colors',
                  !backtestMode ? 'bg-green-900/40 text-green-400' : 'text-white/35 hover:text-white/60'
                )}
              >
                Live
              </button>
              <button
                onClick={() => setBacktestMode(true)}
                className={clsx(
                  'px-3 py-1 text-[11px] font-medium transition-colors',
                  backtestMode ? 'bg-amber-900/40 text-amber-400' : 'text-white/35 hover:text-white/60'
                )}
              >
                Backtest
              </button>
            </div>
          </div>

          {/* Zone 1 / Zone 2 divider */}
          <div className="w-px h-5 bg-purple-500/20 mx-1.5" />

          {/* ── ZONE 2: Execution ── */}
          {backtestMode ? (
            <button
              onClick={handleBacktest}
              disabled={nodes.length === 0}
              className={clsx(
                'flex items-center gap-2 px-5 py-1.5 rounded-full text-xs font-semibold transition-all disabled:opacity-40',
                botRunning
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_10px_#dc262640]'
                  : 'bg-amber-500 hover:bg-amber-400 text-white shadow-[0_0_10px_#f59e0b40] hover:shadow-[0_0_16px_#f59e0b50]'
              )}
            >
              {botRunning ? <><Square size={12} /> Stop</> : <><Timer size={12} /> Run Backtest</>}
            </button>
          ) : (
            <button
              onClick={handleRun}
              disabled={nodes.length === 0}
              className={clsx(
                'flex items-center gap-2 px-5 py-1.5 rounded-full text-xs font-semibold transition-all disabled:opacity-40',
                botRunning
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_10px_#dc262640]'
                  : isScheduled
                  ? 'bg-orange-500 hover:bg-orange-400 text-white shadow-[0_0_10px_#f9730040]'
                  : 'bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_10px_#7c3aed40] hover:shadow-[0_0_18px_#7c3aed60]'
              )}
            >
              {botRunning
                ? <><Square size={12} /> Stop</>
                : isScheduled
                ? <><Clock size={12} /> Run (every {schedNode!.getInterval()}s)</>
                : <><Play size={12} /> Run Bot</>
              }
            </button>
          )}

          {/* Zone 2 / Zone 3 divider */}
          <div className="w-px h-5 bg-purple-500/20 mx-1.5" />

          {/* ── ZONE 3: Utilities ── */}
          <div className="flex items-center gap-1.5 flex-1">
            {/* Chart toggle */}
            <button
              onClick={() => setChartOpen(!chartOpen)}
              className={clsx(
                'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all',
                chartOpen
                  ? 'bg-blue-900/40 border-blue-500/30 text-blue-400'
                  : 'text-white/50 hover:text-white border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/10'
              )}
            >
              <LineChart size={12} />
              Chart
            </button>

            {/* Logs toggle */}
            <button
              onClick={() => setShowLogs((v) => !v)}
              className={clsx(
                'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all',
                showLogs
                  ? 'bg-purple-900/40 border-purple-500/30 text-purple-300'
                  : 'text-white/50 hover:text-white border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/10'
              )}
            >
              Logs
              {logs.length > 0 && (
                <span className={clsx(
                  'text-[9px] px-1 py-0.5 rounded-full min-w-[18px] text-center font-mono',
                  logs.some((l) => l.level === 'error')
                    ? 'bg-red-500/30 text-red-400'
                    : logs.some((l) => l.level === 'warn')
                    ? 'bg-yellow-500/30 text-yellow-400'
                    : 'bg-white/10 text-white/40'
                )}>
                  {logs.length}
                </span>
              )}
              {showLogs ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>

            {/* Workflows */}
            <button
              onClick={() => setWorkflowsOpen(true)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-purple-500/20 hover:border-purple-500/40 text-white/50 hover:text-white hover:bg-purple-500/10 transition-all"
            >
              <FolderOpen size={12} />
              Workflows
            </button>

            {/* Agent toggle */}
            <button
              onClick={() => setAgentOpen(!agentOpen)}
              className={clsx(
                'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all',
                agentOpen
                  ? 'bg-purple-900/40 border-purple-500/30 text-purple-400'
                  : 'text-white/50 hover:text-white border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/10'
              )}
            >
              <Bot size={12} />
              Agent
            </button>

            <div className="flex-1" />

            {/* Wallet */}
            <button
              onClick={handleConnect}
              className={clsx(
                'flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border transition-all',
                isConnected
                  ? 'bg-green-900/40 border-green-500/30 text-green-400'
                  : 'bg-purple-600/20 border-purple-500/30 text-white hover:bg-purple-600/30 hover:border-purple-500/50'
              )}
            >
              <Wallet size={12} />
              {isConnected ? shortAddr : 'Connect Wallet'}
            </button>
          </div>
        </div>

        {/* Backtest config strip */}
        {backtestMode && <BacktestConfigStrip />}

        {/* Log drawer */}
        <AnimatePresence>
          {showLogs && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="overflow-hidden border-t border-purple-500/20 bg-gradient-to-b from-[#1a1a2e]/70 to-[#0d0d1a]/70"
            >
              {/* Log toolbar */}
              <div className="flex items-center gap-2 px-4 py-1.5 sticky top-0 bg-[#1a1a2e]/85 backdrop-blur border-b border-purple-500/10">
                <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider flex-1">
                  Execution Log
                </span>

                {/* Filter tabs */}
                <div className="flex items-center gap-0.5">
                  {(['all', 'info', 'warn', 'error'] as LogFilter[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setLogFilter(f)}
                      className={clsx(
                        'flex items-center gap-1 px-2 py-0.5 rounded text-[10px] transition-colors',
                        logFilter === f
                          ? f === 'error' ? 'bg-red-900/40 text-red-400'
                            : f === 'warn' ? 'bg-yellow-900/40 text-yellow-400'
                            : 'bg-purple-900/40 text-purple-300'
                          : 'text-white/30 hover:text-white/60'
                      )}
                    >
                      {LOG_FILTER_ICON[f]}
                      <span className="capitalize">{f}</span>
                      {f !== 'all' && (
                        <span className="text-[9px] opacity-60">
                          ({logs.filter((l) => l.level === f).length})
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="w-px h-3.5 bg-purple-500/20" />

                {/* Export */}
                <button
                  onClick={handleExportLogs}
                  disabled={logs.length === 0}
                  title="Copy logs to clipboard"
                  className="text-white/30 hover:text-white/60 transition-colors disabled:opacity-30"
                >
                  <Download size={11} />
                </button>

                {/* Clear */}
                <button
                  onClick={clearLogs}
                  title="Clear logs"
                  className="text-white/30 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={11} />
                </button>
              </div>

              {/* Log entries */}
              <div className="max-h-44 overflow-y-auto">
                {filteredLogs.length === 0 ? (
                  <p className="px-4 py-3 text-[11px] text-white/30 font-mono">
                    {logFilter === 'all' ? 'No logs yet' : `No ${logFilter} logs`}
                  </p>
                ) : (
                  <div className="px-1 pb-1.5 space-y-px font-mono text-[11px]">
                    {filteredLogs.map((log) => (
                      <button
                        key={log.id}
                        onClick={() => handleLogRowClick(log)}
                        className={clsx(
                          'w-full text-left flex items-start gap-2.5 px-3 py-1 rounded transition-colors',
                          'hover:bg-white/5',
                          log.nodeId ? 'cursor-pointer' : 'cursor-default',
                          log.level === 'error' ? 'text-red-400' :
                          log.level === 'warn' ? 'text-yellow-400' :
                          'text-white/55'
                        )}
                      >
                        <span className="text-white/25 shrink-0 tabular-nums">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                        {log.nodeLabel && (
                          <span className="text-white/35 shrink-0">[{log.nodeLabel}]</span>
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
  )
}
