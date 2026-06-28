'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { 
  ChevronRight, Star, Fuel, Settings2, Users, 
  ShieldCheck, MapPin, Calendar, Clock, 
  ArrowRight, CheckCircle2, AlertCircle, Info, Zap, Crown
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import Script from 'next/script'

export default function FleetDetailPage({ params }) {
  const { api, user } = useAuth()
  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [months, setMonths] = useState('1')
  const [pickupTime, setPickupTime] = useState('10:00')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [pickup, setPickup] = useState('')
  const [drop, setDrop] = useState('')
  const [distance, setDistance] = useState(0)
  const [distanceLoading, setDistanceLoading] = useState(false)
  const [usePoints, setUsePoints] = useState(false)

  useEffect(() => {
    if (window.google) {
      initMap()
    }
  }, [loading])

  useEffect(() => {
    api(`/cars/${params.id}`).then(data => {
      setCar(data.car)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [params.id, api])

  // Monthly billing — the fleet car's stored price is its monthly price
  const monthsNum = Math.max(1, parseInt(months) || 1)
  const monthlyRate = car ? (Number(car.monthlyPrice) || Number(car.pricePerDay) || 0) : 0
  const baseAmount = monthsNum * monthlyRate
  const pointsDiscount = usePoints ? Math.min(user?.points || 0, baseAmount) : 0
  const premiumDiscount = user?.isPremium ? Math.floor((baseAmount - pointsDiscount) * 0.05) : 0
  const taxableAmount = Math.max(0, baseAmount - premiumDiscount - pointsDiscount)
  const gst = Math.round(taxableAmount * 0.18)
  const finalAmount = Math.max(0, taxableAmount + gst)

  const initMap = () => {
    if (!window.google) return
    const pickupInput = document.getElementById('pickup-input')
    const dropInput = document.getElementById('drop-input')
    
    if (pickupInput && dropInput) {
      const options = { componentRestrictions: { country: "in" } }
      const autocompletePickup = new window.google.maps.places.Autocomplete(pickupInput, options)
      const autocompleteDrop = new window.google.maps.places.Autocomplete(dropInput, options)

      autocompletePickup.addListener('place_changed', () => {
        const place = autocompletePickup.getPlace()
        setPickup(place.formatted_address || place.name)
        calculateDistance()
      })
      autocompleteDrop.addListener('place_changed', () => {
        const place = autocompleteDrop.getPlace()
        setDrop(place.formatted_address || place.name)
        calculateDistance()
      })
    }
  }

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords
        const geocoder = new window.google.maps.Geocoder()
        geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
          if (status === "OK" && results[0]) {
            setPickup(results[0].formatted_address)
            calculateDistance()
          }
        })
      })
    }
  }

  const calculateDistance = () => {
    const pickupVal = document.getElementById('pickup-input').value
    const dropVal = document.getElementById('drop-input').value
    
    if (pickupVal && dropVal && window.google) {
      setDistanceLoading(true)
      const service = new window.google.maps.DistanceMatrixService()
      service.getDistanceMatrix({
        origins: [pickupVal],
        destinations: [dropVal],
        travelMode: 'DRIVING',
      }, (response, status) => {
        setDistanceLoading(false)
        if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
          const distInKm = response.rows[0].elements[0].distance.value / 1000
          setDistance(Math.ceil(distInKm))
        }
      })
    }
  }

  const handleBooking = async () => {
    if (!user) {
      toast.error('Please login to book this car')
      return
    }
    if (!startDate || !pickupTime || !pickup || !drop) {
      toast.error('Please fill start date, pickup time and locations')
      return
    }
    setBookingLoading(true)
    try {
      const res = await api('/bookings/create-order', {
        method: 'POST',
        body: JSON.stringify({
          carId: car.id,
          startDate,
          months: monthsNum,
          pickupTime,
          bookingType: 'with-driver',
          pickupLocation: pickup,
          dropLocation: drop,
          distance,
          usePoints
        })
      })
      
      const options = {
        key: res.key,
        amount: res.amount * 100,
        currency: res.currency,
        name: 'Kashi Ka Fleet',
        description: `Booking for ${car.brand} ${car.name}`,
        order_id: res.orderId,
        handler: async (response) => {
          try {
            await api('/bookings/verify', {
              method: 'POST',
              body: JSON.stringify({
                ...response,
                bookingId: res.bookingId
              })
            })
            toast.success('Monthly booking confirmed!')
            window.location.href = '/dashboard'
          } catch (e) {
            toast.error('Verification failed')
          }
        },
        theme: { color: '#F26A21' }
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <Zap className="size-12 text-brand-500 animate-pulse" />
      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-500">Initializing Fleet</span>
    </div>
  )

  if (!car) return <div className="min-h-screen bg-white text-charcoal-900 flex items-center justify-center">Vehicle Not Found</div>

  const fmtINR = (n) => `₹${(n || 0).toLocaleString('en-IN')}`

  return (
    <div className="min-h-screen bg-white text-charcoal-900 pb-32">

      {/* ── CINEMATIC BANNER ── */}
      <section className="relative flex min-h-[560px] md:min-h-[640px] items-center overflow-hidden bg-charcoal-950">
        {/* Cinematic Background Car Image */}
        <motion.img
          initial={{ scale: 1.12, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.45 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          src="https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?q=80&w=2400&auto=format&fit=crop"
          alt="Luxury chauffeur"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-950 via-charcoal-950/85 to-charcoal-950/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-transparent to-charcoal-950/50" />
        {/* Brand glow */}
        <div className="pointer-events-none absolute -left-20 top-1/3 size-[500px] rounded-full bg-brand-500/20 blur-[150px]" />

        <div className="container mx-auto px-6 lg:px-12 relative z-10 pt-24">
          <div className="max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Back link */}
              <Link href="/fleet" className="group mb-8 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 transition-colors hover:text-white">
                <ChevronRight className="size-4 rotate-180 transition-transform group-hover:-translate-x-1" /> Back to Fleet
              </Link>

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 backdrop-blur-md">
                <Crown className="size-3.5 text-brand-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-400">Monthly Rental Collection</span>
              </div>

              <h1 className="mb-8 text-5xl font-black uppercase leading-[0.85] tracking-tighter text-white md:text-8xl">
                {car.brand} <br />
                <span className="text-brand-500">{car.name}</span>
              </h1>

              <div className="flex flex-wrap items-center gap-6 border-t border-white/10 pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-500/10 border border-brand-500/20">
                    <Crown className="size-5 text-brand-500" />
                  </div>
                  <div>
                    <p className="mb-1 text-[8px] font-black uppercase leading-none tracking-widest text-zinc-400">Plan Type</p>
                    <p className="text-xl font-black uppercase tracking-tight text-white">Monthly Rental</p>
                  </div>
                </div>

                <div className="hidden h-10 w-px bg-white/10 md:block" />

                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-500/10 border border-brand-500/20">
                    <ShieldCheck className="size-5 text-brand-500" />
                  </div>
                  <div>
                    <p className="mb-1 text-[8px] font-black uppercase leading-none tracking-widest text-zinc-400">Billing</p>
                    <p className="text-xl font-black uppercase tracking-tight text-white">Per Month</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main className="container mx-auto px-6 lg:px-12 relative z-20 pb-32 pt-16">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* LEFT COLUMN: Visuals & Details */}
          <div className="flex-1 space-y-16">
            {/* Main Car Visual */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-[21/9] rounded-[32px] overflow-hidden bg-zinc-50 border border-zinc-200 shadow-[0_10px_40px_-15px_rgba(21,22,27,0.12)]"
            >
              <img
                src={car.image || '/assests/bmw_x5_hero.png'}
                alt={car.name}
                className="w-full h-full object-contain"
                onError={e => { e.target.src = '/assests/bmw_x5_hero.png' }}
              />
              <div className="absolute top-8 left-8 bg-charcoal-900/90 backdrop-blur-xl border border-white/10 px-6 py-2 rounded-full flex items-center gap-3">
                <Star className="size-4 text-brand-500 fill-brand-500" />
                <span className="text-xs font-black uppercase tracking-widest text-white">Elite Class Fleet</span>
              </div>
            </motion.div>

            {/* Chauffeur Context */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white border border-zinc-200 p-8 rounded-[28px] flex gap-6 shadow-[0_10px_40px_-15px_rgba(21,22,27,0.12)]">
                 <div className="size-14 rounded-2xl bg-brand-500/10 flex items-center justify-center shrink-0 border border-brand-500/20">
                   <Calendar className="size-7 text-brand-500" />
                 </div>
                 <div>
                   <h4 className="text-lg font-black uppercase tracking-tight mb-2 text-charcoal-900">Flexible Monthly Plans</h4>
                   <p className="text-zinc-600 text-sm leading-relaxed">Book this car for as many months as you need — simple, transparent monthly pricing.</p>
                 </div>
               </div>
               <div className="bg-white border border-zinc-200 p-8 rounded-[28px] flex gap-6 shadow-[0_10px_40px_-15px_rgba(21,22,27,0.12)]">
                 <div className="size-14 rounded-2xl bg-brand-500/10 flex items-center justify-center shrink-0 border border-brand-500/20">
                   <ShieldCheck className="size-7 text-brand-500" />
                 </div>
                 <div>
                   <h4 className="text-lg font-black uppercase tracking-tight mb-2 text-charcoal-900">Maintenance Included</h4>
                   <p className="text-zinc-600 text-sm leading-relaxed">Every monthly rental includes servicing and upkeep, so the car stays in pristine condition.</p>
                 </div>
               </div>
            </div>

            {/* Vehicle Specs */}
            <div className="grid grid-cols-3 gap-4 sm:gap-12 py-10 md:py-12 border-y border-zinc-200">
              <div className="space-y-3">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Powertrain</p>
                <div className="flex items-center gap-3">
                   <Fuel className="size-5 text-brand-500" />
                   <span className="text-sm sm:text-xl font-black uppercase text-charcoal-900 break-words">{car.fuel}</span>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Gearbox</p>
                <div className="flex items-center gap-3">
                   <Settings2 className="size-5 text-brand-500" />
                   <span className="text-sm sm:text-xl font-black uppercase text-charcoal-900 break-words">{car.transmission}</span>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Capacity</p>
                <div className="flex items-center gap-3">
                   <Users className="size-5 text-brand-500" />
                   <span className="text-sm sm:text-xl font-black uppercase text-charcoal-900 break-words">{car.seats} Seats</span>
                </div>
              </div>
            </div>
            
            {/* User Wallet Info */}
            <div className="bg-brand-500/5 border border-brand-500/20 p-8 rounded-[28px] flex items-center justify-between group">
               <div className="flex items-center gap-6">
                  <div className="size-16 rounded-2xl bg-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform">
                     <Zap className="size-8" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-1">Your Rewards Balance</p>
                     <h4 className="text-3xl font-black text-charcoal-900 tracking-tighter uppercase">{fmtINR(user?.points || 0)}</h4>
                  </div>
               </div>
               <div className="text-right hidden md:block">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Membership</p>
                  <p className="text-xs font-black text-charcoal-900 uppercase tracking-widest">
                    {user?.isPremium ? 'Elite Club Member' : 'Standard Member'}
                  </p>
               </div>
            </div>

            <div className="space-y-6">
               <h3 className="text-2xl font-black uppercase tracking-tighter text-charcoal-900">About this Vehicle</h3>
               <p className="text-zinc-600 text-lg leading-relaxed">{car.description}</p>
            </div>
          </div>

          {/* RIGHT COLUMN: Reservation Panel */}
          <div className="w-full lg:w-[420px] shrink-0">
            <div className="bg-white border border-zinc-200 rounded-[32px] p-10 sticky top-32 shadow-[0_10px_40px_-15px_rgba(21,22,27,0.12)]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Monthly Rental Plan</p>
                  <h3 className="text-3xl font-black text-charcoal-900 uppercase tracking-tight">{fmtINR(monthlyRate)}<span className="text-sm text-zinc-500">/mo</span></h3>
                </div>
                <div className="bg-brand-500/10 border border-brand-500/20 px-3 py-1.5 rounded-xl text-brand-600 text-[10px] font-black uppercase tracking-widest">
                  Monthly Plan
                </div>
              </div>

              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Journey Start</label>
                     <div className="relative">
                       <Calendar className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-brand-500 pointer-events-none" />
                       <input
                         type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                         className="w-full bg-white border border-zinc-200 h-14 rounded-2xl pl-12 pr-4 text-xs font-bold text-charcoal-900 focus:border-brand-500 transition-all outline-none"
                       />
                     </div>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Pickup Time</label>
                     <div className="relative">
                       <Clock className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-brand-500 pointer-events-none" />
                       <input
                         type="time" value={pickupTime} onChange={e => setPickupTime(e.target.value)}
                         className="w-full bg-white border border-zinc-200 h-14 rounded-2xl pl-12 pr-4 text-xs font-bold text-charcoal-900 focus:border-brand-500 transition-all outline-none"
                       />
                     </div>
                   </div>
                 </div>

                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Booking Duration (Months)</label>
                   <div className="relative">
                     <Calendar className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-brand-500 pointer-events-none" />
                     <select
                       value={months} onChange={e => setMonths(e.target.value)}
                       className="w-full bg-white border border-zinc-200 h-14 rounded-2xl pl-12 pr-4 text-xs font-bold text-charcoal-900 focus:border-brand-500 transition-all outline-none appearance-none"
                     >
                       {[1,2,3,4,5,6,9,12].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Month' : 'Months'}</option>)}
                     </select>
                   </div>
                 </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Pickup Address</label>
                    <button
                      onClick={useCurrentLocation}
                      className="text-[8px] font-black text-brand-500 uppercase tracking-widest hover:text-brand-600 transition-colors flex items-center gap-1"
                    >
                      <MapPin className="size-2" /> Use Current Location
                    </button>
                  </div>
                  <div className="relative">
                    <MapPin className="size-4 absolute left-5 top-1/2 -translate-y-1/2 text-brand-500" />
                    <input 
                      id="pickup-input"
                      type="text" value={pickup} onChange={e => setPickup(e.target.value)}
                      placeholder="Street, City, Area..."
                      className="w-full pl-12 pr-5 bg-white border border-zinc-200 h-14 rounded-2xl text-xs font-bold text-charcoal-900 placeholder:text-zinc-400 focus:border-brand-500 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Drop-off Destination</label>
                  <div className="relative">
                    <MapPin className="size-4 absolute left-5 top-1/2 -translate-y-1/2 text-brand-500" />
                    <input 
                      id="drop-input"
                      type="text" value={drop} onChange={e => setDrop(e.target.value)}
                      placeholder="Final destination address..."
                      className="w-full pl-12 pr-5 bg-white border border-zinc-200 h-14 rounded-2xl text-xs font-bold text-charcoal-900 placeholder:text-zinc-400 focus:border-brand-500 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Redeem Points */}
                {(user?.points > 0) && (
                    <label className="flex items-center gap-4 bg-brand-500/5 border border-brand-500/20 p-4 rounded-2xl cursor-pointer group hover:bg-brand-500/10 transition-all">
                       <input
                          type="checkbox" checked={usePoints} onChange={e => setUsePoints(e.target.checked)}
                          className="size-5 rounded-lg border-2 border-zinc-200 bg-white text-brand-500 focus:ring-brand-500 accent-brand-500"
                       />
                       <div>
                          <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest leading-none mb-1">Redeem Points</p>
                          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-tight">Apply {user.points} points for a ₹{user.points} discount</p>
                       </div>
                    </label>
                 )}

                <div className="pt-6 space-y-4">

                   {baseAmount > 0 && (
                     <div className="space-y-4 pt-4 border-t border-zinc-200">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                          <span>Base ({monthsNum} {monthsNum === 1 ? 'Month' : 'Months'} × {fmtINR(monthlyRate)})</span>
                          <span className="text-charcoal-900">{fmtINR(baseAmount)}</span>
                        </div>

                        {user?.isPremium && (
                           <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-brand-600">
                              <div className="flex items-center gap-1.5">
                                 <Crown className="size-3 fill-brand-500" /> Premium Member Savings (5%)
                              </div>
                              <span>-{fmtINR(premiumDiscount)}</span>
                           </div>
                         )}

                         {usePoints && pointsDiscount > 0 && (
                           <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-green-600">
                              <span>Reward Points Discount</span>
                              <span>-{fmtINR(pointsDiscount)}</span>
                           </div>
                         )}

                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                          <span>GST (18%)</span>
                          <span className="text-charcoal-900">{fmtINR(gst)}</span>
                        </div>

                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest pt-4 border-t border-zinc-200">
                          <span className="text-zinc-500">Total Amount</span>
                          <span className="text-3xl font-black text-brand-500 tracking-tighter leading-none">{fmtINR(finalAmount)}</span>
                        </div>
                     </div>
                   )}

                   <div className="h-px bg-zinc-200 my-4" />
                   <button
                    onClick={handleBooking}
                    disabled={bookingLoading}
                    className="w-full bg-brand-500 hover:bg-brand-600 h-16 rounded-[24px] text-white font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-brand-500/10 active:scale-95 disabled:opacity-50"
                  >
                    {bookingLoading ? 'Processing...' : 'Confirm Monthly Booking'}
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
