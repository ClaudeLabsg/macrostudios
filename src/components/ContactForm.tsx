'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { submitEnquiry, type EnquiryState } from '@/app/contact/actions'
import { SHOOT_TYPES } from '@/app/contact/shoot-types'
import { maxBookingDate, todayInSingapore } from '@/app/contact/dates'

const initialState: EnquiryState = { status: 'idle', message: '' }

const fieldClass =
  'w-full border-b border-ink-line bg-transparent py-3 text-bone placeholder:text-bone-dim/60 transition-colors focus:border-sand focus:outline-none'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-bone px-8 py-3.5 text-sm font-medium text-ink transition-colors duration-300 hover:bg-sand disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Sending…' : 'Send enquiry'}
    </button>
  )
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="mt-2 text-xs text-danger" role="alert">
      {message}
    </p>
  )
}

/** Points an input at its error text only when there is one, so the id is never dangling. */
const describedBy = (id: string, message?: string) =>
  message ? id : undefined

/**
 * Enquiry form.
 *
 * The old form asked only for name, email and a message — which meant every lead
 * needed a follow-up email just to establish what and when. Asking for shoot type
 * and date up front means Larry can quote on the first reply.
 *
 * Validation is enforced in the server action, not here; `noValidate` turns off the
 * browser's own bubbles so there is one set of error messages rather than two
 * competing ones. The constraints below (`min`, `max`, `maxLength`) are a courtesy
 * that stops most mistakes before a round trip — they are not the check that counts.
 */
export default function ContactForm() {
  const [state, formAction] = useActionState(submitEnquiry, initialState)
  const formRef = useRef<HTMLFormElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)
  const errors = state.fieldErrors ?? {}

  /*
    Date bounds are written onto the DOM node after mount rather than rendered as
    JSX attributes. This page is statically prerendered, so anything derived from
    "now" at render time would be frozen at build time — a site built in January
    would still be refusing February by March. The picker is an external system
    here; React has no business holding a value that only the browser can know.
  */
  useEffect(() => {
    const input = dateRef.current
    if (!input) return
    input.min = todayInSingapore()
    input.max = maxBookingDate()
  }, [])

  // Send focus to the first field the server rejected, so the error is not off-screen
  // above or below the viewport after a submit.
  useEffect(() => {
    if (state.status !== 'error' || !state.fieldErrors) return
    formRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus()
  }, [state])

  if (state.status === 'success') {
    return (
      <div
        className="border border-sand/40 bg-sand/5 p-8"
        role="status"
        aria-live="polite"
      >
        <p className="font-display text-2xl text-bone">Enquiry sent</p>
        <p className="mt-3 text-sm leading-relaxed text-bone-dim">
          {state.message}
        </p>
      </div>
    )
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-8" noValidate>
      {/* Honeypot — hidden from people, irresistible to bots. */}
      <div aria-hidden className="absolute left-[-9999px]">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="eyebrow block">
            Name *
          </label>
          <input
            id="name"
            name="name"
            required
            maxLength={100}
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy('name-error', errors.name)}
            className={`${fieldClass} mt-2`}
            placeholder="Jane Tan"
          />
          <FieldError id="name-error" message={errors.name} />
        </div>

        <div>
          <label htmlFor="email" className="eyebrow block">
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={200}
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy('email-error', errors.email)}
            className={`${fieldClass} mt-2`}
            placeholder="jane@company.com"
          />
          <FieldError id="email-error" message={errors.email} />
        </div>

        <div>
          <label htmlFor="company" className="eyebrow block">
            Company
          </label>
          <input
            id="company"
            name="company"
            maxLength={120}
            autoComplete="organization"
            aria-invalid={Boolean(errors.company)}
            aria-describedby={describedBy('company-error', errors.company)}
            className={`${fieldClass} mt-2`}
            placeholder="Optional"
          />
          <FieldError id="company-error" message={errors.company} />
        </div>

        <div>
          <label htmlFor="phone" className="eyebrow block">
            Phone
          </label>
          {/* Optional, and only used on the day of a confirmed shoot — replies to
              enquiries always go back by email. */}
          <input
            id="phone"
            name="phone"
            type="tel"
            maxLength={40}
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={describedBy('phone-error', errors.phone)}
            className={`${fieldClass} mt-2`}
            placeholder="Optional, for the shoot day"
          />
          <FieldError id="phone-error" message={errors.phone} />
        </div>

        <div>
          <label htmlFor="shootType" className="eyebrow block">
            Type of shoot
          </label>
          <select
            id="shootType"
            name="shootType"
            defaultValue=""
            aria-invalid={Boolean(errors.shootType)}
            aria-describedby={describedBy('shootType-error', errors.shootType)}
            className={`${fieldClass} mt-2`}
          >
            <option value="" className="bg-ink text-bone">
              Select one
            </option>
            {SHOOT_TYPES.map((type) => (
              <option key={type} value={type} className="bg-ink text-bone">
                {type}
              </option>
            ))}
          </select>
          <FieldError id="shootType-error" message={errors.shootType} />
        </div>

        <div>
          <label htmlFor="eventDate" className="eyebrow block">
            Date (if known)
          </label>
          <input
            id="eventDate"
            name="eventDate"
            type="date"
            ref={dateRef}
            aria-invalid={Boolean(errors.eventDate)}
            aria-describedby={describedBy('eventDate-error', errors.eventDate)}
            className={`${fieldClass} mt-2`}
          />
          <FieldError id="eventDate-error" message={errors.eventDate} />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="eyebrow block">
          What are we shooting? *
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          maxLength={5000}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describedBy('message-error', errors.message)}
          className={`${fieldClass} mt-2 resize-y`}
          placeholder="Venue, rough headcount, how many hours, what you need the images for."
        />
        <FieldError id="message-error" message={errors.message} />
      </div>

      {state.status === 'error' && !state.fieldErrors && (
        <p className="text-sm text-danger" role="alert">
          {state.message}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-5">
        <SubmitButton />
        <p className="text-xs text-bone-dim">* Required</p>
      </div>
    </form>
  )
}
