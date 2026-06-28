'use client'
import { useState } from 'react'
import { MapPin, Phone, Mail, Send, Sparkles, Zap } from 'lucide-react'
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Save the submission so it shows up in the admin panel
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send message')

      setSuccess(true)
      toast.success('Message sent! Our team will reach out shortly.')
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (error) {
      toast.error(error.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-zinc-50 min-h-screen text-charcoal-900 pb-32">
      
      {/* ── CINEMATIC BANNER ── */}
      <section className="relative flex min-h-[60vh] items-center overflow-hidden bg-charcoal-950 pb-40">
        <img
          src="https://images.unsplash.com/photo-1534536281715-e28d76689b4d?q=80&w=2400&auto=format&fit=crop"
          alt="Contact Kashi Ka"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-950 via-charcoal-950/85 to-charcoal-950/30" />
        <div className="pointer-events-none absolute -left-20 top-1/3 size-[500px] rounded-full bg-amber-500/20 blur-[150px]" />

        <div className="container mx-auto px-6 relative z-10 pt-28">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            className="max-w-4xl"
          >
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 backdrop-blur-md text-amber-400 font-black uppercase tracking-[0.3em] text-[10px]"
            >
              <Sparkles className="size-3.5" />
              <span>Concierge Desk</span>
            </motion.div>
            <motion.h1
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
              className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-8 text-white"
            >
              Let's Start A <br />
              <span className="text-amber-500">Conversation.</span>
            </motion.h1>
            <motion.p
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
              className="text-zinc-300 font-medium text-lg md:text-xl leading-relaxed max-w-2xl"
            >
              Whether you have a specific inquiry about our fleet or just want to say hello, our team is here to assist you 24/7.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── MAIN CONTENT (overlaps banner) ── */}
      <main className="container mx-auto px-6 lg:px-12 relative z-20 -mt-28">
        <div className="grid lg:grid-cols-12 gap-20">
          
          {/* LEFT: INFO CARDS */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-4 space-y-8"
          >
            <div className="bg-white border border-zinc-200 p-10 rounded-[32px] shadow-[0_10px_40px_-20px_rgba(21,22,27,0.15)]">
              <h3 className="text-2xl font-black uppercase tracking-tight mb-10 text-charcoal-900">Reach Out</h3>

              <div className="space-y-10">
                
                {[
                  { icon: MapPin, label: 'Main Branch', lines: ['Bhubaneswar Nagar Colony, Gate No. 3,', 'Near Electrical Orderly Bazar, Varanasi, UP 221002'] },
                  { icon: MapPin, label: 'Sheel Nagar Branch', lines: ['B-38/55 A23-S, Sheel Nagar,', 'Mahmoorganj, Varanasi'] },
                  { icon: MapPin, label: 'BHU / Lanka Branch', lines: ['B.32/19-B-1, Nariya, Bhogabeer Road,', 'BHU, Lanka, Varanasi'] },
                  { icon: Phone, label: 'Direct Line', lines: ['+91 73178 93339', '+91 73178 93331', '+91 73178 93332'] },
                  { icon: Mail, label: 'Official Email', lines: ['kashikaselfdrive@gmail.com'] },
                ].map((info, idx) => (
                  <div key={idx} className="flex gap-6 group">
                    <div className="size-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center shrink-0 text-amber-500 transition-all group-hover:bg-amber-500 group-hover:text-white group-hover:scale-105">
                      <info.icon className="size-6" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">{info.label}</h4>
                      <p className="text-charcoal-900 font-bold leading-relaxed">
                        {info.lines.map((line, i) => (
                          <span key={i}>{line}{i < info.lines.length - 1 && <br />}</span>
                        ))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* RIGHT: CONTACT FORM */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-8"
          >
            <div className="bg-white border border-zinc-200 p-10 md:p-14 rounded-[32px] shadow-[0_10px_40px_-20px_rgba(21,22,27,0.15)]">
              <div className="max-w-2xl">
                <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 text-charcoal-900">Send An Inquiry</h3>
                <p className="text-zinc-500 font-medium mb-12">Fill out the form below and a representative will contact you within 2 hours.</p>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Your Name</label>
                      <input 
                        name="name" value={formData.name} onChange={handleChange} required placeholder="Full Name"
                        className="w-full bg-white border border-zinc-200 h-16 rounded-2xl px-6 text-sm font-bold text-charcoal-900 placeholder:text-zinc-400 focus:outline-none focus:border-brand-500 transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
                      <input 
                        type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Email Address"
                        className="w-full bg-white border border-zinc-200 h-16 rounded-2xl px-6 text-sm font-bold text-charcoal-900 placeholder:text-zinc-400 focus:outline-none focus:border-brand-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Phone (Optional)</label>
                      <input 
                        name="phone" value={formData.phone} onChange={handleChange} placeholder="+91..."
                        className="w-full bg-white border border-zinc-200 h-16 rounded-2xl px-6 text-sm font-bold text-charcoal-900 placeholder:text-zinc-400 focus:outline-none focus:border-brand-500 transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Inquiry Subject</label>
                      <input 
                        name="subject" value={formData.subject} onChange={handleChange} required placeholder="Topic"
                        className="w-full bg-white border border-zinc-200 h-16 rounded-2xl px-6 text-sm font-bold text-charcoal-900 placeholder:text-zinc-400 focus:outline-none focus:border-brand-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Message Detail</label>
                    <textarea 
                      name="message" value={formData.message} onChange={handleChange} required placeholder="How can we help?"
                      className="w-full bg-white border border-zinc-200 rounded-3xl p-6 min-h-[200px] text-sm font-bold text-charcoal-900 placeholder:text-zinc-400 focus:outline-none focus:border-brand-500 transition-all resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit" disabled={loading}
                    className="h-16 px-12 bg-brand-500 text-white hover:bg-brand-600 rounded-2xl transition-all font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl shadow-amber-500/10 active:scale-95 disabled:opacity-50"
                  >
                    {loading ? 'Transmitting...' : 'Dispatch Message'}
                    <Send className="size-4" />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  )
}
