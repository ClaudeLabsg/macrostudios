/**
 * Date helpers shared between the form UI and the server action.
 *
 * Everything is an ISO `YYYY-MM-DD` string, which is what `<input type="date">`
 * submits and what sorts correctly with plain `<` / `>` comparison. No `Date`
 * objects cross this boundary: parsing "2026-03-14" with `new Date()` gives
 * midnight UTC, which is already "yesterday" for anyone east of Greenwich.
 *
 * "Today" is always Singapore's today. The shoot happens in Singapore and the
 * enquirer is usually in Singapore, but the server is not — Vercel runs this in
 * whatever region it feels like, and a UTC box is still on yesterday's date until
 * 8am SGT. Pinning the timezone stops a morning enquiry for *today* being rejected
 * as past.
 */

export const SG_TIME_ZONE = 'Asia/Singapore'

/** How far ahead a date may be booked. Beyond this it is almost always a typo in the year. */
export const MAX_BOOKING_YEARS = 2

/** en-CA formats as YYYY-MM-DD, which is the ISO form the date input wants. */
const isoFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: SG_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Today's date in Singapore, as `YYYY-MM-DD`. */
export function todayInSingapore(): string {
  return isoFormatter.format(new Date())
}

/** The latest date an enquiry may name, as `YYYY-MM-DD`. */
export function maxBookingDate(): string {
  const [y, m, d] = todayInSingapore().split('-').map(Number)
  return `${y + MAX_BOOKING_YEARS}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

/**
 * True only for a well-formed ISO date that actually exists.
 *
 * The shape test alone would accept "2026-02-31"; round-tripping through Date
 * catches it, because Date rolls the overflow forward to March and the parts no
 * longer match what went in.
 */
export function isRealIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [y, m, d] = value.split('-').map(Number)
  const parsed = new Date(Date.UTC(y, m - 1, d))
  return (
    parsed.getUTCFullYear() === y &&
    parsed.getUTCMonth() === m - 1 &&
    parsed.getUTCDate() === d
  )
}

/** "2026-03-14" -> "Sat, 14 Mar 2026", for the enquiry email. */
export function formatIsoDate(value: string): string {
  if (!isRealIsoDate(value)) return value
  const [y, m, d] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('en-SG', {
    timeZone: 'UTC',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(Date.UTC(y, m - 1, d)))
}
