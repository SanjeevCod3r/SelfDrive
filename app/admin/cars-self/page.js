'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Plus, Trash2, Edit2, Zap, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function AdminSelfDriveCars() {
  const { api } = useAuth()
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // car being edited, or null
  const [saving, setSaving] = useState(false)
  const [serviceType, setServiceType] = useState('self-drive')

  useEffect(() => {
    fetchCars()
  }, [])

  const fetchCars = async () => {
    try {
      const data = await api('/cars?serviceType=self-drive')
      setCars(data.cars)
    } finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this car?')) return
    await api(`/admin/cars/${id}`, { method: 'DELETE' })
    if (editing?.id === id) setEditing(null)
    fetchCars()
  }

  const startEdit = (car) => {
    setEditing(car)
    setServiceType(car.serviceType || 'self-drive')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => { setEditing(null); setServiceType('self-drive') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)
    const features = data.features
      ? data.features.split(',').map(f => f.trim()).filter(Boolean)
      : []
    const payload = {
      ...data,
      pricePerDay: parseInt(data.pricePerDay),
      seats: parseInt(data.seats),
      securityDeposit: data.securityDeposit ? parseInt(data.securityDeposit) : 0,
      monthlyPrice: data.monthlyPrice ? parseInt(data.monthlyPrice) : 0,
      serviceType: data.serviceType || 'self-drive',
      features,
    }
    setSaving(true)
    try {
      if (editing) {
        await api(`/admin/cars/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) })
        toast.success('Car updated')
      } else {
        await api('/admin/cars', { method: 'POST', body: JSON.stringify(payload) })
        toast.success('Car added')
        e.target.reset()
        setServiceType('self-drive')
      }
      setEditing(null)
      fetchCars()
    } catch (err) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = "w-full bg-white border border-zinc-200 h-12 rounded-xl px-4 text-charcoal-900 placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none"

  return (
    <div>
      <h2 className="text-2xl font-black text-charcoal-900 uppercase tracking-tight mb-8">Manage Self-Drive Cars</h2>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {loading ? <Zap className="size-8 text-brand-500 animate-pulse" /> : cars.length > 0 ? cars.map(car => (
            <div key={car.id} className={`bg-zinc-50 border shadow-sm p-4 rounded-2xl flex items-center gap-4 transition-all ${editing?.id === car.id ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-zinc-200'}`}>
              <img src={car.image || '/assests/bmw_x5_hero.png'} alt={car.name} className="size-16 object-cover rounded-xl bg-zinc-100" />
              <div className="flex-1">
                <h4 className="text-charcoal-900 font-black uppercase">{car.brand} {car.name}</h4>
                <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                  {car.type} &middot; ₹{car.pricePerDay}/day &middot; {car.serviceType}
                  {car.securityDeposit > 0 && <> &middot; Dep ₹{car.securityDeposit}</>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => startEdit(car)} variant="ghost" className="size-10 p-0 text-zinc-500 hover:text-brand-500 hover:bg-brand-500/10"><Edit2 className="size-4" /></Button>
                <Button onClick={() => handleDelete(car.id)} variant="ghost" className="size-10 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 className="size-4" /></Button>
              </div>
            </div>
          )) : (
            <div className="text-zinc-500 font-bold uppercase tracking-widest text-center py-12 bg-zinc-50 border border-zinc-200 rounded-2xl">
              No self-drive cars found
            </div>
          )}
        </div>

        <div>
          <div className="bg-zinc-50 border border-zinc-200 shadow-sm rounded-3xl p-6 sticky top-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-charcoal-900 uppercase tracking-tight flex items-center gap-2">
                {editing ? <Edit2 className="size-5 text-brand-500" /> : <Plus className="size-5 text-brand-500" />}
                {editing ? 'Edit Car' : 'Add New Self-Drive Car'}
              </h3>
              {editing && (
                <button onClick={cancelEdit} type="button" className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-red-500">
                  <X className="size-3.5" /> Cancel
                </button>
              )}
            </div>

            {/* key forces remount so defaultValues repopulate when switching add/edit */}
            <form key={editing?.id || 'new'} onSubmit={handleSubmit} className="space-y-4">
              <input name="name" defaultValue={editing?.name} placeholder="Car Name (e.g. Swift)" required className={inputCls} />
              <input name="brand" defaultValue={editing?.brand} placeholder="Brand (e.g. Maruti)" required className={inputCls} />
              <div className="grid grid-cols-2 gap-4">
                <input name="type" defaultValue={editing?.type} placeholder="Category (e.g. Hatchback)" required className={inputCls} />
                <select name="serviceType" value={serviceType} onChange={e => setServiceType(e.target.value)} required className={`${inputCls} appearance-none`}>
                  <option value="self-drive">Self-Drive Only</option>
                  <option value="both">Both Services</option>
                </select>
              </div>
              <input name="pricePerDay" type="number" defaultValue={editing?.pricePerDay} placeholder="Price Per Day (₹)" required className={inputCls} />
              {serviceType === 'both' && (
                <div>
                  <input name="monthlyPrice" type="number" min="0" defaultValue={editing?.monthlyPrice} placeholder="Monthly Price (₹) — shown on Fleet page" required className={inputCls} />
                  <p className="text-[10px] text-zinc-400 font-medium mt-1 ml-1">Per-month price used for the With-Driver Fleet listing.</p>
                </div>
              )}
              <div>
                <input name="securityDeposit" type="number" min="0" defaultValue={editing?.securityDeposit} placeholder="Security Deposit (₹) — optional" className={inputCls} />
                <p className="text-[10px] text-zinc-400 font-medium mt-1 ml-1">Leave blank or 0 for no security deposit on this car.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input name="seats" type="number" defaultValue={editing?.seats} placeholder="Seats" required className={inputCls} />
                <input name="transmission" defaultValue={editing?.transmission} placeholder="Transmission" required className={inputCls} />
              </div>
              <input name="fuel" defaultValue={editing?.fuel} placeholder="Fuel Type" required className={inputCls} />
              <input name="image" defaultValue={editing?.image} placeholder="Image URL" className={inputCls} />
              <input name="features" defaultValue={Array.isArray(editing?.features) ? editing.features.join(', ') : editing?.features} placeholder="Features (comma-separated: GPS,AC,Bluetooth)" className={inputCls} />
              <Button type="submit" disabled={saving} className="w-full bg-brand-500 text-white font-black uppercase tracking-widest h-12 rounded-xl hover:bg-brand-600 disabled:opacity-50">
                {saving ? 'Saving...' : editing ? 'Update Car' : 'Save Car'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
