'use client'
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, SlidersHorizontal, Car as CarIcon, MapPin, 
  ChevronDown, X, ChevronRight, Fuel, Settings2, Users,
  ArrowRight, Heart, Star, LayoutGrid, ListFilter, Shield, Clock
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import Link from 'next/link'

export default function FleetPage() {
  const { api } = useAuth()
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBrands, setSelectedBrands] = useState([])
  const [selectedTypes, setSelectedTypes] = useState([])
  const [priceRange, setPriceRange] = useState(25000)

  // Accordion State
  const [openFilters, setOpenFilters] = useState(['brand', 'price', 'type'])

  useEffect(() => {
    api('/cars?serviceType=with-driver').then(data => {
      setCars(data.cars)
      setLoading(false)
    }).catch(e => {
      console.error(e)
      setLoading(false)
    })
  }, [api])

  const filterOptions = useMemo(() => {
    const brands = [...new Set(cars.map(c => c.brand))].sort()
    const types = [...new Set(cars.map(c => c.type))].sort()
    const brandCounts = brands.reduce((acc, b) => {
      acc[b] = cars.filter(c => c.brand === b).length
      return acc
    }, {})
    return { brands, types, brandCounts }
  }, [cars])

  const filteredCars = cars.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         c.brand.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(c.brand)
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(c.type)
    const matchesPrice = Number(c.pricePerDay) <= priceRange
    return matchesSearch && matchesBrand && matchesType && matchesPrice
  })

  return (
    <div className="min-h-screen bg-white text-charcoal-900">

      {/* ── CINEMATIC HERO BANNER ── */}
      <section className="relative flex min-h-[88vh] items-center overflow-hidden bg-charcoal-950">
        <img
          src="https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?q=80&w=2400&auto=format&fit=crop"
          alt="Chauffeur fleet"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-950 via-charcoal-950/85 to-charcoal-950/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-transparent to-charcoal-950/60" />
        <div className="pointer-events-none absolute -left-20 top-1/3 size-[500px] rounded-full bg-brand-500/20 blur-[150px]" />

        <div className="container relative z-10 mx-auto px-6 pt-28">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            className="max-w-3xl"
          >
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-2 backdrop-blur-md"
            >
              <Shield className="size-4 fill-brand-500 text-brand-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-400">Professional Chauffeur Service</span>
            </motion.div>

            <motion.h1
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
              className="mb-6 text-5xl font-black uppercase leading-[0.85] tracking-tighter text-white md:text-8xl"
            >
              Premium Fleet <br /><span className="text-brand-500">Experience</span>
            </motion.h1>

            <motion.p
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
              className="mb-10 max-w-xl text-lg font-medium leading-relaxed text-zinc-300"
            >
              Sit back and arrive in style. An elite range of vehicles paired with highly trained professional drivers, ready whenever you are.
            </motion.p>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
              className="flex flex-wrap items-center gap-4"
            >
              <a href="#fleet" className="group inline-flex items-center gap-3 rounded-2xl bg-brand-500 px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-600 hover:scale-105">
                Browse Available Fleet
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </a>
              <Link href="/self-drive" className="inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-xs font-black uppercase tracking-widest text-white backdrop-blur-md transition-all hover:bg-white/10">
                Prefer Self Drive?
              </Link>
            </motion.div>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
              className="mt-14 flex flex-wrap gap-10 border-t border-white/10 pt-8"
            >
              {[['100%', 'Verified Drivers'], ['30+', 'Cities'], ['24/7', 'Concierge']].map(([n, l]) => (
                <div key={l}>
                  <div className="text-3xl font-black tracking-tighter text-white">{n}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{l}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex">
          <div className="h-12 w-px bg-gradient-to-b from-brand-500 to-transparent" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-500/60">Scroll</span>
        </div>
      </section>

      <main id="fleet" className="container mx-auto px-6 pb-32 pt-20 scroll-mt-24">

        {/* ── Quick category chips ── */}
        {filterOptions.types.length > 0 && (
          <div className="mb-10 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setSelectedTypes([])}
              className={`rounded-full px-6 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all ${
                selectedTypes.length === 0
                  ? 'bg-charcoal-900 text-white shadow-lg shadow-charcoal-900/20'
                  : 'border border-zinc-200 bg-white text-zinc-500 hover:border-brand-500/40 hover:text-brand-500'
              }`}
            >
              All Vehicles
            </button>
            {filterOptions.types.map(t => (
              <button
                key={t}
                onClick={() => setSelectedTypes([t])}
                className={`rounded-full px-6 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all ${
                  selectedTypes.includes(t)
                    ? 'bg-charcoal-900 text-white shadow-lg shadow-charcoal-900/20'
                    : 'border border-zinc-200 bg-white text-zinc-500 hover:border-brand-500/40 hover:text-brand-500'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── FILTER SIDEBAR ── */}
          <aside className="w-full lg:w-[300px] shrink-0">
            <div className="bg-white border border-zinc-200 rounded-[28px] overflow-hidden sticky top-28 shadow-[0_10px_40px_-20px_rgba(21,22,27,0.15)]">
              <div className="flex items-center gap-2 border-b border-zinc-100 px-7 py-5">
                <SlidersHorizontal className="size-4 text-brand-500" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-charcoal-900">Filters</span>
              </div>
              <div className="p-7 space-y-7">
                <div className="relative">
                  <Search className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search fleet..."
                    className="w-full pl-11 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-charcoal-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all placeholder:text-zinc-400"
                  />
                </div>

                <FilterAccordion title="Brand" isOpen={openFilters.includes('brand')} onToggle={() => toggleFilter('brand')}>
                  <div className="space-y-2.5 mt-4 max-h-44 overflow-y-auto pr-2 custom-scrollbar">
                    {filterOptions.brands.map(brand => (
                      <label key={brand} className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            className="size-4 rounded border-zinc-300 bg-white accent-brand-500"
                            checked={selectedBrands.includes(brand)}
                            onChange={() => toggleSelection(selectedBrands, setSelectedBrands, brand)}
                          />
                          <span className={`text-[11px] font-bold transition-colors ${selectedBrands.includes(brand) ? 'text-brand-500' : 'text-zinc-500 group-hover:text-charcoal-900'}`}>{brand}</span>
                        </div>
                        <span className="text-[9px] font-black text-zinc-400">{filterOptions.brandCounts[brand]}</span>
                      </label>
                    ))}
                  </div>
                </FilterAccordion>

                <FilterAccordion title="Vehicle Type" isOpen={openFilters.includes('type')} onToggle={() => toggleFilter('type')}>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {filterOptions.types.map(t => (
                      <button
                        key={t}
                        onClick={() => toggleSelection(selectedTypes, setSelectedTypes, t)}
                        className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                          selectedTypes.includes(t)
                            ? 'bg-brand-500 text-white'
                            : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </FilterAccordion>

                <FilterAccordion title="Daily Budget" isOpen={openFilters.includes('price')} onToggle={() => toggleFilter('price')}>
                  <div className="mt-6 px-1">
                    <input
                      type="range" min="1000" max="25000" step="1000"
                      value={priceRange}
                      onChange={e => setPriceRange(Number(e.target.value))}
                      className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-brand-500 mb-4"
                    />
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-zinc-400">₹1,000</span>
                      <span className="text-brand-500">Up to ₹{priceRange.toLocaleString()}</span>
                    </div>
                  </div>
                </FilterAccordion>

                <button
                  onClick={() => { setSelectedBrands([]); setSelectedTypes([]); setPriceRange(25000); setSearchQuery('') }}
                  className="w-full py-3.5 bg-charcoal-900 text-white hover:bg-brand-500 font-black uppercase tracking-widest text-[9px] rounded-xl transition-all active:scale-95"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          </aside>

          {/* ── FLEET GRID ── */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8 pb-5 border-b border-zinc-200">
              <div className="flex items-center gap-3">
                <LayoutGrid className="size-4 text-brand-500" />
                <span className="text-[11px] font-black text-charcoal-900 uppercase tracking-[0.2em]">
                  <span className="text-brand-500">{filteredCars.length}</span> Fleet Options
                </span>
              </div>
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-zinc-100 rounded-[28px] h-[400px] animate-pulse border border-zinc-200" />
                ))}
              </div>
            ) : filteredCars.length > 0 ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCars.map((car, i) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <FleetCard car={car} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-32 text-center border-2 border-dashed border-zinc-200 rounded-[32px] bg-white">
                <CarIcon className="size-10 text-zinc-300 mx-auto mb-4" />
                <h3 className="text-xl font-black text-charcoal-900 uppercase tracking-tight mb-2">No fleet found</h3>
                <p className="text-zinc-500 text-sm font-medium">Try adjusting your filters</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )

  function toggleFilter(section) {
    setOpenFilters(prev => prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section])
  }

  function toggleSelection(list, setList, item) {
    setList(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item])
  }
}

function FilterAccordion({ title, children, isOpen, onToggle }) {
  return (
    <div className="border-b border-zinc-200 pb-6 last:border-0 last:pb-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between group"
      >
        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] group-hover:text-brand-500 transition-colors">{title}</span>
        <ChevronDown className={`size-3 text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-500' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FleetCard({ car }) {
  const id = car.id || car._id
  const specs = [
    { icon: Fuel, label: car.fuel || 'Petrol' },
    { icon: Settings2, label: car.transmission === 'Automatic' ? 'Auto' : 'Manual' },
    { icon: Users, label: `${car.seats || 5} Seats` },
  ]

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-[0_10px_40px_-20px_rgba(21,22,27,0.15)] transition-all duration-500 hover:-translate-y-2 hover:border-brand-500/40 hover:shadow-[0_30px_60px_-25px_rgba(242,106,33,0.3)]">

      {/* Full-bleed image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={car.image || car.images?.[0] || '/assests/bmw_x5_hero.png'}
          alt={car.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          onError={e => { e.target.src = '/assests/bmw_x5_hero.png' }}
        />
        {/* Legibility gradients */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-charcoal-950/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-charcoal-950/40 to-transparent" />

        {/* Chauffeur badge */}
        <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-brand-500 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-brand-500/30">
          <Shield className="size-2.5" /> Chauffeur Included
        </div>
        {/* Type */}
        {car.type && (
          <div className="absolute right-4 top-4 rounded-full bg-charcoal-900/85 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white backdrop-blur-md">
            {car.type}
          </div>
        )}

        {/* Floating price pill */}
        <div className="absolute bottom-4 right-4 flex items-baseline gap-1 rounded-2xl bg-white/95 px-4 py-2 shadow-lg backdrop-blur-md">
          <span className="text-lg font-black tracking-tighter text-charcoal-900">₹{Number(car.pricePerDay).toLocaleString()}</span>
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">/day</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-5">
          <div className="text-[9px] font-black uppercase tracking-widest text-brand-600">{car.brand}</div>
          <h4 className="truncate text-xl font-black uppercase tracking-tight text-charcoal-900 transition-colors group-hover:text-brand-500">
            {car.name}
          </h4>
        </div>

        {/* Spec row */}
        <div className="mb-6 flex items-center justify-between rounded-2xl bg-zinc-50 px-2 py-3">
          {specs.map((s, idx) => (
            <div key={idx} className={`flex flex-1 flex-col items-center gap-1.5 text-zinc-600 ${idx < specs.length - 1 ? 'border-r border-zinc-200' : ''}`}>
              <s.icon className="size-4 text-brand-500" />
              <span className="text-[9px] font-black uppercase tracking-wide">{s.label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-auto flex gap-3">
          <Link
            href={`/fleet/${id}`}
            className="flex-1 rounded-xl border border-zinc-200 py-3.5 text-center text-[10px] font-black uppercase tracking-widest text-charcoal-900 transition-all hover:border-brand-500 hover:text-brand-500"
          >
            Details
          </Link>
          <Link
            href={`/fleet/${id}?book=true`}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-charcoal-900 py-3.5 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-brand-500 active:scale-95"
          >
            Book Now <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
