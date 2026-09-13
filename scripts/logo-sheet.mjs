/** Renders every processed logo onto the site background so the wall can be eyeballed. */
import sharp from 'sharp'
import { readdirSync } from 'node:fs'

const DIR = 'public/images/logos'
const COLS = 5, CELL_W = 260, CELL_H = 90, PAD = 20
const files = readdirSync(DIR).filter((f) => f.endsWith('.webp')).sort()
const rows = Math.ceil(files.length / COLS)

const W = COLS * (CELL_W + PAD) + PAD
const H = rows * (CELL_H + PAD) + PAD

const composites = []
for (const [i, f] of files.entries()) {
  const buf = await sharp(`${DIR}/${f}`)
    .resize(CELL_W - 40, CELL_H - 30, { fit: 'inside', withoutEnlargement: true })
    .toBuffer()
  const m = await sharp(buf).metadata()
  const col = i % COLS, row = Math.floor(i / COLS)
  composites.push({
    input: buf,
    left: Math.round(PAD + col * (CELL_W + PAD) + (CELL_W - m.width) / 2),
    top: Math.round(PAD + row * (CELL_H + PAD) + (CELL_H - m.height) / 2),
  })
}

await sharp({ create: { width: W, height: H, channels: 3, background: '#0b0b0c' } })
  .composite(composites)
  .png()
  .toFile('scripts/tmp/logo-sheet.png')

console.log(`${files.length} logos ->  scripts/tmp/logo-sheet.png  (${W}x${H})`)
