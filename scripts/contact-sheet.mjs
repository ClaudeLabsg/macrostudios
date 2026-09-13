/** Contact sheet for one category, so covers can be chosen by eye. Usage: node scripts/contact-sheet.mjs products */
import sharp from 'sharp'
import { readFileSync } from 'node:fs'

const cat = process.argv[2]
const manifest = JSON.parse(readFileSync('src/data/gallery.generated.json', 'utf8'))
const items = manifest[cat].slice(0, Number(process.argv[3] ?? 24))

const COLS = 6, CELL = 200, PAD = 6
const rows = Math.ceil(items.length / COLS)
const composites = []
for (const [i, it] of items.entries()) {
  const buf = await sharp('public' + it.src).resize(CELL, CELL, { fit: 'cover' }).toBuffer()
  composites.push({
    input: buf,
    left: (i % COLS) * (CELL + PAD),
    top: Math.floor(i / COLS) * (CELL + PAD),
  })
}
await sharp({
  create: { width: COLS * (CELL + PAD), height: rows * (CELL + PAD), channels: 3, background: '#0b0b0c' },
})
  .composite(composites)
  .png()
  .toFile(`scripts/tmp/sheet-${cat}.png`)

items.forEach((it, i) => console.log(String(i).padStart(2), it.name))
