import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' })

// Step down the page so scroll-reveal sections have triggered before capture.
const h = await page.evaluate(() => document.body.scrollHeight)
for (let y = 0; y < h; y += 700) {
  await page.evaluate((v) => window.scrollTo(0, v), y)
  await page.waitForTimeout(180)
}
await page.waitForTimeout(900)

for (const [i, y] of [900, 1800, 2700, 3600].entries()) {
  await page.evaluate((v) => window.scrollTo(0, v), y)
  await page.waitForTimeout(700)
  await page.screenshot({ path: `scripts/shots/home-s${i + 1}.png` })
}
await browser.close()
console.log('scroll shots done, page height:', h)
