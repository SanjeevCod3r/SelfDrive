'use client'
import { motion } from 'framer-motion'
import { Users, Car, MapPin, Milestone, Star } from 'lucide-react'

const facts = [
  { icon: Users, number: '5K+', label: 'Happy Customers' },
  { icon: Car, number: '100+', label: 'Premium Cars' },
  { icon: MapPin, number: '20+', label: 'Cities Covered' },
  { icon: Milestone, number: '10M+', label: 'Kilometers Driven' }
]

export default function FunFacts() {
  return (
    <section className="py-24 bg-white overflow-hidden border-t border-slate-100">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <div className="flex items-center gap-2 text-amber-600 font-black uppercase tracking-[0.3em] text-[10px] mb-12">
           <img src="/assests/car_icon_small.png" alt="" className="h-3 w-auto opacity-50" onError={e => e.target.style.display = 'none'} />
           <span>Fun Facts</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {facts.map((fact, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group text-center flex flex-col items-center"
            >
              <div className="size-20 rounded-[28px] bg-amber-500/10 flex items-center justify-center text-amber-600 mb-6 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500 shadow-xl shadow-amber-500/5">
                <fact.icon className="size-8" />
              </div>
              <h3 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter mb-2 group-hover:text-amber-500 transition-colors">
                {fact.number}
              </h3>
              <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">
                {fact.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Global Rating Section */}
        <div className="mt-20 pt-16 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-10">
           <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="size-12 rounded-full border-4 border-white bg-slate-200 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="" />
                   </div>
                 ))}
              </div>
              <div>
                 <div className="flex items-center gap-1 mb-1">
                    {[1,2,3,4,5].map(s => <Star key={s} className="size-3 text-amber-500 fill-amber-500" />)}
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trusted by thousands of drivers</p>
              </div>
           </div>

           <div className="flex items-center gap-8">
              <div className="h-10 w-px bg-slate-200 hidden md:block" />
              <div className="text-center md:text-left">
                 <p className="text-2xl font-black text-slate-900 uppercase tracking-tight">4.9/5</p>
                 <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Global Customer Rating</p>
              </div>
           </div>
        </div>
      </div>
    </section>
  )
}
