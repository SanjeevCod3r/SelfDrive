'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Plus, Trash2, Edit2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminFleetCars() {
  const { api } = useAuth()
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCars()
  }, [])

  const fetchCars = async () => {
    try {
      // Get all cars and filter for with-driver or both
      const data = await api('/cars?serviceType=with-driver')
      setCars(data.cars)
    } finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this car?')) return
    await api(`/admin/cars/${id}`, { method: 'DELETE' })
    fetchCars()
  }

  const handleAddCar = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)
    // Parse features from comma-separated string to array
    const features = data.features
      ? data.features.split(',').map(f => f.trim()).filter(Boolean)
      : []
    await api('/admin/cars', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        pricePerDay: parseInt(data.pricePerDay),
        seats: parseInt(data.seats),
        serviceType: data.serviceType || 'with-driver',
        features,
        available: true,
      })
    })
    e.target.reset()
    fetchCars()
  }

  return (
    <div>
      <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-8">Manage Fleet (With Driver) Cars</h2>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {loading ? <Zap className="size-8 text-amber-500 animate-pulse" /> : cars.length > 0 ? cars.map(car => (
            <div key={car.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
              <img src={car.image || '/assests/bmw_x5_hero.png'} alt={car.name} className="size-16 object-cover rounded-xl" />
              <div className="flex-1">
                <h4 className="text-white font-black uppercase">{car.brand} {car.name}</h4>
                <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                  {car.type} &middot; ₹{car.pricePerDay}/day &middot; {car.serviceType}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" className="size-10 p-0 text-slate-500 hover:text-white"><Edit2 className="size-4" /></Button>
                <Button onClick={() => handleDelete(car.id)} variant="ghost" className="size-10 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"><Trash2 className="size-4" /></Button>
              </div>
            </div>
          )) : (
            <div className="text-slate-500 font-bold uppercase tracking-widest text-center py-12 bg-slate-950 border border-slate-800 rounded-2xl">
              No fleet cars found
            </div>
          )}
        </div>

        <div>
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sticky top-8">
            <h3 className="text-lg font-black text-white uppercase tracking-tight mb-4 flex items-center gap-2"><Plus className="size-5 text-amber-500"/> Add New Fleet Car</h3>
            <form onSubmit={handleAddCar} className="space-y-4">
              <input name="name" placeholder="Car Name (e.g. Innova)" required className="w-full bg-slate-900 border border-slate-800 h-12 rounded-xl px-4 text-white" />
              <input name="brand" placeholder="Brand (e.g. Toyota)" required className="w-full bg-slate-900 border border-slate-800 h-12 rounded-xl px-4 text-white" />
              <div className="grid grid-cols-2 gap-4">
                <input name="type" placeholder="Category (e.g. MPV)" required className="w-full bg-slate-900 border border-slate-800 h-12 rounded-xl px-4 text-white" />
                <select name="serviceType" defaultValue="with-driver" required className="w-full bg-slate-900 border border-slate-800 h-12 rounded-xl px-4 text-white appearance-none">
                  <option value="with-driver">Fleet Only (With Driver)</option>
                  <option value="both">Both Services</option>
                </select>
              </div>
              <input name="pricePerDay" type="number" placeholder="Price Per Day (₹)" required className="w-full bg-slate-900 border border-slate-800 h-12 rounded-xl px-4 text-white" />
              <div className="grid grid-cols-2 gap-4">
                <input name="seats" type="number" placeholder="Seats" required className="w-full bg-slate-900 border border-slate-800 h-12 rounded-xl px-4 text-white" />
                <input name="transmission" placeholder="Transmission" required className="w-full bg-slate-900 border border-slate-800 h-12 rounded-xl px-4 text-white" />
              </div>
              <input name="fuel" placeholder="Fuel Type (e.g. Diesel)" required className="w-full bg-slate-900 border border-slate-800 h-12 rounded-xl px-4 text-white" />
              <input name="location" placeholder="City (e.g. Mumbai)" required className="w-full bg-slate-900 border border-slate-800 h-12 rounded-xl px-4 text-white" />
              <input name="image" placeholder="Image URL" className="w-full bg-slate-900 border border-slate-800 h-12 rounded-xl px-4 text-white" />
              <input name="description" placeholder="Short description (optional)" className="w-full bg-slate-900 border border-slate-800 h-12 rounded-xl px-4 text-white" />
              <input name="features" placeholder="Features (comma-separated: GPS,AC,Bluetooth)" className="w-full bg-slate-900 border border-slate-800 h-12 rounded-xl px-4 text-white" />
              <Button type="submit" className="w-full bg-amber-500 text-slate-950 font-black uppercase tracking-widest h-12 rounded-xl">Save Car</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
