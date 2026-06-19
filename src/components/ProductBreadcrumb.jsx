import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function ProductBreadcrumb({ brand, productName, className = '' }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-1 text-[11px] text-gray-600 flex-wrap">
        <li>
          <Link href="/" className="hover:text-[#D1B23E] transition-colors">
            Home
          </Link>
        </li>
        {brand && (
          <>
            <li><ChevronRight size={9} className="opacity-40 shrink-0" aria-hidden="true" /></li>
            <li>
              <Link href={`/brands/${brand._id}`} className="hover:text-[#D1B23E] transition-colors">
                {brand.name}
              </Link>
            </li>
          </>
        )}
        <li><ChevronRight size={9} className="opacity-40 shrink-0" aria-hidden="true" /></li>
        <li className="text-gray-500 truncate max-w-[160px] lg:max-w-xs" aria-current="page">{productName}</li>
      </ol>
    </nav>
  );
}
