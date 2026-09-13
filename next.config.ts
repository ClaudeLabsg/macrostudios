import type { NextConfig } from 'next'

/**
 * 301s from the old WordPress URLs.
 *
 * Every one of these is currently indexed by Google. Without redirects the
 * rebuild would throw away twenty years of accumulated link equity and hand
 * every visitor from a search result a 404.
 */
const legacyRedirects = [
  // Portfolio sections
  { source: '/portfolio', destination: '/work' },
  { source: '/portfolio/events', destination: '/work/corporate-events' },
  { source: '/corporate-events', destination: '/work/corporate-events' },
  { source: '/portfolio/corporate-photos', destination: '/work/corporate-portraits' },
  { source: '/portfolio/products', destination: '/work/products' },
  { source: '/portfolio/ads', destination: '/work/advertising' },
  { source: '/celebrities', destination: '/work/celebrities' },

  // Duplicated / working pages that were live by accident.
  { source: '/portfolio/events-new', destination: '/work/corporate-events' },
  { source: '/portfolio/additional-events1025', destination: '/work/corporate-events' },

  // Thin pages (6 images, never linked from the nav) — folded into the portfolio index.
  { source: '/portfolio/portraiture', destination: '/work' },
  { source: '/portfolio/maternity', destination: '/work' },

  // Leftovers: a vcard, a transfer sample, and a client delivery page.
  { source: '/vcard', destination: '/contact' },
  { source: '/pf-sample', destination: '/' },
  { source: '/sgpools', destination: '/' },

  // Contact
  { source: '/contact-us', destination: '/contact' },
]

const nextConfig: NextConfig = {
  // A stray package-lock.json in the user's home directory otherwise gets picked up
  // as the workspace root. Pin it to this project.
  turbopack: { root: __dirname },

  images: {
    // Next 16 defaults `qualities` to [75] only. Photography needs more headroom,
    // so 82 (galleries) and 90 (lightbox/hero) are allowed explicitly.
    qualities: [75, 82, 85, 90],
    formats: ['image/avif', 'image/webp'],
    // Source images are already WebP; a long TTL keeps the optimizer cheap.
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },

  async redirects() {
    return legacyRedirects.map((r) => ({ ...r, permanent: true }))
  },

  async headers() {
    return [
      {
        // The old site sent no Cache-Control at all, so every visit re-downloaded
        // every photograph. These files are content-hashed by name and immutable.
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
}

export default nextConfig
