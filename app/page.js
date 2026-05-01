'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/AuthProvider'

// Components
import Hero from '@/components/Hero'
import Ticker from '@/components/Ticker'
import Services from '@/components/Services'
import AboutUs from '@/components/AboutUs'
import RentalProcess from '@/components/RentalProcess'
import BookingCTA from '@/components/BookingCTA'
import WhyChooseUs from '@/components/WhyChooseUs'
import FunFacts from '@/components/FunFacts'
import CarCard from '@/components/CarCard'
import LatestBlog from '@/components/LatestBlog'
import FAQ from '@/components/FAQ'
import Testimonials from '@/components/Testimonials'
import PopularCarTypes from '@/components/PopularCarTypes'
import Pricing from '@/components/Pricing'

export default function LandingPage() {
  const { api, openAuth } = useAuth()
  const [featuredCars, setFeaturedCars] = useState([])

  useEffect(() => {
    api('/cars').then(data => {
      const selfDrive = data.cars.filter(c => c.serviceType === 'self-drive')
      setFeaturedCars(selfDrive.length > 0 ? selfDrive.slice(0, 3) : data.cars.slice(0, 3))
    }).catch(console.error)
  }, [api])

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8 }
  }

  return (
    <div className="bg-white">
      <Hero />
      <Ticker />
      


      {/* Featured Cars Section */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 size-[600px] bg-amber-500/5 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
            <motion.div {...fadeInUp}>
              <div className="flex items-center gap-2 text-amber-500 font-black uppercase tracking-[0.3em] text-[10px] mb-4">
                <Sparkles className="size-4" />
                <span>Premium Fleet</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-[0.9]">
                Featured <span className="text-amber-500">Rides</span> <br />
                Ready for the road
              </h2>
            </motion.div>
            
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.2 }}
            >
              <Button asChild variant="outline" className="h-16 px-8 rounded-2xl border-white/10 text-white hover:bg-amber-500 hover:text-slate-950 transition-all uppercase tracking-widest font-black text-xs">
                <Link href="/fleet">
                  Explore Full Fleet <ArrowRight className="size-4 ml-2" />
                </Link>
              </Button>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCars.map((car, index) => (
              <motion.div 
                key={car.id}
                {...fadeInUp}
                transition={{ delay: index * 0.1 }}
                className="h-full"
              >
                <CarCard car={car} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <PopularCarTypes />
      <WhyChooseUs />
      <Services />
     
      
      <Pricing />

      <RentalProcess />
      
      <FAQ />
      <Testimonials />
      <LatestBlog />

      {/* Final Booking Drive Section */}
      <section className="py-24 bg-amber-500 relative overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-8xl font-black text-slate-950 uppercase tracking-tighter mb-10 leading-none">
            Don't just travel. <br />
            <span className="text-white">Drive your destiny.</span>
          </h2>
          <Button asChild className="h-24 px-16 rounded-[32px] bg-slate-950 text-white font-black text-2xl hover:scale-105 transition-all shadow-2xl uppercase tracking-tight">
            <Link href="/self-drive">Book Your Adventure Now</Link>
          </Button>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[300px] font-black text-white/10 select-none pointer-events-none uppercase tracking-tighter">
          Kasika
        </div>
      </section>
    </div>
  )
}
