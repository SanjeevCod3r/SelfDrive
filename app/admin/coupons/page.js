'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Ticket, Plus, Zap, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminCoupons() {
  const { api } = useAuth()
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    const data = await api('/admin/coupons')
    setCoupons(data.coupons)
    setLoading(false)
  }

  const handleAddCoupon = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    await api('/admin/coupons', {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(formData))
    })
    e.target.reset()
    fetchCoupons()
  }

  return (
    <div>
      <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-8">Discount Coupons</h2>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          {loading ? <Zap className="size-8 text-amber-500 animate-pulse" /> : coupons.map(c => (
            <div key={c.id} className="bg-slate-950 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
              <Tag className="absolute -right-4 -bottom-4 size-24 text-amber-500/10" />
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Code</div>
              <h4 className="text-2xl font-black text-amber-500 uppercase tracking-widest mb-4">{c.code}</h4>
              <div className="text-white font-bold text-lg mb-1">₹{c.discount} OFF</div>
              <div className="text-slate-500 text-xs font-medium">Valid until: {new Date(c.expiry).toLocaleDateString()}</div>
            </div>
          ))}
        </div>

        <div>
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sticky top-8">
            <h3 className="text-lg font-black text-white uppercase tracking-tight mb-4 flex items-center gap-2"><Plus className="size-5 text-amber-500"/> Create Coupon</h3>
            <form onSubmit={handleAddCoupon} className="space-y-4">
              <input name="code" placeholder="Code (e.g. SUMMER20)" required className="w-full bg-slate-900 border border-slate-800 h-12 rounded-xl px-4 text-white uppercase" />
              <input name="discount" type="number" placeholder="Discount Amount (₹)" required className="w-full bg-slate-900 border border-slate-800 h-12 rounded-xl px-4 text-white" />
              <input name="expiry" type="date" required className="w-full bg-slate-900 border border-slate-800 h-12 rounded-xl px-4 text-white" />
              <Button type="submit" className="w-full bg-amber-500 text-slate-950 font-black uppercase tracking-widest h-12 rounded-xl">Save Coupon</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
