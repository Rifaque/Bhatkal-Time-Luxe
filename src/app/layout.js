import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { getSettings } from "@/lib/settings";

const playfairDisplay = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export async function generateMetadata() {
  const { storeName } = await getSettings();
  return {
    metadataBase: new URL('https://bhatkaltimeluxe.in'),
    title: {
      default: storeName,
      template: `%s | ${storeName}`,
    },
    description: `${storeName} — Premium luxury watches. Explore our curated collection of fine timepieces.`,
    openGraph: {
      siteName: storeName,
      type: 'website',
      locale: 'en_US',
    },
  };
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Bhatkal Time Luxe',
  url: 'https://bhatkaltimeluxe.in',
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Bhatkal Time Luxe',
  url: 'https://bhatkaltimeluxe.in',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://bhatkaltimeluxe.in/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

