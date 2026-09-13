'use server'

import { contact } from '@/data/site'
import { SHOOT_TYPES } from './shoot-types'

export type EnquiryState = {
  status: 'idle' | 'success' | 'error'
  message: string
  /** Field-level errors, keyed by input name. */
  fieldErrors?: Record<string, string>
}

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
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    fieldErrors.email = 'Please enter a valid email address.'
  if (message.length < 10)
    fieldErrors.message = 'A sentence or two about the shoot helps me quote accurately.'
  if (shootType && !SHOOT_TYPES.includes(shootType as (typeof SHOOT_TYPES)[number]))
    fieldErrors.shootType = 'Please choose one of the listed options.'

  return {
    fieldErrors,
    data: { name, email, company, phone, shootType, eventDate, message },
  }
}

/**
 * Handles the contact form.
 *
 * Email is sent through the Resend REST API so there is no SDK dependency to keep
 * updated. Set these in the Vercel project settings:
 *   RESEND_API_KEY   - from resend.com
 *   ENQUIRY_TO       - where enquiries land (defaults to the published address)
 *   ENQUIRY_FROM     - a verified sender on your domain, e.g. site@macrostudios.sg
 *
 * Without RESEND_API_KEY the action fails loudly rather than silently swallowing an
 * enquiry — a lost lead is worse than a visible error, and the page always shows
 * the email and WhatsApp fallbacks.
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
    return {
      status: 'error',
      message: `The enquiry form is not connected yet. Please email ${contact.email} directly.`,
    }
  }

  const lines = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    data.company && `Company: ${data.company}`,
    data.phone && `Phone: ${data.phone}`,
    data.shootType && `Shoot type: ${data.shootType}`,
    data.eventDate && `Date: ${data.eventDate}`,
    '',
    data.message,
  ].filter(Boolean)

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.ENQUIRY_FROM ?? 'Macrostudios <site@macrostudios.sg>',
        to: [process.env.ENQUIRY_TO ?? contact.email],
        reply_to: data.email,
        subject: `New enquiry — ${data.shootType || 'Photography'} — ${data.name}`,
        text: lines.join('\n'),
      }),
    })

    if (!res.ok) {
      console.error('Resend rejected the enquiry', res.status, await res.text())
      return {
        status: 'error',
        message: `Something went wrong sending that. Please email ${contact.email} directly.`,
      }
    }
  } catch (err) {
    console.error('Enquiry submission failed', err)
    return {
      status: 'error',
      message: `Something went wrong sending that. Please email ${contact.email} directly.`,
    }
  }

  return {
    status: 'success',
    message: `Thanks ${data.name} — I have got your enquiry and will reply ${contact.responseTime}.`,
  }
}
