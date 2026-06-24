'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Car, Check, Sparkles, Crown } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { toast } from 'sonner'
import Script from 'next/script'

export default function Pricing({ showBanner = true }) {
  const { api, user, openAuth } = useAuth()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [buyingPlanId, setBuyingPlanId] = useState(null)

  useEffect(() => {
    api('/packages').then(data => {
      setPlans(data.plans || [])
    }).catch(e => {
      toast.error('Failed to load subscription plans')
    }).finally(() => setLoading(false))
  }, [api])

  const handleSubscribe = async (planId) => {
    if (!user) {
      toast.info('Please login to subscribe')
      openAuth('login')
      return
    }

    setBuyingPlanId(planId)
    try {
      const res = await api('/subscriptions/create-order', {
        method: 'POST',
        body: JSON.stringify({ planId })
      })
      
      const options = {
        key: res.key,
        amount: res.amount * 100,
        currency: res.currency,
        name: 'Kasika Premium',
        description: `Subscription to ${planId} plan`,
        order_id: res.orderId,
        handler: async (response) => {
          try {
            await api('/subscriptions/verify', {
              method: 'POST',
              body: JSON.stringify({
                ...response,
                subscriptionId: res.subscriptionId
              })
            })
            toast.success('Welcome to Kasika Premium!')
            window.location.reload()
          } catch (e) {
            toast.error('Verification failed')
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: '#F26A21' }
      }
      
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBuyingPlanId(null)
    }
  }

  return (
    <section className="py-24 md:py-32 bg-zinc-50 overflow-hidden relative">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* Soft amber glow accent */}
      <div className="pointer-events-none absolute left-1/2 top-0 size-[600px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-amber-500/5 blur-[120px]" />

      <div className="container mx-auto px-6 relative z-10">

        {/* Header */}
        {showBanner && (
          <div className="text-center mb-16 md:mb-20">
             <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-px bg-amber-500/30" />
                <div className="flex items-center gap-2 text-amber-500 font-black uppercase tracking-[0.4em] text-[10px]">
                   <Sparkles className="size-3.5" />
                   <span>Pricing &amp; Plans</span>
                </div>
                <div className="w-12 h-px bg-amber-500/30" />
             </div>
             <h3 className="text-4xl md:text-6xl font-black text-charcoal-900 uppercase tracking-tighter leading-[0.95] max-w-3xl mx-auto">
               Quick &amp; Easy <span className="text-amber-500">Transportation</span>
             </h3>
          </div>
        )}

        {/* Pricing Grid */}
        <div className="flex flex-wrap justify-center gap-6 lg:gap-7 max-w-6xl mx-auto">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="w-full sm:w-[340px] lg:w-[360px] h-[560px] bg-white rounded-[36px] animate-pulse border border-zinc-200" />)
          ) : plans.map((plan, i) => {
            const featured = i === 1
            return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`group relative w-full sm:w-[340px] lg:w-[360px] rounded-[36px] p-8 lg:p-10 transition-all duration-500 flex flex-col ${
                featured
                  ? 'bg-charcoal-900 border border-charcoal-900 shadow-[0_30px_70px_-20px_rgba(21,22,27,0.55)] md:-translate-y-3'
                  : 'bg-white border border-zinc-200 shadow-[0_10px_40px_-20px_rgba(21,22,27,0.15)] hover:border-amber-500/40'
              }`}
            >
              {/* Most Popular badge */}
              {featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-amber-500/30">
                  Most Popular
                </div>
              )}

              {/* Header row: name + icon */}
              <div className="flex items-start justify-between mb-6">
                 <h3 className={`text-2xl font-black uppercase tracking-tight leading-tight max-w-[160px] ${featured ? 'text-white' : 'text-charcoal-900'}`}>
                   {plan.name}
                 </h3>
                 <div className={`size-14 rounded-2xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110 ${featured ? 'bg-amber-500 text-white' : 'bg-amber-500/10 text-amber-500'}`}>
                    <Car className="size-7" />
                 </div>
              </div>

              <p className={`font-medium leading-relaxed mb-8 text-sm ${featured ? 'text-zinc-400' : 'text-zinc-500'}`}>
                 Keep your journeys seamless with priority service, exclusive perks and the best rates on every booking.
              </p>

              {/* Price */}
              <div className={`flex items-baseline gap-2 pb-8 mb-8 border-b ${featured ? 'border-white/10' : 'border-zinc-100'}`}>
                 <span className={`text-5xl font-black tracking-tighter ${featured ? 'text-white' : 'text-charcoal-900'}`}>₹{Number(plan.price).toLocaleString()}</span>
                 <span className="text-xs font-black uppercase tracking-widest text-zinc-400">/ {plan.duration === 365 ? 'year' : 'month'}</span>
              </div>

              {/* Features checklist */}
              <div className="space-y-4 mb-10 flex-1">
                 {(plan.features || []).slice(0, 5).map((feature, idx) => (
                   <div key={idx} className="flex items-center gap-3">
                      <span className={`flex size-5 shrink-0 items-center justify-center rounded-full ${featured ? 'bg-amber-500/20 text-amber-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                      <span className={`text-sm font-semibold ${featured ? 'text-zinc-300' : 'text-zinc-600'}`}>
                        {feature}
                      </span>
                   </div>
                 ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={buyingPlanId === plan.id}
                className={`mt-auto w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 ${
                  featured
                    ? 'bg-amber-500 hover:bg-white text-white hover:text-charcoal-900 shadow-lg shadow-amber-500/25'
                    : 'bg-charcoal-900 hover:bg-amber-500 text-white shadow-lg shadow-charcoal-900/10'
                }`}
              >
                 {buyingPlanId === plan.id ? 'Processing...' : 'Subscribe Now'}
                 <ArrowRight className="size-4" />
              </button>
            </motion.div>
            )
          })}

          {!loading && plans.length === 0 && (
            <div className="w-full max-w-md mx-auto py-16 text-center border-2 border-dashed border-zinc-200 rounded-[36px] bg-white">
              <Crown className="size-10 text-zinc-300 mx-auto mb-4" />
              <h3 className="text-xl font-black text-charcoal-900 uppercase tracking-tight mb-2">No Plans Yet</h3>
              <p className="text-zinc-500 text-sm font-medium px-6">Subscription packages will appear here once added from the admin panel.</p>
            </div>
          )}
        </div>

      </div>
    </section>
  )
}
