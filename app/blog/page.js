import Link from 'next/link'
import { ArrowRight, Calendar, User, Clock, ChevronRight } from 'lucide-react'
import { getDb } from '@/lib/mongo'

export const metadata = {
  title: 'Blog | Kasika Self Drive',
  description: 'Read the latest road trip guides, travel tips, and updates from Kasika.'
}

export default async function BlogList() {
  const db = await getDb()
  const posts = await db.collection('blogs').find({}).sort({ createdAt: -1 }).toArray()

  return (
    <div className="bg-[#020617] pt-40 pb-32 min-h-screen text-white">
      <div className="container mx-auto px-6">
        
        {/* HERO SECTION */}
        <div className="max-w-4xl mb-24">
          <div className="flex items-center gap-3 text-amber-500 font-black uppercase tracking-[0.4em] text-[10px] mb-6">
            <span className="opacity-50">Journal</span>
            <ChevronRight className="size-3" />
            <span>The Open Road</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-8 leading-none">
            Perspective <br/> <span className="text-amber-500">& Insights.</span>
          </h1>
          <p className="text-slate-400 font-medium text-xl leading-relaxed max-w-2xl">
            Expert travel itineraries, technical driving guides, and the latest news from the Kasika fleet.
          </p>
        </div>

        {/* POSTS GRID */}
        {posts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {posts.map((post) => (
              <Link key={post._id.toString()} href={`/blog/${post.slug}`} className="group flex flex-col h-full">
                <div className="relative aspect-[4/3] rounded-[40px] overflow-hidden mb-8 bg-slate-900 border border-white/5">
                  <img 
                    src={post.coverImage || 'https://images.unsplash.com/photo-1542362567-b054cd1321c1'} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  />
                  <div className="absolute top-6 left-6 bg-amber-500 text-[#020617] font-black uppercase tracking-widest text-[9px] px-4 py-2 rounded-full shadow-2xl">
                    {post.category || 'General'}
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-1.5"><Calendar className="size-3.5 text-amber-500" /> {new Date(post.createdAt).toLocaleDateString()}</div>
                    <div className="size-1 bg-slate-800 rounded-full" />
                    <div className="flex items-center gap-1.5"><User className="size-3.5 text-amber-500" /> {post.author}</div>
                  </div>
                  
                  <h3 className="text-2xl font-black uppercase tracking-tight group-hover:text-amber-500 transition-colors leading-tight">
                    {post.title}
                  </h3>
                  
                  <p className="text-slate-400 font-medium leading-relaxed line-clamp-3">
                    {post.excerpt || post.content?.substring(0, 120)}...
                  </p>

                  <div className="pt-4 flex items-center gap-2 text-amber-500 text-[10px] font-black uppercase tracking-widest group-hover:gap-4 transition-all">
                    Read Full Article <ArrowRight className="size-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-40 text-center border-2 border-dashed border-white/5 rounded-[60px]">
             <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-2">No Articles Yet</h3>
             <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Stay tuned for upcoming road trip guides</p>
          </div>
        )}
      </div>
    </div>
  )
}
