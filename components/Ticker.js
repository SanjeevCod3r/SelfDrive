import { Sparkles, Star } from 'lucide-react'

export default function Ticker() {
  const items = [
    "Premium Fleet", "Unlimited Kilometers", "Zero Hidden Charges", "24/7 Roadside Assistance",
    "Doorstep Delivery", "Fully Sanitized", "Comprehensive Insurance", "Flexible Bookings"
  ]
  const doubled = [...items, ...items]

  return (
    <div className="bg-amber-500 py-4 overflow-hidden flex border-y border-amber-600 relative z-20">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center mx-8">
            {i % 2 === 0
              ? <Sparkles className="size-5 text-slate-950 mr-4 flex-shrink-0" />
              : <Star className="size-5 text-slate-950 mr-4 flex-shrink-0" />}
            <span className="text-xl font-black text-slate-950 uppercase tracking-widest">{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
