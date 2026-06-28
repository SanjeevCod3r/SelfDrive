'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Phone, SendHorizontal, X } from 'lucide-react'

// Primary contact numbers (digits only, with country code)
const WHATSAPP_NUMBER = '917317893339'
const CALL_NUMBER = '917317893339'

export default function WhatsAppWidget() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  if (pathname.startsWith('/admin')) return null

  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi Kashi Ka Self Drive! I'd like to know more about your car rentals."
  )}`

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-4">
      {/* ── Expandable card ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="w-[330px] max-w-[calc(100vw-3rem)] overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]"
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 px-6 py-5 text-white">
              <h4 className="text-lg font-black tracking-tight">How can we help you?</h4>
              <p className="text-sm font-medium text-white/90">Get in touch with Kashi Ka Self Drive</p>
            </div>

            {/* Options */}
            <div className="space-y-3 p-4">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 transition-colors hover:bg-green-100"
              >
                <div className="flex size-11 items-center justify-center rounded-full bg-green-500 text-white shrink-0">
                  <MessageCircle className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="font-black text-charcoal-900 leading-tight">Chat on WhatsApp</p>
                  <p className="text-xs font-medium text-green-700">Instant messaging</p>
                </div>
                <SendHorizontal className="size-5 text-green-500" />
              </a>

              <a
                href={`tel:+${CALL_NUMBER}`}
                className="flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 transition-colors hover:bg-amber-100"
              >
                <div className="flex size-11 items-center justify-center rounded-full bg-amber-500 text-white shrink-0">
                  <Phone className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="font-black text-charcoal-900 leading-tight">Call Us Directly</p>
                  <p className="text-xs font-medium text-amber-700">Speak with our team</p>
                </div>
                <Phone className="size-5 text-amber-500" />
              </a>
            </div>

            <p className="px-6 pb-5 text-center text-xs font-medium text-zinc-400">
              Available 24/7 for your transportation needs
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating toggle button ── */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Chat with us on WhatsApp"
        className="relative flex size-16 items-center justify-center rounded-full bg-green-500 text-white shadow-xl shadow-green-500/30 transition-transform hover:scale-105 active:scale-95"
      >
        {!open && (
          <span className="absolute inset-0 animate-ping rounded-full bg-green-500/40" />
        )}
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="size-7" />
            </motion.span>
          ) : (
            <motion.span
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="size-7" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  )
}
