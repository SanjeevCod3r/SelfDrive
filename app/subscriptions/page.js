'use client'
import Pricing from '@/components/Pricing'
import { Crown } from 'lucide-react'
import { motion } from 'framer-motion'

export default function SubscriptionsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Cinematic Hero */}
      <section className="relative pt-48 pb-24 bg-slate-950 overflow-hidden">
        <div className="absolute inset-0">
           <img src="/assests/subscription_banner.png" className="w-full h-full object-cover" alt="Premium Subscriptions" />
           <div className="absolute inset-0 bg-gradient-to-b" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-center gap-3 text-amber-500 font-black uppercase tracking-[0.4em] text-[10px] mb-6">
              <Crown className="size-4 fill-amber-500" />
              <span>Kasika Elite Club</span>
            </div>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white uppercase tracking-tighter leading-[0.8] mb-12">
              DRIVE THE <br /> <span className="text-amber-500 text-glow">EXCEPTIONAL</span>
            </h1>
          </motion.div>
        </div>
      </section>
      {/* The Proper Pricing Section */}
      <Pricing showBanner={false} />

      {/* Premium Perks Grid - The WOW Factor */}
      <section className="py-32 bg-white overflow-hidden">
        <div className="container mx-auto px-6">
           <div className="text-center mb-24">
              <div className="flex items-center justify-center gap-2 text-amber-500 font-black uppercase tracking-[0.4em] text-[10px] mb-6">
                 <span>ELITE PRIVILEGES</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-[#020617] uppercase tracking-tighter leading-[0.9]">
                BEYOND JUST A <span className="text-amber-500">MEMBERSHIP</span>
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
                  className="group relative h-[300px] rounded-[50px] overflow-hidden bg-slate-900 shadow-2xl"
                >
                   <img src={perk.img} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700" alt="" />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                   <div className="absolute inset-0 p-12 flex flex-col justify-end">
                      <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-4">{perk.title}</h3>
                      <p className="text-slate-300 font-medium leading-relaxed mb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">{perk.desc}</p>
                      <div className="w-12 h-1.5 bg-amber-500 rounded-full group-hover:w-full transition-all duration-500" />
                   </div>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
           <div className="grid md:grid-cols-4 gap-12">
              {[
                { label: 'Secure Payment', desc: 'Protected by Razorpay TLS' },
                { label: 'Instant Upgrade', desc: 'Benefits unlock immediately' },
                { label: 'Flexible Plans', desc: 'Switch or cancel anytime' },
                { label: 'VIP Support', desc: 'Dedicated concierge line' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                   <p className="text-sm font-black uppercase tracking-widest text-slate-900 mb-2">{item.label}</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>
    </div>
  )
}
