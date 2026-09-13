import manifest from '@/data/gallery.generated.json'
import captions from '@/data/captions.json'
import { categories, type Category } from '@/data/site'

export type Photo = {
  src: string
  width: number
  height: number
  blurDataURL: string
  alt: string
  /** Human-readable project name, shown in the lightbox caption. */
  caption: string
}

type ManifestEntry = {
  src: string
  width: number
  height: number
  blurDataURL?: string
  name: string
}

const manifestData = manifest as Record<string, ManifestEntry[]>
const captionData = captions as Record<string, string>

/** Filename fragments that should keep a non-title-case form. */
const CASING: Record<string, string> = {
  dbs: 'DBS',
  hsbc: 'HSBC',
  smu: 'SMU',
  ntu: 'NTU',
  nus: 'NUS',
  sg: 'SG',
  tr: 'TR',
  ap: 'AP',
  bmw: 'BMW',
  ge: 'GE',
  ui: 'UI',
  mice: 'MICE',
  dnd: 'D&D',
  loreal: "L'Oreal",
  x: 'x',
}

/**
 * Turns an optimised filename back into something readable.
 * "22nd-emirates-singapore-derby-5" -> "22nd Emirates Singapore Derby"
 *
 * Camera-roll filenames (dsc-4503e, img-2231, or a bare Facebook photo id) carry no
 * meaning, so they resolve to an empty string and the caller falls back to the
 * category name.
 */
export function humanise(name: string): string {
  const withoutIndex = name.replace(/-\d{1,3}$/, '')

  // Camera/CMS default names and long numeric ids tell the reader nothing.
  if (/^(dsc|dscf|img|imgp|p|pic|photo|untitled)[-_]?\d/i.test(withoutIndex)) return ''
  if (/^\d{6,}/.test(withoutIndex)) return ''

  const words = withoutIndex
    .split('-')
    .filter(Boolean)
    .map((word) => {
      const key = word.toLowerCase()
      if (CASING[key]) return CASING[key]
      // Keep things like "22nd" and "2017" as they are.
      if (/^\d/.test(word)) return word
      return word.charAt(0).toUpperCase() + word.slice(1)
    })

  const result = words.join(' ').trim()
  // A single leftover token is usually noise rather than a project name.
  return words.length < 2 && !/\d/.test(result) ? '' : result
}

function buildPhoto(entry: ManifestEntry, category: Category): Photo {
  // A hand-written caption in captions.json always wins over the derived one.
  const derived = humanise(entry.name)
  const caption = captionData[entry.name] ?? derived

  const alt = caption
    ? `${caption} - ${category.title.toLowerCase()} by Macrostudios Singapore`
    : `${category.title} photography in Singapore by Macrostudios`

  return {
    src: entry.src,
    width: entry.width,
    height: entry.height,
    blurDataURL: entry.blurDataURL ?? '',
    alt,
    caption: caption || category.title,
  }
}

export function photosFor(category: Category): Photo[] {
  const entries = manifestData[category.source] ?? []
  return entries.map((entry) => buildPhoto(entry, category))
}

export function photoCount(category: Category): number {
  return (manifestData[category.source] ?? []).length
}

/**
 * Cover image for a category card.
 *
 * Uses the hand-picked `cover` slug from src/data/site.ts. Picking automatically
 * gave two categories the same cover, because the same photograph is filed under
 * both products and advertising. Falls back to the widest available shot if a
 * cover slug no longer resolves.
 */
export function coverFor(category: Category): Photo | undefined {
  const photos = photosFor(category)
  if (photos.length === 0) return undefined

  const picked = photos.find((p) => p.src.endsWith(`/${category.cover}.webp`))
  if (picked) return picked

  const landscape = photos.filter((p) => p.width / p.height > 1.2)
  return (landscape.length > 0 ? landscape : photos)[0]
}

export type ClientLogo = { src: string; width: number; height: number; name: string }

export function clientLogos(): ClientLogo[] {
  const entries = manifestData.logos ?? []
  return entries.map((entry) => ({
    src: entry.src,
    width: entry.width,
    height: entry.height,
    name: humanise(entry.name) || entry.name,
  }))
}

/**
 * Hero images, hand-picked for impact and landscape crop.
 *
 * Ordered darkest-first: the headline and nav are set in bone over the top of these,
 * and a pale frame loses the type no matter how heavy the scrim. The Chanel retail
 * shot is the strongest image of the three but the brightest, so it runs second.
 *
 * Falls back to the widest available shots if any of these are renamed.
 */
const HERO_PICKS = [
  'allianz-ap-summit-1',
  'chanel-tr-dinner-10',
  '22nd-emirates-singapore-derby-1',
]

export function heroPhotos(): Photo[] {
  const eventsCategory = categories.find((c) => c.source === 'events')!
  const all = photosFor(eventsCategory)

  const picked = HERO_PICKS.map((name) =>
    all.find((p) => p.src.endsWith(`/${name}.webp`))
  ).filter((p): p is Photo => Boolean(p))

  if (picked.length > 0) return picked

  return all
    .filter((p) => p.width / p.height > 1.4)
    .slice(0, 3)
}
