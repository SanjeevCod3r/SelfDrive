'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Components
import Hero from '@/components/Hero'
import Ticker from '@/components/Ticker'
import Services from '@/components/Services'
import RentalProcess from '@/components/RentalProcess'
import WhyChooseUs from '@/components/WhyChooseUs'
import LatestBlog from '@/components/LatestBlog'
import FAQ from '@/components/FAQ'
import Testimonials from '@/components/Testimonials'
import PopularCarTypes from '@/components/PopularCarTypes'
import Pricing from '@/components/Pricing'
import OurVehicleFleet from '@/components/OurVehicleFleet'

export default function LandingPage() {
  return (
    <div className="bg-white">
      <Hero />
      <Ticker />

      {/* Our Vehicle Fleet — featured grid with category filter */}
      <OurVehicleFleet />

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
          <Button asChild className="h-24 px-16 rounded-[32px] bg-charcoal-900 text-white font-black text-2xl hover:scale-105 transition-all shadow-2xl uppercase tracking-tight">
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
