import Link from 'next/link'
import { Settings2, Users, Briefcase, Zap, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CarCard({ car, basePath = '/self-drive' }) {
  if (!car) return null

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden group hover:border-brand-300 hover:shadow-[0_24px_60px_-20px_rgba(21,22,27,0.18)] transition-all duration-500 flex flex-col h-full">
      {/* Image Area */}
      <div className="relative h-56 bg-gradient-to-b from-zinc-50 to-zinc-100 p-6 flex items-center justify-center overflow-hidden">
        <img
          src={car.images?.[0] || '/assests/bmw_x5_hero.png'}
          alt={car.name || 'Car Image'}
          className="w-full h-auto object-contain z-0 group-hover:scale-110 transition-transform duration-700 ease-out mix-blend-multiply"
        />
        <div className="absolute top-4 right-4 z-20 bg-brand-500 text-white font-bold uppercase tracking-widest text-[10px] px-3 py-1.5 rounded-full shadow-lg shadow-brand-500/25">
          {car.category || 'Premium'}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-4">
          <h3 className="text-2xl font-black text-charcoal-900 uppercase tracking-tight mb-1">{car.brand} {car.name}</h3>
          <div className="text-brand-600 font-black">₹{car.pricePerDay || '4,999'}<span className="text-zinc-400 text-sm font-medium">/Day</span></div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2 text-zinc-600 font-medium text-sm">
            <Settings2 className="size-4 text-brand-500" /> {car.transmission || 'Automatic'}
          </div>
          <div className="flex items-center gap-2 text-zinc-600 font-medium text-sm">
            <Users className="size-4 text-brand-500" /> {car.seats || '5'} Seats
          </div>
          <div className="flex items-center gap-2 text-zinc-600 font-medium text-sm">
            <Zap className="size-4 text-brand-500" /> {car.fuelType || 'Petrol'}
          </div>
          <div className="flex items-center gap-2 text-zinc-600 font-medium text-sm">
            <Briefcase className="size-4 text-brand-500" /> {car.bags || '2'} Bags
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-zinc-100 flex items-center justify-between">
          <Button asChild variant="ghost" className="text-zinc-500 hover:text-brand-600 hover:bg-transparent uppercase tracking-widest text-xs font-bold px-0">
            <Link href={`${basePath}/${car._id || car.id}`}>View Details</Link>
          </Button>
          <Button asChild className="bg-charcoal-900 text-white hover:bg-brand-500 rounded-xl px-6 font-bold uppercase tracking-widest text-xs transition-all">
            <Link href={`${basePath}/${car._id || car.id}?book=true`}>Book Now <ArrowRight className="size-3 ml-2" /></Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
