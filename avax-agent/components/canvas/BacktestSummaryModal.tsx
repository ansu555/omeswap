'use client'

import { useStore } from '@/store/useStore'
import { CheckCircle, X, AlertTriangle } from 'lucide-react'

export default function BacktestSummaryModal() {
  const { backtestSummary, setBacktestSummary, backtestConfig } = useStore()
  if (!backtestSummary) return null

  const { totalTicks, markersPlaced, signalsFired, skippedNodes, durationMs } = backtestSummary

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="w-96 rounded-2xl p-6 flex flex-col gap-4"
        style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.12)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}
          >
            <CheckCircle size={15} className="text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">Backtest Complete</p>
            <p className="text-white/35 text-[10px]">{backtestConfig.symbol} · {backtestConfig.interval} · {backtestConfig.startDate} → {backtestConfig.endDate}</p>
          </div>
          <button
            onClick={() => setBacktestSummary(null)}
            className="text-white/25 hover:text-white/60 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Stats */}
        <div
          className="rounded-xl divide-y"
          style={{ border: '1px solid rgba(255,255,255,0.08)', divideColor: 'rgba(255,255,255,0.06)' }}
        >
          {[
            { label: 'Candles processed', value: totalTicks.toLocaleString() },
            { label: 'Chart markers placed', value: markersPlaced.toLocaleString() },
            { label: 'Signals fired', value: signalsFired.toLocaleString() },
            { label: 'Duration', value: durationMs < 1000 ? `${durationMs}ms` : `${(durationMs / 1000).toFixed(1)}s` },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center px-4 py-2.5">
              <span className="text-[11px] text-white/50">{label}</span>
              <span className="text-[11px] text-white font-mono font-medium">{value}</span>
            </div>
          ))}
        </div>

        {/* Simulated nodes warning */}
        {skippedNodes.length > 0 && (
          <div
            className="flex gap-2.5 rounded-xl px-3.5 py-3"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <AlertTriangle size={13} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-400/80 leading-relaxed">
              Simulated in backtest: <span className="font-medium text-amber-400">{skippedNodes.join(', ')}</span>. No real transactions were executed.
            </p>
          </div>
        )}

        {/* Close */}
        <button
          onClick={() => setBacktestSummary(null)}
          className="w-full py-2 rounded-xl text-xs font-medium text-white/60 hover:text-white transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          Close
        </button>
      </div>
    </div>
  )
}
