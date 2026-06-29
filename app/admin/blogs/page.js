'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import {
  Plus, Zap, FileText, Calendar,
  User, ChevronRight, Trash2, Pencil, X,
  Image as ImageIcon, AlignLeft,
  LayoutGrid, List
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminBlogs() {
  const { api } = useAuth()
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [editing, setEditing] = useState(null) // blog being edited, or null

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    try {
      const data = await api('/admin/blogs')
      setBlogs(data.blogs)
    } catch (e) {
      toast.error('Failed to load blogs')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (blog) => {
    setEditing(blog)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => setEditing(null)

  const handlePublish = async (e) => {
    e.preventDefault()
    setPublishing(true)
    const formData = new FormData(e.target)
    const body = Object.fromEntries(formData)

    try {
      if (editing) {
        await api(`/admin/blogs/${editing.id}`, {
          method: 'PUT',
          body: JSON.stringify(body)
        })
        toast.success('Blog post updated')
        setEditing(null)
      } else {
        await api('/admin/blogs', {
          method: 'POST',
          body: JSON.stringify(body)
        })
        toast.success('Blog post published successfully')
        e.target.reset()
      }
      fetchBlogs()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setPublishing(false)
    }
  }

  const deleteBlog = async (id) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    try {
      // Assuming a delete endpoint exists or we use segments
      await api(`/admin/blogs/${id}`, { method: 'DELETE' })
      toast.success('Deleted')
      fetchBlogs()
    } catch (e) {
      toast.error('Delete failed')
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-3xl font-black text-charcoal-900 uppercase tracking-tight">Blog Engine</h2>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Manage your platform's editorial content</p>
        </div>
        <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 p-2 rounded-2xl">
          <div className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-[10px] font-black text-brand-500 uppercase tracking-widest">
            {blogs.length} Posts
          </div>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-12 gap-12">
        
        {/* LEFT: WRITING PANE */}
        <div className="lg:col-span-5">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-zinc-50 border border-zinc-200 rounded-[32px] p-8 sticky top-32 shadow-[0_4px_20px_-8px_rgba(21,22,27,0.10)]"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-brand-100 flex items-center justify-center border border-brand-200">
                  {editing ? <Pencil className="size-6 text-brand-500" /> : <Plus className="size-6 text-brand-500" />}
                </div>
                <h3 className="text-xl font-black text-charcoal-900 uppercase tracking-tight">{editing ? 'Edit Post' : 'Create Post'}</h3>
              </div>
              {editing && (
                <button onClick={cancelEdit} type="button" className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-red-500">
                  <X className="size-3.5" /> Cancel
                </button>
              )}
            </div>

            <form key={editing?.id || 'new'} onSubmit={handlePublish} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Article Title</label>
                <div className="relative">
                  <FileText className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    name="title" required defaultValue={editing?.title} placeholder="Catchy title for your blog..."
                    className="w-full pl-11 pr-4 h-14 bg-white border border-zinc-200 rounded-2xl text-charcoal-900 placeholder:text-zinc-400 focus:outline-none focus:border-brand-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Category</label>
                  <div className="relative">
                    <LayoutGrid className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      name="category" required defaultValue={editing?.category} placeholder="e.g. Travel"
                      className="w-full pl-11 pr-4 h-14 bg-white border border-zinc-200 rounded-2xl text-charcoal-900 placeholder:text-zinc-400 focus:outline-none focus:border-brand-500 transition-all text-xs font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Cover Image</label>
                  <div className="relative">
                    <ImageIcon className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      name="coverImage" defaultValue={editing?.coverImage} placeholder="URL"
                      className="w-full pl-11 pr-4 h-14 bg-white border border-zinc-200 rounded-2xl text-charcoal-900 placeholder:text-zinc-400 focus:outline-none focus:border-brand-500 transition-all text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Content (Normal text supported)</label>
                <div className="relative">
                  <AlignLeft className="size-4 absolute left-4 top-6 text-zinc-400" />
                  <textarea
                    name="content" required defaultValue={editing?.content} placeholder="Write your story here..."
                    className="w-full pl-11 pr-4 pt-5 h-60 bg-white border border-zinc-200 rounded-2xl text-charcoal-900 placeholder:text-zinc-400 focus:outline-none focus:border-brand-500 transition-all font-medium resize-none leading-relaxed"
                  />
                </div>
              </div>

              <button
                type="submit" disabled={publishing}
                className="w-full h-16 bg-brand-500 hover:bg-brand-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-xl shadow-brand-500/10 active:scale-95 disabled:opacity-50"
              >
                {publishing ? 'Saving...' : editing ? 'Update Article' : 'Publish Article'}
              </button>
            </form>
          </motion.div>
        </div>

        {/* RIGHT: LISTING */}
        <div className="lg:col-span-7">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <Zap className="size-10 text-brand-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-500">Loading Posts</span>
            </div>
          ) : blogs.length > 0 ? (
            <div className="grid gap-6">
              <AnimatePresence>
                {blogs.map((b, i) => (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`group bg-zinc-50 border rounded-[32px] p-6 hover:shadow-[0_4px_20px_-8px_rgba(21,22,27,0.10)] transition-all duration-500 flex gap-6 ${editing?.id === b.id ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-zinc-200 hover:border-brand-500/40'}`}
                  >
                    <div className="size-32 shrink-0 rounded-2xl overflow-hidden border border-zinc-200 bg-white">
                      <img src={b.coverImage || 'https://images.unsplash.com/photo-1542362567-b054cd1321c1'} alt={b.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-black text-brand-700 uppercase tracking-widest px-2 py-1 bg-brand-100 rounded-md">
                          {b.category || 'General'}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEdit(b)}
                            className="size-8 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-brand-500/10 hover:text-brand-500 transition-all"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            onClick={() => deleteBlog(b.id)}
                            className="size-8 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-red-50 hover:text-red-500 transition-all"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                      <h4 className="text-xl font-black text-charcoal-900 uppercase tracking-tight mb-3 line-clamp-1 group-hover:text-brand-500 transition-colors">
                        {b.title}
                      </h4>
                      <div className="flex items-center gap-4 text-zinc-500">
                        <div className="flex items-center gap-2">
                          <User className="size-3 text-zinc-400" />
                          <span className="text-[9px] font-black uppercase tracking-widest">{b.author}</span>
                        </div>
                        <div className="size-1 bg-zinc-300 rounded-full" />
                        <div className="flex items-center gap-2">
                          <Calendar className="size-3 text-zinc-400" />
                          <span className="text-[9px] font-black uppercase tracking-widest">{new Date(b.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="py-40 text-center border-2 border-dashed border-zinc-300 bg-zinc-50 rounded-[40px]">
              <div className="size-20 bg-white border border-zinc-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="size-10 text-zinc-300" />
              </div>
              <h3 className="text-xl font-black text-charcoal-900 uppercase tracking-tight mb-2">No Blog Posts</h3>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Your editorial feed is empty</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
