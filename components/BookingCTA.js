import { Button } from '@/components/ui/button'

export default function BookingCTA({ onAuth }) {
  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0">
        <img src="/assests/about_image.jpg" alt="Background" className="w-full h-full object-cover opacity-20 mix-blend-luminosity" />
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-6 leading-[0.9]">
          Become a <span className="text-amber-500">Premium</span> Member
        </h2>
        <p className="text-xl text-slate-300 font-medium max-w-2xl mx-auto mb-10">
          Sign up today and earn <strong className="text-amber-500">500 Bonus Reward Points</strong>. Unlock exclusive discounts, priority bookings, and free upgrades.
        </p>
        <Button onClick={onAuth} className="h-16 px-12 rounded-2xl bg-amber-500 text-slate-950 hover:bg-white font-black uppercase tracking-widest text-sm shadow-xl shadow-amber-500/20 transition-all">
          Join the Club Now
        </Button>
      </div>
    </section>
  )
}
