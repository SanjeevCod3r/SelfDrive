'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, Trash2, Edit2, Zap, Clock, 
  CreditCard, CheckCircle2, X, List, Package as PackageIcon,
  ShieldCheck, Star
} from 'lucide-react'
import { toast } from 'sonner'

export default function AdminPackages() {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '',
    features: ''
  })

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/admin/packages')
      const data = await res.json()
      setPackages(data.packages || [])
    } catch (e) {
      toast.error('Failed to load packages')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          id: editingPackage?.id
        })
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success(editingPackage ? 'Package updated' : 'Package created')
      setShowModal(false)
      setEditingPackage(null)
      setFormData({ name: '', price: '', duration: '', features: '' })
      fetchPackages()
    } catch (e) {
      toast.error(e.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return
    try {
      const res = await fetch(`/api/admin/packages/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      toast.success('Package removed')
      fetchPackages()
    } catch (e) {
      toast.error(e.message)
    }
  }

  const openEdit = (pkg) => {
    setEditingPackage(pkg)
    setFormData({
      name: pkg.name,
      price: pkg.price,
      duration: pkg.duration,
      features: Array.isArray(pkg.features) ? pkg.features.join(', ') : pkg.features
    })
    setShowModal(true)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
            Subscription <span className="text-amber-500">Packages</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Manage user membership plans</p>
        </div>
        <button 
          onClick={() => { setEditingPackage(null); setFormData({ name: '', price: '', duration: '', features: '' }); setShowModal(true); }}
          className="bg-amber-500 text-slate-950 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-white transition-all shadow-xl shadow-amber-500/20 active:scale-95"
        >
          <Plus className="size-4" /> Create Package
        </button>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-64 bg-slate-900/50 rounded-[40px] animate-pulse border border-white/5" />)
        ) : packages.map((pkg) => (
          <motion.div 
            key={pkg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-slate-900/40 backdrop-blur-xl border border-white/5 p-10 rounded-[48px] hover:border-amber-500/30 transition-all duration-500 flex flex-col relative overflow-hidden"
          >
            {/* Top Badge */}
            <div className="absolute top-0 right-0 p-8">
               <PackageIcon className="size-12 text-white/5 group-hover:text-amber-500/20 transition-colors" />
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-amber-500 transition-colors">{pkg.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">₹{pkg.price}</span>
                <span className="text-xs font-bold text-slate-500 uppercase">/ {pkg.duration} Days</span>
              </div>
            </div>

            <div className="space-y-4 mb-10 flex-1">
              {(Array.isArray(pkg.features) ? pkg.features : []).map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 text-slate-400">
                  <CheckCircle2 className="size-4 text-amber-500" />
                  <span className="text-xs font-bold tracking-wide">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 pt-8 border-t border-white/5">
              <button 
                onClick={() => openEdit(pkg)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white h-12 rounded-xl flex items-center justify-center gap-2 transition-all font-black uppercase tracking-widest text-[10px]"
              >
                <Edit2 className="size-3.5 text-amber-500" /> Edit
              </button>
              <button 
                onClick={() => handleDelete(pkg.id)}
                className="size-12 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl flex items-center justify-center transition-all border border-red-500/20"
              >
                <Trash2 className="size-4" />
              </button>
            </div>

            {/* Background Decoration */}
            <div className="absolute -bottom-10 -left-10 size-40 bg-amber-500/5 rounded-full blur-3xl" />
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-[48px] p-10 md:p-14 shadow-2xl overflow-hidden"
            >
              <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">
                <X className="size-6" />
              </button>

              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-10">
                {editingPackage ? 'Update' : 'Create'} <span className="text-amber-500">Package</span>
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Package Name</label>
                  <input 
                    required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Monthly Premium"
                    className="w-full bg-slate-950 border border-white/5 h-16 rounded-2xl px-6 text-sm font-bold text-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Price (₹)</label>
                    <input 
                      type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                      placeholder="999"
                      className="w-full bg-slate-950 border border-white/5 h-16 rounded-2xl px-6 text-sm font-bold text-white focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Duration (Days)</label>
                    <input 
                      type="number" required value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})}
                      placeholder="30"
                      className="w-full bg-slate-950 border border-white/5 h-16 rounded-2xl px-6 text-sm font-bold text-white focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Features (comma separated)</label>
                  <textarea 
                    required value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})}
                    placeholder="5% off bookings, Priority support, Free cancellation"
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl p-6 min-h-[120px] text-sm font-bold text-white focus:border-amber-500 outline-none resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full h-16 bg-amber-500 hover:bg-white text-slate-950 font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-xl shadow-amber-500/20 mt-4"
                >
                  {editingPackage ? 'Update Package' : 'Publish Package'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
