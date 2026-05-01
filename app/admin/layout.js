'use client'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Car, Users, Ticket, FileText,
  Calendar, LogOut, Eye, EyeOff, Shield, ChevronRight
} from 'lucide-react'

// ─── Admin Auth Hook (completely separate from website auth) ─────────────────
function useAdminAuth() {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  async function checkSession() {
    try {
      const res = await fetch('/api/admin-me', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setAdmin(data.user)
      } else {
        // Try localStorage token fallback
        const token = localStorage.getItem('kasika_admin_token')
        if (token) {
          const res2 = await fetch('/api/admin-me', {
            headers: { 'Authorization': `Bearer ${token}` },
            credentials: 'include'
          })
          if (res2.ok) {
            const data2 = await res2.json()
            setAdmin(data2.user)
            return
          } else {
            localStorage.removeItem('kasika_admin_token')
          }
        }
        setAdmin(null)
      }
    } catch (e) {
      setAdmin(null)
    } finally {
      setLoading(false)
    }
  }

  async function login(email, password) {
    const res = await fetch('/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    })
    const data = await res.json()
    if (res.ok) {
      if (data.token) localStorage.setItem('kasika_admin_token', data.token)
      setAdmin(data.user)
      return { success: true }
    }
    return { success: false, error: data.error || 'Login failed' }
  }

  async function logout() {
    await fetch('/api/admin-logout', { method: 'POST', credentials: 'include' })
    localStorage.removeItem('kasika_admin_token')
    setAdmin(null)
  }

  return { admin, loading, login, logout }
}

// ─── Admin Login/Signup Page ──────────────────────────────────────────────────
function AdminLoginPage({ onLogin, onSignup }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    let result
    if (isLogin) {
      result = await onLogin(email, password)
    } else {
      // Logic for signup if available in the hook
      result = await fetch('/api/admin-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include'
      }).then(res => res.json().then(data => res.ok ? { success: true } : { success: false, error: data.error }))
      if (result.success) {
        setIsLogin(true)
        setError('Account created. Please login.')
      }
    }
    if (result && !result.success) setError(result.error)
    setSubmitting(false)
    if (result && result.success && isLogin) {
      window.location.reload() // Refresh to trigger session check in layout
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <Link href="/">
            <img
              src="/assests/kashika logo.png"
              alt="Kasika Logo"
              className="h-24 w-auto object-contain mx-auto mb-6 drop-shadow-2xl"
            />
          </Link>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-1">
            Admin <span className="text-amber-500">Portal</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Secure Access Required</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[40px] p-10 shadow-2xl">
          <div className="mb-8">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">
              {isLogin ? 'Sign In' : 'Create Admin'}
            </h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">
              {isLogin ? 'Enter your credentials to manage the fleet' : 'Register a new administrative account'}
            </p>
          </div>

          {error && (
            <div className={`text-sm font-bold px-4 py-3 rounded-2xl mb-6 ${error.includes('created') ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="e.g. Administrator"
                  className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-700 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="admin@kasika.com"
                className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-700 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Secret Key</label>
                {isLogin && (
                  <button type="button" className="text-[10px] font-bold text-amber-500 uppercase tracking-widest hover:underline">Forgot?</button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-700 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:border-amber-500 transition-all pr-14"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-white hover:bg-amber-500 text-slate-950 font-black uppercase tracking-widest text-xs py-5 rounded-2xl transition-all flex items-center justify-center gap-2 mt-4 shadow-xl shadow-white/5 active:scale-95"
            >
              {submitting ? (
                <span className="size-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <>{isLogin ? 'Continue Session' : 'Create Admin'} <ChevronRight className="size-4" /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] hover:text-amber-500 transition-colors"
            >
              {isLogin ? 'Request New Access' : 'Return to Login'}
            </button>
          </div>
        </div>

        <div className="mt-12 text-center flex flex-col items-center gap-6">
          <div className="flex items-center gap-8 text-slate-600">
            <div className="flex items-center gap-2">
              <Shield className="size-3 text-amber-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Secure TLS</span>
            </div>
            <div className="size-1 bg-slate-800 rounded-full" />
            <div className="text-[10px] font-bold uppercase tracking-widest">Admin v2.0</div>
          </div>
          <Link href="/" className="text-slate-700 hover:text-slate-400 transition-all text-[10px] font-black uppercase tracking-[0.3em]">
            ← Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}


// ─── Admin Layout ─────────────────────────────────────────────────────────────
export default function AdminLayout({ children }) {
  const { admin, loading, login, logout } = useAdminAuth()
  const pathname = usePathname()

  const links = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/bookings-self', label: 'Self-Drive Bookings', icon: Calendar },
    { href: '/admin/bookings-driver', label: 'Driver Bookings', icon: Car },
    { href: '/admin/cars-self', label: 'Self-Drive Cars', icon: Car },
    { href: '/admin/cars-driver', label: 'Fleet Cars', icon: Car },
    { href: '/admin/packages', label: 'Subscription Plans', icon: Ticket },
    { href: '/admin/users', label: 'Manage Users', icon: Users },
    { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
    { href: '/admin/blogs', label: 'Blogs', icon: FileText },
  ]

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 border-4 border-slate-800 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    )
  }

  // Not logged in — show dedicated admin login page
  if (!admin) {
    return <AdminLoginPage onLogin={login} />
  }

  // Logged in — show admin dashboard
  return (
    <div className="bg-slate-950 min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 fixed left-0 top-0 bottom-0 bg-slate-900 border-r border-slate-800 flex flex-col z-20">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="size-9 bg-amber-500 rounded-xl flex items-center justify-center">
              <Shield className="size-5 text-slate-950" />
            </div>
            <div>
              <div className="text-white font-black text-sm uppercase tracking-tight">Kasika Admin</div>
              <div className="text-slate-500 text-[10px] font-medium">{admin.email}</div>
            </div>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-2">Main Menu</div>
          <nav className="space-y-1">
            {links.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${
                    active
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <link.icon className="size-4 shrink-0" />
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Bottom actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-xs font-bold uppercase tracking-widest"
          >
            <Car className="size-4" /> View Website
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-xs font-bold uppercase tracking-widest"
          >
            <LogOut className="size-4" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="text-white font-black uppercase tracking-widest text-xs text-slate-400">
            {links.find(l => l.href === pathname)?.label || 'Dashboard'}
          </div>
          <div className="flex items-center gap-3 bg-slate-800 py-2 px-4 rounded-full">
            <div className="size-6 bg-amber-500 rounded-full flex items-center justify-center text-slate-950 font-black text-xs">
              {admin.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <span className="text-xs font-bold text-white uppercase tracking-widest">{admin.name}</span>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 flex-1">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 min-h-full shadow-2xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
