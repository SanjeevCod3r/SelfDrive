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
    <div className="min-h-screen bg-[#020617] text-white">
      
      {/* ── HERO SECTION WITH BACKGROUND IMAGE ── */}
      <section className="relative pt-48 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop" 
            alt="Fleet Hero" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617]" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
              <Shield className="size-4 text-amber-500 fill-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">Professional Chauffeur Service</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-8">
              PREMIUM FLEET <br />
              <span className="text-amber-500">EXPERIENCE</span>
            </h1>
            <p className="text-slate-300 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
              Arrive in style and comfort with our elite range of vehicles and highly trained professional drivers.
            </p>
            
            <div className="mt-12 flex flex-col items-center gap-4">
              <div className="w-px h-16 bg-gradient-to-b from-amber-500 to-transparent" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-amber-500/50">Browse Available Fleet</span>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="container mx-auto px-6 pb-32">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* ── FILTER SIDEBAR ── */}
          <aside className="w-full lg:w-[280px] shrink-0">
            <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800 rounded-[32px] overflow-hidden sticky top-32 shadow-2xl">
              <div className="p-7 space-y-8">
                <div>
                  <div className="relative">
                    <Search className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search fleet..."
                      className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-700"
                    />
                  </div>
                </div>

                <FilterAccordion title="Brand" isOpen={openFilters.includes('brand')} onToggle={() => toggleFilter('brand')}>
                  <div className="space-y-2 mt-4 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {filterOptions.brands.map(brand => (
                      <label key={brand} className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            className="size-4 rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-amber-500 accent-amber-500"
                            checked={selectedBrands.includes(brand)}
                            onChange={() => toggleSelection(selectedBrands, setSelectedBrands, brand)}
                          />
                          <span className={`text-[11px] font-bold transition-colors ${selectedBrands.includes(brand) ? 'text-amber-500' : 'text-slate-500 group-hover:text-slate-300'}`}>{brand}</span>
                        </div>
                        <span className="text-[9px] font-black text-slate-700">{filterOptions.brandCounts[brand]}</span>
                      </label>
                    ))}
                  </div>
                </FilterAccordion>

                <FilterAccordion title="Daily Budget" isOpen={openFilters.includes('price')} onToggle={() => toggleFilter('price')}>
                  <div className="mt-6 px-1">
                    <input 
                      type="range" min="1000" max="25000" step="1000"
                      value={priceRange}
                      onChange={e => setPriceRange(Number(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 mb-4"
                    />
                    <div className="text-center">
                      <span className="text-[10px] font-black text-amber-500 tracking-widest">₹{priceRange.toLocaleString()} / Day</span>
                    </div>
                  </div>
                </FilterAccordion>

                <button 
                  onClick={() => { setSelectedBrands([]); setSelectedTypes([]); setPriceRange(25000); setSearchQuery('') }}
                  className="w-full py-3.5 bg-white text-slate-950 hover:bg-amber-500 hover:text-white font-black uppercase tracking-widest text-[9px] rounded-xl transition-all active:scale-95 shadow-lg shadow-white/5"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </aside>

          {/* ── FLEET GRID ── */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800/50">
              <div className="flex items-center gap-3">
                <LayoutGrid className="size-4 text-amber-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{filteredCars.length} Fleet Options Available</span>
              </div>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-slate-900/50 rounded-[24px] h-[350px] animate-pulse border border-slate-800" />
                ))}
              </div>
            ) : filteredCars.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCars.map((car, i) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <CompactFleetCard car={car} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-40 text-center">
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">No fleet found</h3>
                <p className="text-slate-500 text-sm">Try adjusting your filters</p>
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
    <div className="border-b border-slate-800/50 pb-6 last:border-0 last:pb-0">
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between group"
      >
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover:text-amber-500 transition-colors">{title}</span>
        <ChevronDown className={`size-3 text-slate-700 transition-transform duration-300 ${isOpen ? 'rotate-180 text-amber-500' : ''}`} />
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

function CompactFleetCard({ car }) {
  return (
    <div className="group bg-slate-900/30 backdrop-blur-md border border-slate-800/50 rounded-[24px] overflow-hidden hover:border-amber-500/30 transition-all duration-500 flex flex-col h-full relative">
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-amber-500 text-[#020617] text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md flex items-center gap-1.5 shadow-lg">
          <Shield className="size-2.5" /> Chauffeur Included
        </div>
      </div>

      <div className="relative aspect-[4/3] overflow-hidden bg-slate-950/50 p-4 flex items-center justify-center">
        <img 
          src={car.image || '/assests/bmw_x5_hero.png'} 
          alt={car.name} 
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
          onError={e => { e.target.src = '/assests/bmw_x5_hero.png' }}
        />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/2 h-2 bg-white/5 blur-lg rounded-full" />
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="mb-4">
          <div className="text-[8px] font-black text-amber-600 uppercase tracking-widest mb-1">{car.brand}</div>
          <h4 className="text-base font-black text-white tracking-tight group-hover:text-amber-500 transition-colors line-clamp-1">
            {car.name}
          </h4>
        </div>

        <div className="flex items-center gap-4 py-3 border-y border-white/5 mb-5 text-slate-500">
          <div className="flex items-center gap-1.5">
            <Fuel className="size-3" />
            <span className="text-[8px] font-bold uppercase">{car.fuel}</span>
          </div>
          <div className="flex items-center gap-1.5 border-x border-white/5 px-4">
            <Settings2 className="size-3" />
            <span className="text-[8px] font-bold uppercase">{car.transmission === 'Automatic' ? 'Auto' : 'Manual'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="size-3" />
            <span className="text-[8px] font-bold uppercase">{car.seats}</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Full Day Rate</span>
            <span className="text-base font-black text-white">₹{Number(car.pricePerDay).toLocaleString()}</span>
          </div>
          <Link 
            href={`/fleet/${car.id || car._id}`}
            className="size-10 bg-white hover:bg-amber-500 text-slate-950 hover:text-white rounded-xl transition-all flex items-center justify-center shadow-lg shadow-white/5 active:scale-90"
          >
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
