'use client'

import { useStore } from '@/store/useStore'
import { X, Bell, AlertTriangle, XCircle } from 'lucide-react'
import clsx from 'clsx'

export default function ToastContainer() {
  const { toasts, removeToast } = useStore()

  if (!toasts.length) return null

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={clsx(
            'flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl border pointer-events-auto',
            'min-w-[260px] max-w-[360px] animate-in slide-in-from-right-4',
            t.level === 'error'
              ? 'bg-red-950 border-red-500/50 text-red-200'
              : t.level === 'warn'
              ? 'bg-yellow-950 border-yellow-500/50 text-yellow-200'
              : 'bg-gray-800 border-white/20 text-white'
          )}
        >
          <span className="shrink-0 mt-0.5">
            {t.level === 'error' ? (
              <XCircle size={15} className="text-red-400" />
            ) : t.level === 'warn' ? (
              <AlertTriangle size={15} className="text-yellow-400" />
            ) : (
              <Bell size={15} className="text-blue-400" />
            )}
          </span>
          <span className="text-sm flex-1 leading-snug">{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            className="shrink-0 text-white/30 hover:text-white/70 transition-colors mt-0.5"
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  )
}
