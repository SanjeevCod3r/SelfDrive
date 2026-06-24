'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, CheckCircle } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()

  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const data = Object.fromEntries(new FormData(e.target))
    const res = await login(data)
    setLoading(false)
    if (res.success) {
      router.push('/')
    } else {
      setError(res.error || 'Invalid credentials. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL — amber with car ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-brand-500 relative overflow-hidden flex-col justify-between p-12">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Top logo */}
        <div className="relative z-10">
          <Link href="/">
            <img
              src="/assests/kashika logo.png"
              alt="Kashi Ka Self Drive"
              className="h-16 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Center car image + text */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <img
            src="/assests/bmw_x5_hero.png"
            alt="Premium Car"
            className="w-full max-w-sm mix-blend-multiply mb-8"
          />
          <h2 className="text-4xl font-black text-white uppercase tracking-tight leading-tight mb-4">
            Drive Your<br />Dream Car
          </h2>
          <p className="text-brand-100 text-base font-medium max-w-xs">
            Premium self-drive & chauffeured car rentals across India.
          </p>

          {/* Features */}
          <div className="mt-8 space-y-3 w-full max-w-xs">
            {['Verified cars across India', 'Instant booking confirmation', 'Earn reward points'].map(f => (
              <div key={f} className="flex items-center gap-3 text-white">
                <CheckCircle className="size-5 text-white/80 flex-shrink-0" />
                <span className="text-sm font-semibold">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10 text-brand-100 text-xs font-bold uppercase tracking-widest">
          Your Journey, Your Way
        </div>
      </div>

      {/* ── RIGHT PANEL — white form ── */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[400px]"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/">
              <img
                src="/assests/kashika logo.png"
                alt="Kashi Ka Self Drive"
                className="h-16 w-auto object-contain mx-auto"
              />
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-charcoal-900 tracking-tight">Welcome back 👋</h1>
            <p className="text-zinc-500 text-sm font-medium mt-1">
              Sign in to your Kashi Ka account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-charcoal-900 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full h-13 py-3.5 pl-11 pr-4 rounded-xl border border-zinc-200 bg-white text-charcoal-900 text-sm font-medium outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-zinc-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-charcoal-900 uppercase tracking-widest">
                  Password
                </label>
                <button type="button" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                <input
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full h-13 py-3.5 pl-11 pr-12 rounded-xl border border-zinc-200 bg-white text-charcoal-900 text-sm font-medium outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-zinc-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
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
              className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="size-4" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-zinc-200" />
            <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-zinc-200" />
          </div>

          {/* Switch to signup */}
          <p className="text-center text-sm text-zinc-500 font-medium">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-brand-600 font-black hover:underline underline-offset-4">
              Create one free
            </Link>
          </p>

          {/* Trust */}
          <div className="flex items-center justify-center gap-5 mt-8 pt-6 border-t border-zinc-200">
            <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-medium">
              <Shield className="size-3.5 text-brand-500" /> Secure & Encrypted
            </div>
            <span className="w-px h-4 bg-zinc-200" />
            <div className="text-zinc-500 text-xs font-medium">
              <span className="text-brand-500 mr-1">✓</span>No spam, ever
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
