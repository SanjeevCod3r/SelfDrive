'use client'
import { motion } from 'framer-motion'
import { PhoneCall, ArrowRight, Car, Zap, Shield, Search } from 'lucide-react'
import Link from 'next/link'

const types = [
  { name: "Sports Coupe", icon: "🏎️", count: "3 Cars" },
  { name: "Crossover", icon: "🚙", count: "5 Cars" },
  { name: "Pickup", icon: "🛻", count: "8 Cars" },
  { name: "Family MPV", icon: "🚐", count: "6 Cars" },
  { name: "Pickup", icon: "🛻", count: "7 Cars" }
]

export default function PopularCarTypes() {
  return (
    <section className="bg-[#020617] pt-24 pb-40 overflow-hidden relative">
      {/* Background Car Silhouette Decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-5 pointer-events-none">
         <h2 className="text-[250px] font-black text-white/10 uppercase tracking-tighter text-center">KASIKA</h2>
      </div>

      <div className="container mx-auto px-6 relative z-10">

        {/* Section Header */}
        <div className="text-center mb-24">
          <div className="flex items-center justify-center gap-3 mb-6">
             <div className="w-12 h-px bg-amber-500/30" />
             <div className="flex items-center gap-2 text-amber-500 font-black uppercase tracking-[0.4em] text-[10px]">
                <Car className="size-4" />
                <span>Popular Car</span>
             </div>
             <div className="w-12 h-px bg-amber-500/30" />
          </div>
          <h2 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none">
            Most Popular <span className="text-amber-500">Cartypes</span>
          </h2>
        </div>

        {/* Categories Grid - Stacked Card Design */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
           {types.map((type, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1 }}
               className="group relative pt-10"
             >
                {/* Background Shadow Layer */}
                <div className="absolute inset-0 bg-slate-900 translate-y-4 rounded-[40px] opacity-30 group-hover:translate-y-6 transition-all duration-500" />
                
                {/* Main Content Layer */}
                <div className="relative bg-[#0f172a] border border-white/5 p-10 pb-12 rounded-[40px] flex flex-col items-center group-hover:border-amber-500/30 transition-all duration-500">
                   
                   {/* Gold Icon Badge - top right */}
                   <div className="absolute top-0 right-8 -translate-y-1/2">
                      <div className="size-16 bg-[#1e293b] rounded-2xl border border-white/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-slate-900 transition-all shadow-xl">
                         <Zap className="size-7 fill-amber-500 group-hover:fill-slate-900" />
                      </div>
                   </div>

                   <h4 className="text-xl font-black uppercase tracking-tight text-white mb-4 mt-4">{type.name}</h4>
                   <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 group-hover:text-amber-500 transition-colors">{type.count}</p>
                </div>
             </motion.div>
           ))}
        </div>

      </div>
    </section>
  )
}
