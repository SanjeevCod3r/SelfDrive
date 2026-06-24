'use client'
import { Users, Car, Calendar, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Users', value: '1,245', icon: Users },
    { label: 'Active Bookings', value: '84', icon: Calendar },
    { label: 'Total Fleet', value: '120', icon: Car },
    { label: 'Revenue (MTD)', value: '₹4.2M', icon: TrendingUp },
  ]

  return (
    <div>
      <h1 className="text-3xl font-black text-charcoal-900 uppercase tracking-tighter mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
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
          <div className="text-zinc-500 text-sm font-medium">Booking list will be displayed here...</div>
        </div>
        <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 shadow-[0_4px_20px_-8px_rgba(21,22,27,0.10)]">
          <h3 className="text-lg font-black text-charcoal-900 uppercase tracking-tight mb-4">System Alerts</h3>
          <div className="text-zinc-500 text-sm font-medium">No active alerts.</div>
        </div>
      </div>
    </div>
  )
}
