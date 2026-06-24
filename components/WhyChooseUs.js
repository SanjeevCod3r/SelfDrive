'use client'
import { motion } from 'framer-motion'
import { Shield, MapPin, Smile, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    icon: Shield,
    title: "Easy & Fast Booking",
    desc: "Reserve your car in under two minutes. A clean, transparent flow with instant confirmation — no paperwork, no waiting.",
  },
  {
    icon: MapPin,
    title: "Many Pickup Locations",
    desc: "Pick up and drop off across every major city in India. Doorstep delivery available so your ride reaches you, wherever you are.",
  },
  {
    icon: Smile,
    title: "Customer Satisfaction",
    desc: "Well-maintained vehicles, 24/7 roadside support and a dedicated team that puts your journey first, every single time.",
  }
]

export default function WhyChooseUs() {
  return (
    <section className="relative overflow-hidden bg-white py-24 md:py-28">
      {/* Soft amber glow accent */}
      <div className="pointer-events-none absolute right-0 top-1/3 size-[500px] translate-x-1/3 rounded-full bg-amber-500/5 blur-[120px]" />

      <div className="container relative z-10 mx-auto px-6">

        {/* Header */}
        <div className="mb-16 text-center md:mb-20">
          <div className="mb-6 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">
             <div className="h-px w-8 bg-amber-500/40" />
             <Sparkles className="size-3.5" />
             <span>Why Choose Us</span>
             <div className="h-px w-8 bg-amber-500/40" />
          </div>
          <h2 className="mx-auto max-w-3xl text-4xl font-black uppercase leading-[0.95] tracking-tighter text-charcoal-900 md:text-6xl">
            Innovative &amp; Passionate <span className="text-amber-500">About Every Drive</span>
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {features.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
              className="group relative flex flex-col rounded-[32px] border border-zinc-200 bg-zinc-50 p-10 shadow-[0_10px_40px_-20px_rgba(21,22,27,0.15)] transition-all duration-500 hover:-translate-y-2 hover:border-amber-500/40 hover:bg-white hover:shadow-[0_30px_60px_-25px_rgba(242,106,33,0.35)]"
            >
              {/* Icon badge */}
              <div className="mb-8 flex size-16 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/25 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                <item.icon className="size-7 stroke-[2.5]" />
              </div>

              <h3 className="mb-4 text-2xl font-black uppercase leading-tight tracking-tight text-charcoal-900">
                {item.title}
              </h3>
              <p className="mb-10 flex-1 text-sm font-medium leading-relaxed text-zinc-500">
                {item.desc}
              </p>

              <Link
                href="/self-drive"
                className="group/btn mt-auto inline-flex w-fit items-center gap-2 text-xs font-black uppercase tracking-widest text-charcoal-900 transition-colors hover:text-amber-500"
              >
                Rent Now
                <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-1" />
              </Link>

              {/* Large faded number */}
              <span className="pointer-events-none absolute right-8 top-8 text-5xl font-black text-charcoal-900/[0.04] transition-colors group-hover:text-amber-500/10">
                0{i + 1}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
