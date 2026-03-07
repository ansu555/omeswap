'use client'

import { useState, useRef } from 'react'
import { useStore } from '@/store/useStore'
import { connectMetaMask } from '@/lib/avalanche/provider'
import { runBot } from '@/lib/engine/BotRunner'
import { fetchBinanceHistory } from '@/lib/backtest/fetchHistory'
import { runBacktest } from '@/lib/backtest/BacktestRunner'
import { ScheduleTriggerNode } from '@/lib/nodes/flow/ScheduleTriggerNode'
import { ethers } from 'ethers'
import { Wallet, Play, Square, ChevronDown, ChevronUp, Trash2, Clock, LineChart, FolderOpen, Bot, Timer } from 'lucide-react'
import clsx from 'clsx'
import WorkflowManager from './WorkflowManager'
import BacktestConfigStrip from './BacktestConfigStrip'
import BacktestSummaryModal from './BacktestSummaryModal'

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
  } = useStore()

  const [showLogs, setShowLogs] = useState(false)
  const [showWorkflows, setShowWorkflows] = useState(false)
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
        addLog('', 'Scheduler', `Next run in ${scheduleNode.getInterval()}s...`)
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

    // Auto-open chart so user can watch markers appear
    if (!chartOpen) setChartOpen(true)
    clearChartMarkers()

    try {
      addToast(`Fetching ${symbol} ${interval} history...`, 'info')
      const candles = await fetchBinanceHistory(
        symbol,
        interval,
        new Date(startDate).getTime(),
        new Date(endDate).getTime() + 86_400_000 // include end day
      )
      addToast(`Loaded ${candles.length.toLocaleString()} candles — running backtest...`, 'info')

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

  const shortAddr = walletAddress
    ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
    : null

  const schedNode = getScheduleNode()
  const isScheduled = !!schedNode

  return (
    <>
      {showWorkflows && <WorkflowManager onClose={() => setShowWorkflows(false)} />}
      <BacktestSummaryModal />

      <div className="flex flex-col border-b border-white/10 bg-gray-900">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2 mr-2">
            <div className="w-7 h-7 rounded-lg bg-red-500 flex items-center justify-center text-white font-bold text-sm">A</div>
            <span className="text-white font-semibold text-sm">AVAX Bot Builder</span>
          </div>

          {/* Live / Backtest toggle pill */}
          <div className="flex rounded-lg border border-white/15 overflow-hidden">
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

          <div className="flex-1" />

          {/* Logs toggle */}
          <button
            onClick={() => setShowLogs((v) => !v)}
            className="flex items-center gap-1 text-xs text-white/60 hover:text-white px-2 py-1 rounded border border-white/10 hover:border-white/30 transition-colors"
          >
            Logs ({logs.length})
            {showLogs ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {/* Chart toggle */}
          <button
            onClick={() => setChartOpen(!chartOpen)}
            className={clsx(
              'flex items-center gap-1.5 text-xs px-2 py-1 rounded border transition-colors',
              chartOpen
                ? 'bg-blue-900/40 border-blue-500/40 text-blue-400'
                : 'text-white/60 hover:text-white border-white/10 hover:border-white/30'
            )}
          >
            <LineChart size={13} />
            Chart
          </button>

          {/* Workflow manager */}
          <button
            onClick={() => setShowWorkflows(true)}
            className="flex items-center gap-1.5 text-xs px-2 py-1 rounded border border-white/10 hover:border-white/30 text-white/60 hover:text-white transition-colors"
          >
            <FolderOpen size={13} />
            Workflows
          </button>

          {/* Agent toggle */}
          <button
            onClick={() => setAgentOpen(!agentOpen)}
            className={clsx(
              'flex items-center gap-1.5 text-xs px-2 py-1 rounded border transition-colors',
              agentOpen
                ? 'bg-purple-900/40 border-purple-500/40 text-purple-400'
                : 'text-white/60 hover:text-white border-white/10 hover:border-white/30'
            )}
          >
            <Bot size={13} />
            Agent
          </button>

          {/* Wallet */}
          <button
            onClick={handleConnect}
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              isConnected
                ? 'bg-green-900/40 border-green-500/40 text-green-400'
                : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
            )}
          >
            <Wallet size={13} />
            {isConnected ? shortAddr : 'Connect Wallet'}
          </button>

          {/* Run / Stop / Backtest */}
          {backtestMode ? (
            <button
              onClick={handleBacktest}
              disabled={nodes.length === 0}
              className={clsx(
                'flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40',
                botRunning ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'
              )}
            >
              {botRunning ? <><Square size={12} /> Stop</> : <><Timer size={12} /> Run Backtest</>}
            </button>
          ) : (
            <button
              onClick={handleRun}
              disabled={nodes.length === 0}
              className={clsx(
                'flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40',
                botRunning
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : isScheduled
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
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
        </div>

        {/* Backtest config strip */}
        {backtestMode && <BacktestConfigStrip />}

        {/* Log drawer */}
        {showLogs && (
          <div className="border-t border-white/10 bg-black/40 max-h-48 overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-1.5 sticky top-0 bg-black/60">
              <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider">Execution Log</span>
              <button onClick={clearLogs} className="text-white/30 hover:text-white/60 transition-colors">
                <Trash2 size={11} />
              </button>
            </div>
            {logs.length === 0 ? (
              <p className="px-4 py-3 text-[11px] text-white/30 font-mono">No logs yet</p>
            ) : (
              <div className="px-4 pb-2 space-y-0.5 font-mono text-[11px]">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={clsx(
                      log.level === 'error' ? 'text-red-400' :
                      log.level === 'warn' ? 'text-yellow-400' :
                      'text-white/60'
                    )}
                  >
                    <span className="text-white/30">{log.timestamp.toLocaleTimeString()} </span>
                    {log.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
