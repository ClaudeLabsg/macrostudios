import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://127.0.0.1:3000/work/products', { waitUntil: 'networkidle' })
await page.locator('button[aria-label^="Open image"]').first().click()
await page.waitForSelector('[role="dialog"]')

const img = page.locator('[role="dialog"] img')
for (const wait of [0, 500, 1500, 3000]) {
  await page.waitForTimeout(wait === 0 ? 0 : wait)
  const box = await img.boundingBox()
  const state = await img.evaluate((el) => ({
    complete: el.complete,
    naturalW: el.naturalWidth,
    naturalH: el.naturalHeight,
    opacity: getComputedStyle(el).opacity,
    display: getComputedStyle(el).display,
  }))
  console.log(`t+${String(wait).padStart(4)}ms  box=${box ? Math.round(box.width) + 'x' + Math.round(box.height) : 'null'}  complete=${state.complete} natural=${state.naturalW}x${state.naturalH} opacity=${state.opacity}`)
}
await page.screenshot({ path: 'scripts/shots/11-lightbox.png' })
await browser.close()
