'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Zap, ShieldCheck, Mail, Phone, MapPin, User } from 'lucide-react'

function DocThumb({ label, url }) {
  if (!url) return null
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="group block">
      <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">{label}</div>
      <img src={url} alt={label} className="h-24 w-full rounded-xl object-cover border border-zinc-200 group-hover:border-brand-500 transition-colors" />
    </a>
  )
}

export default function AdminKyc() {
  const { api } = useAuth()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/admin/kyc').then(data => {
      setRecords(data.kyc || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [api])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-charcoal-900 uppercase tracking-tight flex items-center gap-3">
          <ShieldCheck className="text-brand-500" /> KYC Verifications
        </h2>
        {!loading && (
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-amber-100 text-amber-700">
            {records.length} Total
          </span>
        )}
      </div>

      {loading ? (
        <Zap className="size-8 text-amber-500 animate-pulse" />
      ) : records.length === 0 ? (
        <div className="text-center py-20">
          <ShieldCheck className="size-12 text-zinc-300 mx-auto mb-4" />
          <p className="text-zinc-500 text-sm font-medium">No KYC submissions yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {records.map(k => (
            <div key={k._id} className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-[0_4px_20px_-8px_rgba(21,22,27,0.10)]">
              <div className="flex items-center gap-3 mb-5">
                <div className="size-10 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500">
                  <User className="size-5" />
                </div>
                <div>
                  <div className="text-sm font-black text-charcoal-900 uppercase tracking-tight">{k.fullName || k.userName}</div>
                  <div className="text-[11px] font-medium text-zinc-500">{k.userEmail}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs mb-5">
                <div className="flex items-center gap-2 text-zinc-600"><Phone className="size-3.5 text-amber-500" /> {k.phone}</div>
                <div className="flex items-center gap-2 text-zinc-600"><Mail className="size-3.5 text-amber-500" /> {k.userEmail}</div>
                <div className="col-span-2 flex items-start gap-2 text-zinc-600"><MapPin className="size-3.5 text-amber-500 shrink-0 mt-0.5" /> {k.address}</div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs mb-5 border-y border-zinc-100 py-4">
                <div><div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Aadhaar</div><div className="font-bold text-charcoal-900">{k.aadhaarNumber}</div></div>
                <div><div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">PAN</div><div className="font-bold text-charcoal-900">{k.panNumber}</div></div>
                <div><div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Licence</div><div className="font-bold text-charcoal-900">{k.licenseNumber}</div></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DocThumb label="Aadhaar Front" url={k.aadhaarFront} />
                <DocThumb label="Aadhaar Back" url={k.aadhaarBack} />
                <DocThumb label="PAN Card" url={k.panImage} />
                <DocThumb label="Driving Licence" url={k.licenseImage} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
