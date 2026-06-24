'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, User, Calendar, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function postDate(post) {
  const raw = post.publishedAt || post.createdAt || post.date
  if (!raw) return null
  const d = new Date(raw)
  if (isNaN(d)) return null
  return { day: String(d.getDate()).padStart(2, '0'), month: MONTHS[d.getMonth()] }
}

export default function LatestBlog() {
  const { api } = useAuth()
  const [blogs, setBlogs] = useState([])

  useEffect(() => {
    api('/blogs').then(data => {
      setBlogs((data.blogs || []).slice(0, 3))
    }).catch(console.error)
  }, [api])

  if (blogs.length === 0) return null

  return (
    <section className="relative overflow-hidden bg-white py-24 md:py-28">
      <div className="container mx-auto px-6">

        {/* Header */}
        <div className="mb-16 flex flex-col justify-between gap-8 md:mb-20 md:flex-row md:items-end">
          <div>
            <div className="mb-6 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">
              <Sparkles className="size-3.5" />
              <span>Our Blog</span>
            </div>
            <h2 className="text-4xl font-black uppercase leading-[0.95] tracking-tighter text-charcoal-900 md:text-6xl">
              Our Latest <span className="text-amber-500">Stories</span>
            </h2>
          </div>

          <Link
            href="/blog"
            className="group inline-flex w-fit items-center gap-3 rounded-2xl bg-charcoal-900 px-8 py-4 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-amber-500 hover:scale-[1.02]"
          >
            View All Posts
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Blog Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((post, i) => {
            const date = postDate(post)
            return (
            <motion.div
              key={post.id || i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
              className="group flex h-full flex-col overflow-hidden rounded-[32px] border border-zinc-200 bg-white shadow-[0_10px_40px_-20px_rgba(21,22,27,0.15)] transition-all duration-500 hover:-translate-y-2 hover:border-amber-500/40 hover:shadow-[0_30px_60px_-25px_rgba(242,106,33,0.3)]"
            >
              <div className="relative m-3 aspect-[16/11] overflow-hidden rounded-[24px]">
                <img
                  src={post.coverImage || 'https://images.unsplash.com/photo-1542362567-b054cd1321c1'}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />

                {/* Date badge — real post date */}
                {date && (
                  <div className="absolute right-5 top-5 flex h-20 w-14 flex-col overflow-hidden rounded-xl shadow-xl">
                     <div className="flex flex-1 items-center justify-center bg-amber-500 pt-1 text-2xl font-black leading-none text-white">
                        {date.day}
                     </div>
                     <div className="flex h-7 items-center justify-center bg-white text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        {date.month}
                     </div>
                  </div>
                )}

                <div className="absolute bottom-5 left-5">
                   <div className="rounded-xl bg-amber-500 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                     {post.category || 'Car Showcase'}
                   </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-7 pt-4">
                <div className="mb-5 flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  <div className="flex items-center gap-2"><User className="size-4 text-amber-500" /> {post.author || 'Admin'}</div>
                  {date && <div className="flex items-center gap-2"><Calendar className="size-4 text-amber-500" /> {date.day} {date.month}</div>}
                </div>

                <h3 className="mb-4 line-clamp-2 text-xl font-black uppercase leading-tight tracking-tight text-charcoal-900 transition-colors duration-500 group-hover:text-amber-500">
                  {post.title}
                </h3>

                <p className="mb-8 line-clamp-2 text-sm font-medium leading-relaxed text-zinc-600">
                  {post.excerpt || post.content?.substring(0, 100)}...
                </p>

                <Link href={`/blog/${post.slug}`} className="group/btn mt-auto inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-charcoal-900 transition-colors hover:text-amber-500">
                   Read More <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-2" />
                </Link>
              </div>
            </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
