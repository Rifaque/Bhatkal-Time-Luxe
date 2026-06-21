import { notFound } from 'next/navigation';
import Link from 'next/link';
import { guides, getGuide } from '@/lib/guides';

const BASE_URL = 'https://bhatkaltimeluxe.in';

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return { title: 'Guide Not Found' };

  return {
    title: guide.title,
    description: guide.description,
    openGraph: {
      title: guide.title,
      description: guide.description,
      type: 'article',
      publishedTime: guide.publishedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.title,
      description: guide.description,
    },
  };
}

function renderSection(section, idx) {
  switch (section.type) {
    case 'h2':
      return (
        <h2 key={idx} className="text-xl md:text-2xl font-serif font-bold text-white mt-8 mb-3">
          {section.text}
        </h2>
      );
    case 'p':
      return (
        <p key={idx} className="text-gray-300 leading-relaxed mb-4">
          {section.text}
        </p>
      );
    case 'ul':
      return (
        <ul key={idx} className="space-y-2 mb-6 pl-1">
          {section.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-gray-300 text-sm leading-relaxed">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-[#D1B23E] shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      );
    case 'cta':
      return (
        <div key={idx} className="my-8 p-5 rounded-2xl border border-[#D1B23E]/20 bg-[#D1B23E]/5">
          <p className="text-sm text-gray-400 mb-3">Ready to find your timepiece?</p>
          <Link
            href={section.href}
            className="inline-flex items-center gap-2 bg-[#D1B23E] text-black text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#c1a22e] transition-colors"
          >
            {section.label}
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      );
    default:
      return null;
  }
}

export default async function GuidePage({ params }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    datePublished: guide.publishedAt,
    author: { '@type': 'Organization', name: 'Bhatkal Time Luxe' },
    publisher: {
      '@type': 'Organization',
      name: 'Bhatkal Time Luxe',
      url: BASE_URL,
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}/guides/${guide.slug}` },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: `${BASE_URL}/guides` },
      { '@type': 'ListItem', position: 3, name: guide.title },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="min-h-screen bg-[#1a1a1a] text-white">
        {/* Back nav */}
        <div className="max-w-3xl mx-auto px-5 md:px-8 pt-10">
          <Link
            href="/guides"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#D1B23E] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
              <path d="M9.5 6h-7M5.5 3L2.5 6l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            All Guides
          </Link>
        </div>

        {/* Article header */}
        <header className="max-w-3xl mx-auto px-5 md:px-8 pt-6 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#D1B23E]">
              {guide.category}
            </span>
            <span className="text-gray-700">·</span>
            <span className="text-[11px] text-gray-600">{guide.readTime} read</span>
            <span className="text-gray-700">·</span>
            <time className="text-[11px] text-gray-600" dateTime={guide.publishedAt}>
              {new Date(guide.publishedAt).toLocaleDateString('en', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </time>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white leading-snug mb-4">
            {guide.title}
          </h1>
          <p className="text-gray-400 leading-relaxed">{guide.description}</p>
          <div className="h-px bg-white/8 mt-8" />
        </header>

        {/* Article body */}
        <article className="max-w-3xl mx-auto px-5 md:px-8 pb-16">
          {guide.sections.map((section, idx) => renderSection(section, idx))}
        </article>

        {/* Footer nav */}
        <div className="max-w-3xl mx-auto px-5 md:px-8 pb-16 border-t border-white/5 pt-8">
          <p className="text-xs text-gray-600 mb-4">Continue exploring</p>
          <div className="flex gap-3 flex-wrap">
            <Link href="/new-arrivals" className="text-xs text-[#D1B23E] border border-[#D1B23E]/30 px-3 py-1.5 rounded-lg hover:bg-[#D1B23E]/10 transition-colors">
              New Arrivals
            </Link>
            <Link href="/brands" className="text-xs text-gray-400 border border-white/10 px-3 py-1.5 rounded-lg hover:border-white/20 transition-colors">
              Browse Brands
            </Link>
            <Link href="/guides" className="text-xs text-gray-400 border border-white/10 px-3 py-1.5 rounded-lg hover:border-white/20 transition-colors">
              More Guides
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
