/**
 * Derives every piece of Macrostudios brand artwork from the one supplied master,
 * scripts/raw/brand/macrostudios-logo-black.jpg.
 *
 * Run with: npm run brand
 *
 * The master is a stacked lockup printed black on white: a camera-lens mark, the
 * MACROSTUDIOS wordmark, then the "Visual Architect" line. Two things follow from
 * that, and they are the whole reason this script exists.
 *
 * 1. It is the wrong polarity. Dropped onto a #0b0b0c page a black-on-white JPEG
 *    shows as a white card, so the ink is reduced to a bone silhouette on
 *    transparency - the same treatment optimize-images.mjs gives the client logos,
 *    so the studio's own mark sits in the same visual system as the wall of clients.
 *
 * 2. It is stacked, and a stacked lockup cannot be read in an 80px header: the
 *    wordmark ends up around 7px tall. So the master is split into its parts and
 *    the header re-sets them side by side. The bands are *measured*, not hardcoded
 *    - see splitBands() - because a re-exported master with different padding would
 *    silently shift any fixed crop and slice the mark in half.
 *
 * Outputs (all committed; this does not run at build time):
 *   public/images/brand/macrostudios-mark.webp      lens only, for the header
 *   public/images/brand/macrostudios-wordmark.webp  type only, for the header
 *   public/images/brand/macrostudios-logo.webp      full stacked lockup, for the footer
 *   src/data/brand.generated.json                   dimensions, so <Image> gets an aspect ratio
 *   src/app/icon.png, apple-icon.png, favicon.ico   tab and home-screen icons
 *   src/app/opengraph-image.jpg                     link share card
 */
import sharp from 'sharp'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const MASTER = 'scripts/raw/brand/macrostudios-logo-black.jpg'
const OUT = 'public/images/brand'
const APP = 'src/app'
const MANIFEST = 'src/data/brand.generated.json'

const BONE = '#f5f3f0' // --color-bone
const INK = '#0b0b0c' // --color-ink
const PAPER = '#edeae4' // --surface in the light theme, i.e. the footer's background

/** The photograph behind the share card. Darkest of the hero picks, so type holds. */
const OG_BACKDROP = 'public/images/events/allianz-ap-summit-1.webp'

/**
 * Finds the horizontal bands of ink in the master and the tight column extents of
 * each, by thresholding luminance. Returns bands top-to-bottom.
 *
 * The master has generous white padding and clean gutters between the three
 * elements, so a simple "which rows contain any dark pixel" scan separates them
 * exactly. Bands thinner than a few pixels are dropped: JPEG ringing along the
 * edges of the artwork can otherwise register as its own one-row band.
 */
async function splitBands(src) {
  const { data, info } = await sharp(src)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const { width, height } = info
  const isInk = (x, y) => data[y * width + x] < 128

  const bands = []
  let start = null
  for (let y = 0; y <= height; y++) {
    let rowHasInk = false
    if (y < height) {
      for (let x = 0; x < width; x++) {
        if (isInk(x, y)) {
          rowHasInk = true
          break
        }
      }
    }
    if (rowHasInk && start === null) start = y
    if (!rowHasInk && start !== null) {
      if (y - start > 4) bands.push({ top: start, height: y - start })
      start = null
    }
  }

  // Tight column extents per band, so each crop carries no side padding of its own.
  for (const band of bands) {
    let left = width
    let right = 0
    for (let y = band.top; y < band.top + band.height; y++) {
      for (let x = 0; x < width; x++) {
        if (isInk(x, y)) {
          if (x < left) left = x
          if (x > right) right = x
        }
      }
    }
    band.left = left
    band.width = right - left + 1
  }

  return bands
}

/**
 * Crops a region of the master and returns it as a flat-coloured silhouette on
 * transparency - bone by default, ink where the artwork sits on a light tile.
 *
 * The mask is inverted luminance - the master is dark ink on a light ground, so the
 * darkest pixels become the most opaque - and it doubles as the antialiasing, which
 * is why the edges stay smooth instead of stair-stepping. `normalise` pulls the
 * JPEG's not-quite-white paper back to true transparent.
 */
async function silhouette(src, region, colour = BONE) {
  const { data, info } = await sharp(src)
    .extract(region)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const mask = Buffer.alloc(info.width * info.height)
  for (let i = 0; i < mask.length; i++) mask[i] = 255 - data[i]

  const alpha = await sharp(mask, {
    raw: { width: info.width, height: info.height, channels: 1 },
  })
    .normalise()
    .toColourspace('b-w')
    .png()
    .toBuffer()

  return sharp({
    create: { width: info.width, height: info.height, channels: 3, background: colour },
  })
    .joinChannel(alpha)
    .png()
    .toBuffer()
}

/** Writes a silhouette out as WebP and returns its manifest entry. */
async function writeAsset(png, name) {
  const dest = path.join(OUT, `${name}.webp`)
  const info = await sharp(png).webp({ quality: 92, alphaQuality: 100 }).toFile(dest)
  return { src: `/images/brand/${name}.webp`, width: info.width, height: info.height }
}

/**
 * A square app icon: the lens mark in ink on a paper tile.
 *
 * Deliberately not transparent. A mark on nothing takes the colour of whatever tab
 * bar or home screen it lands on, and a 16px favicon has no room for the wordmark,
 * so the tile carries a fixed ground and the mark alone identifies it.
 *
 * Ink-on-paper rather than bone-on-ink: the master is drawn as a dark barrel with
 * light ridge lines, so lifting it onto a dark tile prints the negative of the lens
 * - legible, but not the logo. This is the footer lockup in the light theme, boxed.
 */
async function iconTile(markPng, size) {
  const inset = Math.round(size * 0.18)
  const mark = await sharp(markPng)
    .resize(size - inset * 2, size - inset * 2, { fit: 'inside' })
    .toBuffer()
  const { width, height } = await sharp(mark).metadata()

  return sharp({ create: { width: size, height: size, channels: 4, background: PAPER } })
    .composite([
      {
        input: mark,
        left: Math.round((size - width) / 2),
        top: Math.round((size - height) / 2),
      },
    ])
    .png()
    .toBuffer()
}

/**
 * Packs PNGs into a multi-size .ico.
 *
 * sharp has no ICO encoder and the format needs no library: a 6-byte header, one
 * 16-byte directory entry per image, then the payloads. PNG payloads are read by
 * every browser released this past decade. A 256px entry records its dimension as 0,
 * which is how the format spells "256".
 */
function packIco(images) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(images.length, 4)

  const dir = Buffer.alloc(16 * images.length)
  let offset = header.length + dir.length
  images.forEach(({ size, buf }, i) => {
    const o = i * 16
    dir[o] = size >= 256 ? 0 : size
    dir[o + 1] = size >= 256 ? 0 : size
    dir.writeUInt16LE(1, o + 4) // colour planes
    dir.writeUInt16LE(32, o + 6) // bits per pixel
    dir.writeUInt32LE(buf.length, o + 8)
    dir.writeUInt32LE(offset, o + 12)
    offset += buf.length
  })

  return Buffer.concat([header, dir, ...images.map((i) => i.buf)])
}

/**
 * 1200x630 share card: the lockup on an ink panel, an event photograph beside it.
 *
 * The obvious build - logo centred over a full-bleed photo behind a scrim - was
 * tried first and rejected. Darkening a photograph enough for bone type to hold
 * turns it into grey haze, which is a poor advertisement for a photographer. A hard
 * split keeps the photograph at full strength and gives the type a clean ground;
 * the gradient only softens the seam where the two meet.
 */
async function shareCard(logoPng) {
  const W = 1200
  const H = 630
  const SPLIT = Math.round(W * 0.46)

  const seam = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W - SPLIT}" height="${H}">
       <defs><linearGradient id="g" x1="0" x2="1">
         <stop offset="0" stop-color="${INK}" stop-opacity="1"/>
         <stop offset="0.4" stop-color="${INK}" stop-opacity="0"/>
       </linearGradient></defs>
       <rect width="100%" height="100%" fill="url(#g)"/>
     </svg>`
  )

  const photo = await sharp(OG_BACKDROP)
    .resize(W - SPLIT, H, { fit: 'cover', position: 'attention' })
    .composite([{ input: seam }])
    .png()
    .toBuffer()

  const logo = await sharp(logoPng)
    .resize({ width: Math.round(SPLIT * 0.66) })
    .toBuffer()
  const { width, height } = await sharp(logo).metadata()

  return sharp({ create: { width: W, height: H, channels: 4, background: INK } })
    .composite([
      { input: photo, left: SPLIT, top: 0 },
      {
        input: logo,
        left: Math.round((SPLIT - width) / 2),
        top: Math.round((H - height) / 2),
      },
    ])
    // JPEG, not PNG: this is a photograph with type over it, and the PNG of the same
    // card is six times the size for no visible gain in a 1200px preview.
    .jpeg({ quality: 88, chromaSubsampling: '4:4:4' })
    .toBuffer()
}

async function run() {
  const bands = await splitBands(MASTER)
  if (bands.length !== 3) {
    throw new Error(
      `Expected 3 bands in the master (mark, wordmark, tagline), found ${bands.length}. ` +
        `If the logo was re-exported, check the crops before trusting the output.`
    )
  }

  const [markBand, nameBand, taglineBand] = bands
  const box = (...bs) => {
    const left = Math.min(...bs.map((b) => b.left))
    const top = Math.min(...bs.map((b) => b.top))
    return {
      left,
      top,
      width: Math.max(...bs.map((b) => b.left + b.width)) - left,
      height: Math.max(...bs.map((b) => b.top + b.height)) - top,
    }
  }

  await mkdir(OUT, { recursive: true })

  const markPng = await silhouette(MASTER, box(markBand))
  // The icons are the one output on a light ground, so their mark is cut in ink.
  const markInkPng = await silhouette(MASTER, box(markBand), INK)
  // Wordmark and tagline travel together: they are one typographic unit and the
  // space between them is part of the lockup.
  const wordmarkPng = await silhouette(MASTER, box(nameBand, taglineBand))
  const logoPng = await silhouette(MASTER, box(markBand, nameBand, taglineBand))

  const manifest = {
    mark: await writeAsset(markPng, 'macrostudios-mark'),
    wordmark: await writeAsset(wordmarkPng, 'macrostudios-wordmark'),
    logo: await writeAsset(logoPng, 'macrostudios-logo'),
  }
  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')

  await writeFile(path.join(APP, 'icon.png'), await iconTile(markInkPng, 512))
  await writeFile(path.join(APP, 'apple-icon.png'), await iconTile(markInkPng, 180))
  await writeFile(
    path.join(APP, 'favicon.ico'),
    packIco(
      await Promise.all(
        [16, 32, 48, 256].map(async (size) => ({
          size,
          buf: await iconTile(markInkPng, size),
        }))
      )
    )
  )

  await writeFile(path.join(APP, 'opengraph-image.jpg'), await shareCard(logoPng))

  for (const [key, entry] of Object.entries(manifest)) {
    console.log(`${key.padEnd(9)} ${entry.width}x${entry.height}  ${entry.src}`)
  }
  console.log('icons     icon.png, apple-icon.png, favicon.ico')
  console.log('share     opengraph-image.jpg  1200x630')
}

run()
