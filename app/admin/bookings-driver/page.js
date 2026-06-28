'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { format } from 'date-fns'
import { Car, User, MapPin, Phone, Clock, CalendarDays } from 'lucide-react'

export default function DriverBookings() {
  const { api } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/admin/bookings?type=with-driver').then(data => {
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
          <Car className="size-6 text-brand-500" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-charcoal-900 uppercase tracking-tighter">Driver Bookings</h1>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1">Manage all chauffeured services</p>
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
                <th className="p-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Locations</th>
                <th className="p-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-zinc-500 font-medium">No driver bookings found.</td>
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
                    {booking.userPhone && (
                      <div className="flex items-center gap-1.5 text-zinc-500 text-xs mt-1">
                        <Phone className="size-3 text-zinc-400" />
                        <a href={`tel:${booking.userPhone}`} className="hover:text-brand-600 transition-colors">{booking.userPhone}</a>
                      </div>
                    )}
                  </td>
                  <td className="p-6">
                    <div className="text-charcoal-900 font-bold text-sm">{booking.carName}</div>
                    <div className="text-brand-600 text-sm font-black mt-1">₹{(booking.finalAmount || 0).toLocaleString('en-IN')}</div>
                    <div className="mt-2 space-y-0.5 text-[10px] font-medium text-zinc-500">
                      <div>Base: ₹{(booking.baseAmount || 0).toLocaleString('en-IN')}</div>
                      {booking.gst > 0 && <div>GST (18%): ₹{(booking.gst || 0).toLocaleString('en-IN')}</div>}
                    </div>
                  </td>
                  <td className="p-6 text-sm text-zinc-600">
                    {booking.months > 0 && (
                      <div className="inline-flex items-center gap-1.5 mb-2 text-[10px] font-black uppercase tracking-widest text-brand-600 bg-brand-500/10 px-2.5 py-1 rounded-full">
                        <CalendarDays className="size-3" /> {booking.months} {booking.months === 1 ? 'Month' : 'Months'}
                      </div>
                    )}
                    <div>{format(new Date(booking.startDate), 'MMM dd, yyyy')}</div>
                    <div className="text-zinc-500 text-xs mt-1">to {format(new Date(booking.endDate), 'MMM dd, yyyy')}</div>
                    {booking.pickupTime && (
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mt-2">
                        <Clock className="size-3 text-brand-500" /> Pickup {booking.pickupTime}
                      </div>
                    )}
                  </td>
                  <td className="p-6 max-w-xs">
                    <div className="flex items-start gap-2 mb-2">
                      <MapPin className="size-3 text-brand-500 shrink-0 mt-0.5" />
                      <div className="text-zinc-600 text-xs truncate" title={booking.pickupLocation}>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-0.5">Pickup</span>
                        {booking.pickupLocation}
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="size-3 text-green-600 shrink-0 mt-0.5" />
                      <div className="text-zinc-600 text-xs truncate" title={booking.dropLocation}>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-0.5">Drop-off</span>
                        {booking.dropLocation}
                      </div>
                    </div>
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
