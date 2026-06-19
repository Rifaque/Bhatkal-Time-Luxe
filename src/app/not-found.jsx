import Link from 'next/link';

export const metadata = {
  title: 'Page Not Found',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md">
        <p className="text-[10px] uppercase tracking-[0.4em] text-[#D1B23E] font-semibold mb-5">
          404
        </p>
        <h1 className="text-4xl font-serif font-bold mb-4 text-white">
          Page Not Found
        </h1>
        <p className="text-gray-400 text-sm mb-10 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
          Browse our collection below.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="bg-[#D1B23E] text-black font-semibold px-8 py-3 rounded-xl text-sm hover:bg-[#c1a22e] transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/brands"
            className="border border-white/10 text-white font-semibold px-8 py-3 rounded-xl text-sm hover:border-white/20 hover:bg-white/5 transition-colors"
          >
            Browse Brands
          </Link>
          <Link
            href="/search"
            className="border border-white/10 text-white font-semibold px-8 py-3 rounded-xl text-sm hover:border-white/20 hover:bg-white/5 transition-colors"
          >
            Search
          </Link>
        </div>
      </div>
    </div>
  );
}
