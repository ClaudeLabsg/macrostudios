/**
 * Realistic first-visit transfer size.
 *
 * Text assets are measured brotli-compressed (what Vercel serves); images are
 * already compressed so their raw bytes are the transfer size. Only images the
 * browser fetches immediately (loading != "lazy") are counted.
 *
 * Run the production server first: npm run build && npm start
 */
import { brotliCompressSync } from 'node:zlib'

const BASE = process.env.BASE ?? 'http://127.0.0.1:3000'

const compressed = (buf) => brotliCompressSync(buf).length

async function fetchBuf(path) {
  const res = await fetch(BASE + path)
  return Buffer.from(await res.arrayBuffer())
}

async function measure(path, label) {
  const htmlBuf = await fetchBuf(path)
  const html = htmlBuf.toString()
  const htmlBytes = compressed(htmlBuf)

  const assets = [
    ...new Set([...html.matchAll(/\/_next\/static\/[^"]*?\.(?:js|css)/g)].map((m) => m[0])),
  ]
  let assetBytes = 0
  for (const a of assets) assetBytes += compressed(await fetchBuf(a))

  const imgTags = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0])
  const eager = imgTags.filter((t) => !/loading="lazy"/.test(t))
  let imgBytes = 0
  for (const tag of eager) {
    const src = tag.match(/src="([^"]+)"/)?.[1]
    if (src) imgBytes += (await fetchBuf(src.replace(/&amp;/g, '&'))).length
  }

  const total = htmlBytes + assetBytes + imgBytes
  const kb = (n) => (n / 1024).toFixed(0).padStart(4)
  console.log(
    `${label.padEnd(24)} html ${kb(htmlBytes)} | js+css ${kb(assetBytes)} | ` +
      `img ${kb(imgBytes)} (${eager.length} of ${imgTags.length}) | TOTAL ${kb(total)} KB`
  )
  return total
}

console.log('======== FIRST-VISIT TRANSFER (brotli text + raw images), KB ========')
const pages = [
  ['/', 'Homepage'],
  ['/work', 'Work index'],
  ['/work/advertising', 'Ads gallery (89)'],
  ['/work/corporate-events', 'Events gallery (52)'],
  ['/clients', 'Clients (57 logos)'],
  ['/about', 'About'],
  ['/services', 'Services'],
  ['/contact', 'Contact'],
]
let worst = 0
for (const [path, label] of pages) worst = Math.max(worst, await measure(path, label))
console.log(`\nHeaviest page: ${(worst / 1024).toFixed(0)} KB`)
