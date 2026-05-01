'use client'
import { useState } from 'react'
import { MapPin, Phone, Mail, Send, MessageSquare, ChevronRight, Zap, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      toast.success('Message sent! Our team will reach out shortly.')
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    }, 1500)
  }

  return (
    <div className="bg-[#020617] min-h-screen text-white pb-32">
      
      {/* ── CINEMATIC BANNER ── */}
      <section className="relative pt-48 pb-32 overflow-hidden">
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1534536281715-e28d76689b4d?q=80&w=2070&auto=format&fit=crop" 
            alt="Contact Banner" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617]" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 text-amber-500 font-black uppercase tracking-[0.4em] text-[10px] mb-6">
                <span className="opacity-50">Support</span>
                <ChevronRight className="size-3" />
                <span>Concierge Desk</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-10">
                Let's Start A <br />
                <span className="text-amber-500">Conversation.</span>
              </h1>
              <p className="text-slate-400 font-medium text-xl leading-relaxed max-w-2xl">
                Whether you have a specific inquiry about our fleet or just want to say hello, our team is here to assist you 24/7.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-20">
          
          {/* LEFT: INFO CARDS */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 p-10 rounded-[48px] shadow-2xl">
              <h3 className="text-2xl font-black uppercase tracking-tight mb-10">Reach Out</h3>
              
              <div className="space-y-12">
                <div className="flex gap-6 group">
                  <div className="size-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-amber-500 transition-all group-hover:text-slate-950 text-amber-500">
                    <MapPin className="size-6" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Location</h4>
                    <p className="text-white font-bold leading-relaxed">
                      4140 Parker Rd.<br />
                      Allentown, New Mexico 31134
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 group">
                  <div className="size-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-amber-500 transition-all group-hover:text-slate-950 text-amber-500">
                    <Phone className="size-6" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Direct Line</h4>
                    <p className="text-white font-bold leading-relaxed">
                      +91 98765 43210<br />
                      +91 88765 43210
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 group">
                  <div className="size-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-amber-500 transition-all group-hover:text-slate-950 text-amber-500">
                    <Mail className="size-6" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Official Email</h4>
                    <p className="text-white font-bold leading-relaxed">
                      support@kasika.com<br />
                      fleet@kasika.com
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Availability Badge */}
            <div className="bg-amber-500 p-8 rounded-[40px] text-slate-950 flex items-center gap-6 shadow-xl shadow-amber-500/10">
               <Zap className="size-10 fill-slate-950" />
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status</p>
                  <p className="text-xl font-black uppercase tracking-tight">Active & Online 24/7</p>
               </div>
            </div>
          </div>

          {/* RIGHT: CONTACT FORM */}
          <div className="lg:col-span-8">
            <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 p-10 md:p-16 rounded-[48px] shadow-2xl">
              <div className="max-w-2xl">
                <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">Send An Inquiry</h3>
                <p className="text-slate-500 font-medium mb-12">Fill out the form below and a representative will contact you within 2 hours.</p>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Your Name</label>
                      <input 
                        name="name" value={formData.name} onChange={handleChange} required placeholder="Full Name"
                        className="w-full bg-slate-950 border border-white/5 h-16 rounded-2xl px-6 text-sm font-bold text-white focus:outline-none focus:border-amber-500 transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                      <input 
                        type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Email Address"
                        className="w-full bg-slate-950 border border-white/5 h-16 rounded-2xl px-6 text-sm font-bold text-white focus:outline-none focus:border-amber-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone (Optional)</label>
                      <input 
                        name="phone" value={formData.phone} onChange={handleChange} placeholder="+91..."
                        className="w-full bg-slate-950 border border-white/5 h-16 rounded-2xl px-6 text-sm font-bold text-white focus:outline-none focus:border-amber-500 transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Inquiry Subject</label>
                      <input 
                        name="subject" value={formData.subject} onChange={handleChange} required placeholder="Topic"
                        className="w-full bg-slate-950 border border-white/5 h-16 rounded-2xl px-6 text-sm font-bold text-white focus:outline-none focus:border-amber-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Message Detail</label>
                    <textarea 
                      name="message" value={formData.message} onChange={handleChange} required placeholder="How can we help?"
                      className="w-full bg-slate-950 border border-white/5 rounded-3xl p-6 min-h-[200px] text-sm font-bold text-white focus:outline-none focus:border-amber-500 transition-all resize-none leading-relaxed"
                    />
                  </div>

                  <button 
                    type="submit" disabled={loading}
                    className="h-16 px-12 bg-amber-500 text-slate-950 hover:bg-white rounded-2xl transition-all font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl shadow-amber-500/10 active:scale-95 disabled:opacity-50"
                  >
                    {loading ? 'Transmitting...' : 'Dispatch Message'}
                    <Send className="size-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
