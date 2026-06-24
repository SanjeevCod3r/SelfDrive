'use client'
import { motion } from 'framer-motion'
import { Shield, Lock, Eye, FileText, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Banner */}
      <section className="relative pt-48 pb-24 bg-charcoal-900 overflow-hidden">
        <div className="absolute inset-0">
           <img src="/assests/privacy_banner.png" className="w-full h-full object-cover " alt="Privacy Policy" />
           <div className="absolute inset-0 bg-gradient-to-b from-charcoal-900 via-charcoal-900/80 to-charcoal-900" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 text-amber-500 font-black uppercase tracking-[0.4em] text-[10px] mb-6">
              <Shield className="size-4" />
              <span>Security & Trust</span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.85] mb-8">
              Privacy <span className="text-amber-500">Policy</span>
            </h1>
            <p className="text-zinc-300 font-bold uppercase tracking-widest text-xs max-w-2xl">
              Your trust is our most valuable asset. Learn how we protect and respect your personal information at Kasika.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-32">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="space-y-20">
             
             <div className="space-y-6">
                <div className="flex items-center gap-4 mb-8">
                   <div className="size-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <Eye className="size-6" />
                   </div>
                   <h2 className="text-3xl font-black uppercase tracking-tight text-charcoal-900">Information We Collect</h2>
                </div>
                <p className="text-zinc-700 leading-relaxed font-medium text-lg">
                   We collect information you provide directly to us when you create an account, make a booking, or communicate with us. This includes your name, email address, phone number, driver's license details, and payment information processed securely via Razorpay.
                </p>
             </div>

             <div className="space-y-6">
                <div className="flex items-center gap-4 mb-8">
                   <div className="size-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <Lock className="size-6" />
                   </div>
                   <h2 className="text-3xl font-black uppercase tracking-tight text-charcoal-900">How We Use Your Data</h2>
                </div>
                <p className="text-zinc-700 leading-relaxed font-medium text-lg">
                   Your data is used to process bookings, verify driver eligibility, and provide a personalized experience. We do not sell your personal information to third parties. We may use your email to send updates about your rentals or exclusive Kasika Elite rewards.
                </p>
             </div>

             <div className="space-y-6">
                <div className="flex items-center gap-4 mb-8">
                   <div className="size-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <Shield className="size-6" />
                   </div>
                   <h2 className="text-3xl font-black uppercase tracking-tight text-charcoal-900">Data Security</h2>
                </div>
                <p className="text-zinc-700 leading-relaxed font-medium text-lg">
                   We implement industry-standard security measures to protect your data. All payment transactions are encrypted using Secure Socket Layer (SSL) technology and handled by certified payment processors.
                </p>
             </div>

             <div className="pt-20 border-t border-zinc-200">
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest text-center">
                   Last Updated: October 2023 | Kasika Premium Fleet
                </p>
             </div>

          </div>
        </div>
      </section>
    </div>
  )
}
