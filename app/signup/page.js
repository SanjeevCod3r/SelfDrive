'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, Shield, Star, Gift } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

export default function SignupPage() {
  const router = useRouter()
  const { signup } = useAuth()

  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const data = Object.fromEntries(new FormData(e.target))
    if (data.password.length < 6) {
      setError('Password must be at least 6 characters.')
      setLoading(false)
      return
    }
    const res = await signup(data)
    setLoading(false)
    if (res.success) {
      router.push('/')
    } else {
      setError(res.error || 'Something went wrong. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL — white form ── */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12 order-2 lg:order-1">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[420px]"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/">
              <img
                src="/assests/kashika logo.png"
                alt="Kashika Self Drive"
                className="h-16 w-auto object-contain mx-auto"
              />
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Join Kashika 🚗
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Create your free account and start driving today
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="John Doe"
                  className="w-full py-3.5 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/10 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+91 98765 43210"
                  className="w-full py-3.5 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/10 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full py-3.5 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/10 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="Min. 6 characters"
                  className="w-full py-3.5 pl-11 pr-12 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/10 transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 pt-1">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-0.5 size-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 accent-amber-500 flex-shrink-0"
              />
              <label htmlFor="terms" className="text-xs text-slate-500 font-medium leading-relaxed">
                I agree to the{' '}
                <Link href="#" className="text-amber-600 font-bold hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="#" className="text-amber-600 font-bold hover:underline">Privacy Policy</Link>
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 font-medium">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm mt-2"
            >
              {loading ? (
                <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight className="size-4" /></>
              )}
            </button>
          </form>

          {/* Switch to login */}
          <p className="text-center text-sm text-slate-500 font-medium mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-amber-600 font-black hover:underline underline-offset-4">
              Sign in
            </Link>
          </p>

          {/* Trust */}
          <div className="flex items-center justify-center gap-5 mt-8 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
              <Shield className="size-3.5 text-amber-500" /> Secure
            </div>
            <span className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
              <Gift className="size-3.5 text-amber-500" /> Free forever
            </div>
            <span className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
              <Star className="size-3.5 text-amber-500" /> Earn rewards
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── RIGHT PANEL — amber with car ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-amber-500 relative overflow-hidden flex-col justify-between p-12 order-1 lg:order-2">
        {/* Background circles */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 translate-y-1/2" />
        </div>

        {/* Top logo */}
        <div className="relative z-10">
          <Link href="/">
            <img
              src="/assests/kashika logo.png"
              alt="Kashika Self Drive"
              className="h-16 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <img
            src="/assests/yellow_car_hero.png"
            alt="Premium Car"
            className="w-full max-w-sm mix-blend-multiply mb-8"
          />
          <h2 className="text-4xl font-black text-white uppercase tracking-tight leading-tight mb-4">
            Start Your<br />Journey Today
          </h2>
          <p className="text-amber-100 text-base font-medium max-w-xs">
            Join thousands of happy drivers who trust Kashika for their road trips.
          </p>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-3 gap-4 w-full max-w-xs">
            {[
              { val: '5K+', label: 'Happy Drivers' },
              { val: '50+', label: 'Premium Cars' },
              { val: '4.9★', label: 'Avg Rating' },
            ].map(s => (
              <div key={s.label} className="bg-white/15 rounded-2xl p-3 text-center">
                <div className="text-xl font-black text-white">{s.val}</div>
                <div className="text-[10px] font-bold text-amber-100 uppercase tracking-wide mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 text-amber-100 text-xs font-bold uppercase tracking-widest">
          Your Journey, Your Way
        </div>
      </div>

    </div>
  )
}
