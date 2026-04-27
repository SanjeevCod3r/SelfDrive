'use client'
import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  Car, MapPin, Calendar, Fuel, Users, Settings as Cog, Star, Gift, Crown, BookOpen,
  LogOut, User as UserIcon, Plus, Edit, Trash2, ShieldCheck, Tag, Search, ArrowRight,
  CheckCircle2, Sparkles, Zap, Clock, IndianRupee, ChevronRight, Menu,
} from 'lucide-react'

// ====== API helpers ======
const api = async (path, opts = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('kasika_token') : null
  const res = await fetch(`/api${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

const fmtINR = (n) => `\u20B9${(n || 0).toLocaleString('en-IN')}`

// ====== Main App ======
function App() {
  const [view, setView] = useState('home')
  const [user, setUser] = useState(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [cars, setCars] = useState([])
  const [selectedCar, setSelectedCar] = useState(null)
  const [blogs, setBlogs] = useState([])
  const [selectedBlog, setSelectedBlog] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem('kasika_token')
    if (!token) return
    try {
      const { user } = await api('/auth/me')
      setUser(user)
    } catch {
      localStorage.removeItem('kasika_token')
    }
  }, [])

  const loadCars = useCallback(async () => {
    try {
      const { cars } = await api('/cars')
      setCars(cars)
    } catch (e) { /* ignore */ }
  }, [])

  const loadBlogs = useCallback(async () => {
    try {
      const { blogs } = await api('/blogs')
      setBlogs(blogs)
    } catch {}
  }, [])

  const loadMyBookings = useCallback(async () => {
    if (!user) return
    try {
      const { bookings } = await api('/bookings/me')
      setBookings(bookings)
    } catch {}
  }, [user])

  useEffect(() => {
    loadMe()
    loadCars()
    loadBlogs()
  }, [loadMe, loadCars, loadBlogs])

  useEffect(() => { loadMyBookings() }, [loadMyBookings])

  const logout = () => {
    localStorage.removeItem('kasika_token')
    setUser(null)
    setView('home')
    toast.success('Logged out')
  }

  const goView = (v) => { setView(v); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  const requireLogin = () => {
    if (!user) {
      setAuthMode('login')
      setAuthOpen(true)
      return false
    }
    return true
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <Header user={user} view={view} goView={goView} logout={logout} onAuth={() => { setAuthMode('login'); setAuthOpen(true) }} />

      {view === 'home' && <Home cars={cars} onSeeAll={() => goView('cars')} onSelectCar={(c) => { setSelectedCar(c); goView('car-detail') }} onAuth={() => { setAuthMode('signup'); setAuthOpen(true) }} />}
      {view === 'cars' && <CarsList cars={cars} onSelect={(c) => { setSelectedCar(c); goView('car-detail') }} />}
      {view === 'car-detail' && selectedCar && <CarDetail car={selectedCar} user={user} requireLogin={requireLogin} onBooked={() => { loadMyBookings(); loadMe(); goView('dashboard') }} />}
      {view === 'dashboard' && (user ? <Dashboard user={user} bookings={bookings} reload={() => { loadMe(); loadMyBookings() }} goView={goView} /> : <NeedLogin onAuth={() => { setAuthMode('login'); setAuthOpen(true) }} />)}
      {view === 'admin' && (user?.isAdmin ? <AdminPanel reloadCars={loadCars} reloadBlogs={loadBlogs} /> : <div className="container py-20 text-center text-muted-foreground">Admin only</div>)}
      {view === 'blogs' && <BlogList blogs={blogs} onSelect={(b) => { setSelectedBlog(b); goView('blog-detail') }} />}
      {view === 'blog-detail' && selectedBlog && <BlogDetail blog={selectedBlog} onBack={() => goView('blogs')} />}
      {view === 'subscriptions' && <Subscriptions user={user} requireLogin={requireLogin} reload={loadMe} />}

      <Footer goView={goView} />

      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} mode={authMode} setMode={setAuthMode} onSuccess={(u) => { setUser(u); setAuthOpen(false); toast.success(`Welcome, ${u.name}!`) }} />
    </div>
  )
}

// ====== Header ======
function Header({ user, view, goView, logout, onAuth }) {
  const [open, setOpen] = useState(false)
  const link = (id, label) => (
    <button onClick={() => { goView(id); setOpen(false) }} className={`px-3 py-2 rounded-md text-sm font-medium transition ${view === id ? 'text-amber-400' : 'text-slate-300 hover:text-white'}`}>{label}</button>
  )
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/70 border-b border-slate-800">
      <div className="container flex items-center justify-between h-16">
        <button onClick={() => goView('home')} className="flex items-center gap-2 group">
          <div className="size-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 grid place-items-center shadow-lg shadow-orange-500/20"><Car className="size-5 text-slate-900" /></div>
          <span className="text-xl font-bold tracking-tight">Kasika<span className="text-amber-400">.</span></span>
        </button>
        <nav className="hidden md:flex items-center gap-1">
          {link('home', 'Home')}
          {link('cars', 'Cars')}
          {link('subscriptions', 'Premium')}
          {link('blogs', 'Blog')}
          {user && link('dashboard', 'Dashboard')}
          {user?.isAdmin && link('admin', 'Admin')}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              {user.isPremium && <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 hidden sm:inline-flex"><Crown className="size-3 mr-1" />Premium</Badge>}
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-300"><Gift className="size-4 text-amber-400" />{user.rewardPoints || 0} pts</div>
              <Button size="sm" variant="ghost" onClick={logout} className="text-slate-300"><LogOut className="size-4" /></Button>
            </div>
          ) : (
            <Button size="sm" onClick={onAuth} className="bg-amber-400 text-slate-900 hover:bg-amber-300">Sign in</Button>
          )}
          <Button size="sm" variant="ghost" className="md:hidden" onClick={() => setOpen(!open)}><Menu className="size-5" /></Button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-slate-800 px-4 py-2 flex flex-col">
          {link('home', 'Home')}
          {link('cars', 'Cars')}
          {link('subscriptions', 'Premium')}
          {link('blogs', 'Blog')}
          {user && link('dashboard', 'Dashboard')}
          {user?.isAdmin && link('admin', 'Admin')}
        </div>
      )}
    </header>
  )
}

// ====== Home ======
function Home({ cars, onSeeAll, onSelectCar, onAuth }) {
  const featured = cars.slice(0, 6)
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1541807360746-039080941306" alt="Hero" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/30" />
        </div>
        <div className="relative container py-24 md:py-36">
          <Badge className="bg-amber-400/10 text-amber-300 border border-amber-400/30 mb-6"><Sparkles className="size-3 mr-1" />India&apos;s premium self-drive rental</Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-3xl leading-[1.05]">
            Your road, your <span className="bg-gradient-to-r from-amber-300 to-orange-500 bg-clip-text text-transparent">rules</span>.
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-8">
            Hand-picked premium cars, transparent pricing, and reward points on every drive. Pick your dates, hit the road.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" onClick={onSeeAll} className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-900 font-semibold">
              Browse cars <ArrowRight className="size-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" onClick={onAuth} className="border-slate-700 hover:bg-slate-800">
              Create account
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-12 max-w-2xl">
            {[{ k: '500+', v: 'Premium Cars' }, { k: '15+', v: 'Cities' }, { k: '50K+', v: 'Happy Drivers' }].map((s) => (
              <div key={s.v} className="border-l-2 border-amber-400/50 pl-4">
                <div className="text-2xl md:text-3xl font-bold">{s.k}</div>
                <div className="text-sm text-slate-400">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured cars */}
      <section className="container py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured rides</h2>
            <p className="text-slate-400">Top-rated cars ready to roll out today</p>
          </div>
          <Button variant="ghost" onClick={onSeeAll} className="text-amber-400 hover:text-amber-300">See all <ChevronRight className="size-4" /></Button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((c) => <CarCard key={c.id} car={c} onSelect={() => onSelectCar(c)} />)}
        </div>
      </section>

      {/* How it works */}
      <section className="container py-20">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { i: Search, t: 'Pick your car', d: 'Browse premium hatchbacks, sedans, SUVs and luxury cars.' },
            { i: Calendar, t: 'Choose dates', d: 'Flexible hourly to monthly rentals with instant confirmation.' },
            { i: Zap, t: 'Drive away', d: 'Pay securely, earn rewards, hit the road.' },
          ].map((s, i) => (
            <Card key={i} className="bg-slate-900/60 border-slate-800">
              <CardHeader>
                <div className="size-12 rounded-lg bg-amber-400/10 grid place-items-center mb-3"><s.i className="size-6 text-amber-400" /></div>
                <CardTitle>{s.t}</CardTitle>
                <CardDescription className="text-slate-400">{s.d}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Rewards CTA */}
      <section className="container py-20">
        <div className="rounded-3xl bg-gradient-to-br from-amber-400/15 via-orange-500/10 to-slate-900 border border-amber-400/20 p-10 md:p-16 text-center">
          <Crown className="size-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Earn rewards on every drive</h2>
          <p className="text-slate-300 max-w-2xl mx-auto mb-6">For every &#8377;1,000 you spend, earn 10 reward points. Unlock Premium status with 3+ bookings or our subscription plans.</p>
          <Button size="lg" onClick={onAuth} className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-semibold">Join free <ArrowRight className="size-4 ml-2" /></Button>
        </div>
      </section>
    </main>
  )
}

// ====== Car Card ======
function CarCard({ car, onSelect }) {
  return (
    <Card className="overflow-hidden bg-slate-900/60 border-slate-800 hover:border-amber-400/50 transition group cursor-pointer" onClick={onSelect}>
      <div className="aspect-[16/10] overflow-hidden bg-slate-800">
        <img src={car.image} alt={car.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
      </div>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="border-slate-700 text-slate-300">{car.type}</Badge>
          <div className="flex items-center gap-1 text-xs text-slate-400"><MapPin className="size-3" />{car.location}</div>
        </div>
        <h3 className="text-lg font-semibold mb-1">{car.name}</h3>
        <p className="text-sm text-slate-400 mb-4">{car.brand}</p>
        <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
          <span className="flex items-center gap-1"><Users className="size-3" />{car.seats}</span>
          <span className="flex items-center gap-1"><Cog className="size-3" />{car.transmission}</span>
          <span className="flex items-center gap-1"><Fuel className="size-3" />{car.fuel}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold">{fmtINR(car.pricePerDay)}</span>
            <span className="text-xs text-slate-400">/day</span>
          </div>
          <Button size="sm" className="bg-amber-400 text-slate-900 hover:bg-amber-300">Book <ArrowRight className="size-3 ml-1" /></Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ====== Cars List ======
function CarsList({ cars, onSelect }) {
  const [q, setQ] = useState('')
  const [type, setType] = useState('all')
  const filtered = cars.filter(c =>
    (type === 'all' || c.type === type) &&
    (q === '' || `${c.name} ${c.brand} ${c.location}`.toLowerCase().includes(q.toLowerCase()))
  )
  const types = ['all', ...new Set(cars.map(c => c.type))]
  return (
    <main className="container py-12">
      <h1 className="text-4xl font-bold mb-2">Browse cars</h1>
      <p className="text-slate-400 mb-8">{filtered.length} cars available</p>
      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, brand, city..." className="pl-9 bg-slate-900 border-slate-800" />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="md:w-48 bg-slate-900 border-slate-800"><SelectValue /></SelectTrigger>
          <SelectContent>{types.map(t => <SelectItem key={t} value={t}>{t === 'all' ? 'All types' : t}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(c => <CarCard key={c.id} car={c} onSelect={() => onSelect(c)} />)}
      </div>
      {filtered.length === 0 && <div className="text-center py-20 text-slate-400">No cars match your search.</div>}
    </main>
  )
}

// ====== Car Detail / Booking ======
function CarDetail({ car, user, requireLogin, onBooked }) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [coupon, setCoupon] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [discount, setDiscount] = useState(0)
  const [validating, setValidating] = useState(false)
  const [paying, setPaying] = useState(false)

  const days = startDate && endDate ? Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000)) : 0
  const baseAmount = days * car.pricePerDay
  const premiumDiscount = user?.isPremium ? Math.floor((baseAmount - discount) * 0.05) : 0
  const finalAmount = Math.max(0, baseAmount - discount - premiumDiscount)

  const applyCoupon = async () => {
    if (!coupon) return
    setValidating(true)
    try {
      const { discount: d, code } = await api('/coupons/validate', { method: 'POST', body: JSON.stringify({ code: coupon, amount: baseAmount }) })
      setDiscount(d)
      setAppliedCoupon(code)
      toast.success(`Coupon ${code} applied! Saved ${fmtINR(d)}`)
    } catch (e) {
      toast.error(e.message)
      setDiscount(0)
      setAppliedCoupon(null)
    } finally { setValidating(false) }
  }

  const handleBook = async () => {
    if (!requireLogin()) return
    if (!startDate || !endDate) { toast.error('Pick rental dates'); return }
    if (new Date(endDate) <= new Date(startDate)) { toast.error('End date must be after start date'); return }
    setPaying(true)
    try {
      const order = await api('/bookings/create-order', {
        method: 'POST',
        body: JSON.stringify({ carId: car.id, startDate, endDate, couponCode: appliedCoupon }),
      })
      const rzp = new window.Razorpay({
        key: order.key,
        amount: order.amount * 100,
        currency: 'INR',
        name: 'Kasika Self Drive',
        description: `Booking: ${car.name}`,
        order_id: order.orderId,
        prefill: { name: user.name, email: user.email, contact: user.phone || '' },
        theme: { color: '#fbbf24' },
        handler: async (resp) => {
          try {
            const v = await api('/bookings/verify', {
              method: 'POST',
              body: JSON.stringify({
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_signature: resp.razorpay_signature,
                bookingId: order.bookingId,
              }),
            })
            toast.success(`Booking confirmed! +${v.pointsEarned} reward points`)
            onBooked()
          } catch (e) { toast.error(e.message) }
        },
        modal: { ondismiss: () => setPaying(false) },
      })
      rzp.open()
    } catch (e) {
      toast.error(e.message)
    } finally { setPaying(false) }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <main className="container py-12">
      <div className="grid lg:grid-cols-2 gap-10">
        <div>
          <div className="rounded-2xl overflow-hidden bg-slate-900 mb-4">
            <img src={car.image} alt={car.name} className="w-full aspect-[16/10] object-cover" />
          </div>
          <h1 className="text-3xl font-bold mb-1">{car.name}</h1>
          <p className="text-slate-400 mb-4">{car.brand} &middot; {car.type} &middot; <span className="inline-flex items-center gap-1"><MapPin className="size-3" />{car.location}</span></p>
          <p className="text-slate-300 mb-6">{car.description}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <Spec icon={Users} label="Seats" value={car.seats} />
            <Spec icon={Cog} label="Transmission" value={car.transmission} />
            <Spec icon={Fuel} label="Fuel" value={car.fuel} />
            <Spec icon={Star} label="Rating" value="4.8" />
          </div>
          {car.features?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Features</h3>
              <div className="flex flex-wrap gap-2">
                {car.features.map(f => <Badge key={f} variant="outline" className="border-slate-700 text-slate-300"><CheckCircle2 className="size-3 mr-1 text-amber-400" />{f}</Badge>)}
              </div>
            </div>
          )}
        </div>

        <Card className="bg-slate-900/60 border-slate-800 h-fit sticky top-20">
          <CardHeader>
            <CardTitle className="flex items-baseline justify-between">
              <span>{fmtINR(car.pricePerDay)}<span className="text-sm font-normal text-slate-400">/day</span></span>
              <Badge className="bg-amber-400/15 text-amber-300 border border-amber-400/30">Available</Badge>
            </CardTitle>
            <CardDescription>Pick your rental dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start date</Label>
                <Input type="date" min={today} value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-slate-950 border-slate-800" />
              </div>
              <div>
                <Label>End date</Label>
                <Input type="date" min={startDate || today} value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-slate-950 border-slate-800" />
              </div>
            </div>
            <div>
              <Label>Coupon code</Label>
              <div className="flex gap-2">
                <Input value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())} placeholder="e.g. WELCOME10" className="bg-slate-950 border-slate-800" />
                <Button onClick={applyCoupon} disabled={validating || !coupon || !days} variant="outline" className="border-slate-700">Apply</Button>
              </div>
              <p className="text-xs text-slate-500 mt-1">Try WELCOME10, FLAT500, KASIKA20</p>
            </div>
            {days > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800 text-sm">
                <Row k={`${fmtINR(car.pricePerDay)} \u00D7 ${days} days`} v={fmtINR(baseAmount)} />
                {discount > 0 && <Row k={`Coupon ${appliedCoupon}`} v={`- ${fmtINR(discount)}`} cls="text-green-400" />}
                {premiumDiscount > 0 && <Row k="Premium 5% off" v={`- ${fmtINR(premiumDiscount)}`} cls="text-amber-400" />}
                <Separator className="bg-slate-800" />
                <Row k={<span className="font-semibold">Total</span>} v={<span className="text-xl font-bold">{fmtINR(finalAmount)}</span>} />
              </div>
            )}
            <Button onClick={handleBook} disabled={paying || !days} className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-semibold">
              {paying ? 'Processing...' : days > 0 ? `Pay ${fmtINR(finalAmount)} & book` : 'Select dates'}
            </Button>
            <p className="text-xs text-slate-500 text-center">Secured by Razorpay &middot; Earn {Math.floor(finalAmount / 1000) * 10} reward points</p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

const Spec = ({ icon: Icon, label, value }) => (
  <div className="rounded-lg bg-slate-900/60 border border-slate-800 p-3">
    <Icon className="size-4 text-amber-400 mb-2" />
    <div className="text-xs text-slate-400">{label}</div>
    <div className="font-semibold text-sm">{value}</div>
  </div>
)
const Row = ({ k, v, cls = '' }) => (
  <div className={`flex items-center justify-between ${cls}`}><span className="text-slate-400">{k}</span><span>{v}</span></div>
)

// ====== Auth Dialog ======
function AuthDialog({ open, onClose, mode, setMode, onSuccess }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setBusy(true)
    try {
      const body = mode === 'signup' ? { name, email, password, phone } : { email, password }
      const { token, user } = await api(`/auth/${mode}`, { method: 'POST', body: JSON.stringify(body) })
      localStorage.setItem('kasika_token', token)
      onSuccess(user)
    } catch (e) {
      toast.error(e.message)
    } finally { setBusy(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</DialogTitle>
          <DialogDescription className="text-slate-400">{mode === 'signup' ? 'Join Kasika and earn rewards on your first drive.' : 'Sign in to book and manage rentals.'}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {mode === 'signup' && (<>
            <div><Label>Full name</Label><Input value={name} onChange={e => setName(e.target.value)} className="bg-slate-950 border-slate-800" /></div>
            <div><Label>Phone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} className="bg-slate-950 border-slate-800" /></div>
          </>)}
          <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-slate-950 border-slate-800" /></div>
          <div><Label>Password</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} className="bg-slate-950 border-slate-800" /></div>
          <p className="text-xs text-slate-500">Demo admin: admin@kasika.com / admin123</p>
        </div>
        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button onClick={submit} disabled={busy} className="w-full bg-amber-400 text-slate-900 hover:bg-amber-300">{busy ? '...' : (mode === 'signup' ? 'Create account' : 'Sign in')}</Button>
          <button onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')} className="text-sm text-slate-400 hover:text-white">
            {mode === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const NeedLogin = ({ onAuth }) => (
  <div className="container py-32 text-center">
    <UserIcon className="size-12 mx-auto mb-4 text-slate-500" />
    <h2 className="text-2xl font-bold mb-2">Sign in required</h2>
    <p className="text-slate-400 mb-6">Sign in to view your dashboard.</p>
    <Button onClick={onAuth} className="bg-amber-400 text-slate-900 hover:bg-amber-300">Sign in</Button>
  </div>
)

// ====== Dashboard ======
function Dashboard({ user, bookings, reload, goView }) {
  const confirmed = bookings.filter(b => b.status === 'confirmed' && b.type !== 'subscription')
  const carBookings = bookings.filter(b => b.type !== 'subscription')
  return (
    <main className="container py-12">
      <h1 className="text-3xl font-bold mb-1">Hello, {user.name}</h1>
      <p className="text-slate-400 mb-8">Manage your bookings, rewards and profile</p>
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        <StatCard icon={BookOpen} label="Total bookings" value={confirmed.length} />
        <StatCard icon={Gift} label="Reward points" value={user.rewardPoints || 0} accent />
        <StatCard icon={Crown} label="Status" value={user.isPremium ? 'Premium' : 'Standard'} />
      </div>
      <Tabs defaultValue="bookings">
        <TabsList className="bg-slate-900 border border-slate-800">
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="bookings" className="mt-6">
          {carBookings.length === 0 ? (
            <Card className="bg-slate-900/60 border-slate-800"><CardContent className="py-12 text-center text-slate-400">No bookings yet. <button onClick={() => goView('cars')} className="text-amber-400 underline">Browse cars</button></CardContent></Card>
          ) : (
            <div className="space-y-3">{carBookings.map(b => <BookingRow key={b.id} b={b} />)}</div>
          )}
        </TabsContent>
        <TabsContent value="rewards" className="mt-6">
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Gift className="text-amber-400" /> {user.rewardPoints || 0} points</CardTitle>
              <CardDescription>Earn 10 points for every &#8377;1,000 spent. Redeem on future bookings (coming soon).</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">Bookings completed: {confirmed.length}</p>
              {!user.isPremium && <p className="text-sm text-slate-400 mt-2">Complete {Math.max(0, 3 - confirmed.length)} more bookings to unlock Premium.</p>}
              {user.isPremium && <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 mt-2"><Crown className="size-3 mr-1" />Premium member</Badge>}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="profile" className="mt-6">
          <Card className="bg-slate-900/60 border-slate-800">
            <CardContent className="pt-6 space-y-3">
              <Row k="Name" v={user.name} />
              <Row k="Email" v={user.email} />
              <Row k="Phone" v={user.phone || '—'} />
              <Row k="Member since" v={new Date(user.createdAt).toLocaleDateString()} />
              {user.subscription && <Row k="Subscription" v={`${user.subscription.planName} (until ${new Date(user.subscription.expiresAt).toLocaleDateString()})`} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <Card className={`border-slate-800 ${accent ? 'bg-gradient-to-br from-amber-400/15 to-orange-500/10' : 'bg-slate-900/60'}`}>
    <CardContent className="pt-6 flex items-center justify-between">
      <div><div className="text-sm text-slate-400">{label}</div><div className="text-3xl font-bold">{value}</div></div>
      <Icon className={`size-8 ${accent ? 'text-amber-400' : 'text-slate-500'}`} />
    </CardContent>
  </Card>
)

const BookingRow = ({ b }) => (
  <Card className="bg-slate-900/60 border-slate-800">
    <CardContent className="pt-5 flex items-center gap-4">
      <img src={b.carImage} alt={b.carName} className="size-20 rounded-lg object-cover hidden sm:block" />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1"><h3 className="font-semibold">{b.carName}</h3><Badge className={b.status === 'confirmed' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-slate-700/40 text-slate-300'}>{b.status}</Badge></div>
        <p className="text-sm text-slate-400">{new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()} &middot; {b.days} days</p>
        {b.appliedCoupon && <p className="text-xs text-amber-400 mt-1">Coupon: {b.appliedCoupon}</p>}
      </div>
      <div className="text-right"><div className="text-lg font-bold">{fmtINR(b.finalAmount)}</div></div>
    </CardContent>
  </Card>
)

// ====== Subscriptions ======
function Subscriptions({ user, requireLogin, reload }) {
  const [plans, setPlans] = useState([])
  const [paying, setPaying] = useState(false)
  useEffect(() => { api('/subscriptions/plans').then(d => setPlans(d.plans)).catch(() => {}) }, [])

  const subscribe = async (planId) => {
    if (!requireLogin()) return
    setPaying(true)
    try {
      const order = await api('/subscriptions/create-order', { method: 'POST', body: JSON.stringify({ planId }) })
      const rzp = new window.Razorpay({
        key: order.key,
        amount: order.amount * 100,
        currency: 'INR',
        name: 'Kasika Premium',
        description: `Premium subscription`,
        order_id: order.orderId,
        prefill: { name: user.name, email: user.email },
        theme: { color: '#fbbf24' },
        handler: async (resp) => {
          try {
            await api('/subscriptions/verify', { method: 'POST', body: JSON.stringify({ ...resp, subscriptionId: order.subscriptionId }) })
            toast.success('Welcome to Kasika Premium!')
            reload()
          } catch (e) { toast.error(e.message) }
        },
      })
      rzp.open()
    } catch (e) { toast.error(e.message) } finally { setPaying(false) }
  }

  return (
    <main className="container py-16">
      <div className="text-center mb-12">
        <Crown className="size-12 text-amber-400 mx-auto mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold mb-3">Kasika Premium</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">Unlock exclusive cars, automatic discounts, and priority support. Subscribe monthly or save with a yearly plan.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {plans.map(p => (
          <Card key={p.id} className={`border-slate-800 ${p.id === 'yearly' ? 'bg-gradient-to-br from-amber-400/15 to-orange-500/5 border-amber-400/40' : 'bg-slate-900/60'}`}>
            <CardHeader>
              {p.id === 'yearly' && <Badge className="w-fit bg-amber-400 text-slate-900 mb-2">Best value</Badge>}
              <CardTitle className="text-2xl">{p.name}</CardTitle>
              <div className="flex items-baseline gap-2 mt-2"><span className="text-4xl font-bold">{fmtINR(p.price)}</span><span className="text-slate-400">/ {p.duration === 30 ? 'month' : 'year'}</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {p.features.map(f => <li key={f} className="flex items-center gap-2 text-sm"><CheckCircle2 className="size-4 text-amber-400" />{f}</li>)}
              </ul>
              <Button disabled={paying || user?.subscription?.planId === p.id} onClick={() => subscribe(p.id)} className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-semibold">
                {user?.subscription?.planId === p.id ? 'Active' : `Subscribe ${fmtINR(p.price)}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}

// ====== Blog ======
function BlogList({ blogs, onSelect }) {
  return (
    <main className="container py-12">
      <h1 className="text-4xl font-bold mb-2">Kasika Blog</h1>
      <p className="text-slate-400 mb-8">Travel tips, road trips, and car insights</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map(b => (
          <Card key={b.id} className="bg-slate-900/60 border-slate-800 hover:border-amber-400/40 transition cursor-pointer overflow-hidden" onClick={() => onSelect(b)}>
            <div className="aspect-[16/9] bg-slate-800 overflow-hidden"><img src={b.coverImage} alt={b.title} className="w-full h-full object-cover" /></div>
            <CardContent className="pt-5">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{b.title}</h3>
              <p className="text-sm text-slate-400 line-clamp-3">{b.excerpt}</p>
              <p className="text-xs text-slate-500 mt-3">{b.author} &middot; {new Date(b.createdAt).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}

function BlogDetail({ blog, onBack }) {
  return (
    <main className="container py-12 max-w-3xl">
      <Button variant="ghost" onClick={onBack} className="mb-4 text-slate-400">← Back</Button>
      <img src={blog.coverImage} className="w-full aspect-[16/9] rounded-2xl object-cover mb-6" alt={blog.title} />
      <h1 className="text-4xl font-bold mb-3">{blog.title}</h1>
      <p className="text-slate-400 mb-6">{blog.author} &middot; {new Date(blog.createdAt).toLocaleDateString()}</p>
      <div className="prose prose-invert max-w-none whitespace-pre-line text-slate-200 leading-relaxed">{blog.content}</div>
    </main>
  )
}

// ====== Admin Panel ======
function AdminPanel({ reloadCars, reloadBlogs }) {
  return (
    <main className="container py-10">
      <div className="flex items-center gap-2 mb-8"><ShieldCheck className="size-7 text-amber-400" /><h1 className="text-3xl font-bold">Admin Panel</h1></div>
      <Tabs defaultValue="cars">
        <TabsList className="bg-slate-900 border border-slate-800">
          <TabsTrigger value="cars">Cars</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
          <TabsTrigger value="blogs">Blogs</TabsTrigger>
        </TabsList>
        <TabsContent value="cars" className="mt-6"><AdminCars reload={reloadCars} /></TabsContent>
        <TabsContent value="users" className="mt-6"><AdminUsers /></TabsContent>
        <TabsContent value="bookings" className="mt-6"><AdminBookings /></TabsContent>
        <TabsContent value="coupons" className="mt-6"><AdminCoupons /></TabsContent>
        <TabsContent value="blogs" className="mt-6"><AdminBlogs reload={reloadBlogs} /></TabsContent>
      </Tabs>
    </main>
  )
}

function AdminCars({ reload }) {
  const [cars, setCars] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', brand: '', type: 'Sedan', transmission: 'Manual', fuel: 'Petrol', seats: 5, pricePerDay: 1500, location: 'Mumbai', image: '', description: '' })
  const load = async () => { const { cars } = await api('/cars'); setCars(cars) }
  useEffect(() => { load() }, [])

  const create = async () => {
    try {
      await api('/admin/cars', { method: 'POST', body: JSON.stringify({ ...form, features: ['AC', 'Bluetooth'] }) })
      toast.success('Car added')
      setOpen(false)
      load()
      reload?.()
    } catch (e) { toast.error(e.message) }
  }

  const remove = async (id) => {
    if (!confirm('Delete this car?')) return
    try { await api(`/admin/cars/${id}`, { method: 'DELETE' }); toast.success('Deleted'); load(); reload?.() } catch (e) { toast.error(e.message) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{cars.length} cars</h2>
        <Button onClick={() => setOpen(true)} className="bg-amber-400 text-slate-900 hover:bg-amber-300"><Plus className="size-4 mr-1" />Add car</Button>
      </div>
      <div className="grid gap-3">
        {cars.map(c => (
          <Card key={c.id} className="bg-slate-900/60 border-slate-800">
            <CardContent className="pt-5 flex items-center gap-4">
              <img src={c.image} className="size-16 rounded-lg object-cover" alt={c.name} />
              <div className="flex-1"><div className="font-semibold">{c.name}</div><div className="text-sm text-slate-400">{c.brand} &middot; {fmtINR(c.pricePerDay)}/day &middot; {c.location}</div></div>
              <Button size="sm" variant="ghost" onClick={() => remove(c.id)} className="text-red-400"><Trash2 className="size-4" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
          <DialogHeader><DialogTitle>Add a car</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['name','Car name'],['brand','Brand'],['type','Type'],['transmission','Transmission'],
              ['fuel','Fuel'],['seats','Seats'],['pricePerDay','Price per day (INR)'],['location','Location'],
            ].map(([k,l]) => (
              <div key={k} className={k === 'name' || k === 'image' ? 'col-span-2' : ''}>
                <Label>{l}</Label>
                <Input value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} className="bg-slate-950 border-slate-800" />
              </div>
            ))}
            <div className="col-span-2"><Label>Image URL</Label><Input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className="bg-slate-950 border-slate-800" /></div>
            <div className="col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-slate-950 border-slate-800" /></div>
          </div>
          <DialogFooter><Button onClick={create} className="bg-amber-400 text-slate-900">Save car</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AdminUsers() {
  const [users, setUsers] = useState([])
  useEffect(() => { api('/admin/users').then(d => setUsers(d.users)).catch(() => {}) }, [])
  return (
    <div className="space-y-2">
      {users.map(u => (
        <Card key={u.id} className="bg-slate-900/60 border-slate-800">
          <CardContent className="pt-5 flex items-center justify-between">
            <div>
              <div className="font-semibold">{u.name} {u.isAdmin && <Badge className="ml-2 bg-purple-500/20 text-purple-300">Admin</Badge>} {u.isPremium && <Badge className="ml-2 bg-amber-400 text-slate-900">Premium</Badge>}</div>
              <div className="text-sm text-slate-400">{u.email} &middot; {u.phone || '-'}</div>
            </div>
            <div className="text-sm text-slate-400">{u.rewardPoints || 0} pts</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function AdminBookings() {
  const [bookings, setBookings] = useState([])
  useEffect(() => { api('/admin/bookings').then(d => setBookings(d.bookings)).catch(() => {}) }, [])
  return (
    <div className="space-y-2">
      {bookings.map(b => (
        <Card key={b.id} className="bg-slate-900/60 border-slate-800">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-1">
              <div className="font-semibold">{b.carName || b.planName}</div>
              <Badge className={b.status === 'confirmed' ? 'bg-green-500/20 text-green-300' : 'bg-slate-700/40 text-slate-300'}>{b.status}</Badge>
            </div>
            <div className="text-sm text-slate-400">{b.userEmail} &middot; {fmtINR(b.finalAmount || b.amount)} &middot; {new Date(b.createdAt).toLocaleString()}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function AdminCoupons() {
  const [coupons, setCoupons] = useState([])
  const [form, setForm] = useState({ code: '', discountType: 'percent', discount: 10, minAmount: 0, maxDiscount: 1000 })
  const load = () => api('/coupons').then(d => setCoupons(d.coupons)).catch(() => {})
  useEffect(() => { load() }, [])
  const create = async () => {
    try { await api('/admin/coupons', { method: 'POST', body: JSON.stringify(form) }); toast.success('Coupon created'); load() } catch (e) { toast.error(e.message) }
  }
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="bg-slate-900/60 border-slate-800 lg:col-span-1">
        <CardHeader><CardTitle>New coupon</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Code</Label><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} className="bg-slate-950 border-slate-800" /></div>
          <div><Label>Type</Label>
            <Select value={form.discountType} onValueChange={v => setForm({ ...form, discountType: v })}>
              <SelectTrigger className="bg-slate-950 border-slate-800"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="percent">Percent</SelectItem><SelectItem value="flat">Flat</SelectItem></SelectContent>
            </Select>
          </div>
          <div><Label>Discount</Label><Input type="number" value={form.discount} onChange={e => setForm({ ...form, discount: +e.target.value })} className="bg-slate-950 border-slate-800" /></div>
          <div><Label>Min amount</Label><Input type="number" value={form.minAmount} onChange={e => setForm({ ...form, minAmount: +e.target.value })} className="bg-slate-950 border-slate-800" /></div>
          <div><Label>Max discount</Label><Input type="number" value={form.maxDiscount} onChange={e => setForm({ ...form, maxDiscount: +e.target.value })} className="bg-slate-950 border-slate-800" /></div>
          <Button onClick={create} className="w-full bg-amber-400 text-slate-900">Create coupon</Button>
        </CardContent>
      </Card>
      <div className="lg:col-span-2 space-y-2">
        {coupons.map(c => (
          <Card key={c.id} className="bg-slate-900/60 border-slate-800">
            <CardContent className="pt-5 flex items-center justify-between">
              <div>
                <div className="font-mono font-bold text-amber-400 text-lg flex items-center gap-2"><Tag className="size-4" />{c.code}</div>
                <div className="text-sm text-slate-400">{c.discountType === 'percent' ? `${c.discount}% off` : `${fmtINR(c.discount)} off`} &middot; min {fmtINR(c.minAmount)}</div>
              </div>
              <Badge className="bg-green-500/20 text-green-300">Active</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function AdminBlogs({ reload }) {
  const [blogs, setBlogs] = useState([])
  const [form, setForm] = useState({ title: '', excerpt: '', content: '', coverImage: '' })
  const load = () => api('/blogs').then(d => setBlogs(d.blogs)).catch(() => {})
  useEffect(() => { load() }, [])
  const create = async () => {
    try { await api('/admin/blogs', { method: 'POST', body: JSON.stringify(form) }); toast.success('Blog published'); setForm({ title: '', excerpt: '', content: '', coverImage: '' }); load(); reload?.() } catch (e) { toast.error(e.message) }
  }
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="bg-slate-900/60 border-slate-800">
        <CardHeader><CardTitle>New blog post</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="bg-slate-950 border-slate-800" /></div>
          <div><Label>Cover image URL</Label><Input value={form.coverImage} onChange={e => setForm({ ...form, coverImage: e.target.value })} className="bg-slate-950 border-slate-800" /></div>
          <div><Label>Excerpt</Label><Textarea value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} className="bg-slate-950 border-slate-800" /></div>
          <div><Label>Content</Label><Textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={8} className="bg-slate-950 border-slate-800" /></div>
          <Button onClick={create} className="w-full bg-amber-400 text-slate-900">Publish</Button>
        </CardContent>
      </Card>
      <div className="space-y-2">
        {blogs.map(b => (
          <Card key={b.id} className="bg-slate-900/60 border-slate-800">
            <CardContent className="pt-5 flex gap-3">
              {b.coverImage && <img src={b.coverImage} className="size-16 rounded-lg object-cover" alt="" />}
              <div className="flex-1">
                <div className="font-semibold">{b.title}</div>
                <div className="text-sm text-slate-400 line-clamp-2">{b.excerpt}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ====== Footer ======
function Footer({ goView }) {
  return (
    <footer className="border-t border-slate-800 mt-20 bg-slate-950">
      <div className="container py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="size-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 grid place-items-center"><Car className="size-4 text-slate-900" /></div>
            <span className="text-lg font-bold">Kasika.</span>
          </div>
          <p className="text-sm text-slate-400">Premium self-drive car rentals across India. Drive freely, earn rewards.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Explore</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><button onClick={() => goView('cars')} className="hover:text-white">Cars</button></li>
            <li><button onClick={() => goView('subscriptions')} className="hover:text-white">Premium</button></li>
            <li><button onClick={() => goView('blogs')} className="hover:text-white">Blog</button></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Support</h4>
          <ul className="space-y-2 text-sm text-slate-400"><li>support@kasika.com</li><li>+91 90000 00000</li></ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Payments</h4>
          <p className="text-sm text-slate-400">Secured by Razorpay. UPI, Card, Net Banking accepted.</p>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">© {new Date().getFullYear()} Kasika Self Drive. All rights reserved.</div>
    </footer>
  )
}

export default App
