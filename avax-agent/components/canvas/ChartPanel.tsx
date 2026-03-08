'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createChart, createSeriesMarkers, type IChartApi, type ISeriesApi, type ISeriesMarkersPluginApi, type SeriesMarker, type Time, CandlestickSeries } from 'lightweight-charts'
import { X, GripHorizontal, Minus, Maximize2 } from 'lucide-react'
import clsx from 'clsx'
import { useStore } from '@/store/useStore'
import { fetchBinanceHistory } from '@/lib/backtest/fetchHistory'

const SYMBOLS = [
  { label: 'AVAX/USD', binance: 'AVAXUSDT' },
  { label: 'AVAX/BTC', binance: 'AVAXBTC' },
  { label: 'BTC/USD',  binance: 'BTCUSDT' },
  { label: 'ETH/USD',  binance: 'ETHUSDT' },
  { label: 'JOE/USD',  binance: 'JOEUSDT' },
]

const INTERVALS = [
  { label: '1m',  value: '1m' },
  { label: '5m',  value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h',  value: '1h' },
  { label: '4h',  value: '4h' },
  { label: '1D',  value: '1d' },
]

interface Candle {
  time: Time
  open: number
  high: number
  low: number
  close: number
}

interface Props {
  onClose: () => void
}

export default function ChartPanel({ onClose }: Props) {
  const { chartMarkers, backtestMode, backtestConfig } = useStore()

  const [symbol, setSymbol] = useState(SYMBOLS[0])
  const [interval, setInterval] = useState(INTERVALS[3])
  const [minimized, setMinimized] = useState(false)
  const [pos, setPos] = useState({ x: 80, y: 80 })
  const [size, setSize] = useState({ w: 680, h: 460 })
  const [loading, setLoading] = useState(false)
  const [live, setLive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dragging = useRef(false)
  const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 })
  const panelRef = useRef<HTMLDivElement>(null)
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const markersPluginRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // ── Drag ──────────────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y }
    e.preventDefault()
  }, [pos])

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!dragging.current) return
      setPos({
        x: dragStart.current.px + e.clientX - dragStart.current.mx,
        y: dragStart.current.py + e.clientY - dragStart.current.my,
      })
    }
    function onUp() { dragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  // ── Create / destroy chart ─────────────────────────────────────────────────
  useEffect(() => {
    if (minimized || !chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      width: size.w,
      height: size.h - 40, // header height
      layout: { background: { color: '#0d1117' }, textColor: '#9ca3af' },
      grid: { vertLines: { color: '#1f2937' }, horzLines: { color: '#1f2937' } },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: '#1f2937' },
      timeScale: { borderColor: '#1f2937', timeVisible: true },
    })

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#22c55e',
      wickDownColor: '#ef4444',
      wickUpColor: '#22c55e',
    })

    const markersPlugin = createSeriesMarkers(series, [])
    chartRef.current = chart
    seriesRef.current = series
    markersPluginRef.current = markersPlugin

    return () => {
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
      markersPluginRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minimized])

  // ── Resize chart when panel size changes ──────────────────────────────────
  useEffect(() => {
    if (chartRef.current && !minimized) {
      chartRef.current.resize(size.w, size.h - 40)
    }
  }, [size, minimized])

  // ── Fetch OHLC data ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!seriesRef.current) return
    let cancelled = false

    // Close any existing WebSocket
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
      setLive(false)
    }

    setLoading(true)
    setError(null)

    if (backtestMode) {
      // ── Backtest: load historical range matching the backtest config ─────
      const { symbol: btSymbol, interval: btInterval, startDate, endDate } = backtestConfig
      const startMs = new Date(startDate).getTime()
      const endMs = new Date(endDate).getTime() + 86_400_000

      fetchBinanceHistory(btSymbol, btInterval, startMs, endMs)
        .then((candles) => {
          if (cancelled) return
          seriesRef.current?.setData(
            candles.map((c) => ({ time: c.time as Time, open: c.open, high: c.high, low: c.low, close: c.close }))
          )
          chartRef.current?.timeScale().fitContent()
          setLoading(false)
        })
        .catch((e) => {
          if (!cancelled) { setError(e.message); setLoading(false) }
        })
    } else {
      // ── Live: last 200 candles + WebSocket stream ────────────────────────
      fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol.binance}&interval=${interval.value}&limit=200`
      )
        .then((r) => r.json())
        .then((raw: [number, string, string, string, string, ...unknown[]][]) => {
          if (cancelled) return
          const candles: Candle[] = raw.map((k) => ({
            time: Math.floor(k[0] / 1000) as Time,
            open:  parseFloat(k[1]),
            high:  parseFloat(k[2]),
            low:   parseFloat(k[3]),
            close: parseFloat(k[4]),
          }))
          seriesRef.current?.setData(candles)
          chartRef.current?.timeScale().fitContent()
          setLoading(false)

          if (cancelled) return
          const wsSymbol = symbol.binance.toLowerCase()
          const ws = new WebSocket(
            `wss://stream.binance.com:9443/ws/${wsSymbol}@kline_${interval.value}`
          )
          wsRef.current = ws
          ws.onopen = () => { if (!cancelled) setLive(true) }
          ws.onclose = () => { if (!cancelled) setLive(false) }
          ws.onerror = () => { if (!cancelled) setLive(false) }
          ws.onmessage = (evt) => {
            if (cancelled) return
            const msg = JSON.parse(evt.data as string)
            const k = msg.k
            if (!k) return
            seriesRef.current?.update({
              time: Math.floor(k.t / 1000) as Time,
              open:  parseFloat(k.o),
              high:  parseFloat(k.h),
              low:   parseFloat(k.l),
              close: parseFloat(k.c),
            })
          }
        })
        .catch((e) => {
          if (!cancelled) { setError(e.message); setLoading(false) }
        })
    }

    return () => {
      cancelled = true
      if (wsRef.current) { wsRef.current.close(); wsRef.current = null }
      setLive(false)
    }
  }, [symbol, interval, backtestMode, backtestConfig, seriesRef.current]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync markers from store ────────────────────────────────────────────────
  useEffect(() => {
    if (!markersPluginRef.current) return
    const markers: SeriesMarker<Time>[] = chartMarkers.map((m) => ({
      time: m.time as Time,
      position: m.shape === 'arrowDown' ? 'aboveBar' : 'belowBar',
      color: m.color,
      shape: m.shape,
      text: m.label,
    }))
    // Sort by time ascending (required by lightweight-charts)
    markers.sort((a, b) => (a.time as number) - (b.time as number))
    markersPluginRef.current.setMarkers(markers)
  }, [chartMarkers])

  return (
    <div
      ref={panelRef}
      className="fixed z-40 flex flex-col rounded-xl border border-white/15 shadow-2xl bg-[#0d1117] overflow-hidden"
      style={{ left: pos.x, top: pos.y, width: size.w, height: minimized ? 'auto' : size.h }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-2 px-3 py-2 bg-gray-900 border-b border-white/10 cursor-grab active:cursor-grabbing select-none shrink-0"
        onMouseDown={onMouseDown}
      >
        <GripHorizontal size={13} className="text-white/30" />
        <span className="text-xs font-semibold text-white/80 flex-1">Chart</span>

        {loading && <span className="text-[10px] text-white/30 animate-pulse">loading…</span>}
        {!loading && backtestMode && (
          <span className="flex items-center gap-1 text-[10px] text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            backtest
          </span>
        )}
        {!loading && !backtestMode && live && (
          <span className="flex items-center gap-1 text-[10px] text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
            live
          </span>
        )}
        {error && <span className="text-[10px] text-red-400">{error}</span>}

        {/* Marker count badge */}
        {chartMarkers.length > 0 && (
          <span className="text-[10px] bg-purple-700/60 text-purple-200 px-1.5 py-0.5 rounded">
            {chartMarkers.length} marker{chartMarkers.length !== 1 ? 's' : ''}
          </span>
        )}

        {/* Symbol selector — hidden in backtest (driven by backtest config) */}
        {backtestMode ? (
          <span className="text-[11px] text-amber-400/70 font-mono">
            {backtestConfig.symbol} · {backtestConfig.interval}
          </span>
        ) : (
          <>
            <select
              value={symbol.binance}
              onChange={(e) => setSymbol(SYMBOLS.find(s => s.binance === e.target.value) ?? SYMBOLS[0])}
              onMouseDown={(e) => e.stopPropagation()}
              className="bg-black/40 border border-white/15 rounded px-2 py-0.5 text-[11px] text-white focus:outline-none"
            >
              {SYMBOLS.map((s) => <option key={s.binance} value={s.binance}>{s.label}</option>)}
            </select>

            <div className="flex gap-0.5" onMouseDown={(e) => e.stopPropagation()}>
              {INTERVALS.map((iv) => (
                <button
                  key={iv.value}
                  onClick={() => setInterval(iv)}
                  className={clsx(
                    'px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors',
                    interval.value === iv.value
                      ? 'bg-blue-600 text-white'
                      : 'text-white/40 hover:text-white hover:bg-white/10'
                  )}
                >
                  {iv.label}
                </button>
              ))}
            </div>
          </>
        )}

        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => setMinimized(v => !v)}
          className="text-white/30 hover:text-white/70 transition-colors"
        >
          {minimized ? <Maximize2 size={12} /> : <Minus size={12} />}
        </button>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={onClose}
          className="text-white/30 hover:text-red-400 transition-colors"
        >
          <X size={13} />
        </button>
      </div>

      {/* Chart */}
      {!minimized && (
        <div ref={chartContainerRef} className="flex-1 w-full" />
      )}

      {/* Resize handle */}
      {!minimized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={(e) => {
            e.preventDefault()
            const startW = size.w; const startH = size.h
            const startX = e.clientX; const startY = e.clientY
            function onMove(ev: MouseEvent) {
              setSize({ w: Math.max(380, startW + ev.clientX - startX), h: Math.max(260, startH + ev.clientY - startY) })
            }
            function onUp() { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
            window.addEventListener('mousemove', onMove)
            window.addEventListener('mouseup', onUp)
          }}
        >
          <svg viewBox="0 0 10 10" className="w-3 h-3 absolute bottom-1 right-1 text-white/20">
            <path d="M0 10 L10 0 M5 10 L10 5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      )}
    </div>
  )
}
