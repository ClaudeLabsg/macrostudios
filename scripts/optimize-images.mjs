/**
 * Converts the raw downloads in scripts/raw/ into web-ready WebP in public/images/,
 * and writes src/data/gallery.generated.json with dimensions + blur placeholders
 * so every <Image> renders with a known aspect ratio (zero layout shift).
 *
 * Run with: npm run images
 */
import sharp from 'sharp'
import { readdir, mkdir, writeFile, stat } from 'node:fs/promises'
import path from 'node:path'

const RAW = 'scripts/raw'
const OUT = 'public/images'
const MANIFEST = 'src/data/gallery.generated.json'

const PHOTO = { maxEdge: 2000, quality: 82 }
// Logos are rendered as bone-coloured silhouettes; see processLogo().
const LOGO = { maxWidth: 320, maxHeight: 120, quality: 90, tint: '#f5f3f0' }
// The studio's own logo was mixed into the client folder on the old site.
const NOT_A_CLIENT = /macrostudios/i

const slug = (name) =>
  path
    .basename(name, path.extname(name))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

async function blurPlaceholder(input) {
  const buf = await sharp(input).resize(12, 12, { fit: 'inside' }).webp({ quality: 25 }).toBuffer()
  return `data:image/webp;base64,${buf.toString('base64')}`
}

async function processPhoto(src, destDir, name) {
  const dest = path.join(destDir, `${name}.webp`)
  const meta = await sharp(src).rotate().metadata()
  const info = await sharp(src)
    .rotate() // honour EXIF orientation before stripping metadata
    .resize(PHOTO.maxEdge, PHOTO.maxEdge, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: PHOTO.quality })
    .toFile(dest)
  return {
    src: `/images/${path.basename(destDir)}/${name}.webp`,
    width: info.width,
    height: info.height,
    blurDataURL: await blurPlaceholder(src),
    bytes: info.size,
    original: meta.size ?? 0,
  }
}

/**
 * Per-logo strategy overrides, keyed by slug, for the few files the heuristic
 * in logoMask() cannot read correctly. Valid values:
 *   'alpha'      - alpha channel is the silhouette (dark mark on transparency)
 *   'light-ink'  - keep the light pixels (filled badge with light type inside)
 *   'dark-ink'   - keep the dark pixels (mark printed on a light ground)
 *
 * 'royal-caribbean' is left on auto deliberately: its source mixes white-on-navy
 * with navy-on-yellow, so no single polarity is right. The automatic result is
 * legible; pin it here if a one-colour master file ever turns up.
 */
const LOGO_STRATEGY = {
  // 'example-slug': 'light-ink',
}

/**
 * Builds the single-channel opacity mask for a logo.
 *
 * Client logos arrive as a mix of black-on-white JPEGs and transparent PNGs. Dropped
 * onto a near-black page as-is the dark ones vanish and the JPEGs show as white
 * rectangles, so each one is reduced to a bone silhouette on transparency and the
 * wall reads as one system regardless of what each brand team supplied.
 *
 * Three source shapes show up in this folder:
 *   - a dark mark on transparency, where the alpha channel is already the silhouette
 *   - a filled badge with light type inside it (Nintendo, Land Rover), where the
 *     badge outline is not the mark and only the light pixels should be kept
 *   - an opaque file with the mark printed on a light ground, where the inverted
 *     luminance is the silhouette
 *
 * NOTE: sharp's .stats() reads the *input* image and ignores operations chained
 * before it, so every measurement below is taken from raw pixels. Reading stats off
 * a pipeline silently returns untransformed numbers and misclassifies about a third
 * of these logos.
 */
async function logoMask(src, slug) {
  const override = LOGO_STRATEGY[slug]

  const { data, info } = await sharp(src)
    .rotate()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const n = info.width * info.height
  const ch = info.channels
  const alpha = Buffer.alloc(n)
  const luma = Buffer.alloc(n)

  let opaque = 0
  let bright = 0
  let lumaSum = 0

  for (let i = 0; i < n; i++) {
    const o = i * ch
    const a = data[o + 3]
    const l = (data[o] * 0.299 + data[o + 1] * 0.587 + data[o + 2] * 0.114) | 0
    alpha[i] = a
    luma[i] = l
    if (a > 128) {
      opaque++
      lumaSum += l
      if (l > 200) bright++
    }
  }

  // If nearly every pixel is opaque the alpha channel carries no shape.
  const alphaCarriesShape = opaque < n * 0.98
  const brightShare = opaque > 0 ? bright / opaque : 0
  const meanLuma = opaque > 0 ? lumaSum / opaque : 0

  const mask = Buffer.alloc(n)

  const strategy =
    override ??
    (alphaCarriesShape
      ? brightShare > 0.12
        ? 'light-ink'
        : 'alpha'
      : meanLuma >= 127
        ? 'dark-ink'
        : 'light-ink')

  if (strategy === 'alpha') {
    // A dark mark sitting on transparency: the alpha channel is the silhouette.
    alpha.copy(mask)
  } else if (strategy === 'light-ink') {
    // Light type, either inside a filled badge (Nintendo, Land Rover) or printed
    // on a dark ground. Keep the light pixels, bounded by any alpha shape.
    for (let i = 0; i < n; i++) mask[i] = (alpha[i] * luma[i]) / 255
  } else {
    // Dark mark printed on a light ground.
    for (let i = 0; i < n; i++) mask[i] = (alpha[i] * (255 - luma[i])) / 255
  }

  return sharp(mask, { raw: { width: info.width, height: info.height, channels: 1 } })
    .normalise()
    .toColourspace('b-w')
    .png()
    .toBuffer()
}

async function processLogo(src, destDir, name) {
  const dest = path.join(destDir, `${name}.webp`)

  const mask = await logoMask(src, name)
  const { width, height } = await sharp(mask).metadata()

  const silhouette = await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: LOGO.tint,
    },
  })
    .joinChannel(mask) // the mask becomes the alpha channel
    .png()
    .toBuffer()

  const info = await sharp(silhouette)
    // Trim the transparent margin so every logo optically fills its cell.
    .trim({ threshold: 2 })
    .resize(LOGO.maxWidth, LOGO.maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: LOGO.quality, alphaQuality: 100 })
    .toFile(dest)

  return {
    src: `/images/logos/${name}.webp`,
    width: info.width,
    height: info.height,
    bytes: info.size,
  }
}

async function run() {
  const categories = await readdir(RAW)
  const manifest = {}
  let before = 0
  let after = 0

  for (const cat of categories) {
    const srcDir = path.join(RAW, cat)
    let files = (await readdir(srcDir)).filter((f) => /\.(jpe?g|png)$/i.test(f))
    if (cat === 'logos') files = files.filter((f) => !NOT_A_CLIENT.test(f))
    if (files.length === 0) continue

    const destDir = path.join(OUT, cat)
    await mkdir(destDir, { recursive: true })

    const entries = []
    for (const file of files) {
      const src = path.join(srcDir, file)
      before += (await stat(src)).size
      try {
        const entry =
          cat === 'logos'
            ? await processLogo(src, destDir, slug(file))
            : await processPhoto(src, destDir, slug(file))
        after += entry.bytes
        entries.push({ ...entry, name: slug(file) })
      } catch (err) {
        console.warn(`  ! skipped ${file}: ${err.message}`)
      }
    }
    // Deterministic order so builds are reproducible.
    entries.sort((a, b) => a.name.localeCompare(b.name))
    manifest[cat] = entries
    const kb = (n) => `${(n / 1024).toFixed(0)} KB`
    const total = entries.reduce((s, e) => s + e.bytes, 0)
    console.log(`${cat.padEnd(12)} ${String(entries.length).padStart(3)} images  ${kb(total).padStart(9)}  (avg ${kb(total / entries.length)})`)
  }

  await mkdir(path.dirname(MANIFEST), { recursive: true })
  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2))

  const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`
  console.log(`\nTotal: ${mb(before)} -> ${mb(after)}  (${(100 - (after / before) * 100).toFixed(1)}% smaller)`)
}

run()
