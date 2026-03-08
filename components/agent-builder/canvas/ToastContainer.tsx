'use client'

import { useStore } from '@/store/agent-builder'
import { X, Bell, AlertTriangle, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

export default function ToastContainer() {
  const { toasts, removeToast } = useStore()

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={clsx(
              'flex items-start gap-3 px-4 py-3 rounded-2xl shadow-2xl border pointer-events-auto backdrop-blur-xl',
              'min-w-[260px] max-w-[360px]',
              t.level === 'error'
                ? 'bg-red-950/80 border-red-500/30 text-red-200'
                : t.level === 'warn'
                ? 'bg-yellow-950/80 border-yellow-500/30 text-yellow-200'
                : 'bg-[#1a1a2e]/90 border-purple-500/30 text-white'
            )}
          >
            <span className="shrink-0 mt-0.5">
              {t.level === 'error' ? (
                <XCircle size={15} className="text-red-400" />
              ) : t.level === 'warn' ? (
                <AlertTriangle size={15} className="text-yellow-400" />
              ) : (
                <Bell size={15} className="text-purple-400" />
              )}
            </span>
            <span className="text-sm flex-1 leading-snug">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 text-white/30 hover:text-white/70 transition-colors mt-0.5"
            >
              <X size={13} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
