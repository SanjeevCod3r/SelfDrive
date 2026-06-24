import { ArrowLeft, Calendar, User, Share2, ChevronLeft, Clock, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { getDb } from '@/lib/mongo'

export async function generateMetadata({ params }) {
  const db = await getDb()
  const post = await db.collection('blogs').findOne({ slug: params.slug })
  return {
    title: post ? `Blog | ${post.title}` : 'Post Not Found',
    description: post ? post.excerpt || post.content?.substring(0, 100) : 'Kashi Ka Road Trip Journal.',
  }
}

export default async function BlogPost({ params }) {
  const db = await getDb()
  const post = await db.collection('blogs').findOne({ slug: params.slug })

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-charcoal-900 p-6">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-8">Article Not Found</h1>
        <Link href="/blog" className="text-amber-500 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:gap-4 transition-all">
          <ArrowLeft className="size-4" /> Return to Journal
        </Link>
      </div>
    )
  }

  // Derived reading time
  const words = (post.content || '').trim().split(/\s+/).filter(Boolean).length
  const readTime = Math.max(1, Math.round(words / 200))
  const dateStr = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  return (
    <div className="bg-zinc-50 text-charcoal-900 min-h-screen selection:bg-amber-500/30">

      {/* ── CINEMATIC ARTICLE BANNER ── */}
      <section className="relative flex min-h-[68vh] items-end overflow-hidden bg-charcoal-950 pb-20">
        <img
          src={post.coverImage || 'https://images.unsplash.com/photo-1542362567-b054cd1321c1'}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/70 to-charcoal-950/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-950/80 via-transparent to-transparent" />
        <div className="pointer-events-none absolute -left-20 top-1/3 size-[500px] rounded-full bg-amber-500/20 blur-[150px]" />

        <div className="container mx-auto px-6 relative z-10 pt-28">
          <div className="max-w-4xl">
            <Link href="/blog" className="group mb-8 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 transition-colors hover:text-white">
              <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-1" /> Back to Journal
            </Link>

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.3em] text-amber-400 backdrop-blur-md">
              <Sparkles className="size-3" />
              {post.category || 'Travel Guide'}
            </div>

            <h1 className="mb-10 text-4xl font-black uppercase leading-[0.95] tracking-tighter text-white md:text-7xl">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[10px] font-black uppercase tracking-widest text-zinc-300">
              {dateStr && <div className="flex items-center gap-2.5"><Calendar className="size-4 text-amber-500" /> {dateStr}</div>}
              <div className="flex items-center gap-2.5"><User className="size-4 text-amber-500" /> By {post.author}</div>
              <div className="flex items-center gap-2.5"><Clock className="size-4 text-amber-500" /> {readTime} Min Read</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ARTICLE CONTENT ── */}
      <main className="container mx-auto px-6 py-20">
        <div className="mx-auto max-w-3xl">
          {/* Optional lead / excerpt */}
          {post.excerpt && (
            <p className="mb-12 text-center text-xl font-medium italic leading-relaxed text-zinc-500">
              "{post.excerpt}"
            </p>
          )}

          {/* Content pane */}
          <div className="rounded-[32px] border border-zinc-200 bg-white p-8 shadow-[0_10px_40px_-20px_rgba(21,22,27,0.15)] md:p-14">
            <article className="whitespace-pre-wrap text-lg font-medium leading-[1.85] text-zinc-700 first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-6xl first-letter:font-black first-letter:leading-[0.75] first-letter:text-amber-500 md:text-xl">
              {post.content}
            </article>

            {/* Author + share */}
            <div className="mt-16 flex flex-col items-center justify-between gap-8 border-t border-zinc-200 pt-10 md:flex-row">
              <div className="flex items-center gap-4">
                <div className="flex size-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-2xl font-black uppercase text-amber-500">
                  {post.author?.[0] || 'K'}
                </div>
                <div>
                  <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">Written By</div>
                  <div className="text-lg font-black uppercase tracking-tight text-charcoal-900">{post.author}</div>
                </div>
              </div>
              <Link
                href="/contact"
                className="flex h-14 items-center gap-3 rounded-2xl bg-charcoal-900 px-8 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-amber-500 hover:scale-105"
              >
                <Share2 className="size-4" /> Share Article
              </Link>
            </div>
          </div>

          {/* CTA card */}
          <div className="mt-12 overflow-hidden rounded-[32px] bg-amber-500 p-10 text-center shadow-[0_30px_70px_-25px_rgba(242,106,33,0.5)]">
            <h3 className="mx-auto mb-6 max-w-md text-2xl font-black uppercase leading-tight tracking-tighter text-charcoal-900 md:text-3xl">
              Inspired to hit the road?
            </h3>
            <Link
              href="/self-drive"
              className="group inline-flex items-center gap-3 rounded-2xl bg-charcoal-900 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:scale-105"
            >
              Browse The Fleet <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Bottom nav */}
          <div className="mt-16 text-center">
            <Link href="/blog" className="group inline-flex items-center gap-4">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 transition-colors group-hover:text-charcoal-900">Read More Stories</span>
              <div className="flex size-12 items-center justify-center rounded-full border border-zinc-200 transition-all group-hover:border-amber-500 group-hover:bg-amber-500 group-hover:text-white">
                <ArrowRight className="size-5" />
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
