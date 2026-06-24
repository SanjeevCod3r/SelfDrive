import { motion } from 'framer-motion'
import { ArrowRight, Target, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AboutUs() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] -translate-y-1/2" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="relative">
            <div className="aspect-square md:aspect-[4/3] rounded-[40px] overflow-hidden border border-zinc-200 bg-zinc-50 shadow-[0_10px_40px_-15px_rgba(21,22,27,0.12)] relative">
              <img src="/assests/carsRent.jpeg" alt="Luxury Fleet" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/20 via-transparent to-transparent" />
            </div>
            
            {/* Floating Card */}
            <div className="absolute -bottom-8 -right-8 md:bottom-8 md:-right-8 bg-amber-500 p-8 rounded-[32px] shadow-2xl max-w-xs">
              <Trophy className="size-10 text-charcoal-900 mb-4" />
              <h4 className="text-3xl font-black text-charcoal-900 uppercase tracking-tighter leading-none mb-2">10+ Years</h4>
              <p className="text-charcoal-900 font-bold text-sm uppercase tracking-widest">Of Excellence in Mobility</p>
            </div>
          </div>

          <div>
            <div className="text-amber-500 font-bold uppercase tracking-[0.2em] text-[10px] mb-4">About Kasika</div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-charcoal-900 uppercase tracking-tighter mb-8 leading-[0.9]">
              Redefining <br />
              <span className="text-amber-500">Self-Drive</span> Mobility
            </h2>

            <p className="text-zinc-600 font-medium text-lg leading-relaxed mb-8">
              Kasika was born out of a simple idea: that the journey should be just as exhilarating as the destination. We provide a premium fleet of impeccably maintained vehicles that offer ultimate freedom and comfort.
            </p>

            <div className="grid grid-cols-2 gap-8 mb-10">
              <div>
                <Target className="size-8 text-amber-500 mb-3" />
                <h4 className="text-charcoal-900 font-black uppercase tracking-tight mb-2">Our Mission</h4>
                <p className="text-zinc-500 text-sm font-medium">To democratize luxury travel and provide hassle-free access to top-tier vehicles.</p>
              </div>
              <div>
                <Trophy className="size-8 text-amber-500 mb-3" />
                <h4 className="text-charcoal-900 font-black uppercase tracking-tight mb-2">Our Vision</h4>
                <p className="text-zinc-500 text-sm font-medium">To be India's most trusted and innovative self-drive mobility platform.</p>
              </div>
            </div>

            <Button className="h-14 px-8 rounded-2xl bg-charcoal-900 text-white hover:bg-amber-500 transition-all font-black uppercase tracking-widest text-xs">
              Learn More About Us <ArrowRight className="size-4 ml-2" />
            </Button>
          </div>

        </div>
      </div>
    </section>
  )
}
