import { motion } from 'framer-motion'
import { ShieldCheck, Map, Clock, Headphones } from 'lucide-react'

export default function Services() {
  const services = [
    {
      icon: ShieldCheck,
      title: 'Secure Insurance',
      desc: 'All our vehicles come with comprehensive insurance coverage for your peace of mind on the road.'
    },
    {
      icon: Map,
      title: 'All India Permit',
      desc: 'Travel across state borders seamlessly with valid permits for all Indian states.'
    },
    {
      icon: Clock,
      title: 'Flexible Plans',
      desc: 'Choose from hourly, daily, weekly, or monthly subscription plans tailored to your needs.'
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      desc: 'Dedicated roadside assistance and customer support available around the clock.'
    }
  ]

  return (
    <section className="py-24 bg-slate-900 relative border-t border-slate-800">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-amber-500 font-bold uppercase tracking-[0.2em] text-[10px] mb-4">Kasika Advantages</div>
          <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-6">
            Why Drive <span className="text-amber-500">With Us?</span>
          </h2>
          <p className="text-slate-400 font-medium text-lg">
            We provide more than just a car; we provide a complete, hassle-free mobility solution designed for the modern traveler.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, idx) => (
            <div key={idx} className="bg-slate-950 p-8 rounded-[32px] border border-slate-800 hover:border-amber-500/30 transition-colors group">
              <div className="size-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 group-hover:bg-amber-500 transition-colors">
                <service.icon className="size-8 text-amber-500 group-hover:text-slate-950 transition-colors" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3">{service.title}</h3>
              <p className="text-slate-400 font-medium leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
