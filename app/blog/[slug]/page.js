import { ArrowLeft, Calendar, User, Share2, ChevronLeft, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getDb } from '@/lib/mongo'

export async function generateMetadata({ params }) {
  const db = await getDb()
  const post = await db.collection('blogs').findOne({ slug: params.slug })
  return {
    title: post ? `Blog | ${post.title}` : 'Post Not Found',
    description: post ? post.excerpt || post.content?.substring(0, 100) : 'Kasika Road Trip Journal.',
  }
}

export default async function BlogPost({ params }) {
  const db = await getDb()
  const post = await db.collection('blogs').findOne({ slug: params.slug })

  if (!post) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-white p-6">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-8">Article Not Found</h1>
        <Link href="/blog" className="text-amber-500 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:gap-4 transition-all">
          <ArrowLeft className="size-4" /> Return to Library
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-[#020617] text-white min-h-screen selection:bg-amber-500/30">
      
      {/* ARTICLE HEADER / BANNER */}
      <section className="relative h-[60vh] flex items-end pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={post.coverImage || 'https://images.unsplash.com/photo-1542362567-b054cd1321c1'} 
            alt={post.title} 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <Link href="/blog" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.3em] mb-8 group">
              <ChevronLeft className="size-4 group-hover:-translate-x-1 transition-transform" /> Back to Journal
            </Link>
            <div className="bg-amber-500 text-[#020617] inline-block px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-6">
              {post.category || 'Travel Guide'}
            </div>
            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.95] mb-10">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-8 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <div className="flex items-center gap-2.5"><Calendar className="size-4 text-amber-500" /> {new Date(post.createdAt).toLocaleDateString()}</div>
              <div className="flex items-center gap-2.5"><User className="size-4 text-amber-500" /> By {post.author}</div>
              <div className="flex items-center gap-2.5"><Clock className="size-4 text-amber-500" /> 5 Min Read</div>
            </div>
          </div>
        </div>
      </section>

      {/* ARTICLE CONTENT */}
      <main className="container mx-auto px-6 py-24">
        <div className="max-w-3xl mx-auto">
          {/* Main Content Pane */}
          <div className="bg-white/5 border border-white/5 rounded-[48px] p-10 md:p-16">
            <div className="text-slate-300 text-lg md:text-xl font-medium leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
            
            <div className="mt-20 pt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500 font-black text-2xl uppercase">
                  {post.author?.[0] || 'K'}
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Editorial Author</div>
                  <div className="text-lg font-black uppercase tracking-tight text-white">{post.author}</div>
                </div>
              </div>
              <button className="h-14 px-8 bg-white hover:bg-amber-500 text-slate-950 hover:text-white font-black rounded-2xl transition-all text-[10px] uppercase tracking-widest flex items-center gap-3">
                <Share2 className="size-4" /> Share Article
              </button>
            </div>
          </div>

          {/* Bottom Nav */}
          <div className="mt-20 text-center">
            <Link href="/blog" className="inline-flex items-center gap-4 group">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 group-hover:text-white transition-colors">Read More Stories</span>
              <div className="size-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-amber-500 group-hover:border-amber-500 transition-all">
                <ArrowRight className="size-5" />
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
