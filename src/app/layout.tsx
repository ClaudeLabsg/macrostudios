import type { Metadata } from 'next'
import { Inter, Instrument_Serif } from 'next/font/google'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import { site, contact } from '@/data/site'
import './globals.css'

const sans = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
})

const display = Instrument_Serif({
  variable: '--font-display',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    // The single most valuable SEO tag on the site — the old build shipped this empty.
    default: `${site.name} | Corporate & Event Photography Singapore`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [
    'photographer Singapore',
    'corporate event photography Singapore',
    'corporate headshots Singapore',
    'product photography Singapore',
    'advertising photographer Singapore',
    'event photographer Singapore',
  ],
  authors: [{ name: site.photographer }],
  creator: site.photographer,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: `${site.name} | Corporate & Event Photography Singapore`,
    description: site.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} | Corporate & Event Photography Singapore`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

/**
 * LocalBusiness structured data. Helps Google show the business panel for
 * "photographer singapore" style queries and is what feeds rich results.
 */
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${site.url}/#business`,
  name: site.name,
  description: site.description,
  url: site.url,
  email: contact.email,
  telephone: contact.phone,
  image: `${site.url}/images/events/allianz-ap-summit-1.webp`,
  priceRange: '$$',
  areaServed: { '@type': 'Country', name: 'Singapore' },
  address: { '@type': 'PostalAddress', addressCountry: 'SG' },
  founder: { '@type': 'Person', name: site.photographer },
  foundingDate: String(site.foundedYear),
  sameAs: contact.socials.map((s) => s.href),
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en-SG"
      className={`${sans.variable} ${display.variable} h-full antialiased`}
    >
      <head>
        {/* Scroll-reveal starts at opacity 0; without JS nothing would ever reveal it. */}
        <noscript>
          <style>{`.reveal { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>
      </head>
      <body className="flex min-h-full flex-col bg-ink text-bone">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-sand focus:px-4 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  )
}
