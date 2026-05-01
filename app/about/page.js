'use client'
import { Car, Trophy, Users, ShieldCheck, Target, Award, Star } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AboutPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8 }
  }

  return (
    <div className="bg-slate-950 pt-32 pb-24 min-h-screen">
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 text-center mb-24">
        <motion.div {...fadeInUp}>
          <div className="flex items-center justify-center gap-2 text-amber-500 font-bold uppercase tracking-[0.2em] text-[10px] mb-4">
            <Car className="size-4" />
            <span>About Us</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter mb-6">
            The Kasika <span className="text-amber-500">Story</span>
          </h1>
          <p className="text-slate-400 font-medium max-w-3xl mx-auto text-lg leading-relaxed">
            Founded with a passion for the open road and an uncompromising dedication to luxury, Kasika is redefining the self-drive and chauffeured experience in India. We believe every journey should be an unforgettable adventure.
          </p>
        </motion.div>
      </div>

      {/* Our Story & Mission */}
      <div className="container mx-auto px-4 mb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="aspect-[4/3] rounded-[40px] overflow-hidden relative shadow-2xl"
          >
            <img src="/assests/carabout.jpeg" alt="Our Fleet" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-amber-500/10 mix-blend-overlay" />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Our Mission</h2>
              <p className="text-slate-400 leading-relaxed font-medium">
                To democratize luxury mobility by providing seamless, hassle-free access to top-tier vehicles. Whether you're taking the wheel yourself or relaxing in the back seat with our professional drivers, our goal is to deliver an experience that exceeds your expectations at every turn.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
                <Target className="size-8 text-amber-500 mb-4" />
                <h4 className="text-white font-black uppercase tracking-tight mb-2">Precision</h4>
                <p className="text-slate-500 text-sm">Every vehicle is maintained to the highest standards.</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
                <ShieldCheck className="size-8 text-amber-500 mb-4" />
                <h4 className="text-white font-black uppercase tracking-tight mb-2">Safety First</h4>
                <p className="text-slate-500 text-sm">Comprehensive insurance and 24/7 roadside assistance.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Meet the Leadership */}

      {/* The Kasika Difference */}
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-16">
          The Kasika <span className="text-amber-500">Difference</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: 'Curated Fleet', desc: 'From sleek sports cars to spacious SUVs, our fleet is handpicked for performance and comfort.' },
            { title: 'Flexible Booking', desc: 'Choose to drive yourself or book a professional chauffeur. Tailor your trip to your specific needs.' },
            { title: 'Transparent Pricing', desc: 'No hidden fees. We believe in honest, upfront pricing so you can travel with peace of mind.' }
          ].map((item, i) => (
            <div key={i} className="p-8">
              <h4 className="text-lg font-black text-amber-500 uppercase tracking-tight mb-4">{item.title}</h4>
              <p className="text-slate-400 font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
