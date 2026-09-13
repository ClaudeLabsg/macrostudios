import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = 'http://127.0.0.1:3000'
const OUT = 'scripts/shots'
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()

const shoot = async (name, path, viewport, fullPage = false) => {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 })
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(String(e)))

  await page.goto(BASE + path, { waitUntil: 'networkidle' })
  // Let reveal animations settle.
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage })
  if (errors.length) console.log(`  ! ${name} console errors:`, errors.slice(0, 3))
  await page.close()
}

const DESKTOP = { width: 1440, height: 900 }
const MOBILE = { width: 390, height: 844 }

await shoot('01-home-desktop', '/', DESKTOP)
await shoot('02-home-scroll', '/', { width: 1440, height: 3200 })
await shoot('03-work', '/work', DESKTOP)
await shoot('04-gallery', '/work/corporate-events', DESKTOP)
await shoot('05-services', '/services', DESKTOP)
await shoot('06-clients', '/clients', DESKTOP)
await shoot('07-about', '/about', DESKTOP)
await shoot('08-contact', '/contact', DESKTOP)
await shoot('09-home-mobile', '/', MOBILE)
await shoot('10-gallery-mobile', '/work/products', MOBILE)

await browser.close()
console.log('done')
