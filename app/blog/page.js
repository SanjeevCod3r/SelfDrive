import Link from 'next/link'
import { ArrowRight, Calendar, User, Sparkles } from 'lucide-react'
import { getDb } from '@/lib/mongo'

export const metadata = {
  title: 'Blog | Kashi Ka Self Drive',
  description: 'Read the latest road trip guides, travel tips, and updates from Kashi Ka.'
}

export default async function BlogList() {
  const db = await getDb()
  const posts = await db.collection('blogs').find({}).sort({ createdAt: -1 }).toArray()

  return (
    <div className="min-h-screen bg-zinc-50 text-charcoal-900">

      {/* ── CINEMATIC BANNER ── */}
      <section className="relative flex min-h-[60vh] items-center overflow-hidden bg-charcoal-950">
        <img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2400&auto=format&fit=crop"
          alt="The open road"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-950 via-charcoal-950/85 to-charcoal-950/30" />
        <div className="pointer-events-none absolute -left-20 top-1/3 size-[500px] rounded-full bg-amber-500/20 blur-[150px]" />

        <div className="container mx-auto px-6 relative z-10 pt-28">
          <div className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-amber-400 font-black uppercase tracking-[0.4em] text-[10px] backdrop-blur-md">
              <Sparkles className="size-3.5" />
              <span>The Open Road</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 leading-[0.9] text-white">
              Perspectives <span className="text-amber-500">&amp; Insights</span>
            </h1>
            <p className="text-zinc-300 font-medium text-lg md:text-xl leading-relaxed max-w-2xl">
              Expert travel itineraries, technical driving guides, and the latest news from the Kashi Ka fleet.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 pt-20 pb-32">

        {/* POSTS GRID */}
        {posts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post._id.toString()}
                href={`/blog/${post.slug}`}
                className="group flex flex-col h-full rounded-[32px] border border-zinc-200 bg-white p-3 shadow-[0_10px_40px_-20px_rgba(21,22,27,0.15)] transition-all duration-500 hover:-translate-y-2 hover:border-amber-500/40 hover:shadow-[0_30px_60px_-25px_rgba(242,106,33,0.3)]"
              >
                <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden mb-6 bg-zinc-100">
                  <img
                    src={post.coverImage || 'https://images.unsplash.com/photo-1542362567-b054cd1321c1'}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute top-5 left-5 bg-amber-500 text-white font-black uppercase tracking-widest text-[9px] px-4 py-2 rounded-full shadow-xl">
                    {post.category || 'General'}
                  </div>
                </div>

                <div className="flex-1 space-y-4 px-4 pb-5">
                  <div className="flex items-center gap-4 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-1.5"><Calendar className="size-3.5 text-amber-500" /> {new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    <div className="size-1 bg-zinc-300 rounded-full" />
                    <div className="flex items-center gap-1.5"><User className="size-3.5 text-amber-500" /> {post.author}</div>
                  </div>

                  <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-amber-500 transition-colors leading-tight line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-zinc-600 font-medium leading-relaxed line-clamp-3 text-sm">
                    {post.excerpt || post.content?.substring(0, 120)}...
                  </p>

                  <div className="pt-2 flex items-center gap-2 text-amber-500 text-[10px] font-black uppercase tracking-widest group-hover:gap-4 transition-all">
                    Read Full Article <ArrowRight className="size-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-40 text-center border-2 border-dashed border-zinc-200 rounded-[40px] bg-white/50">
             <h3 className="text-2xl font-black uppercase tracking-tight text-charcoal-900 mb-2">No Articles Yet</h3>
             <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Stay tuned for upcoming road trip guides</p>
          </div>
        )}
      </div>
    </div>
  )
}
