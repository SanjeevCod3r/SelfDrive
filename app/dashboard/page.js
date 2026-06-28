'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { motion } from 'framer-motion'
import {
  User, Award, Car, Calendar, CreditCard, Settings,
  LogOut, MapPin, Clock, ArrowRight, Zap , Crown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const fmtINR = (n) => `₹${(n || 0).toLocaleString('en-IN')}`

export default function Dashboard() {
  const { user, setUser, loading: authLoading, logout, api } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('bookings')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  // Profile settings form
  const [profile, setProfile] = useState({ name: '', phone: '' })
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    if (user) setProfile({ name: user.name || '', phone: user.phone || '' })
  }, [user])

  const saveProfile = async () => {
    setSavingProfile(true)
    try {
      const data = await api('/auth/me', { method: 'PUT', body: JSON.stringify(profile) })
      if (data.user) setUser(data.user)
      toast.success('Profile updated successfully')
    } catch (e) {
      toast.error(e.message || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && activeTab === 'bookings') {
      api('/bookings').then(data => {
        setBookings(data.bookings || [])
        setLoading(false)
      }).catch(e => {
        console.error(e)
        setLoading(false)
      })
    }
  }, [user, activeTab, api])

  if (authLoading || !user) return <div className="min-h-screen bg-zinc-50 flex items-center justify-center"><Zap className="size-12 text-amber-500 animate-pulse" /></div>

  const tabs = [
    { id: 'bookings', label: 'My Bookings', icon: Calendar },
    { id: 'rewards', label: 'Reward Points', icon: Award },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="bg-zinc-50 pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-4 gap-8">

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-zinc-200 shadow-[0_10px_40px_-15px_rgba(21,22,27,0.12)] rounded-[32px] p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 size-32 bg-amber-500/10 blur-[50px]" />
              <div className="size-24 rounded-full bg-zinc-100 border-2 border-brand-500 mx-auto flex items-center justify-center mb-4 relative z-10">
                <User className="size-10 text-amber-500" />
              </div>
              <h2 className="text-xl font-black text-charcoal-900 uppercase tracking-tight">{user.name}</h2>
              <p className="text-zinc-600 font-medium text-sm mb-6">{user.email}</p>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between">
                <div className="text-left">
                  <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Reward Points</div>
                  <div className="text-2xl font-black text-charcoal-900">{user.points || 0}</div>
                </div>
                <Award className="size-8 text-amber-500 opacity-50" />
              </div>
            </div>

            <div className="bg-white border border-zinc-200 shadow-[0_10px_40px_-15px_rgba(21,22,27,0.12)] rounded-[32px] p-4 flex flex-col gap-2">
              {tabs.map((tab) => {
                const active = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all ${
                      active ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-zinc-500 hover:text-charcoal-900 hover:bg-zinc-100'
                    }`}
                  >
                    <tab.icon className="size-4" /> {tab.label}
                  </button>
                )
              })}
              <div className="h-px bg-zinc-200 my-2" />
              <button
                onClick={() => { logout(); router.push('/') }}
                className="flex items-center gap-4 px-6 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs text-red-400 hover:bg-red-500/10 transition-colors text-left w-full"
              >
                <LogOut className="size-4" /> Logout
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-zinc-200 shadow-[0_10px_40px_-15px_rgba(21,22,27,0.12)] rounded-[32px] p-8 min-h-[600px]">
              
              {activeTab === 'bookings' && (
                <div>
                  <h3 className="text-2xl font-black text-charcoal-900 uppercase tracking-tight mb-8 flex items-center gap-3">
                    <Calendar className="text-amber-500" /> Booking History
                  </h3>

                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2].map(i => <div key={i} className="h-40 rounded-2xl bg-zinc-100 animate-pulse" />)}
                    </div>
                  ) : bookings.length > 0 ? (
                    <div className="space-y-6">
                      {bookings.map((b) => (
                        <div key={b._id} className="bg-white border border-zinc-200 shadow-[0_10px_40px_-15px_rgba(21,22,27,0.12)] rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-center">
                          <img src={b.carImage || '/assests/bmw_x5_hero.png'} alt="Car" className="w-full md:w-48 h-32 object-cover rounded-xl" />
                          <div className="flex-1 w-full">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <Badge variant="outline" className="text-amber-500 border-amber-500/50 mb-2 uppercase tracking-widest text-[10px]">{b.status}</Badge>
                                <h4 className="text-xl font-black text-charcoal-900 uppercase">{b.carName}</h4>
                              </div>
                              <div className="text-xl font-black text-charcoal-900">{fmtINR(b.finalAmount)}</div>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-zinc-600 mt-4">
                              <div className="flex items-center gap-2">
                                <MapPin className="size-4 text-zinc-500" />
                                {b.bookingType === 'with-driver' ? `${b.pickupLocation} to ${b.dropLocation}` : b.deliveryAddress || 'Self Drive'}
                              </div>
                              <div className="flex items-center gap-2"><Clock className="size-4 text-zinc-500" /> {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <Car className="size-16 text-zinc-300 mx-auto mb-4" />
                      <h4 className="text-xl font-bold text-charcoal-900 uppercase mb-2">No bookings yet</h4>
                      <p className="text-zinc-500 mb-6 font-medium">It's time to start your next adventure.</p>
                      <Button onClick={() => router.push('/cars')} className="bg-amber-500 text-white font-black uppercase tracking-widest text-xs h-12 px-8 rounded-xl">
                        Explore Fleet
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'rewards' && (
                <div>
                   <h3 className="text-2xl font-black text-charcoal-900 uppercase tracking-tight mb-8 flex items-center gap-3">
                    <Award className="text-amber-500" /> Reward Points
                  </h3>
                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-10 text-white relative overflow-hidden mb-8">
                    <Award className="absolute -right-10 -bottom-10 size-64 opacity-20" />
                    <div className="relative z-10">
                      <div className="text-sm font-black uppercase tracking-widest mb-2 opacity-80">Total Balance</div>
                      <div className="text-6xl font-black tracking-tighter mb-4">{user.points || 0} <span className="text-2xl">PTS</span></div>
                      <p className="font-bold opacity-80 max-w-sm">Use your points to get discounts on your next bookings. 1 Point = ₹1 Discount.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'subscription' && (
                <div>
                   <h3 className="text-2xl font-black text-charcoal-900 uppercase tracking-tight mb-8 flex items-center gap-3">
                    <CreditCard className="text-amber-500" /> My Subscription
                  </h3>

                  {user.subscription ? (
                    <div className="bg-white border border-zinc-200 shadow-[0_10px_40px_-15px_rgba(21,22,27,0.12)] rounded-[40px] p-10 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                          <Crown className="size-32 text-amber-500" />
                       </div>
                       
                       <div className="relative z-10">
                          <div className="inline-flex items-center gap-2 bg-amber-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-xl shadow-amber-500/10">
                             <Crown className="size-3" /> Active Plan
                          </div>

                          <h4 className="text-4xl font-black text-charcoal-900 uppercase tracking-tight mb-2">{user.subscription.planName}</h4>
                          <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs mb-10 flex items-center gap-2">
                             <Clock className="size-4 text-amber-500" /> Expires on: {new Date(user.subscription.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-zinc-200">
                             <div>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Started At</p>
                                <p className="text-sm font-black text-charcoal-900 uppercase">{new Date(user.subscription.startedAt).toLocaleDateString()}</p>
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Status</p>
                                <p className="text-sm font-black text-green-500 uppercase">Healthy</p>
                             </div>
                          </div>
                       </div>
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-white border border-zinc-200 shadow-[0_10px_40px_-15px_rgba(21,22,27,0.12)] rounded-[40px]">
                      <CreditCard className="size-16 text-zinc-300 mx-auto mb-4" />
                      <h4 className="text-xl font-bold text-charcoal-900 uppercase mb-2">No Active Subscription</h4>
                      <p className="text-zinc-500 mb-8 font-medium max-w-sm mx-auto">Join the Elite Club to unlock 10% off every ride and priority fleet access.</p>
                      <Button onClick={() => router.push('/subscriptions')} className="bg-amber-500 hover:bg-brand-600 text-white font-black uppercase tracking-widest text-xs h-14 px-10 rounded-2xl transition-all shadow-xl shadow-amber-500/20 active:scale-95">
                        Choose A Plan <ArrowRight className="size-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6 max-w-md">
                   <h3 className="text-2xl font-black text-charcoal-900 uppercase tracking-tight mb-8 flex items-center gap-3">
                    <Settings className="text-amber-500" /> Profile Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Full Name</label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                        className="w-full bg-white border border-zinc-200 rounded-xl h-12 px-4 text-charcoal-900 focus:outline-none focus:border-brand-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Email Address</label>
                      <input type="email" defaultValue={user.email} disabled className="w-full bg-zinc-100 border border-zinc-200 rounded-xl h-12 px-4 text-zinc-500 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Phone Number</label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                        placeholder="+91 98765 43210"
                        className="w-full bg-white border border-zinc-200 rounded-xl h-12 px-4 text-charcoal-900 focus:outline-none focus:border-brand-500 transition-colors placeholder:text-zinc-400"
                      />
                    </div>
                    <Button
                      onClick={saveProfile}
                      disabled={savingProfile}
                      className="mt-4 bg-brand-500 text-white font-black uppercase tracking-widest text-xs h-12 px-8 rounded-xl hover:bg-brand-600 transition-colors disabled:opacity-50"
                    >
                      {savingProfile ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
