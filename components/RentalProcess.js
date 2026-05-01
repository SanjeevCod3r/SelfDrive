import { Car, CalendarCheck, Key } from 'lucide-react'

export default function RentalProcess() {
  const steps = [
    {
      icon: Car,
      title: 'Choose Your Ride',
      desc: 'Browse our premium fleet and select the vehicle that perfectly matches your journey.'
    },
    {
      icon: CalendarCheck,
      title: 'Book & Confirm',
      desc: 'Select your dates, choose a subscription or rental plan, and confirm your booking securely.'
    },
    {
      icon: Key,
      title: 'Drive Away',
      desc: 'Pick up your keys or get the car delivered to your doorstep and enjoy the drive.'
    }
  ]

  return (
    <section className="py-24 bg-slate-900 border-t border-slate-800">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-amber-500 font-bold uppercase tracking-[0.2em] text-[10px] mb-4">How It Works</div>
          <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-6">
            3 Steps to <span className="text-amber-500">Freedom</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-slate-800" />
          
          {steps.map((step, idx) => (
            <div key={idx} className="relative text-center group">
              <div className="relative mx-auto size-24 bg-slate-950 border-4 border-slate-900 rounded-full flex items-center justify-center z-10 mb-6 group-hover:border-amber-500 transition-colors">
                <step.icon className="size-8 text-white group-hover:text-amber-500 transition-colors" />
                <div className="absolute -top-2 -right-2 size-8 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center font-black text-sm">
                  {idx + 1}
                </div>
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-3">{step.title}</h3>
              <p className="text-slate-400 font-medium">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
