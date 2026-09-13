'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { submitEnquiry, type EnquiryState } from '@/app/contact/actions'
import { SHOOT_TYPES } from '@/app/contact/shoot-types'

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

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-2 text-xs text-red-400" role="alert">
      {message}
    </p>
  )
}

/**
 * Enquiry form.
 *
 * The old form asked only for name, email and a message — which meant every lead
 * needed a follow-up email just to establish what and when. Asking for shoot type
 * and date up front means Larry can quote on the first reply.
 */
export default function ContactForm() {
  const [state, formAction] = useActionState(submitEnquiry, initialState)
  const errors = state.fieldErrors ?? {}

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
    <form action={formAction} className="space-y-8" noValidate>
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
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            className={`${fieldClass} mt-2`}
            placeholder="Jane Tan"
          />
          <FieldError message={errors.name} />
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
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            className={`${fieldClass} mt-2`}
            placeholder="jane@company.com"
          />
          <FieldError message={errors.email} />
        </div>

        <div>
          <label htmlFor="company" className="eyebrow block">
            Company
          </label>
          <input
            id="company"
            name="company"
            autoComplete="organization"
            className={`${fieldClass} mt-2`}
            placeholder="Optional"
          />
        </div>

        <div>
          <label htmlFor="phone" className="eyebrow block">
            Phone / WhatsApp
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className={`${fieldClass} mt-2`}
            placeholder="Optional, but faster"
          />
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
            className={`${fieldClass} mt-2`}
          >
            <option value="" className="bg-ink">
              Select one
            </option>
            {SHOOT_TYPES.map((type) => (
              <option key={type} value={type} className="bg-ink">
                {type}
              </option>
            ))}
          </select>
          <FieldError message={errors.shootType} />
        </div>

        <div>
          <label htmlFor="eventDate" className="eyebrow block">
            Date (if known)
          </label>
          <input
            id="eventDate"
            name="eventDate"
            type="date"
            className={`${fieldClass} mt-2`}
          />
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
          aria-invalid={Boolean(errors.message)}
          className={`${fieldClass} mt-2 resize-y`}
          placeholder="Venue, rough headcount, how many hours, what you need the images for."
        />
        <FieldError message={errors.message} />
      </div>

      {state.status === 'error' && !state.fieldErrors && (
        <p className="text-sm text-red-400" role="alert">
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
