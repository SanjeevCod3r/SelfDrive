'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { toast } from 'sonner'
import { Zap, Mail, Phone, Trash2, MessageSquare, Calendar } from 'lucide-react'

export default function AdminContacts() {
  const { api } = useAuth()
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    api('/admin/contacts').then(data => {
      setContacts(data.contacts || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [api])

  const remove = async (id) => {
    if (!confirm('Delete this message?')) return
    try {
      await api(`/admin/contacts/${id}`, { method: 'DELETE' })
      setContacts(prev => prev.filter(c => c.id !== id))
      toast.success('Message deleted')
    } catch (e) {
      toast.error(e.message || 'Failed to delete')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-charcoal-900 uppercase tracking-tight">Contact Messages</h2>
        {!loading && (
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-amber-100 text-amber-700">
            {contacts.length} Total
          </span>
        )}
      </div>

      {loading ? (
        <Zap className="size-8 text-amber-500 animate-pulse" />
      ) : contacts.length === 0 ? (
        <div className="text-center py-20">
          <MessageSquare className="size-12 text-zinc-300 mx-auto mb-4" />
          <p className="text-zinc-500 text-sm font-medium">No contact messages yet.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {contacts.map(c => (
            <div key={c.id} className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-[0_4px_20px_-8px_rgba(21,22,27,0.10)]">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="text-sm font-black text-charcoal-900 uppercase tracking-tight">{c.name}</div>
                  {c.subject && (
                    <div className="text-[11px] font-black text-amber-600 uppercase tracking-widest mt-0.5">{c.subject}</div>
                  )}
                </div>
                <button
                  onClick={() => remove(c.id)}
                  className="size-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center shrink-0 transition-colors"
                  aria-label="Delete message"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              <p className="text-sm text-zinc-600 leading-relaxed mb-5 whitespace-pre-wrap">{c.message}</p>

              <div className="space-y-2 border-t border-zinc-100 pt-4">
                <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-amber-600 transition-colors">
                  <Mail className="size-3.5 text-amber-500" /> {c.email}
                </a>
                {c.phone && (
                  <a href={`tel:${c.phone}`} className="flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-amber-600 transition-colors">
                    <Phone className="size-3.5 text-amber-500" /> {c.phone}
                  </a>
                )}
                <div className="flex items-center gap-2 text-[11px] font-medium text-zinc-400">
                  <Calendar className="size-3.5" /> {new Date(c.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
