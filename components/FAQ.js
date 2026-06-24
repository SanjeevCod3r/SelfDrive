'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Sparkles } from 'lucide-react'

const faqs = [
  {
    question: "How old do I need to be to rent a car?",
    answer: "You must be at least 21 years old to rent a self-drive car with Kasika. For luxury vehicles, the minimum age requirement may be 25 years. A valid driver's license is mandatory."
  },
  {
    question: "What documents do I need to rent a car?",
    answer: "You'll need a valid driving licence, a government-issued photo ID (Aadhaar, passport or voter ID) and a recent address proof. Documents can be uploaded digitally during booking for instant verification."
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
    <section className="relative overflow-hidden bg-zinc-50 py-24 md:py-28">
      <div className="container mx-auto px-6">

        <div className="grid items-start gap-16 lg:grid-cols-12 lg:gap-20">

          {/* Left: Heading + Image + Badge */}
          <div className="relative lg:col-span-5">
            <div className="mb-6 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">
               <Sparkles className="size-3.5" />
               <span>Our FAQs</span>
            </div>
            <h5 className="mb-12 text-4xl font-black uppercase leading-[0.9] tracking-tighter text-charcoal-900 md:text-6xl">
              Frequently Asked <span className="text-amber-500">Questions</span>
            </h5>

            <div className="relative">
              <div className="overflow-hidden rounded-[40px] border-8 border-white shadow-2xl">
                <img
                  src="/assests/carsRent.jpeg"
                  alt="Kasika customer support"
                  className="h-[380px] w-full object-cover"
                />
              </div>

              {/* Experience badge */}
              <div className="absolute -bottom-8 right-0 z-10 min-w-[180px] rounded-[32px] border-8 border-white bg-gradient-to-br from-amber-400 to-amber-600 p-8 text-white shadow-[0_20px_50px_rgba(242,106,33,0.3)] lg:-right-8">
                 <p className="mb-1 text-6xl font-black leading-none tracking-tighter">10</p>
                 <p className="text-[10px] font-black uppercase leading-tight tracking-widest">Years of <br/> experience</p>
              </div>
            </div>
          </div>

          {/* Right: Accordion */}
          <div className="space-y-4 lg:col-span-7 lg:pt-4">
            {faqs.map((faq, index) => {
              const open = openIndex === index
              return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className={`overflow-hidden rounded-[24px] border transition-all duration-500 ${
                  open
                    ? 'border-amber-500 bg-white shadow-[0_10px_40px_-20px_rgba(242,106,33,0.4)]'
                    : 'border-zinc-200 bg-white hover:border-amber-300'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(open ? -1 : index)}
                  className="group flex w-full items-center justify-between gap-4 px-7 py-6 text-left"
                >
                  <span className={`text-base font-black uppercase tracking-tight transition-colors md:text-lg ${
                    open ? 'text-charcoal-900' : 'text-zinc-600 group-hover:text-charcoal-900'
                  }`}>
                    {faq.question}
                  </span>
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                    open ? 'rotate-180 bg-charcoal-900 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    <ChevronDown className="size-5" />
                  </div>
                </button>
                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="max-w-2xl px-7 pb-7 text-sm font-medium leading-relaxed text-zinc-600">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              )
            })}
          </div>

        </div>
      </div>
    </section>
  )
}
