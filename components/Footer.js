'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MapPin, Phone, Mail, ArrowRight, MessageSquare } from 'lucide-react'

// Six automotive photos for the grid strip
const GALLERY = [
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80',
  'https://images.unsplash.com/photo-1543465077-db45d34b88a5?w=400&q=80',
  'https://images.unsplash.com/photo-1486496572940-2bb2341fdbdf?w=400&q=80',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=400&q=80',
]

export default function Footer() {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return null

  return (
    <footer className="bg-[#0d0f1c] relative overflow-hidden">

      {/* ── Photo grid strip ── */}
      <div className="grid grid-cols-3 md:grid-cols-6 h-48 md:h-56">
        {GALLERY.map((src, i) => (
          <div key={i} className="relative overflow-hidden group">
            <img
              src={src}
              alt={`Car gallery ${i + 1}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-75 group-hover:brightness-90"
            />
            {/* overlay tint */}
            <div className="absolute inset-0 bg-[#0d0f1c]/20 group-hover:bg-transparent transition-colors duration-500" />
          </div>
        ))}
      </div>

      {/* ── Main footer content ── */}
      <div className="container mx-auto px-6 lg:px-12 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10">

          {/* ── Brand col ── */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/assests/kashika logo.png"
                alt="Kashika Self Drive"
                className="h-14 w-auto object-contain"
              />
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed max-w-[240px]">
              Car Is Where Early Adopters And Innovation Seekers Find Lively Imaginative Tech.
            </p>

            {/* Email subscribe */}
            <div className="relative max-w-[260px]">
              <input
                type="email"
                placeholder="Your Email"
                className="w-full bg-transparent border border-slate-700 rounded-full h-12 pl-5 pr-14 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors placeholder:text-slate-600"
              />
              <button className="absolute right-1 top-1 bottom-1 w-10 bg-amber-500 rounded-full flex items-center justify-center text-white hover:bg-amber-600 transition-colors">
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>

          {/* ── Fleet ── */}
          <div>
            <h3 className="text-white font-black uppercase tracking-widest text-sm mb-7 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-amber-500 inline-block" />
              Our Services
            </h3>
            <ul className="space-y-3.5">
              {[
                { name: 'Self Drive Fleet', href: '/self-drive' },
                { name: 'Chauffeur Fleet', href: '/fleet' },
                { name: 'Elite Membership', href: '/subscriptions' },
                { name: 'Reward Program', href: '/dashboard' },
              ].map(item => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-slate-400 text-sm hover:text-amber-500 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-3 h-px bg-amber-500 transition-all duration-300 inline-block" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Company ── */}
          <div>
            <h3 className="text-white font-black uppercase tracking-widest text-sm mb-7 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-amber-500 inline-block" />
              Company
            </h3>
            <ul className="space-y-3.5">
              {[
                { name: 'About Kasika', href: '/about' },
                { name: 'Latest Blog', href: '/blog' },
                { name: 'Contact Us', href: '/contact' },
                { name: 'Privacy Policy', href: '/privacy' },
                { name: 'Terms of Use', href: '/terms' },
              ].map(item => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-slate-400 text-sm hover:text-amber-500 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-3 h-px bg-amber-500 transition-all duration-300 inline-block" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact ── */}
          <div>
            <h3 className="text-white font-black uppercase tracking-widest text-sm mb-7 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-amber-500 inline-block" />
              Contact Us
            </h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <div className="size-9 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="size-4 text-amber-500" />
                </div>
                <span className="text-slate-400 text-sm leading-relaxed">
                 9X2J+X4R Varanasi, Uttar Pradesh
                </span>
              </li>
              <li className="flex items-center gap-4">
                <div className="size-9 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Phone className="size-4 text-amber-500" />
                </div>
                <a href="tel:+91299 33309" className="text-slate-400 text-sm hover:text-amber-500 transition-colors">
                     + 91 91299 33309
                </a>
              </li>
              <li className="flex items-center gap-4">
                <div className="size-9 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Mail className="size-4 text-amber-500" />
                </div>
                <a href="mailto:gorent@gmail.com" className="text-slate-400 text-sm hover:text-amber-500 transition-colors">
                kashikaselfdrive@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-6 lg:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-9 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
              <MessageSquare className="size-4 text-white" />
            </div>
            <p className="text-slate-500 text-sm">
              © 2025 Kasika. All Rights Reserved.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="text-slate-500 text-sm hover:text-amber-500 transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-slate-500 text-sm hover:text-amber-500 transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>

      {/* ── Go Back Top — vertical right side ── */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="hidden lg:flex fixed bottom-10 right-0 bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.25em] px-2 py-4 rounded-l-xl items-center gap-2 z-40 hover:bg-amber-600 transition-colors shadow-xl"
        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)' }}
      >
        Go Back Top
      </button>
    </footer>
  )
}
