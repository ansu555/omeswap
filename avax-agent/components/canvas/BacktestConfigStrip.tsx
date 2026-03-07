'use client'

import { useStore } from '@/store/useStore'
import clsx from 'clsx'

const SYMBOLS = ['AVAXUSDT', 'BTCUSDT', 'ETHUSDT', 'JOEUSDT']
const INTERVALS = ['1h', '4h', '1d']

export default function BacktestConfigStrip() {
  const { backtestConfig, setBacktestConfig, backtestProgress } = useStore()

  return (
    <div className="border-t border-white/10 bg-black/30 px-4 py-2.5">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Symbol */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/40 uppercase tracking-wider">Symbol</span>
          <select
            value={backtestConfig.symbol}
            onChange={(e) => setBacktestConfig({ symbol: e.target.value })}
            className="bg-black/40 border border-white/15 rounded px-2 py-0.5 text-[11px] text-white focus:outline-none focus:border-amber-500/50"
          >
            {SYMBOLS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Interval */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/40 uppercase tracking-wider">Interval</span>
          <div className="flex rounded-lg border border-white/15 overflow-hidden">
            {INTERVALS.map((iv) => (
              <button
                key={iv}
                onClick={() => setBacktestConfig({ interval: iv })}
                className={clsx(
                  'px-2.5 py-0.5 text-[11px] transition-colors',
                  backtestConfig.interval === iv
                    ? 'bg-amber-900/40 text-amber-400'
                    : 'text-white/40 hover:text-white/70'
                )}
              >
                {iv}
              </button>
            ))}
          </div>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/40 uppercase tracking-wider">From</span>
          <input
            type="date"
            value={backtestConfig.startDate}
            onChange={(e) => setBacktestConfig({ startDate: e.target.value })}
            className="bg-black/40 border border-white/15 rounded px-2 py-0.5 text-[11px] text-white focus:outline-none focus:border-amber-500/50 [color-scheme:dark]"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/40 uppercase tracking-wider">To</span>
          <input
            type="date"
            value={backtestConfig.endDate}
            onChange={(e) => setBacktestConfig({ endDate: e.target.value })}
            className="bg-black/40 border border-white/15 rounded px-2 py-0.5 text-[11px] text-white focus:outline-none focus:border-amber-500/50 [color-scheme:dark]"
          />
        </div>

        {/* Progress */}
        {backtestProgress && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[10px] text-amber-400/70 font-mono">
              {backtestProgress.tick} / {backtestProgress.total}
            </span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {backtestProgress && (
        <div className="mt-2 w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-400/70 rounded-full transition-all duration-100"
            style={{ width: `${(backtestProgress.tick / backtestProgress.total) * 100}%` }}
          />
        </div>
      )}
    </div>
  )
}
