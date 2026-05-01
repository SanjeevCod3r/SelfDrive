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

  if (loading) return <div className="text-white animate-pulse">Loading bookings...</div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="size-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
          <Calendar className="size-6 text-amber-500" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Self-Drive Bookings</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Manage all self-drive rentals</p>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-[32px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Booking ID</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">User Details</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Car Details</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Dates</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Driver's License</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 font-medium">No self-drive bookings found.</td>
                </tr>
              ) : bookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-6 text-sm text-slate-300 font-mono">{booking._id.slice(-6).toUpperCase()}</td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="size-3 text-slate-500" />
                      <span className="text-white font-bold text-sm">{booking.userName}</span>
                    </div>
                    <div className="text-slate-500 text-xs">{booking.userEmail}</div>
                  </td>
                  <td className="p-6">
                    <div className="text-white font-bold text-sm">{booking.carName}</div>
                    <div className="text-amber-500 text-xs font-black uppercase tracking-widest mt-1">₹{booking.finalAmount}</div>
                  </td>
                  <td className="p-6 text-sm text-slate-300">
                    <div>{format(new Date(booking.startDate), 'MMM dd, yyyy')}</div>
                    <div className="text-slate-500 text-xs mt-1">to {format(new Date(booking.endDate), 'MMM dd, yyyy')}</div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="size-3 text-slate-500" />
                      <span className="text-slate-300 text-sm font-mono">{booking.driverLicense}</span>
                    </div>
                    {booking.ageVerified && (
                      <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
                        <CheckCircle2 className="size-3" /> Age 21+ Verified
                      </div>
                    )}
                  </td>
                  <td className="p-6">
                    <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
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
