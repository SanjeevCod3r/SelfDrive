'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, User, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

export default function LatestBlog() {
  const { api } = useAuth()
  const [blogs, setBlogs] = useState([])

  useEffect(() => {
    api('/blogs').then(data => {
      setBlogs(data.blogs.slice(0, 3))
    }).catch(console.error)
  }, [api])

  if (blogs.length === 0) return null

  return (
    <section className="py-32 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
          <div>
            <div className="flex items-center gap-3 text-amber-500 font-black uppercase tracking-[0.4em] text-[10px] mb-6">
              <div className="w-10 h-px bg-amber-500" />
              <span>Our Blog</span>
            </div>
            <h2 className="text-6xl md:text-8xl font-black text-[#020617] uppercase tracking-tighter leading-none">
              Our Latest <span className="text-amber-500">Blog</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
             <button className="size-16 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-amber-500 hover:border-amber-500 hover:text-white transition-all shadow-lg">
                <ArrowRight className="size-7 rotate-180" />
             </button>
             <button className="size-16 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 hover:bg-[#020617] hover:text-white transition-all shadow-xl shadow-amber-500/20">
                <ArrowRight className="size-7" />
             </button>
          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {blogs.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-white border border-slate-100 rounded-[50px] overflow-hidden shadow-2xl shadow-slate-200/50 hover:border-amber-500/20 transition-all duration-700 flex flex-col h-full"
            >
              <div className="relative aspect-[16/11] overflow-hidden m-4 rounded-[40px]">
                <img 
                  src={post.coverImage || 'https://images.unsplash.com/photo-1542362567-b054cd1321c1'} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                />
                
                {/* Date Split Badge - Top Right from image */}
                <div className="absolute top-6 right-6 flex flex-col w-16 h-20 rounded-2xl overflow-hidden shadow-2xl">
                   <div className="flex-1 bg-amber-500 flex items-center justify-center text-white font-black text-2xl leading-none pt-1">
                      10
                   </div>
                   <div className="h-8 bg-slate-100 flex items-center justify-center text-slate-400 font-black text-[10px] uppercase tracking-widest">
                      Nov
                   </div>
                </div>

                <div className="absolute bottom-6 left-6">
                   <div className="bg-amber-500 text-slate-950 font-black uppercase tracking-widest text-[10px] px-5 py-2.5 rounded-2xl shadow-xl">
                     {post.category || 'Car Showcase'}
                   </div>
                </div>
              </div>

              <div className="p-10 pt-6 flex-1 flex flex-col">
                <div className="flex items-center gap-8 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6">
                  <div className="flex items-center gap-2 group-hover:text-amber-500 transition-colors"><User className="size-4 text-amber-500" /> Admin</div>
                  <div className="flex items-center gap-2 group-hover:text-amber-500 transition-colors"><MessageSquare className="size-4 text-amber-500" /> Comment</div>
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-6 group-hover:text-amber-500 transition-all duration-500 leading-tight line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-slate-500 font-medium leading-relaxed mb-10 line-clamp-2 text-sm">
                  {post.excerpt || post.content?.substring(0, 100)}...
                </p>

                <div className="mt-auto">
                   <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-3 text-slate-900 font-black uppercase tracking-[0.2em] text-[12px] group/btn hover:text-amber-500 transition-all">
                      Read More <ArrowRight className="size-4 group-hover/btn:translate-x-2 transition-transform" />
                   </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
