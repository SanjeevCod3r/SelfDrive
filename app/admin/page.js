'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Users, Car, Calendar, TrendingUp, Zap } from 'lucide-react'

const formatINR = (n) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`
  return `₹${n || 0}`
}

export default function AdminDashboard() {
  const { api } = useAuth()
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/admin/stats').then(data => {
      setStats(data.stats)
      setRecent(data.recentBookings || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [api])

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users },
    { label: 'Active Bookings', value: stats?.activeBookings ?? 0, icon: Calendar },
    { label: 'Total Fleet', value: stats?.totalFleet ?? 0, icon: Car },
    { label: 'Revenue (MTD)', value: formatINR(stats?.revenueMTD), icon: TrendingUp },
  ]

  return (
    <div>
      <h1 className="text-3xl font-black text-charcoal-900 uppercase tracking-tighter mb-8">Admin Dashboard</h1>

      {loading ? (
        <Zap className="size-8 text-amber-500 animate-pulse" />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {cards.map((stat, i) => (
              <div key={i} className="bg-zinc-50 border border-zinc-200 p-6 rounded-3xl flex items-center gap-4 shadow-[0_4px_20px_-8px_rgba(21,22,27,0.10)]">
                <div className="size-12 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                  <stat.icon className="size-6 text-amber-500" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</div>
                  <div className="text-2xl font-black text-charcoal-900">{stat.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 shadow-[0_4px_20px_-8px_rgba(21,22,27,0.10)]">
              <h3 className="text-lg font-black text-charcoal-900 uppercase tracking-tight mb-4">Recent Bookings</h3>
              {recent.length === 0 ? (
                <div className="text-zinc-500 text-sm font-medium">No bookings yet.</div>
              ) : (
                <ul className="divide-y divide-zinc-200">
                  {recent.map(b => (
                    <li key={b._id} className="py-3 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-sm font-black text-charcoal-900 truncate">{b.carName || 'Booking'}</div>
                        <div className="text-[11px] font-medium text-zinc-500 truncate">{b.userName || b.userEmail}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-black text-amber-600">{formatINR(b.finalAmount)}</div>
                        <div className={`text-[9px] font-black uppercase tracking-widest ${b.status === 'confirmed' ? 'text-green-600' : 'text-zinc-400'}`}>{b.status}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 shadow-[0_4px_20px_-8px_rgba(21,22,27,0.10)]">
              <h3 className="text-lg font-black text-charcoal-900 uppercase tracking-tight mb-4">System Alerts</h3>
              {stats?.newContacts > 0 ? (
                <div className="text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                  {stats.newContacts} new contact {stats.newContacts === 1 ? 'message' : 'messages'} awaiting response.
                </div>
              ) : (
                <div className="text-zinc-500 text-sm font-medium">No active alerts.</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
