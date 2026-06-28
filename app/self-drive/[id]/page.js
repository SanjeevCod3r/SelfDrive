'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, Fuel, Settings2, Calendar, 
  CheckCircle2, Star, ShieldCheck, Zap,
  ChevronLeft, Tag, CreditCard, Clock, Info, Crown, ArrowRight, Award,
  MapPin, Heart, Share2, Gauge, MoveRight, ChevronRight
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import Link from 'next/link'
import { toast } from 'sonner'

const fmtINR = (n) => `₹${(n || 0).toLocaleString('en-IN')}`

export default function SelfDriveDetail() {
  const { id } = useParams()
  const { api, user, openAuth } = useAuth()
  const router = useRouter()
  
  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [coupon, setCoupon] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [discount, setDiscount] = useState(0)
  const [validating, setValidating] = useState(false)
  const [paying, setPaying] = useState(false)

  const [driverLicense, setDriverLicense] = useState('')
  const [ageVerified, setAgeVerified] = useState(false)
  const [usePoints, setUsePoints] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [pickupLocation, setPickupLocation] = useState('')
  const [dropLocation, setDropLocation] = useState('')

  // New: time, pickup method, PAN upload
  const [pickupTime, setPickupTime] = useState('10:00')
  const [returnTime, setReturnTime] = useState('10:00')
  const [pickupMethod, setPickupMethod] = useState('self') // 'self' = store pickup, 'delivery' = home delivery
  const [panCardImage, setPanCardImage] = useState('')
  const [panUploading, setPanUploading] = useState(false)

  const handlePanUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
    setPanUploading(true)
    try {
      const dataUri = await new Promise((res, rej) => {
        const r = new FileReader()
        r.onload = () => res(r.result)
        r.onerror = rej
        r.readAsDataURL(file)
      })
      const out = await api('/upload', { method: 'POST', body: JSON.stringify({ image: dataUri, folder: 'kashika/pan' }) })
      setPanCardImage(out.url)
      toast.success('PAN card uploaded')
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setPanUploading(false)
    }
  }

  useEffect(() => {
    if (loading) return
    // Attach Google Places autocomplete once the Maps script is ready.
    // The script loads async, so poll until window.google is available.
    if (window.google) {
      initMap()
      return
    }
    const timer = setInterval(() => {
      if (window.google) {
        initMap()
        clearInterval(timer)
      }
    }, 500)
    return () => clearInterval(timer)
  }, [loading])

  useEffect(() => {
    api(`/cars/${id}`).then(data => {
      setCar(data.car)
      setLoading(false)
    }).catch(() => {
      toast.error('Car not found')
      router.push('/self-drive')
    })
  }, [id, api, router])

  const days = startDate && endDate ? Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000)) : 0
  const baseAmount = car ? days * car.pricePerDay : 0
  const premiumDiscount = user?.isPremium ? Math.floor((baseAmount - discount) * 0.05) : 0
  const pointsDiscount = usePoints ? Math.min(user?.points || 0, baseAmount - discount - premiumDiscount) : 0
  const deliveryCharge = pickupMethod === 'delivery' ? 300 : 0
  const securityDeposit = Number(car?.securityDeposit) || 0
  const taxableAmount = Math.max(0, baseAmount - discount - premiumDiscount - pointsDiscount) + deliveryCharge
  const gst = Math.round(taxableAmount * 0.18)
  const finalAmount = Math.max(0, taxableAmount + gst + securityDeposit)

  const initMap = () => {
    if (!window.google) return
    const attach = (id, setter) => {
      const input = document.getElementById(id)
      if (!input) return
      const autocomplete = new window.google.maps.places.Autocomplete(input, {
        componentRestrictions: { country: 'in' },
      })
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        setter(place.formatted_address || place.name)
      })
    }
    attach('pickup-location-input', setPickupLocation)
    attach('drop-location-input', setDropLocation)
  }

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords
        const geocoder = new window.google.maps.Geocoder()
        geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
          if (status === "OK" && results[0]) {
            setPickupLocation(results[0].formatted_address)
          }
        })
      })
    }
  }

  const applyCoupon = async () => {
    if (!coupon) return
    setValidating(true)
    try {
      const data = await api('/coupons/validate', { 
        method: 'POST', 
        body: JSON.stringify({ code: coupon, amount: baseAmount }) 
      })
      setDiscount(data.discount)
      setAppliedCoupon(data.code)
      toast.success(`Coupon applied!`)
    } catch (e) {
      toast.error(e.message)
      setDiscount(0)
      setAppliedCoupon(null)
    } finally { setValidating(false) }
  }

  const handleBook = async () => {
    if (!user) { openAuth('login'); return }
    if (!startDate || !endDate) { toast.error('Select dates'); return }
    if (!pickupTime || !returnTime) { toast.error('Select pickup & return time'); return }
    if (!driverLicense || !ageVerified) { toast.error('Verification required'); return }
    if (!panCardImage) { toast.error('Please upload your PAN card'); return }
    if (!pickupLocation || !dropLocation) { toast.error('Select pickup & drop-off location'); return }

    setPaying(true)
    try {
      const order = await api('/bookings/create-order', {
        method: 'POST',
        body: JSON.stringify({
          carId: car.id, startDate, endDate, couponCode: appliedCoupon,
          bookingType: 'self-drive', driverLicense, ageVerified, usePoints,
          pickupTime, returnTime, pickupMethod,
          pickupLocation, dropLocation,
          deliveryAddress: pickupMethod === 'delivery' ? pickupLocation : null,
          panCardImage,
        }),
      })

      const options = {
        key: order.key,
        amount: order.amount * 100,
        currency: 'INR',
        name: 'Kashi Ka Self Drive',
        description: `Booking: ${car.name}`,
        order_id: order.orderId,
        prefill: { name: user.name, email: user.email, contact: user.phone || '' },
        theme: { color: '#F26A21' },
        handler: async (response) => {
          try {
            await api('/bookings/verify', {
              method: 'POST',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: order.bookingId,
              }),
            })
            toast.success(`Booking confirmed!`)
            router.push('/dashboard')
          } catch (e) { toast.error('Verification failed') }
        },
        modal: { ondismiss: () => setPaying(false) }
      }
      new window.Razorpay(options).open()
    } catch (e) {
      toast.error(e.message)
      setPaying(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="size-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!car) return null

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-white text-charcoal-900">

      {/* ── CINEMATIC BANNER ── */}
      <section className="relative flex min-h-[560px] md:min-h-[640px] items-center overflow-hidden bg-charcoal-950">
        {/* Cinematic Background Car Image */}
        <motion.img
          initial={{ scale: 1.12, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.45 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2400&auto=format&fit=crop"
          alt="Luxury performance"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-950 via-charcoal-950/85 to-charcoal-950/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-transparent to-charcoal-950/50" />
        {/* Amber glow */}
        <div className="pointer-events-none absolute -left-20 top-1/3 size-[500px] rounded-full bg-amber-500/20 blur-[150px]" />

        <div className="container mx-auto px-6 relative z-10 pt-24">
          <div className="max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Back link */}
              <Link href="/self-drive" className="group mb-8 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 transition-colors hover:text-white">
                <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-1" /> Back to Self Drive
              </Link>

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 backdrop-blur-md">
                <Star className="size-3.5 fill-amber-500 text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">Premium Selection</span>
              </div>

              <h1 className="mb-8 text-5xl font-black uppercase leading-[0.85] tracking-tighter text-white md:text-8xl">
                {car.brand} <br />
                <span className="text-amber-500">{car.name}</span>
              </h1>

              <div className="flex flex-wrap items-center gap-6 border-t border-white/10 pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20">
                    <Zap className="size-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="mb-1 text-[8px] font-black uppercase leading-none tracking-widest text-zinc-400">Standard Daily Rate</p>
                    <p className="text-xl font-black uppercase tracking-tight text-white">{fmtINR(car.pricePerDay)}</p>
                  </div>
                </div>

                <div className="hidden h-10 w-px bg-white/10 md:block" />

                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20">
                    <ShieldCheck className="size-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="mb-1 text-[8px] font-black uppercase leading-none tracking-widest text-zinc-400">Insurance Policy</p>
                    <p className="text-xl font-black uppercase tracking-tight text-white">Fully Protected</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main className="container mx-auto px-6 relative z-20 pb-20 pt-16">
        <div className="grid lg:grid-cols-12 gap-16">
          
          {/* LEFT: IMAGE & SPECS */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* Cinematic Image Presentation */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              className="relative aspect-video bg-gradient-to-br from-zinc-100 to-zinc-50 border border-zinc-200 rounded-[32px] overflow-hidden flex items-center justify-center group shadow-[0_10px_40px_-15px_rgba(21,22,27,0.12)]"
            >
              {/* Mesh Gradient Background Effect */}
              <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-700">
                <div className="absolute top-1/4 left-1/4 size-64 bg-amber-500/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 size-64 bg-amber-500/10 blur-[120px] rounded-full" />
              </div>

              {/* Showroom Floor Effect */}
              <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-zinc-200/60 to-transparent opacity-60" />

              <motion.img
                src={car.image}
                alt={car.name}
                className="w-[85%] h-auto object-contain relative z-10 drop-shadow-[0_50px_60px_rgba(21,22,27,0.25)]"
                whileHover={{ scale: 1.05, rotateY: 5, rotateX: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />

              {/* Floating Quality Badge */}
              <div className="absolute bottom-8 left-8 bg-white/80 backdrop-blur-xl border border-zinc-200 px-6 py-3 rounded-2xl flex items-center gap-3 z-20 shadow-[0_10px_40px_-15px_rgba(21,22,27,0.12)]">
                <ShieldCheck className="size-5 text-amber-500" />
                <div>
                   <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Quality Status</p>
                   <p className="text-[10px] font-black text-charcoal-900 uppercase tracking-widest leading-none">Pristine Condition</p>
                </div>
              </div>
            </motion.div>

            {/* User Wallet Info */}
            <div className="bg-amber-500/5 border border-amber-500/20 p-8 rounded-[28px] flex items-center justify-between group">
               <div className="flex items-center gap-6">
                  <div className="size-16 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                     <Award className="size-8" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Your Rewards Balance</p>
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

            {/* Specs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Users, label: 'Capacity', value: `${car.seats} Person` },
                { icon: Fuel, label: 'Fuel', value: car.fuel },
                { icon: Settings2, label: 'Trans', value: car.transmission },
                { icon: Gauge, label: 'Performance', value: 'High' }
              ].map((s, i) => (
                <div key={i} className="bg-white border border-zinc-200 p-6 rounded-3xl text-center shadow-[0_10px_40px_-15px_rgba(21,22,27,0.12)]">
                  <s.icon className="size-5 text-amber-500 mx-auto mb-4" />
                  <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">{s.label}</div>
                  <div className="text-xs font-black uppercase tracking-tight text-charcoal-900">{s.value}</div>
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="space-y-6 pt-6 border-t border-zinc-200">
              <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">Vehicle Highlights</h3>
              <div className="grid grid-cols-2 gap-4">
                {(car.features || ['Premium Audio', 'GPS', 'Bluetooth', 'Reverse Camera']).map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="size-4 text-amber-500" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-zinc-600">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: RESERVATION */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 bg-white border border-zinc-200 rounded-[32px] p-10 shadow-[0_10px_40px_-15px_rgba(21,22,27,0.12)] overflow-hidden">

              <div className="flex items-center justify-between mb-10">
                <h3 className="text-sm font-black uppercase tracking-[0.4em] text-amber-500">Reservation</h3>
                <Heart className="size-5 text-zinc-500 hover:text-red-500 cursor-pointer transition-colors" />
              </div>

              <div className="space-y-8">
                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Pickup Date</label>
                    <input
                      type="date" min={today} value={startDate} onChange={e => setStartDate(e.target.value)}
                      className="w-full h-14 bg-white border border-zinc-200 text-charcoal-900 rounded-2xl px-5 text-xs font-black focus:outline-none focus:border-brand-500 transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Return Date</label>
                    <input
                      type="date" min={startDate || today} value={endDate} onChange={e => setEndDate(e.target.value)}
                      className="w-full h-14 bg-white border border-zinc-200 text-charcoal-900 rounded-2xl px-5 text-xs font-black focus:outline-none focus:border-brand-500 transition-all"
                    />
                  </div>
                </div>

                {/* Times */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Clock className="size-3 text-amber-500" /> Pickup Time</label>
                    <input
                      type="time" value={pickupTime} onChange={e => setPickupTime(e.target.value)}
                      className="w-full h-14 bg-white border border-zinc-200 text-charcoal-900 rounded-2xl px-5 text-xs font-black focus:outline-none focus:border-brand-500 transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Clock className="size-3 text-amber-500" /> Return Time</label>
                    <input
                      type="time" value={returnTime} onChange={e => setReturnTime(e.target.value)}
                      className="w-full h-14 bg-white border border-zinc-200 text-charcoal-900 rounded-2xl px-5 text-xs font-black focus:outline-none focus:border-brand-500 transition-all"
                    />
                  </div>
                </div>

                {/* Pickup method */}
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">How do you want the car?</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button" onClick={() => setPickupMethod('self')}
                      className={`h-16 rounded-2xl border text-left px-4 transition-all ${pickupMethod === 'self' ? 'border-brand-500 bg-amber-500/5 ring-1 ring-brand-500' : 'border-zinc-200 hover:border-zinc-300'}`}
                    >
                      <div className="text-[11px] font-black uppercase tracking-tight text-charcoal-900">Pick up from store</div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-green-600">No extra charge</div>
                    </button>
                    <button
                      type="button" onClick={() => setPickupMethod('delivery')}
                      className={`h-16 rounded-2xl border text-left px-4 transition-all ${pickupMethod === 'delivery' ? 'border-brand-500 bg-amber-500/5 ring-1 ring-brand-500' : 'border-zinc-200 hover:border-zinc-300'}`}
                    >
                      <div className="text-[11px] font-black uppercase tracking-tight text-charcoal-900">Deliver to me</div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-amber-600">+ ₹300 delivery</div>
                    </button>
                  </div>
                </div>

                {/* Pickup Location */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                      {pickupMethod === 'delivery' ? 'Pickup Location (delivery address)' : 'Pickup Location'}
                    </label>
                    <button
                      onClick={useCurrentLocation}
                      className="text-[8px] font-black text-amber-500 uppercase tracking-widest hover:text-brand-600 transition-colors flex items-center gap-1"
                    >
                      <MapPin className="size-2" /> Use Current Location
                    </button>
                  </div>
                  <div className="relative">
                    <MapPin className="size-4 absolute left-5 top-1/2 -translate-y-1/2 text-amber-500" />
                    <input
                      id="pickup-location-input"
                      value={pickupLocation} onChange={e => setPickupLocation(e.target.value)}
                      placeholder="Where you'll collect the car..."
                      className="w-full h-14 bg-white border border-zinc-200 text-charcoal-900 rounded-2xl pl-12 pr-6 text-xs font-black focus:outline-none focus:border-brand-500 transition-all placeholder:text-zinc-400"
                    />
                  </div>
                </div>

                {/* Drop-off Location */}
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Drop-off Location</label>
                  <div className="relative">
                    <MapPin className="size-4 absolute left-5 top-1/2 -translate-y-1/2 text-green-600" />
                    <input
                      id="drop-location-input"
                      value={dropLocation} onChange={e => setDropLocation(e.target.value)}
                      placeholder="Where you'll return the car..."
                      className="w-full h-14 bg-white border border-zinc-200 text-charcoal-900 rounded-2xl pl-12 pr-6 text-xs font-black focus:outline-none focus:border-brand-500 transition-all placeholder:text-zinc-400"
                    />
                  </div>
                </div>

                {/* License */}
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Driver's License</label>
                  <input
                    value={driverLicense} onChange={e => setDriverLicense(e.target.value)}
                    placeholder="DL Number Required"
                    className="w-full h-14 bg-white border border-zinc-200 text-charcoal-900 rounded-2xl px-6 text-xs font-black focus:outline-none focus:border-brand-500 transition-all placeholder:text-zinc-400"
                  />
                </div>

                {/* PAN card upload */}
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">PAN Card</label>
                  <label className={`relative flex h-14 cursor-pointer items-center gap-3 rounded-2xl border px-5 transition-all ${panCardImage ? 'border-green-400 bg-green-50' : 'border-zinc-200 hover:border-brand-500'}`}>
                    {panCardImage ? (
                      <>
                        <img src={panCardImage} alt="PAN" className="size-9 rounded-lg object-cover" />
                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-green-600">
                          <CheckCircle2 className="size-3.5" /> Uploaded — tap to change
                        </span>
                      </>
                    ) : (
                      <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        <CreditCard className="size-4 text-amber-500" /> {panUploading ? 'Uploading…' : 'Upload PAN Card Image'}
                      </span>
                    )}
                    <input type="file" accept="image/*" onChange={handlePanUpload} disabled={panUploading} className="absolute inset-0 cursor-pointer opacity-0" />
                  </label>
                </div>

                <label className="flex items-center gap-4 cursor-pointer group">
                  <input
                    type="checkbox" checked={ageVerified} onChange={e => setAgeVerified(e.target.checked)}
                    className="size-5 rounded-lg border-2 border-zinc-300 bg-transparent text-amber-500 focus:ring-amber-500 accent-amber-500"
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-charcoal-900 transition-colors">I verify I am 21+ years of age</span>
                </label>

                {/* Summary */}
                <AnimatePresence>
                  {days > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      className="pt-8 border-t border-zinc-200 space-y-4"
                    >
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        <span>Base Amount</span>
                        <span className="text-charcoal-900">{fmtINR(baseAmount)}</span>
                      </div>
                      
                      {user?.isPremium && (
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-amber-500">
                           <div className="flex items-center gap-1.5">
                              <Crown className="size-3 fill-amber-500" /> Premium Member Savings (5%)
                           </div>
                           <span>-{fmtINR(premiumDiscount)}</span>
                        </div>
                      )}

                      {usePoints && pointsDiscount > 0 && (
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-green-500">
                           <span>Reward Points Discount</span>
                           <span>-{fmtINR(pointsDiscount)}</span>
                        </div>
                      )}

                      {deliveryCharge > 0 && (
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                          <span>Home Delivery</span>
                          <span className="text-charcoal-900">{fmtINR(deliveryCharge)}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        <span>GST (18%)</span>
                        <span className="text-charcoal-900">{fmtINR(gst)}</span>
                      </div>

                      {securityDeposit > 0 && (
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                          <span className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-amber-500" /> Security Deposit (refundable)</span>
                          <span className="text-charcoal-900">{fmtINR(securityDeposit)}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500 pt-4 border-t border-zinc-200">
                        <span>Grand Total ({days} Days)</span>
                        <span className="text-4xl font-black text-amber-500 tracking-tighter leading-none">{fmtINR(finalAmount)}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button 
                  onClick={handleBook} disabled={paying}
                  className="w-full h-20 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-3xl transition-all text-[12px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 active:scale-95 shadow-xl shadow-amber-500/20"
                >
                  {paying ? 'Processing...' : (
                    <>
                      {days > 0 ? `Confirm Booking` : 'Reserve Now'}
                      <MoveRight className="size-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
