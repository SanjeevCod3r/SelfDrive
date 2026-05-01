'use client'
import { motion } from 'framer-motion'
import { Shield, MapPin, Smile, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    icon: Shield,
    title: "Easy & Fast Booking",
    desc: "Car service is essential for maintaining performance and longevity of vehicle. From oil changes. Dominion fowe there light she does lights begining subdue.",
    btnText: "Rent Now"
  },
  {
    icon: MapPin,
    title: "Many Pickup Location",
    desc: "Car service is essential for maintaining performance and longevity of vehicle. From oil changes. Dominion fowe there light she does lights begining subdue.",
    btnText: "Rent Now"
  },
  {
    icon: Smile,
    title: "Customer Satisfaction",
    desc: "Car service is essential for maintaining performance and longevity of vehicle. From oil changes. Dominion fowe there light she does lights begining subdue.",
    btnText: "Rent Now"
  }
]

export default function WhyChooseUs() {
  return (
    <section className="py-32 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-24">
          <div className="flex items-center justify-center gap-2 text-amber-500 font-black uppercase tracking-[0.4em] text-[10px] mb-6">
             <div className="w-8 h-px bg-amber-500" />
             <span>Why Choose Us</span>
             <div className="w-8 h-px bg-amber-500" />
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-[#020617] uppercase tracking-tighter leading-[0.9] max-w-5xl mx-auto">
            WE ARE INNOVATIVE AND PASSIONATE <br /> ABOUT THE WORK WE DO.
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid lg:grid-cols-3 gap-12">
          {features.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative group"
            >
              {/* Main Card */}
              <div className="bg-[#0f172a] rounded-[60px] p-12 h-full flex flex-col items-center text-center relative overflow-visible mt-10">
                 
                 {/* The "Carved" Icon Container */}
                 <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4">
                    <div className="relative">
                       {/* Yellow Circle */}
                       <div className="size-24 bg-amber-500 rounded-full flex items-center justify-center text-slate-950 shadow-2xl shadow-amber-500/30 border-[8px] border-white z-10 group-hover:scale-110 transition-transform duration-500">
                          <item.icon className="size-8 stroke-[2.5]" />
                       </div>
                       {/* Small inner circle decoration from image */}
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[110px] border border-amber-500/20 rounded-full" />
                    </div>
                 </div>

                 <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-8 mt-4 leading-tight">{item.title}</h3>
                 <p className="text-slate-400 font-medium leading-relaxed mb-12 text-sm">{item.desc}</p>
                 
                 <div className="mt-auto w-full flex justify-start">
                    <Link href="/self-drive" className="inline-flex items-center gap-3 bg-amber-500 hover:bg-white text-slate-950 font-black uppercase tracking-widest text-[11px] h-14 px-10 rounded-2xl transition-all shadow-xl shadow-amber-500/10">
                       {item.btnText} <ArrowRight className="size-4" />
                    </Link>
                 </div>
              </div>

              {/* Offset shadow shape from image */}
              <div className="absolute -z-10 bottom-0 right-0 w-[90%] h-[90%] bg-slate-900 rounded-[60px] translate-x-4 translate-y-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
