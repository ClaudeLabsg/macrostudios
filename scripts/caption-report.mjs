/**
 * Lists every image whose filename carries no usable project name, so alt text
 * and lightbox captions can be written by hand.
 *
 * Output is a ready-to-paste JSON block for src/data/captions.json.
 * Run with: npm run captions
 */
import { readFileSync } from 'node:fs'

const manifest = JSON.parse(readFileSync('src/data/gallery.generated.json', 'utf8'))
const captions = JSON.parse(readFileSync('src/data/captions.json', 'utf8'))

// Mirrors humanise() in src/lib/gallery.ts.
const isMeaningless = (name) => {
  const base = name.replace(/-\d{1,3}$/, '')
  if (/^(dsc|dscf|img|imgp|p|pic|photo|untitled)[-_]?\d/i.test(base)) return true
  if (/^\d{6,}/.test(base)) return true
  return base.split('-').filter(Boolean).length < 2 && !/\d/.test(base)
}

const needed = []
let named = 0

for (const [category, entries] of Object.entries(manifest)) {
  if (category === 'logos') continue
  for (const entry of entries) {
    if (captions[entry.name]) continue
    if (isMeaningless(entry.name)) needed.push({ category, name: entry.name })
    else named += 1
  }
}

console.log(`Images with a usable name derived from the filename: ${named}`)
console.log(`Images needing a hand-written caption:               ${needed.length}`)

if (needed.length > 0) {
  console.log('\nPaste into src/data/captions.json and fill in the values:\n')
  const block = Object.fromEntries(needed.map((n) => [n.name, '']))
  console.log(JSON.stringify(block, null, 2))
}
