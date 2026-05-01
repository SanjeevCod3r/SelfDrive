'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Car } from 'lucide-react'

const faqs = [
  {
    question: "How old do I need to be to rent a car?",
    answer: "You must be at least 21 years old to rent a self-drive car with Kasika. For luxury vehicles, the minimum age requirement may be 25 years. A valid driver's license is mandatory."
  },
  {
    question: "What documents do I need to rent a car?",
    answer: "From personalized solutions to expert execution, we prioritize quality, reliability, and customer satisfaction in everything we do. Let us be your trusted partner in achieving success."
  },
  {
    question: "What types of vehicles are available for rent?",
    answer: "We offer a diverse fleet ranging from compact hatchbacks and fuel-efficient sedans to premium SUVs and high-end luxury sports cars."
  },
  {
    question: "Can I rent a car with a debit card?",
    answer: "While we prefer credit cards for security deposits, we do accept debit cards from major banks. Please note that the security deposit amount will be temporarily blocked."
  },
  {
    question: "What is your fuel policy?",
    answer: "We follow a 'Full-to-Full' policy. You will receive the car with a full tank and must return it with a full tank."
  }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(1)

  return (
    <section className="py-32 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        
        <div className="grid lg:grid-cols-12 gap-20 items-start">
          
          {/* Left: Image & Badge (Col-5) */}
          <div className="lg:col-span-5 relative">
            <div className="flex items-center gap-3 text-amber-500 font-black uppercase tracking-[0.4em] text-[10px] mb-8">
               <Car className="size-4" />
               <span>Our FAQs</span>
            </div>
            <h5 className="text-3xl md:text-8xl font-black text-[#020617] uppercase tracking-tighter leading-[0.85] mb-16">
              FREQUENTLY <br /> ASKING ANY <br /> QUESTION
            </h5>

            <div className="relative">
              <div className="rounded-[60px] overflow-hidden shadow-2xl border-8 border-white">
                <img 
                  src="/assests/carRent.jpeg" 
                  alt="Customer Support" 
                  className="w-full h-[400px] object-cover"
                />
              </div>
              
              {/* Massive Experience Badge - Precise Position */}
              <div className="absolute -bottom-10 right-0 lg:-right-12 bg-gradient-to-br from-amber-400 to-amber-600 p-8 lg:p-12 rounded-[50px] shadow-[0_20px_50px_rgba(245,158,11,0.3)] text-slate-950 min-w-[200px] lg:min-w-[240px] border-8 border-white z-10">
                 <p className="text-6xl lg:text-8xl font-black leading-none mb-2 tracking-tighter">10</p>
                 <p className="text-[10px] lg:text-sm font-black uppercase tracking-widest leading-tight">Year of <br/> experience</p>
              </div>
            </div>
          </div>

          {/* Right: Accordion (Col-7) */}
          <div className="lg:col-span-7 space-y-6 lg:pt-24">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className={`border rounded-[40px] transition-all duration-500 overflow-hidden ${
                  openIndex === index 
                    ? 'border-[#020617] shadow-2xl shadow-slate-200' 
                    : 'border-slate-100 bg-white hover:border-amber-200'
                }`}
              >
                <button 
                  onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                  className="w-full px-12 py-9 flex items-center justify-between text-left group"
                >
                  <span className={`text-xl font-black uppercase tracking-tight transition-colors ${
                    openIndex === index ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'
                  }`}>
                    {faq.question}
                  </span>
                  <div className={`size-12 rounded-full flex items-center justify-center transition-all ${
                    openIndex === index ? 'bg-[#0f172a] text-white rotate-180' : 'bg-amber-500 text-white'
                  }`}>
                    <ChevronDown className="size-6" />
                  </div>
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <div className="px-12 pb-10 text-slate-500 font-medium leading-relaxed text-base max-w-2xl">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
