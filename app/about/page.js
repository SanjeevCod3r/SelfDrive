'use client'
import { useRef, useState, useEffect } from 'react'
import {
  Car, ShieldCheck, Target, Sparkles, ArrowRight,
  Gauge, SlidersHorizontal, BadgeIndianRupee, MapPin, Users, Trophy
} from 'lucide-react'
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'
import Link from 'next/link'

/* ── Animated count-up that fires when scrolled into view ── */
function Counter({ to, suffix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const count = useMotionValue(0)
  const rounded = useTransform(count, v => Math.floor(v))
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(count, to, { duration: 1.8, ease: 'easeOut' })
    return controls.stop
  }, [inView, to, count])

  useEffect(() => rounded.on('change', v => setDisplay(v)), [rounded])

  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>
}

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7 },
}

const stats = [
  { icon: Trophy, value: 10, suffix: '+', label: 'Years of Experience' },

  { icon: Car, value: 250, suffix: '+', label: 'Premium Vehicles' },
  { icon: MapPin, value: 30, suffix: '+', label: 'Cities Covered' },
  { icon: Users, value: 15000, suffix: '+', label: 'Happy Customers' },
]

const differences = [
  { icon: Gauge, title: 'Curated Fleet', desc: 'From sleek sports cars to spacious SUVs, our fleet is handpicked for performance and comfort.' },
  { icon: SlidersHorizontal, title: 'Flexible Booking', desc: 'Drive yourself or book a professional chauffeur. Tailor every trip to your specific needs.' },
  { icon: BadgeIndianRupee, title: 'Transparent Pricing', desc: 'No hidden fees. Honest, upfront pricing so you can travel with total peace of mind.' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-white pb-24">

      {/* ── CINEMATIC HERO BANNER ── */}
      <section className="relative mb-24 flex min-h-[70vh] items-center overflow-hidden bg-charcoal-950">
        <img
          src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2400&auto=format&fit=crop"
          alt="The Kasika story"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-950 via-charcoal-950/85 to-charcoal-950/30" />
        {/* <div className="absolute inset-0 bg-gradient-to-t from-white via-charcoal-950/50 to-charcoal-950/40" /> */}
        <div className="pointer-events-none absolute -left-20 top-1/3 size-[500px] rounded-full bg-amber-500/20 blur-[150px]" />

        <div className="container relative z-10 mx-auto px-6 pt-28">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
            className="max-w-3xl"
          >
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.4em] text-amber-400 backdrop-blur-md"
            >
              <Sparkles className="size-3.5" />
              <span>About Us</span>
            </motion.div>
            <motion.h1
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
              className="mb-6 text-5xl font-black uppercase tracking-tighter text-white md:text-8xl"
            >
              The Kasika <span className="text-amber-500">Story</span>
            </motion.h1>
            <motion.p
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
              className="max-w-2xl text-lg font-medium leading-relaxed text-zinc-300"
            >
              Founded with a passion for the open road and an uncompromising dedication to luxury,
              Kasika is redefining the self-drive and chauffeured experience in India — where every
              journey becomes an unforgettable adventure.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Animated Stats Band ── */}
      <section className="container mx-auto mb-28 px-6">
        <motion.div
          {...fadeUp}
          className="relative overflow-hidden rounded-[40px] border border-amber-200/60 bg-gradient-to-br from-amber-50 via-white to-amber-50/40 px-8 py-14 shadow-[0_30px_70px_-30px_rgba(242,106,33,0.25)]"
        >
          {/* Decorative watermark + glow */}
          <div className="pointer-events-none absolute right-0 top-1/2 size-[400px] -translate-y-1/2 translate-x-1/3 rounded-full bg-amber-500/10 blur-[100px]" />
          <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 select-none text-[160px] font-black uppercase tracking-tighter text-charcoal-900/[0.03]">
            Kasika
          </span>

          <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="group relative rounded-3xl border border-zinc-200/80 bg-white/80 p-8 text-center shadow-[0_10px_40px_-20px_rgba(21,22,27,0.15)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-amber-500/40 hover:shadow-[0_24px_50px_-25px_rgba(242,106,33,0.4)]"
              >
                <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/30 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                  <s.icon className="size-7" />
                </div>
                <div className="text-5xl font-black tracking-tighter text-charcoal-900 md:text-6xl">
                  <Counter to={s.value} suffix={s.suffix} />
                </div>
                <div className="mx-auto mt-4 h-1 w-10 rounded-full bg-amber-500/50 transition-all duration-500 group-hover:w-16 group-hover:bg-amber-500" />
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 transition-colors group-hover:text-charcoal-900">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Our Mission ── */}
      <section className="container mx-auto mb-28 px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-[40px] border-8 border-white shadow-2xl">
              <img src="/assests/carabout.jpeg" alt="Our Fleet" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-amber-500/10 mix-blend-overlay" />
            </div>
            {/* Floating accent badge */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-6 -right-4 rounded-3xl border-8 border-white bg-amber-500 px-7 py-5 text-white shadow-[0_20px_50px_rgba(242,106,33,0.35)] lg:-right-8"
            >
              <p className="text-3xl font-black leading-none tracking-tighter">100%</p>
              <p className="mt-1 text-[9px] font-black uppercase tracking-widest">Driven by <br /> Passion</p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-8"
          >
            <div>
              <div className="mb-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">
                <div className="h-px w-8 bg-amber-500/40" />
                <span>Our Mission</span>
              </div>
              <h2 className="mb-5 text-3xl font-black uppercase tracking-tighter text-charcoal-900 md:text-5xl">
                Luxury Mobility, <span className="text-amber-500">Made Simple</span>
              </h2>
              <p className="font-medium leading-relaxed text-zinc-600">
                To democratize luxury mobility by providing seamless, hassle-free access to top-tier
                vehicles. Whether you're taking the wheel yourself or relaxing in the back seat with
                our professional drivers, our goal is to deliver an experience that exceeds your
                expectations at every turn.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {[
                { icon: Target, title: 'Precision', desc: 'Every vehicle is maintained to the highest standards.' },
                { icon: ShieldCheck, title: 'Safety First', desc: 'Comprehensive insurance and 24/7 roadside assistance.' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className="group rounded-[24px] border border-zinc-200 bg-white p-6 shadow-[0_10px_40px_-20px_rgba(21,22,27,0.15)] transition-all duration-500 hover:-translate-y-1 hover:border-amber-500/40"
                >
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 transition-all group-hover:bg-amber-500 group-hover:text-white">
                    <item.icon className="size-6" />
                  </div>
                  <h4 className="mb-2 font-black uppercase tracking-tight text-charcoal-900">{item.title}</h4>
                  <p className="text-sm text-zinc-500">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── The Kasika Difference ── */}
      <section className="container mx-auto mb-28 px-6">
        <div className="mb-16 text-center">
          <div className="mb-6 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">
            <div className="h-px w-8 bg-amber-500/40" />
            <Sparkles className="size-3.5" />
            <span>Why We're Different</span>
            <div className="h-px w-8 bg-amber-500/40" />
          </div>
          <h2 className="text-4xl font-black uppercase tracking-tighter text-charcoal-900 md:text-6xl">
            The Kasika <span className="text-amber-500">Difference</span>
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {differences.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
              className="group relative flex flex-col rounded-[32px] border border-zinc-200 bg-zinc-50 p-10 shadow-[0_10px_40px_-20px_rgba(21,22,27,0.15)] transition-all duration-500 hover:-translate-y-2 hover:border-amber-500/40 hover:bg-white hover:shadow-[0_30px_60px_-25px_rgba(242,106,33,0.35)]"
            >
              <div className="mb-8 flex size-16 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/25 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                <item.icon className="size-7 stroke-[2.5]" />
              </div>
              <h4 className="mb-4 text-2xl font-black uppercase tracking-tight text-charcoal-900">{item.title}</h4>
              <p className="text-sm font-medium leading-relaxed text-zinc-500">{item.desc}</p>
              <span className="pointer-events-none absolute right-8 top-8 text-5xl font-black text-charcoal-900/[0.04] transition-colors group-hover:text-amber-500/10">
                0{i + 1}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="container mx-auto px-6">
        <motion.div
          {...fadeUp}
          className="relative overflow-hidden rounded-[40px] bg-amber-500 px-8 py-16 text-center shadow-[0_30px_70px_-25px_rgba(242,106,33,0.5)]"
        >
          <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-[200px] font-black uppercase tracking-tighter text-white/10">
            Kasika
          </span>
          <div className="relative">
            <h2 className="mx-auto mb-8 max-w-2xl text-3xl font-black uppercase leading-tight tracking-tighter text-charcoal-900 md:text-5xl">
              Ready to start your <span className="text-white">adventure?</span>
            </h2>
            <Link
              href="/self-drive"
              className="group inline-flex items-center gap-3 rounded-2xl bg-charcoal-900 px-10 py-5 text-xs font-black uppercase tracking-widest text-white transition-all hover:scale-105"
            >
              Explore Our Fleet
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  )
}
