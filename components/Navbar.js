'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, User, LogOut, Settings, LayoutDashboard,
  PhoneCall, Award, ChevronRight, Crown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/AuthProvider'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  let auth = null
  try { auth = useAuth() } catch (e) {}

  const user = auth?.user
  const openAuth = auth?.openAuth || (() => {})
  const logout = auth?.logout || (() => {})

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (pathname.startsWith('/admin')) return null

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Self Drive', href: '/self-drive' },
    { name: 'Fleet', href: '/fleet' },
    { name: 'Subscription', href: '/subscriptions' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <>
    <header className={`fixed top-0 inset-x-0 z-[100] transition-all duration-300 ${
      isScrolled ? 'bg-white/90 backdrop-blur-xl shadow-xl py-3' : 'bg-white shadow-md py-4'
    }`}>
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <img src="/assests/kashika logo.png" alt="Kashi Ka Logo" className="h-12 w-auto object-contain transition-transform group-hover:scale-110 duration-500" />
            <div className="flex flex-col">
              <span className="text-2xl font-black leading-none tracking-tighter text-slate-900">
                Kashi Ka<span className="text-amber-500">.</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative text-[11px] font-black uppercase tracking-[0.15em] transition-all hover:scale-105 ${
                    isActive ? 'text-amber-500' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div layoutId="nav-indicator" className="absolute -bottom-2 left-0 h-[2px] w-full bg-amber-500 rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                <PhoneCall className="size-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inquiry</span>
                <span className="text-sm font-black tracking-tight text-slate-900">+91 91299 33309</span>
              </div>
            </div>

            {/* Auth Section */}
            <div className="flex items-center gap-4 pl-8 border-l border-slate-100">
              {user ? (
                <div className="relative group">
                  <button className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-charcoal-900 flex items-center justify-center text-white hover:bg-amber-500 transition-all">
                      <User className="size-4" />
                    </div>
                  </button>
                  <div className="absolute right-0 top-full mt-4 w-56 bg-white border border-slate-100 rounded-3xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right scale-95 group-hover:scale-100 p-2 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-50 mb-2">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rewards Balance</p>
                       <p className="text-amber-500 font-black text-sm">{user.points || 0} Points</p>
                    </div>
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-700 hover:text-amber-500 hover:bg-slate-50 rounded-2xl transition-all">
                      <LayoutDashboard className="size-4" /> Dashboard
                    </Link>
                    {user.role === 'admin' && (
                      <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-700 hover:text-amber-500 hover:bg-slate-50 rounded-2xl transition-all">
                        <Settings className="size-4" /> Admin Panel
                      </Link>
                    )}
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                      <LogOut className="size-4" /> Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Button 
                  onClick={() => openAuth('login')} 
                  className="bg-amber-500 text-white hover:bg-charcoal-900 font-black uppercase tracking-[0.2em] text-[10px] h-12 px-8 rounded-2xl transition-all shadow-xl shadow-amber-500/10"
                >
                  Join Kashi Ka
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            aria-label="Open menu"
            className="lg:hidden flex size-11 items-center justify-center rounded-xl bg-charcoal-900 text-white transition-colors active:scale-95"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>
    </header>

    {/* ── Mobile Drawer (outside header so its fixed positioning isn't
        trapped by the header's backdrop-blur containing block) ── */}
    <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 z-[110] bg-charcoal-950/60 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed inset-y-0 right-0 z-[120] flex w-[86%] max-w-sm flex-col bg-white shadow-2xl"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                  <img src="/assests/kashika logo.png" alt="Kashi Ka" className="h-9 w-auto object-contain" />
                  <span className="text-xl font-black tracking-tighter text-charcoal-900">Kashi Ka<span className="text-amber-500">.</span></span>
                </Link>
                <button
                  aria-label="Close menu"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex size-10 items-center justify-center rounded-xl bg-zinc-100 text-charcoal-900 transition-colors hover:bg-zinc-200 active:scale-95"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* User strip */}
              {user && (
                <div className="mx-6 mt-6 flex items-center gap-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500 text-white shrink-0">
                    <User className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black uppercase tracking-tight text-charcoal-900">{user.name || 'Member'}</p>
                    <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-600">
                      <Award className="size-3" /> {user.points || 0} Points
                    </p>
                  </div>
                </div>
              )}

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto px-6 py-6">
                <div className="flex flex-col gap-1">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between rounded-2xl px-4 py-4 text-sm font-black uppercase tracking-widest transition-all ${
                          isActive
                            ? 'bg-charcoal-900 text-white'
                            : 'text-slate-600 hover:bg-zinc-50 hover:text-charcoal-900'
                        }`}
                      >
                        {link.name}
                        <ChevronRight className={`size-4 ${isActive ? 'text-amber-500' : 'text-zinc-300'}`} />
                      </Link>
                    )
                  })}

                  {user && (
                    <>
                      <div className="my-3 h-px bg-zinc-100" />
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-2xl px-4 py-4 text-sm font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-zinc-50 hover:text-charcoal-900">
                        <LayoutDashboard className="size-4 text-amber-500" /> Dashboard
                      </Link>
                      {user.role === 'admin' && (
                        <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-2xl px-4 py-4 text-sm font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-zinc-50 hover:text-charcoal-900">
                          <Settings className="size-4 text-amber-500" /> Admin Panel
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </nav>

              {/* Footer: contact + auth */}
              <div className="border-t border-zinc-100 p-6 space-y-5">
                <a href="tel:+919129933309" className="flex items-center gap-4">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-500 text-white shrink-0">
                    <PhoneCall className="size-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Direct Support</p>
                    <p className="text-base font-black tracking-tight text-charcoal-900">+91 91299 33309</p>
                  </div>
                </a>

                {user ? (
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false) }}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-red-50 py-4 text-xs font-black uppercase tracking-widest text-red-500 transition-all hover:bg-red-100 active:scale-95"
                  >
                    <LogOut className="size-4" /> Sign Out
                  </button>
                ) : (
                  <button
                    onClick={() => { openAuth('login'); setMobileMenuOpen(false) }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-4 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-charcoal-900 active:scale-95"
                  >
                    <Crown className="size-4" /> Join Kashi Ka
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
