'use client'
import { motion } from 'framer-motion'
import { Quote, Star, ArrowRight } from 'lucide-react'

const reviews = [
  {
    name: "Jessica Brown",
    role: "Customer",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop",
    text: "maintaining oral health through practices such as the regular check-a ups, cleanings, and treatments for teeth and an gums."
  },
  {
    name: "Adam Smith",
    role: "Customer",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop",
    text: "maintaining oral health through practices such as the regular check-a ups, cleanings, and treatments for teeth and an gums."
  },
  {
    name: "Adam Milne",
    role: "Customer",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop",
    text: "maintaining oral health through practices such as the regular check-a ups, cleanings, and treatments for teeth and an gums."
  }
]

export default function Testimonials() {
  return (
    <section className="py-32 bg-[#020617] overflow-hidden">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
          <div>
            <div className="flex items-center gap-3 text-amber-500 font-black uppercase tracking-[0.4em] text-[10px] mb-6">
               <div className="w-10 h-px bg-amber-500" />
               <span>Our Testimonial</span>
            </div>
            <h2 className="text-3xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none">
              What Peoples Say <br /> <span className="text-amber-500">About Kasika</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
             <button className="size-16 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:bg-amber-500 hover:border-amber-500 hover:text-white transition-all shadow-lg">
                <ArrowRight className="size-7 rotate-180" />
             </button>
             <button className="size-16 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 hover:bg-white transition-all shadow-xl shadow-amber-500/20">
                <ArrowRight className="size-7" />
             </button>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {reviews.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative group bg-slate-900/50 border border-white/5 rounded-[50px] p-12 pt-20 shadow-2xl hover:border-amber-500/20 transition-all duration-500"
            >
              {/* Massive Floating Quote Icon */}
              <div className="absolute top-6 right-6 lg:-right-6 lg:-top-6 size-16 bg-amber-500 rounded-full flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/30 border-8 border-[#020617] group-hover:scale-110 transition-transform duration-500">
                 <Quote className="size-7 fill-slate-950 stroke-[3]" />
              </div>

              {/* Author Header */}
              <div className="flex items-center gap-6 mb-10">
                 <div className="size-20 rounded-[28px] overflow-hidden border-2 border-amber-500/20 group-hover:border-amber-500 transition-colors duration-500 shadow-lg">
                    <img src={review.image} alt={review.name} className="w-full h-full object-cover" />
                 </div>
                 <div>
                    <h4 className="text-xl font-black uppercase tracking-tight text-white mb-1">{review.name}</h4>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{review.role}</p>
                 </div>
              </div>

              {/* Text */}
              <p className="text-slate-400 font-medium leading-relaxed mb-10 text-lg italic">
                "{review.text}"
              </p>

              {/* Gold Stars */}
              <div className="flex items-center gap-1.5 pt-6 border-t border-white/5">
                 {[1,2,3,4,5].map(star => (
                   <Star key={star} className="size-4 text-amber-500 fill-amber-500" />
                 ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
