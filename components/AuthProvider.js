'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, User, Mail, Lock, Phone, X, ArrowRight, Shield } from 'lucide-react'

const AuthContext = createContext()

function AuthModal({ authModal, setAuthModal, login, signup }) {
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Forgot-password sub-view
  const [forgot, setForgot] = useState(false)
  const [fpLoading, setFpLoading] = useState(false)
  const [fpError, setFpError] = useState('')
  const [fpDone, setFpDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const data = Object.fromEntries(new FormData(e.target))
    const res = authModal === 'login' ? await login(data) : await signup(data)
    setLoading(false)
    if (!res.success) setError(res.error)
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    setFpError('')
    setFpLoading(true)
    const data = Object.fromEntries(new FormData(e.target))
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const out = await res.json()
      if (!res.ok) throw new Error(out.error || 'Reset failed')
      setFpDone(true)
    } catch (err) {
      setFpError(err.message)
    } finally {
      setFpLoading(false)
    }
  }

  const isLogin = authModal === 'login'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setAuthModal(null)}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[420px] bg-white border border-zinc-200 rounded-3xl shadow-[0_20px_60px_-20px_rgba(21,22,27,0.25)] overflow-hidden"
      >
        {/* Top brand strip */}
        <div className="h-2 bg-brand-500 w-full" />

        {/* Header */}
        <div className="px-8 pt-8 pb-6 flex flex-col items-center text-center">
          {/* Logo */}
          <div className="mb-5">
            <img
              src="/assests/kashika logo.png"
              alt="Kashi Ka Self Drive"
              className="h-20 w-auto object-contain mx-auto"
            />
          </div>

          <h2 className="text-2xl font-black text-charcoal-900 tracking-tight">
            {forgot ? 'Reset Password' : isLogin ? 'Welcome Back!' : 'Create Account'}
          </h2>
          <p className="text-zinc-500 text-sm font-medium mt-1">
            {forgot
              ? 'Verify with your registered email & phone'
              : isLogin
              ? 'Sign in to manage your bookings'
              : 'Join Kashi Ka and start your journey'}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={() => setAuthModal(null)}
          className="absolute top-4 right-4 size-9 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors"
        >
          <X className="size-4 text-charcoal-900" />
        </button>

        {/* Form */}
        <div className="px-8 pb-8">
          {forgot ? (
            fpDone ? (
              <div className="text-center py-2">
                <p className="text-sm text-zinc-600 font-medium mb-6">
                  Your password has been updated. You can now sign in with your new password.
                </p>
                <button
                  type="button"
                  onClick={() => { setForgot(false); setFpDone(false) }}
                  className="w-full h-12 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-black uppercase tracking-widest text-xs transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgot} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                  <input name="email" type="email" required placeholder="Registered email"
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-zinc-200 bg-white text-charcoal-900 text-sm font-medium outline-none focus:border-brand-500 transition-all placeholder:text-zinc-400" />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                  <input name="phone" type="tel" required placeholder="Registered phone number"
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-zinc-200 bg-white text-charcoal-900 text-sm font-medium outline-none focus:border-brand-500 transition-all placeholder:text-zinc-400" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                  <input name="newPassword" type="password" required minLength={6} placeholder="New password (min 6 chars)"
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-zinc-200 bg-white text-charcoal-900 text-sm font-medium outline-none focus:border-brand-500 transition-all placeholder:text-zinc-400" />
                </div>

                {fpError && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 font-medium">{fpError}</div>
                )}

                <button type="submit" disabled={fpLoading}
                  className="w-full h-12 bg-brand-500 hover:bg-brand-600 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                  {fpLoading ? <span className="animate-spin size-5 border-2 border-white/30 border-t-white rounded-full" /> : <>Reset Password <ArrowRight className="size-4" /></>}
                </button>

                <button type="button" onClick={() => { setForgot(false); setFpError('') }}
                  className="w-full text-center text-sm text-brand-600 font-black hover:underline underline-offset-4">
                  Back to Sign In
                </button>
              </form>
            )
          ) : (
          <>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name — signup only */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-charcoal-900 uppercase tracking-widest mb-1.5 ml-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                  <input
                    name="name"
                    required
                    placeholder="John Doe"
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-zinc-200 bg-white text-charcoal-900 text-sm font-medium outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-zinc-400"
                  />
                </div>
              </div>
            )}

            {/* Phone — signup only */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-charcoal-900 uppercase tracking-widest mb-1.5 ml-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                  <input
                    name="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-zinc-200 bg-white text-charcoal-900 text-sm font-medium outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-zinc-400"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-charcoal-900 uppercase tracking-widest mb-1.5 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-zinc-200 bg-white text-charcoal-900 text-sm font-medium outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-zinc-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5 ml-1">
                <label className="text-xs font-bold text-charcoal-900 uppercase tracking-widest">
                  Password
                </label>
                {isLogin && (
                  <button type="button" onClick={() => { setForgot(true); setFpError(''); setFpDone(false) }} className="text-xs text-brand-600 font-semibold hover:underline">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                <input
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="w-full h-12 pl-11 pr-12 rounded-xl border border-zinc-200 bg-white text-charcoal-900 text-sm font-medium outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-zinc-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 font-medium">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-13 py-3.5 bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="animate-spin size-5 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch mode */}
          <p className="text-center text-sm text-zinc-500 font-medium mt-6">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => { setAuthModal(isLogin ? 'signup' : 'login'); setError('') }}
              className="text-brand-600 font-black hover:underline underline-offset-4"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
          </>
          )}

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 mt-6 pt-5 border-t border-zinc-200">
            <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-medium">
              <Shield className="size-3.5 text-brand-500" />
              Secure Login
            </div>
            <span className="w-px h-4 bg-zinc-200" />
            <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-medium">
              <span className="text-brand-500">✓</span>
              No spam, ever
            </div>
            <span className="w-px h-4 bg-zinc-200" />
            <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-medium">
              <span className="text-brand-500">✓</span>
              Free to join
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authModal, setAuthModal] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchUser() }, [])

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        const token = localStorage.getItem('kasika_token')
        if (token) {
          const res2 = await fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } })
          if (res2.ok) { setUser((await res2.json()).user); return }
          else if (res2.status === 401) localStorage.removeItem('kasika_token')
        }
        setUser(null)
      }
    } catch { setUser(null) }
    finally { setLoading(false) }
  }

  const login = async (credentials) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials), credentials: 'include'
    })
    const data = await res.json()
    if (res.ok) { if (data.token) localStorage.setItem('kasika_token', data.token); setUser(data.user); setAuthModal(null); return { success: true } }
    return { success: false, error: data.error || 'Login failed' }
  }

  const signup = async (userData) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData), credentials: 'include'
    })
    const data = await res.json()
    if (res.ok) { if (data.token) localStorage.setItem('kasika_token', data.token); setUser(data.user); setAuthModal(null); return { success: true } }
    return { success: false, error: data.error || 'Signup failed' }
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    localStorage.removeItem('kasika_token')
    setUser(null)
  }

  const api = async (endpoint, options = {}) => {
    const token = localStorage.getItem('kasika_token')
    const headers = { ...options.headers }
    if (token) headers['Authorization'] = `Bearer ${token}`
    if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json'
    const res = await fetch(`/api${endpoint}`, { ...options, headers, credentials: 'include' })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'API Error')
    return data
  }

  return (
    <AuthContext.Provider value={{ user, setUser, refreshUser: fetchUser, loading, login, signup, logout, api, openAuth: (type) => setAuthModal(type), closeAuth: () => setAuthModal(null) }}>
      {children}
      <AnimatePresence>
        {authModal && (
          <AuthModal authModal={authModal} setAuthModal={setAuthModal} login={login} signup={signup} />
        )}
      </AnimatePresence>
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
