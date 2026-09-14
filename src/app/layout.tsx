import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { site, contact } from '@/data/site'
import './globals.css'

const sans = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
})

/*
  Playfair Display, not a condensed serif. The headline sizes here run to 6rem and the
  same face is reused down at 1.25rem on card titles, so it needs open letterforms and
  a real weight range rather than a single tightly-drawn display cut.
*/
const display = Playfair_Display({
  variable: '--font-display',
  subsets: ['latin'],
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
  // No `telephone`: email is the only published channel, so there is no number for
  // Google to surface in the business panel. See the note on `contact` in data/site.
  email: contact.email,
  image: `${site.url}/images/events/allianz-ap-summit-1.webp`,
  logo: `${site.url}/images/brand/macrostudios-logo.webp`,
  priceRange: '$$',
  areaServed: { '@type': 'Country', name: 'Singapore' },
  address: { '@type': 'PostalAddress', addressCountry: 'SG' },
  founder: { '@type': 'Person', name: site.photographer },
  foundingDate: String(site.foundedYear),
  sameAs: contact.socials.map((s) => s.href),
}

/*
  Applies the stored theme before first paint, so a returning visitor on dark never
  sees a frame of the light default. Light rather than the system preference is the
  deliberate default: the audience is corporate, and most of them are on a bright
  office monitor. `theme-light` is already on the element, so this only ever has work
  to do for someone who has chosen dark.
*/
const themeScript = `try{var t=localStorage.getItem('theme');if(t==='dark'){var e=document.documentElement;e.classList.remove('theme-light');e.classList.add('theme-dark');var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content','#0b0b0c')}}catch(e){}`

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    // The theme script rewrites the class list before React sees it.
    <html
      lang="en-SG"
      suppressHydrationWarning
      className={`${sans.variable} ${display.variable} theme-light h-full antialiased`}
    >
      <head>
        <meta name="theme-color" content="#edeae4" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  )
}
