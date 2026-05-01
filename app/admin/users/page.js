'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Zap, Shield, User, Crown, Clock } from 'lucide-react'

export default function AdminUsers() {
  const { api } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/admin/users').then(data => {
      setUsers(data.users)
      setLoading(false)
    })
  }, [api])

  return (
    <div>
      <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-8">Manage Users</h2>
      {loading ? <Zap className="size-8 text-amber-500 animate-pulse" /> : (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">User Profile</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Membership</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-900/50 transition-colors">
                  <td className="p-6">
                     <div className="flex items-center gap-4">
                        <div className="size-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                           <User className="size-5" />
                        </div>
                        <div>
                           <div className="text-sm font-black text-white uppercase tracking-tight">{u.name}</div>
                           <div className="text-[10px] font-medium text-slate-500">{u.email}</div>
                        </div>
                     </div>
                  </td>
                  <td className="p-6">
                    {u.isPremium ? (
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10 w-fit">
                           <Crown className="size-3" /> {u.subscription?.planName || 'Premium'}
                        </span>
                        {u.subscription?.expiresAt && (
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1 ml-1">
                             <Clock className="size-2.5" /> Exp: {new Date(u.subscription.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-800 text-slate-500">
                         Standard Member
                      </span>
                    )}
                  </td>
                  <td className="p-6 text-right">
                     <div className="text-lg font-black text-amber-500 leading-none">{u.points || 0}</div>
                     <div className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">PTS</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
