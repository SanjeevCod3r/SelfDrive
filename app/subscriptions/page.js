'use client'
import Pricing from '@/components/Pricing'
import { Crown, ShieldCheck, Zap, RefreshCw, Headphones, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function SubscriptionsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Cinematic Hero */}
      <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-charcoal-950">
        <img
          src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=2400&auto=format&fit=crop"
          alt="Premium membership"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-950/70 via-charcoal-950/85 to-charcoal-950" />
        <div className="pointer-events-none absolute left-1/2 top-1/3 size-[600px] -translate-x-1/2 rounded-full bg-brand-500/20 blur-[150px]" />

        <div className="container relative z-10 mx-auto px-6 pt-28 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          >
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-2 backdrop-blur-md"
            >
              <Crown className="size-4 fill-brand-500 text-brand-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-400">Kashi Ka Elite Club</span>
            </motion.div>
            <motion.h1
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
              className="mb-8 text-6xl font-black uppercase leading-[0.82] tracking-tighter text-white md:text-8xl lg:text-9xl"
            >
              Drive The <br /> <span className="text-brand-500 text-glow">Exceptional</span>
            </motion.h1>
            <motion.p
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
              className="mx-auto mb-10 max-w-xl text-lg font-medium leading-relaxed text-zinc-300"
            >
              Unlock zero deposits, priority access to new arrivals and a dedicated concierge. Membership that pays for itself.
            </motion.p>
            <motion.a
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
              href="#plans"
              className="group inline-flex items-center gap-3 rounded-2xl bg-brand-500 px-10 py-5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-600 hover:scale-105"
            >
              View Membership Plans
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </motion.a>
          </motion.div>
        </div>
      </section>
      {/* The Proper Pricing Section */}
      <div id="plans" className="scroll-mt-24">
        <Pricing showBanner={false} />
      </div>

      {/* Premium Perks Grid - The WOW Factor */}
      <section className="py-32 bg-white overflow-hidden">
        <div className="container mx-auto px-6">
           <div className="text-center mb-24">
              <div className="flex items-center justify-center gap-2 text-brand-500 font-black uppercase tracking-[0.4em] text-[10px] mb-6">
                 <span>ELITE PRIVILEGES</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-charcoal-900 uppercase tracking-tighter leading-[0.9]">
                BEYOND JUST A <span className="text-brand-500">MEMBERSHIP</span>
              </h2>
           </div>

           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { 
                  title: 'Zero Security Deposit', 
                  desc: 'Members enjoy bookings with zero security deposits. Your credit limit is yours to keep.',
                  img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2070'
                },
                { 
                  title: 'Priority Fleet Access', 
                  desc: 'Get early access to our newest arrivals and elite performance cars before anyone else.',
                  img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070'
                },
                { 
                  title: 'VIP Concierge', 
                  desc: 'A dedicated 24/7 support line for all your needs, from on-road help to travel planning.',
                  img: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070'
                }
              ].map((perk, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative h-[320px] rounded-[32px] overflow-hidden bg-zinc-100 border border-zinc-200 shadow-[0_10px_40px_-20px_rgba(21,22,27,0.15)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_-25px_rgba(242,106,33,0.4)]"
                >
                   <img src={perk.img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                   <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/90 via-charcoal-900/40 to-transparent" />
                   <div className="absolute inset-0 p-12 flex flex-col justify-end">
                      <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-4">{perk.title}</h3>
                      <p className="text-zinc-200 font-medium leading-relaxed mb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">{perk.desc}</p>
                      <div className="w-12 h-1.5 bg-brand-500 rounded-full group-hover:w-full transition-all duration-500" />
                   </div>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-24 bg-zinc-50">
        <div className="container mx-auto px-6">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: ShieldCheck, label: 'Secure Payment', desc: 'Protected by Razorpay TLS' },
                { icon: Zap, label: 'Instant Upgrade', desc: 'Benefits unlock immediately' },
                { icon: RefreshCw, label: 'Flexible Plans', desc: 'Switch or cancel anytime' },
                { icon: Headphones, label: 'VIP Support', desc: 'Dedicated concierge line' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group flex flex-col items-center rounded-[28px] border border-zinc-200 bg-white p-8 text-center shadow-[0_10px_40px_-20px_rgba(21,22,27,0.15)] transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-500/40"
                >
                   <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500 transition-all group-hover:bg-brand-500 group-hover:text-white">
                      <item.icon className="size-6" />
                   </div>
                   <p className="text-sm font-black uppercase tracking-widest text-charcoal-900 mb-2">{item.label}</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{item.desc}</p>
                </motion.div>
              ))}
           </div>
        </div>
      </section>
    </div>
  )
}
