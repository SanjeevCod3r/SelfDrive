'use client'
import { motion } from 'framer-motion'
import { Crown, ArrowRight, ShieldCheck, Zap, Star } from 'lucide-react'
import Link from 'next/link'

export default function EliteTeaser() {
  return (
    <section className="py-32 bg-white overflow-hidden relative">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3" />
      
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          
          {/* Left Side: Visual */}
          <div className="lg:w-1/2 relative">
             <div className="relative z-10 rounded-[60px] overflow-hidden border border-zinc-200 shadow-[0_25px_60px_-15px_rgba(21,22,27,0.25)]">
                <img
                  src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070"
                  alt="Elite Membership"
                  className="w-full aspect-[4/5] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/40 via-transparent to-transparent" />
             </div>
             
             {/* Floating Reward Card */}
             <motion.div 
               initial={{ x: 50, opacity: 0 }}
               whileInView={{ x: 0, opacity: 1 }}
               className="absolute -bottom-10 -right-10 bg-amber-500 p-8 rounded-[40px] shadow-2xl z-20 hidden md:block max-w-[280px]"
             >
                <Crown className="size-10 text-slate-950 mb-4" />
                <h4 className="text-xl font-black text-slate-950 uppercase tracking-tight mb-2">Kashi Ka Rewards</h4>
                <p className="text-slate-950/70 text-sm font-bold uppercase tracking-widest">Members earn 10 points for every ₹1000 spent.</p>
             </motion.div>
          </div>

          {/* Right Side: Content */}
          <div className="lg:w-1/2 space-y-10">
            <div>
              <div className="flex items-center gap-3 text-amber-500 font-black uppercase tracking-[0.4em] text-[10px] mb-6">
                <Star className="size-4 fill-amber-500" />
                <span>Premium Membership</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-charcoal-900 uppercase tracking-tighter leading-[0.9] mb-8">
                JOIN THE <span className="text-amber-500 text-glow">ELITE CLUB</span> <br />
                EXPERIENCE LUXURY
              </h2>
              <p className="text-zinc-600 text-lg leading-relaxed max-w-xl">
                Unlock exclusive discounts, zero-deposit bookings, and priority access to our most prestigious vehicles. Membership is not just about driving; it's about a lifestyle.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
               {[
                 { icon: ShieldCheck, title: 'Zero Deposit', desc: 'Book any car without security block.' },
                 { icon: Zap, title: 'Instant Upgrade', desc: 'Immediate 5% discount on all trips.' }
               ].map((item, i) => (
                 <div key={i} className="flex gap-4">
                    <div className="size-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                       <item.icon className="size-6 text-amber-500" />
                    </div>
                    <div>
                       <h5 className="text-charcoal-900 font-black uppercase tracking-tight mb-1">{item.title}</h5>
                       <p className="text-zinc-500 text-xs leading-relaxed font-medium">{item.desc}</p>
                    </div>
                 </div>
               ))}
            </div>

            <div className="pt-6">
              <Link href="/subscriptions" className="group inline-flex items-center gap-6 bg-charcoal-900 text-white px-10 py-6 rounded-[30px] font-black uppercase tracking-widest text-xs hover:bg-amber-500 transition-all shadow-xl hover:scale-105 active:scale-95">
                Explore Elite Plans
                <div className="size-8 rounded-full bg-white flex items-center justify-center text-charcoal-900 group-hover:translate-x-2 transition-transform">
                   <ArrowRight className="size-4" />
                </div>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
