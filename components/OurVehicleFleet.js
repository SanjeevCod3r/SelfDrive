'use client'
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

export default function OurVehicleFleet() {
  const { api } = useAuth()
  const [cars, setCars] = useState([])
  const [activeCat, setActiveCat] = useState('All')

  useEffect(() => {
    api('/cars')
      .then(data => setCars(data.cars || []))
      .catch(console.error)
  }, [api])

  // Build category pills from whatever the data actually has.
  const categories = useMemo(() => {
    const set = [...new Set(cars.map(c => c.category || c.type).filter(Boolean))]
    return ['All', ...set]
  }, [cars])

  const filtered = useMemo(() => {
    // Only real cars that actually have an uploaded image.
    const withImages = cars.filter(c => (c.images?.[0] || c.image))
    const list = activeCat === 'All'
      ? withImages
      : withImages.filter(c => (c.category || c.type) === activeCat)
    return list.slice(0, 7) // 3 featured + 4 compact
  }, [cars, activeCat])

  const topRow = filtered.slice(0, 3)
  const bottomRow = filtered.slice(3, 7)

  // Nothing added from the admin panel yet → don't show an empty section.
  const hasCars = cars.some(c => c.images?.[0] || c.image)
  if (!hasCars) return null

  return (
    <section className="relative overflow-hidden bg-white py-24">
      {/* Soft amber glow accent */}
      <div className="pointer-events-none absolute left-1/2 top-0 size-[600px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-brand-500/5 blur-[120px]" />

      <div className="container relative z-10 mx-auto px-6">
        {/* ── Header ── */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-4xl font-black uppercase leading-[0.95] tracking-tighter text-charcoal-900 md:text-6xl">
            Our Vehicle <span className="text-brand-500">Fleet</span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base font-medium leading-relaxed text-zinc-500">
            We provide our customers with the most incredible driving emotions.
            That's why we have only world-class cars in our fleet.
          </p>
        </div>

        {/* ── Category pills ── */}
        <div className="mb-12 flex flex-wrap items-center justify-center gap-3">
          {categories.map(cat => {
            const active = cat === activeCat
            return (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`rounded-full px-6 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all ${
                  active
                    ? 'bg-charcoal-900 text-white shadow-lg shadow-charcoal-900/20'
                    : 'border border-zinc-200 bg-white text-zinc-500 hover:border-brand-500/40 hover:text-brand-500'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>

        {/* ── Featured grid ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCat}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Top row — 3 large */}
            <div className="grid gap-6 md:grid-cols-3">
              {topRow.map((car, i) => (
                <FleetTile key={car.id || car._id || i} car={car} large index={i} />
              ))}
            </div>

            {/* Bottom row — 4 compact */}
            {bottomRow.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {bottomRow.map((car, i) => (
                  <FleetTile key={car.id || car._id || `b${i}`} car={car} index={i + 3} />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Show all ── */}
        <div className="mt-14 flex justify-center">
          <Link
            href="/fleet"
            className="group inline-flex items-center gap-3 rounded-2xl bg-brand-500 px-10 py-5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-600 hover:scale-[1.02]"
          >
            Show All {cars.length > 0 && `(${cars.length} models)`}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function FleetTile({ car, large = false, index = 0 }) {
  if (!car) return null
  const href = `/self-drive/${car._id || car.id}`
  const img = car.images?.[0] || car.image
  if (!img) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
    >
      <Link
        href={href}
        className={`group relative block overflow-hidden rounded-[28px] border border-zinc-200 transition-all duration-500 hover:border-brand-500/40 hover:shadow-[0_24px_60px_-20px_rgba(21,22,27,0.25)] ${
          large ? 'aspect-[4/3]' : 'aspect-[3/2]'
        }`}
      >
        {/* Full-bleed image */}
        <img
          src={img}
          alt={`${car.brand || ''} ${car.name || 'Car'}`}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          draggable={false}
        />

        {/* Subtle gradient so badge + info bar stay legible */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 via-transparent to-charcoal-900/10" />

        {/* Category badge */}
        {(car.category || car.type) && (
          <div className="absolute left-4 top-4 rounded-full bg-charcoal-900/90 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white backdrop-blur-sm">
            {car.category || car.type}
          </div>
        )}

        {/* Bottom info bar — always visible, lifts slightly on hover */}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h4 className="truncate text-sm font-black uppercase tracking-tight text-white">
                {car.brand} {car.name}
              </h4>
              <span className="text-xs font-black text-brand-400">
                ₹{Number(car.pricePerDay || 0).toLocaleString()}
                <span className="font-medium text-white/60">/day</span>
              </span>
            </div>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white transition-transform group-hover:scale-110">
              <ArrowRight className="size-4" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
