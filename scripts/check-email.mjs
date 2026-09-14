/**
 * Verifies the enquiry form's email path without going through the form.
 *
 *   npm run check:email
 *
 * Checks the three things that actually break, in the order they break:
 * the key is missing, the key is rejected, or the key is fine but the sender
 * domain is not verified. Then sends one real test message, so a pass here means
 * a submitted enquiry genuinely lands in the inbox.
 *
 * Reads .env.local the same way `next dev` does. This is a standalone Node script,
 * so nothing loads it automatically.
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Minimal dotenv parse: KEY=value, `export` prefix tolerated, surrounding quotes
 * stripped, `#` comments and blank lines skipped. Unquoted values keep any inner
 * `#`, because `ENQUIRY_FROM=Name <a@b.c>` has no comment in it.
 */
function loadEnvFile(file) {
  if (!existsSync(file)) return false
  for (const rawLine of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).replace(/^export\s+/, '').trim()
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    // Real environment wins, so `RESEND_API_KEY=... npm run check:email` works.
    if (process.env[key] === undefined) process.env[key] = value
  }
  return true
}

const loaded = ['.env.local', '.env'].filter((f) => loadEnvFile(resolve(root, f)))

const ok = (m) => console.log(`  \x1b[32m✓\x1b[0m ${m}`)
const warn = (m) => console.log(`  \x1b[33m!\x1b[0m ${m}`)
const bad = (m) => console.log(`  \x1b[31m✗\x1b[0m ${m}`)

function die(message, ...hints) {
  bad(message)
  for (const hint of hints) console.log(`    ${hint}`)
  console.log()
  process.exit(1)
}

console.log('\nChecking the enquiry form email path\n')

console.log(
  loaded.length
    ? `  Loaded ${loaded.join(', ')}`
    : '  No .env.local found — reading the ambient environment only'
)

// ---------------------------------------------------------------- 1. the key
const apiKey = process.env.RESEND_API_KEY
if (!apiKey) {
  die(
    'RESEND_API_KEY is not set — this is what makes the form say "not connected yet".',
    'Copy .env.example to .env.local and paste a key from https://resend.com/api-keys'
  )
}
ok(`RESEND_API_KEY is set (${apiKey.slice(0, 6)}…, ${apiKey.length} chars)`)

const auth = { Authorization: `Bearer ${apiKey}` }

// ------------------------------------------------- 2. does Resend accept it?
let domains = []
try {
  const res = await fetch('https://api.resend.com/domains', { headers: auth })
  const body = await res.text()
  if (res.status === 401 || res.status === 403) {
    die(
      `Resend rejected the API key (HTTP ${res.status}).`,
      body,
      'Generate a fresh key at https://resend.com/api-keys — it needs send access.'
    )
  }
  if (!res.ok) die(`Could not reach the Resend API (HTTP ${res.status}).`, body)
  domains = JSON.parse(body).data ?? []
  ok('Resend accepted the API key')
} catch (err) {
  if (err instanceof SyntaxError) warn('Could not parse the domain list; continuing')
  else die(`Network error talking to Resend: ${err.message}`)
}

// --------------------------------------------------------- 3. sender/recipient
const DEFAULT_TO = 'larry@macrostudios.sg'
const to = process.env.ENQUIRY_TO ?? DEFAULT_TO

// Mirrors fromAddress() in src/app/contact/actions.ts: ENQUIRY_FROM may be a bare
// address or `Name <addr>`, and the display name is rebuilt per message anyway.
const configuredFrom = process.env.ENQUIRY_FROM?.trim()
const fromAddress = configuredFrom
  ? ((configuredFrom.match(/<([^>]+)>/) ?? [null, configuredFrom])[1] ?? '').trim()
  : 'onboarding@resend.dev'
const from = `Enquiry form test via Macrostudios <${fromAddress}>`

if (!configuredFrom)
  warn(`ENQUIRY_FROM is not set — falling back to ${fromAddress}`)
if (!process.env.ENQUIRY_TO)
  warn(`ENQUIRY_TO is not set — falling back to ${to} from src/data/site.ts`)

const fromDomain = (fromAddress.match(/@(.+)$/) ?? [])[1]
const verified = domains.filter((d) => d.status === 'verified').map((d) => d.name)

if (fromDomain === 'resend.dev') {
  warn(
    'Sending from Resend\'s shared sandbox domain — it only delivers to the address'
  )
  console.log('    that owns the Resend account. Verify a real domain before launch.')
} else if (verified.length && !verified.includes(fromDomain)) {
  die(
    `ENQUIRY_FROM uses @${fromDomain}, which is not a verified domain on this account.`,
    `Verified: ${verified.join(', ') || 'none'}`,
    'Add and verify it at https://resend.com/domains, or use onboarding@resend.dev to test.'
  )
} else if (verified.includes(fromDomain)) {
  ok(`Sender domain @${fromDomain} is verified`)
}

console.log(`\n  Sending a test message:\n    from ${from}\n    to   ${to}\n`)

// ------------------------------------------------------------ 4. send one
const res = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: { ...auth, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from,
    to: [to],
    // A real enquiry sets this to the enquirer's address, so replying reaches them.
    reply_to: to,
    subject: 'Macrostudios — enquiry form test',
    text: [
      'This is a test from `npm run check:email`.',
      '',
      'If it arrived, the contact form will deliver real enquiries to this inbox.',
      'Real enquiries arrive as "<their name> via Macrostudios", with Reply-To set',
      'to the enquirer, so hitting reply goes straight back to them.',
      '',
      `Sent ${new Date().toISOString()}`,
    ].join('\n'),
  }),
})

const body = await res.text()
if (!res.ok) {
  die(
    `Resend refused the send (HTTP ${res.status}).`,
    body,
    res.status === 403
      ? 'Usually an unverified sender domain, or a sandbox sender writing to an address other than the account owner.'
      : 'The message above is Resend\'s own explanation.'
  )
}

ok(`Sent. Resend id: ${JSON.parse(body).id}`)
console.log(`\n  Check ${to} — allow a minute, and look in spam the first time.\n`)
