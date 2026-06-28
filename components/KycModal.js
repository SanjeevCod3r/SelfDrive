'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Upload, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/components/AuthProvider'

// Convert a selected File into a base64 data-URI for upload
const fileToDataUri = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = reject
  reader.readAsDataURL(file)
})

function DocUpload({ label, value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">{label}</label>
      <label className={`relative flex h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-colors ${value ? 'border-green-400 bg-green-50' : 'border-zinc-200 bg-zinc-50 hover:border-brand-500'}`}>
        {value ? (
          <>
            <img src={value} alt={label} className="h-16 w-auto rounded-lg object-contain" />
            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-green-600">
              <CheckCircle2 className="size-3" /> Uploaded — tap to change
            </span>
          </>
        ) : (
          <>
            <Upload className="size-5 text-zinc-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Click to upload</span>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
            onChange(await fileToDataUri(file))
          }}
        />
      </label>
    </div>
  )
}

export default function KycModal({ open, onClose, onSubmitted }) {
  const { user } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    address: '',
    aadhaarNumber: '',
    panNumber: '',
    licenseNumber: '',
    aadhaarFront: '',
    aadhaarBack: '',
    panImage: '',
    licenseImage: '',
  })

  if (!open) return null

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.aadhaarFront || !form.aadhaarBack || !form.panImage || !form.licenseImage) {
      toast.error('Please upload all required documents')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'KYC submission failed')
      toast.success('KYC verified! Proceeding to payment...')
      onSubmitted?.()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const input = "w-full bg-white border border-zinc-200 h-14 rounded-2xl px-5 text-sm font-bold text-charcoal-900 placeholder:text-zinc-400 focus:border-brand-500 outline-none transition-colors"

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-charcoal-950/60 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-zinc-200 rounded-[32px] p-8 md:p-10 shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-6 right-6 size-9 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors">
          <X className="size-4 text-charcoal-900" />
        </button>

        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-brand-600">
            <ShieldCheck className="size-3.5" /> Verification Required
          </div>
          <h2 className="text-2xl font-black text-charcoal-900 uppercase tracking-tight">Complete Your KYC</h2>
          <p className="text-zinc-500 text-sm font-medium mt-1">Required for renting a car. Your documents are stored securely.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Full Name</label>
              <input required value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="As per documents" className={input} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Phone Number</label>
              <input required value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" className={input} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Residential Address</label>
            <textarea required value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full current address" className="w-full bg-white border border-zinc-200 rounded-2xl p-5 min-h-[90px] text-sm font-bold text-charcoal-900 placeholder:text-zinc-400 focus:border-brand-500 outline-none resize-none" />
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Aadhaar No.</label>
              <input required value={form.aadhaarNumber} onChange={e => set('aadhaarNumber', e.target.value)} placeholder="XXXX XXXX XXXX" className={input} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">PAN No.</label>
              <input required value={form.panNumber} onChange={e => set('panNumber', e.target.value.toUpperCase())} placeholder="ABCDE1234F" className={input} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Driving Licence No.</label>
              <input required value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value.toUpperCase())} placeholder="UP00 00000000" className={input} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <DocUpload label="Aadhaar — Front" value={form.aadhaarFront} onChange={v => set('aadhaarFront', v)} />
            <DocUpload label="Aadhaar — Back" value={form.aadhaarBack} onChange={v => set('aadhaarBack', v)} />
            <DocUpload label="PAN Card" value={form.panImage} onChange={v => set('panImage', v)} />
            <DocUpload label="Driving Licence" value={form.licenseImage} onChange={v => set('licenseImage', v)} />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-14 bg-brand-500 hover:bg-brand-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-xl shadow-brand-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (<><Loader2 className="size-4 animate-spin" /> Submitting...</>) : 'Submit & Continue to Payment'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
