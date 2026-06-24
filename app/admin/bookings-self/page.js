'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { format } from 'date-fns'
import { Calendar, User, FileText, CheckCircle2 } from 'lucide-react'

export default function SelfDriveBookings() {
  const { api } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/admin/bookings?type=self-drive').then(data => {
      setBookings(data.bookings || [])
      setLoading(false)
    }).catch(e => {
      console.error(e)
      setLoading(false)
    })
  }, [api])

  if (loading) return <div className="text-charcoal-900 animate-pulse">Loading bookings...</div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="size-12 rounded-2xl bg-brand-500/10 flex items-center justify-center shrink-0">
          <Calendar className="size-6 text-brand-500" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-charcoal-900 uppercase tracking-tighter">Self-Drive Bookings</h1>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1">Manage all self-drive rentals</p>
        </div>
      </div>

      <div className="bg-zinc-50 border border-zinc-200 rounded-[32px] overflow-hidden shadow-[0_4px_20px_-8px_rgba(21,22,27,0.10)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="p-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Booking ID</th>
                <th className="p-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">User Details</th>
                <th className="p-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Car Details</th>
                <th className="p-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Dates</th>
                <th className="p-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Driver's License</th>
                <th className="p-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-zinc-500 font-medium">No self-drive bookings found.</td>
                </tr>
              ) : bookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-zinc-50 transition-colors">
                  <td className="p-6 text-sm text-zinc-600 font-mono">{booking._id.slice(-6).toUpperCase()}</td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="size-3 text-zinc-500" />
                      <span className="text-charcoal-900 font-bold text-sm">{booking.userName}</span>
                    </div>
                    <div className="text-zinc-500 text-xs">{booking.userEmail}</div>
                  </td>
                  <td className="p-6">
                    <div className="text-charcoal-900 font-bold text-sm">{booking.carName}</div>
                    <div className="text-brand-600 text-xs font-black uppercase tracking-widest mt-1">₹{booking.finalAmount}</div>
                  </td>
                  <td className="p-6 text-sm text-zinc-600">
                    <div>{format(new Date(booking.startDate), 'MMM dd, yyyy')}</div>
                    <div className="text-zinc-500 text-xs mt-1">to {format(new Date(booking.endDate), 'MMM dd, yyyy')}</div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="size-3 text-zinc-500" />
                      <span className="text-zinc-600 text-sm font-mono">{booking.driverLicense}</span>
                    </div>
                    {booking.ageVerified && (
                      <div className="flex items-center gap-1 text-[10px] text-green-700 font-bold uppercase tracking-widest">
                        <CheckCircle2 className="size-3" /> Age 21+ Verified
                      </div>
                    )}
                  </td>
                  <td className="p-6">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
