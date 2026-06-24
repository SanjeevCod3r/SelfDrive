'use client'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, ChevronRight, Eye, EyeOff } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      })
      const data = await res.json()
      if (res.ok) {
        if (data.token) localStorage.setItem('kasika_admin_token', data.token)
        router.push('/admin')
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (e) {
      setError('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <Link href="/">
            <img
              src="/assests/kashika logo.png"
              alt="Kashi Ka Logo"
              className="h-24 w-auto object-contain mx-auto mb-6"
            />
          </Link>
          <h1 className="text-2xl font-black text-charcoal-900 uppercase tracking-widest mb-1">
            Admin <span className="text-brand-500">Portal</span>
          </h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Secure Access Required</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-zinc-200 rounded-[40px] p-10 shadow-[0_20px_60px_-20px_rgba(21,22,27,0.25)]">
          <div className="mb-8">
            <h2 className="text-xl font-black text-charcoal-900 uppercase tracking-tight">
              Sign In
            </h2>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1">
              Enter your credentials to manage the fleet
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold px-4 py-3 rounded-2xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="admin@kasika.com"
                className="w-full bg-white border border-zinc-200 text-charcoal-900 placeholder:text-zinc-400 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Secret Key</label>
                <button type="button" className="text-[10px] font-bold text-brand-600 uppercase tracking-widest hover:underline">Forgot?</button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white border border-zinc-200 text-charcoal-900 placeholder:text-zinc-400 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all pr-14"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-charcoal-900 transition-colors"
                >
                  {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl transition-all flex items-center justify-center gap-2 mt-4 shadow-xl shadow-brand-500/25 active:scale-95"
            >
              {submitting ? (
                <span className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>Continue Session <ChevronRight className="size-4" /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link
              href="/admin/signup"
              className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] hover:text-brand-600 transition-colors"
            >
              Request New Access
            </Link>
          </div>
        </div>

        <div className="mt-12 text-center flex flex-col items-center gap-6">
          <div className="flex items-center gap-8 text-zinc-500">
            <div className="flex items-center gap-2">
              <Shield className="size-3 text-brand-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Secure TLS</span>
            </div>
            <div className="size-1 bg-zinc-300 rounded-full" />
            <div className="text-[10px] font-bold uppercase tracking-widest">Admin v2.0</div>
          </div>
          <Link href="/" className="text-zinc-400 hover:text-charcoal-900 transition-all text-[10px] font-black uppercase tracking-[0.3em]">
            ← Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
