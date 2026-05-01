'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, User, LogOut, Settings, LayoutDashboard,
  PhoneCall, Award
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
    <header className={`fixed top-0 inset-x-0 z-[100] transition-all duration-300 ${
      isScrolled ? 'bg-white/90 backdrop-blur-xl shadow-xl py-3' : 'bg-white shadow-md py-4'
    }`}>
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <img src="/assests/kashika logo.png" alt="Kasika Logo" className="h-12 w-auto object-contain transition-transform group-hover:scale-110 duration-500" />
            <div className="flex flex-col">
              <span className="text-2xl font-black leading-none tracking-tighter text-slate-900">
                Kasika<span className="text-amber-500">.</span>
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
                    <div className="size-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white hover:bg-amber-500 transition-all">
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
                  className="bg-amber-500 text-white hover:bg-slate-900 font-black uppercase tracking-[0.2em] text-[10px] h-12 px-8 rounded-2xl transition-all shadow-xl shadow-amber-500/10"
                >
                  Join Kasika
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-3 rounded-xl bg-slate-100 text-slate-900 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden absolute left-0 right-0 top-full bg-white border-t border-slate-100 shadow-2xl p-8 flex flex-col gap-6 max-h-[85vh] overflow-y-auto"
          >
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-2xl font-black uppercase tracking-tighter ${pathname === link.href ? 'text-amber-500' : 'text-slate-400 hover:text-slate-900'}`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="pt-8 border-t border-slate-50 flex flex-col gap-6">
               <div className="flex items-center gap-4">
                 <div className="size-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white">
                   <PhoneCall className="size-6" />
                 </div>
                 <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Direct Support</p>
                   <p className="text-xl font-black text-slate-900">+91 98765 43210</p>
                 </div>
               </div>
               {!user && (
                 <Button onClick={() => { openAuth('login'); setMobileMenuOpen(false) }} className="bg-slate-900 text-white h-16 rounded-2xl font-black uppercase tracking-widest text-xs">
                   Get Started
                 </Button>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
