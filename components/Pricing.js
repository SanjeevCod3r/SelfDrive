'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Car, Zap, Shield } from 'lucide-react'
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
        theme: { color: '#f59e0b' }
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
    <section className="py-32 bg-white overflow-hidden relative">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="container mx-auto px-6">
        
        {/* Header */}
        {showBanner && (
          <div className="text-center mb-24">
             <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-px bg-amber-500/30" />
                <div className="flex items-center gap-2 text-amber-500 font-black uppercase tracking-[0.4em] text-[10px]">
                   <span>PRICING & PLAN</span>
                </div>
                <div className="w-12 h-px bg-amber-500/30" />
             </div>
             <h3 className="text-4xl md:text-8xl font-black text-[#020617] uppercase tracking-tighter leading-[0.9] max-w-5xl mx-auto">
               TIME QUICK AND EASY TO <br /> TRANSPORTATION
             </h3>
          </div>
        )}

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-[600px] bg-slate-50 rounded-[50px] animate-pulse border border-slate-100" />)
          ) : plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative bg-white border border-slate-100 rounded-[50px] p-12 shadow-2xl shadow-slate-200/50 hover:border-amber-500/20 transition-all duration-700 flex flex-col h-full"
            >
              {/* Floating Icon Badge - Match Screenshot */}
              <div className="absolute top-44 right-10">
                 <div className={`size-16 rounded-full flex items-center justify-center shadow-xl transition-all group-hover:scale-110 ${
                   i === 1 ? 'bg-[#0f172a] text-white' : 'bg-amber-500 text-slate-950'
                 }`}>
                    <Car className="size-8" />
                 </div>
              </div>

              <div className="mb-12">
                 <h3 className="text-4xl font-black uppercase tracking-tight text-slate-900 mb-6">{plan.name}</h3>
                 <p className="text-slate-500 font-medium leading-relaxed mb-10 text-sm max-w-[200px]">
                    Car service is essential for maintaining performance and longevity of vehicle. From oil changes
                 </p>
                 
                 <div className="flex items-baseline gap-2 pt-8 border-t border-slate-50">
                    <span className="text-7xl font-black text-slate-900 tracking-tighter">₹{plan.price}</span>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">/ month</span>
                 </div>
              </div>

              <div className="space-y-6 mb-16 flex-1">
                 {/* Feature mapping with price aligned right like screenshot */}
                 {(plan.features || []).slice(0, 4).map((feature, idx) => (
                   <div key={idx} className="flex items-center justify-between group/item">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover/item:text-slate-900 transition-colors">
                        {feature.split(':')[0]}
                      </span>
                    
                   </div>
                 ))}
                 {/* Static placeholders to match screenshot look if features are short */}
                 {(plan.features || []).length < 2 && (
                   <>
                    <div className="flex items-center justify-between"><span className="text-xs font-black uppercase tracking-widest text-slate-400">Initial charge:</span><span className="text-xs font-black text-slate-900">₹00</span></div>
                    <div className="flex items-center justify-between"><span className="text-xs font-black uppercase tracking-widest text-slate-400">Additional Kilometre:</span><span className="text-xs font-black text-slate-900">₹00</span></div>
                   </>
                 )}
              </div>

              <div className="mt-auto">
                 <button 
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={buyingPlanId === plan.id}
                  className="bg-amber-500 hover:bg-slate-950 text-slate-950 hover:text-white px-10 h-16 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all shadow-xl shadow-amber-500/10 active:scale-95 disabled:opacity-50"
                 >
                    {buyingPlanId === plan.id ? 'Processing...' : 'Rent Now'} <ArrowRight className="size-4" />
                 </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
