import { chromium } from 'playwright'
const browser = await chromium.launch()
const errors = []

// ---- Lightbox ----
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('pageerror', (e) => errors.push('pageerror: ' + e))
page.on('console', (m) => m.type() === 'error' && errors.push('console: ' + m.text()))

await page.goto('http://127.0.0.1:3000/work/products', { waitUntil: 'networkidle' })
await page.locator('button[aria-label^="Open image"]').first().click()
await page.waitForSelector('[role="dialog"]')
console.log('lightbox opened          :', await page.locator('[role="dialog"]').isVisible())
console.log('  counter                :', (await page.locator('[role="dialog"] p').first().textContent())?.trim())
console.log('  body scroll locked     :', await page.evaluate(() => document.body.style.overflow))
await page.screenshot({ path: 'scripts/shots/11-lightbox.png' })

await page.keyboard.press('ArrowRight')
await page.waitForTimeout(400)
console.log('  after ArrowRight       :', (await page.locator('[role="dialog"] p').first().textContent())?.trim())
await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(300)
await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(400)
console.log('  wraps backwards to     :', (await page.locator('[role="dialog"] p').first().textContent())?.trim())

await page.keyboard.press('Escape')
await page.waitForTimeout(400)
console.log('  Escape closes          :', (await page.locator('[role="dialog"]').count()) === 0)
console.log('  scroll lock released   :', (await page.evaluate(() => document.body.style.overflow)) === '')
console.log('  focus returned to grid :', await page.evaluate(() => document.activeElement?.getAttribute('aria-label')?.slice(0, 22)))

// ---- Mobile menu ----
const m = await browser.newPage({ viewport: { width: 390, height: 844 } })
m.on('pageerror', (e) => errors.push('mobile pageerror: ' + e))
await m.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' })
await m.locator('button[aria-label="Open menu"]').click()
await m.waitForTimeout(700)
console.log('\nmobile menu expanded     :', await m.locator('#mobile-nav').evaluate((el) => el.getBoundingClientRect().height > 100))
await m.screenshot({ path: 'scripts/shots/12-mobile-menu.png' })
await m.locator('#mobile-nav a', { hasText: 'Work' }).first().click()
await m.waitForTimeout(900)
console.log('  nav closes on route ch :', await m.locator('#mobile-nav').evaluate((el) => el.getBoundingClientRect().height < 20))
console.log('  landed on              :', new URL(m.url()).pathname)

// ---- Skip link ----
const s = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await s.goto('http://127.0.0.1:3000/', { waitUntil: 'domcontentloaded' })
await s.keyboard.press('Tab')
console.log('\nfirst tab stop           :', (await s.evaluate(() => document.activeElement?.textContent))?.trim())

await browser.close()
console.log('\nJS errors:', errors.length ? errors : 'none')
