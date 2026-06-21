import Link from 'next/link';
import { guides } from '@/lib/guides';

export const metadata = {
  title: 'Watch Guides',
  description:
    'Expert guides on luxury watches — comparisons, buying advice, authentication, and the Kuwait watch market. Written by the Bhatkal Time Luxe team.',
  openGraph: {
    title: 'Watch Guides — Bhatkal Time Luxe',
    description:
      'Expert guides on luxury watches — comparisons, buying advice, and authentication tips.',
    type: 'website',
  },
};

const CATEGORY_COLORS = {
  Comparison:    'text-blue-400 bg-blue-400/10 border-blue-400/20',
  'Buying Guide': 'text-[#D1B23E] bg-[#D1B23E]/10 border-[#D1B23E]/20',
  Education:     'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  Market:        'text-purple-400 bg-purple-400/10 border-purple-400/20',
};

export default function GuidesPage() {
  return (
    <main className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-5 md:px-8 pt-16 pb-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D1B23E] font-semibold mb-3">
          Knowledge Base
        </p>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
          Watch Guides
        </h1>
        <p className="text-gray-400 text-base leading-relaxed max-w-xl">
          Expert insight on luxury horology — from buying your first timepiece to
          authenticating rare references.
        </p>
      </div>

      <div className="h-px bg-white/5 max-w-5xl mx-auto mb-10" />

      {/* Guide grid */}
      <div className="max-w-5xl mx-auto px-5 md:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="group block rounded-2xl border border-white/8 bg-white/[0.025] p-6 transition-all hover:border-[#D1B23E]/30 hover:bg-white/[0.04]"
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[guide.category] || 'text-gray-400 bg-white/5 border-white/10'}`}
                >
                  {guide.category}
                </span>
                <span className="text-[11px] text-gray-600">{guide.readTime} read</span>
              </div>
              <h2 className="font-serif font-bold text-white text-lg leading-snug mb-2 group-hover:text-[#D1B23E] transition-colors">
                {guide.title}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                {guide.description}
              </p>
              <div className="mt-4 text-xs text-[#D1B23E] font-semibold tracking-wide flex items-center gap-1">
                Read Guide
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="transition-transform group-hover:translate-x-0.5">
                  <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
