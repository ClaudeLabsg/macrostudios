/**
 * Single source of truth for business details, navigation and portfolio structure.
 *
 * PLACEHOLDERS: search this file for "TODO" before going live. Anything marked TODO
 * is a value that could not be verified from the existing site, so it must be filled
 * in by hand rather than guessed.
 */

export const site = {
  name: 'Macrostudios',
  // The watermark on the event photography reads "Visual Architect" - reused as the brand line.
  tagline: 'Visual Architect',
  legalName: 'Macrostudios',
  uen: '53259273E',
  photographer: 'Larry Lim',
  description:
    'Corporate event, portrait, product and advertising photography in Singapore. Twenty years behind the camera for brands including Chanel, DBS, HSBC and Nintendo.',
  url: 'https://www.macrostudios.sg',
  locale: 'en_SG',
  foundedYear: 2014,
  yearsExperience: 20,
} as const

export const contact = {
  email: 'larry@macrostudios.sg',
  /** TODO: real number. Used for the tel: link and the WhatsApp deep link. */
  phone: '+65 0000 0000',
  /** TODO: digits only, no "+" or spaces, e.g. 6591234567 */
  whatsapp: '6500000000',
  /** TODO: confirm - shown on the contact page so enquirers know when to expect a reply. */
  responseTime: 'within one business day',
  /** TODO: confirm operating hours. */
  hours: 'Mon-Fri, 9am-6pm SGT',
  socials: [
    { label: 'Instagram', href: 'https://www.instagram.com/macrostudios.sg/' },
    { label: 'Facebook', href: 'https://www.facebook.com/macro.studios.sg/' },
  ],
} as const

export const whatsappLink = (
  message = 'Hi Larry, I would like to enquire about a shoot.'
) => `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`

export type CategorySlug =
  | 'corporate-events'
  | 'corporate-portraits'
  | 'products'
  | 'advertising'
  | 'celebrities'

export type Category = {
  slug: CategorySlug
  /** Key into gallery.generated.json */
  source: string
  title: string
  /** Used in nav and cards where the full title is too long */
  shortTitle: string
  blurb: string
  /** Longer intro shown at the top of the gallery page */
  intro: string
  metaDescription: string
  /**
   * Slug of the image used on category cards, chosen by eye rather than picked
   * automatically. Two categories otherwise ended up sharing a cover, because the
   * same photograph exists in both the products and advertising folders.
   */
  cover: string
}

export const categories: Category[] = [
  {
    slug: 'corporate-events',
    source: 'events',
    cover: '22nd-emirates-singapore-derby-1',
    title: 'Corporate Events',
    shortTitle: 'Events',
    blurb:
      'Conferences, galas, launches and award nights - covered discreetly, delivered fast.',
    intro:
      'Company D&Ds, product launches, conferences and award ceremonies. I work the room quietly, get the handshakes and the keynote and the candid moments in between, and turn them around while the event is still news.',
    metaDescription:
      'Corporate event photography in Singapore - conferences, D&Ds, product launches and award nights. Fast turnaround, 20 years experience. Clients include Allianz, Chanel and Emirates.',
  },
  {
    slug: 'corporate-portraits',
    source: 'corporate',
    cover: 'standard-chartered-6',
    title: 'Corporate Photography',
    shortTitle: 'Corporate',
    blurb: 'Headshots and team portraits that look like your people on a good day.',
    intro:
      'Executive headshots, team portraits and workplace photography. Consistent lighting and framing across the whole team, so your leadership page looks deliberate rather than assembled from whatever everyone had on file.',
    metaDescription:
      'Corporate headshots and team portrait photography in Singapore. Consistent, professional executive portraits shot on location or in studio.',
  },
  {
    slug: 'products',
    source: 'products',
    cover: 'hais-sambal-chilli',
    title: 'Product Photography',
    shortTitle: 'Products',
    blurb: 'Clean studio work for catalogues, e-commerce and packaging.',
    intro:
      'Studio product photography for e-commerce listings, catalogues and packaging. Controlled lighting, accurate colour and consistent angles across a full range - shot so the set still matches when you add to it next season.',
    metaDescription:
      'Product photography in Singapore for e-commerce, catalogues and packaging. Clean studio lighting and accurate colour reproduction.',
  },
  {
    slug: 'advertising',
    source: 'ads',
    cover: 'business-times-1',
    title: 'Advertising & Publications',
    shortTitle: 'Advertising',
    blurb: 'Campaign and editorial work for print, out-of-home and digital.',
    intro:
      'Commissioned campaign and editorial photography - press advertising, out-of-home, brand collateral and magazine features. Shot to a brief, art-directed, and delivered in the crops and colour spaces the layout actually needs.',
    metaDescription:
      'Advertising and editorial photography in Singapore. Campaign, print, out-of-home and publication work for agencies and brands.',
  },
  {
    slug: 'celebrities',
    source: 'celebrities',
    cover: 'denise-keller',
    title: 'Celebrities & Personalities',
    shortTitle: 'Celebrities',
    blurb: 'Talent, ambassadors and public figures, shot on tight schedules.',
    intro:
      'Portrait and appearance photography for talent, brand ambassadors and public figures. Usually a short window and a lot of people waiting - the setup is ready before they walk in.',
    metaDescription:
      'Celebrity and personality photography in Singapore. Portraits and appearance coverage for talent, ambassadors and public figures.',
  },
]

export const categoryBySlug = (slug: string) =>
  categories.find((c) => c.slug === slug)

export const nav = [
  { href: '/work', label: 'Work' },
  { href: '/services', label: 'Services' },
  { href: '/clients', label: 'Clients' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const

/**
 * DELIBERATELY EMPTY.
 *
 * Testimonials must be real. Inventing quotes and attributing them to identifiable
 * companies (Chanel, DBS, HSBC) would be fabricating endorsements - a legal and
 * reputational risk, not just a style problem.
 *
 * Add entries here as clients send them and the homepage section appears
 * automatically; while the array is empty the section is skipped entirely.
 */
export type Testimonial = {
  quote: string
  name: string
  role: string
  company: string
}

export const testimonials: Testimonial[] = []

/**
 * Service packages. Prices are TODO - there is no visibility into the real rate card.
 * `priceFrom: null` renders "On request" instead of a number, so the page stays honest
 * until real figures are filled in.
 */
export type Service = {
  name: string
  description: string
  priceFrom: number | null
  unit: string
  includes: string[]
}

export const services: Service[] = [
  {
    name: 'Corporate Events',
    description:
      'Conferences, D&Ds, launches, award nights and AGMs. Coverage from a single hour to multi-day programmes.',
    priceFrom: null, // TODO e.g. 600
    unit: 'per hour, 2-hour minimum',
    includes: [
      'Full-resolution edited images',
      'Online gallery for the whole team',
      'Next-day preview selection',
      'Commercial usage licence',
    ],
  },
  {
    name: 'Corporate Portraits',
    description:
      'Executive headshots and team portraits, on location at your office or in studio.',
    priceFrom: null, // TODO
    unit: 'per person, from 8 people',
    includes: [
      'Consistent lighting across the team',
      'Retouched final selects',
      'Plain or environmental backgrounds',
      'Web and print crops supplied',
    ],
  },
  {
    name: 'Product Photography',
    description: 'Studio shoots for e-commerce, catalogues and packaging.',
    priceFrom: null, // TODO
    unit: 'per product angle',
    includes: [
      'Studio lighting and styling',
      'Pure white or custom backgrounds',
      'Colour-accurate output',
      'Clipping paths on request',
    ],
  },
  {
    name: 'Advertising & Editorial',
    description:
      'Campaign and publication work, shot to brief with your art director on set.',
    priceFrom: null, // TODO
    unit: 'quoted per project',
    includes: [
      'Pre-production and treatment',
      'Crew and studio coordination',
      'Art-directed on set',
      'Usage licensed to the campaign',
    ],
  },
]
