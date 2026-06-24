'use client'
import { motion } from 'framer-motion'
import { FileText, Scale, Zap, Info, CheckCircle2 } from 'lucide-react'

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Banner */}
      <section className="relative pt-48 pb-24 bg-charcoal-900 overflow-hidden">
        <div className="absolute inset-0">
           <img src="/assests/terms_banner.png" className="w-full h-full object-cover" alt="Terms and Conditions" />
           <div className="absolute inset-0 bg-gradient-to-b from-charcoal-900 via-charcoal-900/80 to-charcoal-900" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 text-amber-500 font-black uppercase tracking-[0.4em] text-[10px] mb-6">
              <Scale className="size-4" />
              <span>Legal Framework</span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.85] mb-8">
              Terms & <br /> <span className="text-amber-500">Conditions</span>
            </h1>
            <p className="text-zinc-300 font-bold uppercase tracking-widest text-xs max-w-2xl">
              The rules of the road for Kashi Ka. Please read these terms carefully before booking your premium experience.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-32">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="space-y-16">
             
             <div className="bg-white rounded-[40px] p-10 lg:p-14 border border-zinc-200 shadow-[0_10px_40px_-15px_rgba(21,22,27,0.12)]">
                <h2 className="text-3xl font-black uppercase tracking-tight text-charcoal-900 mb-8 flex items-center gap-4">
                   <div className="size-10 bg-amber-500 rounded-xl flex items-center justify-center text-charcoal-900"><Zap className="size-5" /></div>
                   Booking & Eligibility
                </h2>
                <div className="space-y-4">
                   {[
                     "Minimum age for self-drive is 21 years (25 for Luxury Fleet).",
                     "A valid original driver's license must be presented at pickup.",
                     "Security deposits vary by vehicle class and are fully refundable.",
                     "Bookings are subject to vehicle availability and verification."
                   ].map((item, i) => (
                     <div key={i} className="flex items-center gap-4 text-zinc-700 font-medium">
                        <CheckCircle2 className="size-4 text-amber-500 shrink-0" />
                        <span>{item}</span>
                     </div>
                   ))}
                </div>
             </div>

             <div className="grid md:grid-cols-2 gap-8">
                <div className="p-10 bg-white border border-zinc-200 rounded-[40px] shadow-[0_10px_40px_-15px_rgba(21,22,27,0.12)]">
                   <h3 className="text-xl font-black uppercase tracking-tight text-charcoal-900 mb-6">Usage Policy</h3>
                   <p className="text-zinc-700 text-sm leading-relaxed font-medium">
                      Vehicles must be used within the geographic limits specified in your rental agreement. Off-roading, racing, or using the vehicle for commercial haulage is strictly prohibited.
                   </p>
                </div>
                <div className="p-10 bg-white border border-zinc-200 rounded-[40px] shadow-[0_10px_40px_-15px_rgba(21,22,27,0.12)]">
                   <h3 className="text-xl font-black uppercase tracking-tight text-charcoal-900 mb-6">Cancellations</h3>
                   <p className="text-zinc-700 text-sm leading-relaxed font-medium">
                      Free cancellation is available up to 24 hours before the scheduled pickup. Late cancellations may incur a fee of 20% of the booking amount.
                   </p>
                </div>
             </div>

             <div className="p-10 border-2 border-dashed border-zinc-200 rounded-[40px]">
                <h3 className="text-xl font-black uppercase tracking-tight text-charcoal-900 mb-6 flex items-center gap-3">
                   <Info className="size-5 text-amber-500" /> Damage & Liability
                </h3>
                <p className="text-zinc-700 leading-relaxed font-medium">
                   In case of any damage, the user's liability is limited to the insurance deductible amount, provided all traffic laws and terms were followed. For gross negligence or driving under influence, the user assumes full liability for all damages.
                </p>
             </div>

          </div>
        </div>
      </section>
    </div>
  )
}
