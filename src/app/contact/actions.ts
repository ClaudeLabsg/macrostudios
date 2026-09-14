'use server'

import { contact, site } from '@/data/site'
import { SHOOT_TYPES } from './shoot-types'
import {
  MAX_BOOKING_YEARS,
  formatIsoDate,
  isRealIsoDate,
  maxBookingDate,
  todayInSingapore,
} from './dates'

export type EnquiryState = {
  status: 'idle' | 'success' | 'error'
  message: string
  /** Field-level errors, keyed by input name. */
  fieldErrors?: Record<string, string>
}

/**
 * Upper bounds on every free-text field.
 *
 * These are not cosmetic. The form posts to a server action that forwards straight
 * into an email body, so without a ceiling a bot can push a megabyte of text through
 * it. The limits are generous enough that no real enquiry will ever hit one.
 */
const MAX = {
  name: 100,
  email: 200,
  company: 120,
  phone: 40,
  message: 5000,
} as const

/** Deliberately loose: international numbers, spaces, dashes and brackets all pass. */
const PHONE_PATTERN = /^[+(]?[\d][\d\s().+-]{5,}$/

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validate(form: FormData) {
  const fieldErrors: Record<string, string> = {}

  const name = String(form.get('name') ?? '').trim()
  const email = String(form.get('email') ?? '').trim()
  const company = String(form.get('company') ?? '').trim()
  const phone = String(form.get('phone') ?? '').trim()
  const shootType = String(form.get('shootType') ?? '').trim()
  const eventDate = String(form.get('eventDate') ?? '').trim()
  const message = String(form.get('message') ?? '').trim()

  if (name.length < 2) fieldErrors.name = 'Please enter your name.'
  else if (name.length > MAX.name)
    fieldErrors.name = `Please keep this under ${MAX.name} characters.`

  if (!EMAIL_PATTERN.test(email) || email.length > MAX.email)
    fieldErrors.email = 'Please enter a valid email address.'

  if (company.length > MAX.company)
    fieldErrors.company = `Please keep this under ${MAX.company} characters.`

  if (phone && !PHONE_PATTERN.test(phone))
    fieldErrors.phone = 'Please enter a valid phone number, or leave this blank.'
  else if (phone.length > MAX.phone)
    fieldErrors.phone = 'That phone number is too long.'

  if (message.length < 10)
    fieldErrors.message = 'A sentence or two about the shoot helps me quote accurately.'
  else if (message.length > MAX.message)
    fieldErrors.message = `Please keep this under ${MAX.message} characters — the detail can follow by email.`

  if (shootType && !SHOOT_TYPES.includes(shootType as (typeof SHOOT_TYPES)[number]))
    fieldErrors.shootType = 'Please choose one of the listed options.'

  /*
    The date is optional, but if one is given it has to be a date I could actually
    shoot. The `min` attribute on the input only greys out past dates in the picker —
    it is trivially bypassed by typing, and ignored entirely by anything posting to
    this action directly, so the real check has to live here.
  */
  if (eventDate) {
    if (!isRealIsoDate(eventDate)) {
      fieldErrors.eventDate = 'Please pick a date from the calendar.'
    } else if (eventDate < todayInSingapore()) {
      fieldErrors.eventDate =
        'That date has already passed. Please pick today or a date in the future.'
    } else if (eventDate > maxBookingDate()) {
      fieldErrors.eventDate = `That is more than ${MAX_BOOKING_YEARS} years out — please check the year.`
    }
  }

  return {
    fieldErrors,
    data: { name, email, company, phone, shootType, eventDate, message },
  }
}

type EnquiryData = ReturnType<typeof validate>['data']

/**
 * The address enquiries are sent *from*.
 *
 * This can only ever be an address on a domain verified at resend.com/domains — it
 * cannot be the enquirer's own address. Forging someone else's domain fails SPF and
 * DKIM, so the message is refused outright or filed as spam. The enquirer's address
 * goes in `reply_to` instead, which is what that header is for: the inbox shows the
 * enquiry, and hitting reply goes to them.
 *
 * Accepts either a bare address or a full `Name <addr>` in ENQUIRY_FROM, since the
 * display name is rebuilt per enquiry below.
 */
function fromAddress(): string {
  const configured = process.env.ENQUIRY_FROM?.trim()
  if (!configured) return 'onboarding@resend.dev'
  const angled = configured.match(/<([^>]+)>/)
  return (angled ? angled[1] : configured).trim()
}

/**
 * Puts the enquirer's name in the From line, so the inbox list reads
 * "Jane Tan via Macrostudios" rather than an identical sender on every enquiry.
 *
 * Everything that has meaning inside an address header is stripped first. The name
 * is attacker-controlled free text going into a header, and `"`, `<`, `>` and a bare
 * newline are how that gets turned into a second header or a forged sender.
 */
function senderName(name: string): string {
  const clean = name
    .replace(/[\r\n<>"'@,;:\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60)
  return clean ? `${clean} via ${site.name}` : `${site.name} enquiry`
}

function buildEmail(data: EnquiryData) {
  const subject = `New enquiry — ${data.shootType || 'Photography'} — ${data.name}`

  const text = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    data.company && `Company: ${data.company}`,
    data.phone && `Phone: ${data.phone}`,
    data.shootType && `Shoot type: ${data.shootType}`,
    data.eventDate && `Date: ${formatIsoDate(data.eventDate)}`,
    '',
    data.message,
    '',
    '—',
    `Sent from the enquiry form at ${site.url}/contact`,
  ]
    .filter(Boolean)
    .join('\n')

  return { subject, text }
}

/**
 * Handles the contact form.
 *
 * Email is sent through the Resend REST API so there is no SDK dependency to keep
 * updated. Set these in `.env.local` for development and in the Vercel project
 * settings for production — see `.env.example`:
 *   RESEND_API_KEY   - from resend.com
 *   ENQUIRY_TO       - where enquiries land (defaults to the published address)
 *   ENQUIRY_FROM     - a verified sender on your domain, e.g. site@macrostudios.sg
 *
 * Without RESEND_API_KEY the action fails loudly rather than silently swallowing an
 * enquiry — a lost lead is worse than a visible error, and every failure path names
 * the email address, which is the only other channel on the site.
 */
export async function submitEnquiry(
  _prev: EnquiryState,
  form: FormData
): Promise<EnquiryState> {
  // Honeypot: a real person never fills a hidden field. Pretend success so bots
  // do not learn they were caught.
  if (String(form.get('website') ?? '').length > 0) {
    return { status: 'success', message: 'Thanks — your enquiry is on its way.' }
  }

  const { fieldErrors, data } = validate(form)
  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: 'error',
      message: 'Please check the highlighted fields.',
      fieldErrors,
    }
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error(
      'RESEND_API_KEY is not set — the enquiry form cannot send. See .env.example.'
    )
    return {
      status: 'error',
      message: `The enquiry form is not connected yet. Please email ${contact.email} directly.`,
    }
  }

  const { subject, text } = buildEmail(data)
  const failure = {
    status: 'error' as const,
    message: `Something went wrong sending that. Please email ${contact.email} directly.`,
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${senderName(data.name)} <${fromAddress()}>`,
        to: [process.env.ENQUIRY_TO ?? contact.email],
        // So hitting reply in the inbox goes to the enquirer, not to the sender domain.
        reply_to: data.email,
        subject,
        text,
      }),
      // A hung request would otherwise keep the submit button spinning indefinitely.
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      // Resend explains refusals properly (unverified domain, bad key, sandbox
      // recipient restrictions). Log the body verbatim — it is the only place that
      // detail exists, and the visitor must never see it.
      console.error('Resend rejected the enquiry', res.status, await res.text())
      return failure
    }
  } catch (err) {
    console.error('Enquiry submission failed', err)
    return failure
  }

  return {
    status: 'success',
    message: `Thanks ${data.name} — I have got your enquiry and will reply ${contact.responseTime}.`,
  }
}
