'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, ChevronDown, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'

const CAR_TYPES = ['Sedan', 'SUV', 'Hatchback', 'Luxury', 'Sports', 'MPV']

const SLIDES = [
  {
    src: '/assests/bmw_x6_hero.png',
    // name: 'BMW X5',
    // tag: 'Luxury SUV',
    // price: '₹7,999/day',
  },
  {
    src: '/assests/white_suv.png',
    // name: 'Toyota Highlander',
    // tag: 'Premium SUV',
    // price: '₹4,999/day',
  },
  {
    // src: '/assests/yellow_car_hero.png',
    src: '/assests/white_suv.png',
    // name: 'Audi R8',
    // tag: 'Sports Car',
    // price: '₹14,999/day',

    src: '/assests/bmw_x6_hero.png',
    // name: 'Audi R8',
    // tag: 'Sports Car',
    // price: '₹14,999/day',
  },
]

export default function Hero() {
  const router = useRouter()
  const locationRef = useRef(null)
  const pickupRef = useRef(null)
  const carTypeRef = useRef(null)

  const [carType, setCarType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showCarType, setShowCarType] = useState(false)
  const [current, setCurrent] = useState(0)

  // Auto-advance slides every 3.5 s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % SLIDES.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [])

  const initAutocomplete = () => {
    if (!window.google) return
    const indiaOpts = { componentRestrictions: { country: 'in' } }

    if (locationRef.current) {
      const ac1 = new window.google.maps.places.Autocomplete(locationRef.current, {
        ...indiaOpts,
        types: ['(cities)'],
      })
      ac1.addListener('place_changed', () => {
        locationRef.current.value = ac1.getPlace().name || locationRef.current.value
      })
    }

    if (pickupRef.current) {
      const ac2 = new window.google.maps.places.Autocomplete(pickupRef.current, indiaOpts)
      ac2.addListener('place_changed', () => {
        pickupRef.current.value =
          ac2.getPlace().formatted_address || ac2.getPlace().name || pickupRef.current.value
      })
    }
  }

  // Close Car Type dropdown on outside click
  useEffect(() => {
    const handler = e => {
      if (carTypeRef.current && !carTypeRef.current.contains(e.target)) setShowCarType(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (locationRef.current?.value) params.set('location', locationRef.current.value)
    if (pickupRef.current?.value) params.set('pickup', pickupRef.current.value)
    if (carType) params.set('type', carType)
    if (startDate) params.set('start', startDate)
    if (endDate) params.set('end', endDate)
    router.push(`/self-drive?${params.toString()}`)
  }

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    // Try to init immediately if script is already loaded
    if (window.google) {
      initAutocomplete()
    } else {
      // Otherwise wait for it
      const timer = setInterval(() => {
        if (window.google) {
          initAutocomplete()
          clearInterval(timer)
        }
      }, 500)
      return () => clearInterval(timer)
    }
  }, [])

  return (
    <>
      <section className="relative overflow-hidden bg-white min-h-[88vh] flex items-center">
        {/* Amber diagonal — right half (animated reveal) */}
        <motion.div
          initial={{ x: '60%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="absolute top-0 right-0 w-[50%] h-full bg-amber-500 clip-diagonal hidden lg:block z-0"
        />

        {/* Soft floating glow accents */}
        <motion.div
          animate={{ y: [0, -30, 0], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute top-20 right-[15%] hidden size-72 rounded-full bg-amber-300/30 blur-[100px] lg:block"
        />

        <div className="container mx-auto px-4 lg:px-10 relative z-10 pt-24 pb-16">
          <div className="grid lg:grid-cols-2 gap-0 items-center min-h-[70vh]">

            {/* ── LEFT: headline + form ── */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="relative z-10 flex flex-col justify-center"
            >
              <motion.h1
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
                }}
                className="text-[2rem] sm:text-5xl md:text-6xl lg:text-[72px] font-black text-slate-900 leading-[1.05] mb-5 uppercase tracking-tight"
              >
                {['Unlock Your', 'line2', 'Your Dreams'].map((line, idx) => (
                  <motion.span
                    key={idx}
                    variants={{
                      hidden: { opacity: 0, y: 24 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
                    }}
                    className="block"
                  >
                    {line === 'line2'
                      ? <><span className="text-amber-500">Adventure,</span> Drive</>
                      : line}
                  </motion.span>
                ))}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.6 }}
                className="text-slate-500 text-base font-medium leading-relaxed mb-10 max-w-[440px]"
              >
                Premium self-drive & chauffeured rentals across India. Your journey, your rules.
              </motion.p>

              {/* ── Search Card (Original Light Theme) ── */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.7 }}
                className="bg-white rounded-[20px] shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-slate-100 overflow-visible max-w-[620px]"
              >
                {/* Row 1 — Location | Pick Up | Car Type */}
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                  {/* Location */}
                  <div className="px-5 py-4">
                    <label className="block text-[11px] font-black text-slate-800 uppercase tracking-wider mb-1.5">
                      Location
                    </label>
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-amber-500 flex-shrink-0" />
                      <input
                        ref={locationRef}
                        type="text"
                        placeholder="Select Your City"
                        className="w-full text-sm text-slate-600 placeholder-slate-400 bg-transparent border-none outline-none font-medium"
                      />
                    </div>
                  </div>

                  {/* Pick Up */}
                  <div className="px-5 py-4">
                    <label className="block text-[11px] font-black text-slate-800 uppercase tracking-wider mb-1.5">
                      Pick Up
                    </label>
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-amber-500 flex-shrink-0" />
                      <input
                        ref={pickupRef}
                        type="text"
                        placeholder="Select Your City"
                        className="w-full text-sm text-slate-600 placeholder-slate-400 bg-transparent border-none outline-none font-medium"
                      />
                    </div>
                  </div>

                  {/* Car Type */}
                  <div className="px-5 py-4 relative" ref={carTypeRef}>
                    <label className="block text-[11px] font-black text-slate-800 uppercase tracking-wider mb-1.5">
                      Car Type
                    </label>
                    <button
                      onClick={() => setShowCarType(!showCarType)}
                      className="w-full flex items-center justify-between text-sm font-medium"
                    >
                      <span className={carType ? 'text-slate-800 font-semibold' : 'text-slate-400'}>
                        {carType || 'Choose Car Type'}
                      </span>
                      <ChevronDown className={`size-4 text-slate-400 transition-transform duration-200 ${showCarType ? 'rotate-180' : ''}`} />
                    </button>
                    {showCarType && (
                      <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden py-1">
                        {CAR_TYPES.map(t => (
                          <button
                            key={t}
                            onClick={() => { setCarType(t); setShowCarType(false) }}
                            className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${carType === t ? 'text-amber-600 bg-amber-50' : 'text-slate-700 hover:bg-slate-50'}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-slate-100 mx-5" />

                {/* Row 2 — Date range + Search button */}
                <div className="flex flex-col sm:flex-row sm:items-center px-5 py-4 gap-4">
                  <div className="flex-1 min-w-0">
                    <label className="block text-[11px] font-black text-slate-800 uppercase tracking-wider mb-1.5">
                      Date
                    </label>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Calendar className="size-4 text-amber-500 flex-shrink-0" />
                        <input
                          type="date"
                          min={today}
                          value={startDate}
                          onChange={e => setStartDate(e.target.value)}
                          className="text-sm text-slate-600 bg-transparent border-none outline-none font-medium w-full min-w-0"
                        />
                      </div>
                      <span className="text-slate-300 font-light select-none">—</span>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Calendar className="size-4 text-amber-500 flex-shrink-0" />
                        <input
                          type="date"
                          min={startDate || today}
                          value={endDate}
                          onChange={e => setEndDate(e.target.value)}
                          className="text-sm text-slate-600 bg-transparent border-none outline-none font-medium w-full min-w-0"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSearch}
                    className="flex-shrink-0 h-12 w-full sm:w-12 rounded-xl bg-amber-500 hover:bg-amber-600 flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/30 hover:scale-105"
                  >
                    <Search className="size-5 text-white" />
                    <span className="sm:hidden text-white font-black uppercase tracking-widest text-xs">Search</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>

            {/* ── RIGHT: Auto-sliding car image ── */}
            <div className="hidden lg:flex items-center justify-center relative select-none">

              {/* Slide container — gentle continuous float */}
              <motion.div
                animate={{ y: [0, -16, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative w-full max-w-[580px] aspect-square"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current}
                    initial={{ opacity: 0, x: 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -60 }}
                    transition={{ duration: 0.55, ease: 'easeInOut' }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <img
                      src={SLIDES[current].src}
                      alt={SLIDES[current].name}
                      className="w-full h-full object-contain mix-blend-multiply"
                      style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.15))' }}
                      draggable={false}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Soft shadow that anchors the floating car */}
                <motion.div
                  animate={{ scaleX: [1, 0.88, 1], opacity: [0.25, 0.15, 0.25] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute bottom-4 left-1/2 h-4 w-2/3 -translate-x-1/2 rounded-[100%] bg-charcoal-900/25 blur-xl"
                />
              </motion.div>

              {/* Slide indicators */}
              <div className="absolute bottom-2 right-6 z-20 flex gap-2">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      i === current ? 'w-7 bg-amber-500' : 'w-2.5 bg-amber-300/60 hover:bg-amber-400'
                    }`}
                  />
                ))}
              </div>

              {/* Dot indicators */}
              {/* <div className="absolute bottom-2 right-6 flex gap-2 z-20">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`transition-all duration-300 rounded-full ${
                      i === current
                        ? 'bg-amber-500 w-6 h-2.5'
                        : 'bg-amber-300/60 w-2.5 h-2.5 hover:bg-amber-400'
                    }`}
                  />
                ))}
              </div> */}
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
