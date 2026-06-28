'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check, Sparkles, Crown, ShieldCheck, X } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { toast } from 'sonner'
import Script from 'next/script'
import KycModal from '@/components/KycModal'

export default function Pricing({ showBanner = true }) {
  const { api, user, openAuth } = useAuth()
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [kycOpen, setKycOpen] = useState(false)

  useEffect(() => {
    api('/packages').then(data => {
      // Single dynamic panel — show the active plan configured in the admin panel
      setPlan((data.plans || [])[0] || null)
    }).catch(() => {
      toast.error('Failed to load the subscription plan')
    }).finally(() => setLoading(false))
  }, [api])

  // Step 1 — user clicks Subscribe
  const handleSubscribeClick = () => {
    if (!user) {
      toast.info('Please login to subscribe')
      openAuth('login')
      return
    }
    setConfirmOpen(true)
  }

  // Step 2 — user confirms "Yes" → check KYC, then either pay or collect KYC
  const handleConfirmYes = async () => {
    setConfirmOpen(false)
    try {
      const { kyc } = await api('/kyc/me')
      if (kyc) {
        startPayment()
      } else {
        setKycOpen(true)
      }
    } catch {
      // If KYC lookup fails, fall back to collecting it
      setKycOpen(true)
    }
  }

  // Step 4 — Razorpay checkout
  const startPayment = async () => {
    if (!plan) return
    setProcessing(true)
    try {
      const res = await api('/subscriptions/create-order', {
        method: 'POST',
        body: JSON.stringify({ planId: plan.id }),
      })
      const options = {
        key: res.key,
        amount: res.amount * 100,
        currency: res.currency,
        name: 'Kashi Ka Premium',
        description: `Subscription to ${plan.name}`,
        order_id: res.orderId,
        handler: async (response) => {
          try {
            await api('/subscriptions/verify', {
              method: 'POST',
              body: JSON.stringify({ ...response, subscriptionId: res.subscriptionId }),
            })
            toast.success('Welcome to Kashi Ka Premium!')
            window.location.reload()
          } catch {
            toast.error('Verification failed')
          }
        },
        prefill: { name: user.name, email: user.email, contact: user.phone || '' },
        theme: { color: '#F26A21' },
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (e) {
      if (e.message === 'KYC_REQUIRED') {
        setKycOpen(true)
      } else {
        toast.error(e.message)
      }
    } finally {
      setProcessing(false)
    }
  }

  return (
    <section className="py-24 md:py-32 bg-zinc-50 overflow-hidden relative">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="pointer-events-none absolute left-1/2 top-0 size-[600px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-amber-500/5 blur-[120px]" />

      <div className="container mx-auto px-6 relative z-10">
        {showBanner && (
          <div className="text-center mb-16 md:mb-20">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-px bg-amber-500/30" />
              <div className="flex items-center gap-2 text-amber-500 font-black uppercase tracking-[0.4em] text-[10px]">
                <Sparkles className="size-3.5" />
                <span>Membership Plan</span>
              </div>
              <div className="w-12 h-px bg-amber-500/30" />
            </div>
            <h3 className="text-4xl md:text-6xl font-black text-charcoal-900 uppercase tracking-tighter leading-[0.95] max-w-3xl mx-auto">
              Quick &amp; Easy <span className="text-amber-500">Transportation</span>
            </h3>
          </div>
        )}

        {/* ── Single dynamic subscription panel (rectangle) ── */}
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="h-[300px] bg-white rounded-[32px] animate-pulse border border-zinc-200" />
          ) : !plan ? (
            <div className="py-16 text-center border-2 border-dashed border-zinc-200 rounded-[32px] bg-white">
              <Crown className="size-10 text-zinc-300 mx-auto mb-4" />
              <h3 className="text-xl font-black text-charcoal-900 uppercase tracking-tight mb-2">No Plan Yet</h3>
              <p className="text-zinc-500 text-sm font-medium px-6">The subscription plan will appear here once added from the admin panel.</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group relative grid md:grid-cols-[1.05fr_0.95fr] rounded-[32px] overflow-hidden bg-gradient-to-br from-charcoal-900 to-[#15161b] ring-1 ring-white/10 shadow-[0_40px_90px_-30px_rgba(21,22,27,0.7)]"
            >
              {/* Decorative amber glow */}
              <div className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-amber-500/20 blur-[100px]" />
              <div className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-amber-500/5 blur-[100px]" />

              {/* Left: identity + price + CTA */}
              <div className="relative flex flex-col p-8 lg:p-12">
                <div className="mb-8 inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-500/15 ring-1 ring-amber-500/30 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.25em] text-amber-400">
                  <Crown className="size-3 fill-amber-400" /> Elite Membership
                </div>

                <h3 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-[0.95] text-white mb-4">{plan.name}</h3>

                <p className="font-medium leading-relaxed mb-auto text-sm text-zinc-400 max-w-sm">
                  Keep your journeys seamless with priority service, exclusive perks and the best rates on every booking.
                </p>

                <div className="flex items-baseline gap-2 mt-10 mb-1">
                  <span className="text-6xl lg:text-7xl font-black tracking-tighter text-white">₹{Number(plan.price).toLocaleString()}</span>
                  <span className="text-xs font-black uppercase tracking-widest text-amber-500">/ {plan.duration === 365 ? 'year' : `${plan.duration} days`}</span>
                </div>
                <p className="text-[11px] font-medium text-zinc-500 mb-8">One-time payment · Renew anytime</p>

                <button
                  onClick={handleSubscribeClick}
                  disabled={processing}
                  className="w-full h-15 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 bg-amber-500 hover:bg-amber-400 text-white shadow-[0_12px_30px_-8px_rgba(242,106,33,0.6)]"
                >
                  {processing ? 'Processing...' : 'Subscribe Now'}
                  <ArrowRight className="size-4" />
                </button>

                <p className="mt-4 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  <ShieldCheck className="size-3.5 text-amber-500" /> KYC verification required
                </p>
              </div>

              {/* Right: features */}
              <div className="relative flex flex-col p-8 lg:p-12 border-t md:border-t-0 md:border-l border-white/10 bg-white/[0.03] backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-7">
                  <span className="h-px w-6 bg-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">What's Included</span>
                </div>
                <div className="space-y-3.5">
                  {(plan.features || []).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 rounded-xl bg-white/[0.03] ring-1 ring-white/5 px-4 py-3 transition-colors hover:bg-white/[0.06]">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                      <span className="text-sm font-semibold leading-relaxed text-zinc-200">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Confirm dialog ── */}
      <AnimatePresence>
        {confirmOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setConfirmOpen(false)}
              className="absolute inset-0 bg-charcoal-950/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-md bg-white border border-zinc-200 rounded-[28px] p-8 shadow-2xl text-center"
            >
              <button onClick={() => setConfirmOpen(false)} className="absolute top-5 right-5 size-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors">
                <X className="size-4 text-charcoal-900" />
              </button>
              <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                <Crown className="size-7" />
              </div>
              <h3 className="text-xl font-black text-charcoal-900 uppercase tracking-tight mb-2">Confirm Subscription</h3>
              <p className="text-zinc-500 text-sm font-medium mb-8">
                Subscribe to <span className="font-black text-charcoal-900">{plan?.name}</span> for{' '}
                <span className="font-black text-charcoal-900">₹{Number(plan?.price || 0).toLocaleString()}</span>?
                You'll complete a quick KYC before payment.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmOpen(false)} className="flex-1 h-12 rounded-xl border border-zinc-200 text-charcoal-900 font-black uppercase tracking-widest text-[11px] hover:bg-zinc-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleConfirmYes} className="flex-1 h-12 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-black uppercase tracking-widest text-[11px] transition-colors">
                  Yes, Continue
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── KYC modal ── */}
      <KycModal
        open={kycOpen}
        onClose={() => setKycOpen(false)}
        onSubmitted={() => { setKycOpen(false); startPayment() }}
      />
    </section>
  )
}
