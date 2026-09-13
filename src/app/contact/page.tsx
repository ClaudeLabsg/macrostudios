import type { Metadata } from 'next'
import ContactForm from '@/components/ContactForm'
import PageHeader from '@/components/PageHeader'
import Reveal from '@/components/Reveal'
import { contact, whatsappLink, site } from '@/data/site'

export const metadata: Metadata = {
  title: 'Contact',
  description: `Enquire about a photography shoot in Singapore. WhatsApp, call or email ${contact.email} — most enquiries answered ${contact.responseTime}.`,
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  const phoneHref = `tel:${contact.phone.replace(/\s/g, '')}`

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Check a date"
        intro={`Tell me what you are shooting and when. Most enquiries are answered ${contact.responseTime}, usually with a price attached.`}
      />

      <div className="mx-auto max-w-7xl px-6 pb-24 lg:px-10 lg:pb-36">
        <div className="grid gap-16 lg:grid-cols-[1.4fr_1fr] lg:gap-24">
          <Reveal>
            <ContactForm />
          </Reveal>

          <Reveal delay={100} as="aside" className="space-y-10">
            {/*
              Direct channels sit beside the form rather than below it.
              In Singapore a WhatsApp message converts far better than a form,
              and the previous site offered no messaging route at all.
            */}
            <div>
              <p className="eyebrow">Faster than the form</p>
              <div className="mt-5 space-y-3">
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between border border-ink-line px-6 py-5 transition-colors duration-300 hover:border-sand"
                >
                  <span>
                    <span className="block text-bone">WhatsApp</span>
                    <span className="mt-1 block text-xs text-bone-dim">
                      Quickest for date checks
                    </span>
                  </span>
                  <span aria-hidden className="text-sand">
                    &rarr;
                  </span>
                </a>

                <a
                  href={phoneHref}
                  className="flex items-center justify-between border border-ink-line px-6 py-5 transition-colors duration-300 hover:border-sand"
                >
                  <span>
                    <span className="block text-bone">{contact.phone}</span>
                    <span className="mt-1 block text-xs text-bone-dim">
                      {contact.hours}
                    </span>
                  </span>
                  <span aria-hidden className="text-sand">
                    &rarr;
                  </span>
                </a>

                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center justify-between border border-ink-line px-6 py-5 transition-colors duration-300 hover:border-sand"
                >
                  <span>
                    <span className="block text-bone">{contact.email}</span>
                    <span className="mt-1 block text-xs text-bone-dim">
                      For briefs and attachments
                    </span>
                  </span>
                  <span aria-hidden className="text-sand">
                    &rarr;
                  </span>
                </a>
              </div>
            </div>

            <div className="border-t border-ink-line pt-10">
              <p className="eyebrow">Good to know</p>
              <dl className="mt-5 space-y-5 text-sm">
                <div>
                  <dt className="text-bone">Response time</dt>
                  <dd className="mt-1 text-bone-dim">
                    Replies {contact.responseTime}, usually with an indicative
                    quote.
                  </dd>
                </div>
                <div>
                  <dt className="text-bone">Coverage</dt>
                  <dd className="mt-1 text-bone-dim">
                    Singapore-based. Regional travel on request.
                  </dd>
                </div>
                <div>
                  <dt className="text-bone">Lead time</dt>
                  <dd className="mt-1 text-bone-dim">
                    Peak season (Nov&ndash;Jan) books out early. Last-minute
                    requests are still worth asking about.
                  </dd>
                </div>
                <div>
                  <dt className="text-bone">Business</dt>
                  <dd className="mt-1 text-bone-dim">
                    {site.legalName}, UEN {site.uen}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="border-t border-ink-line pt-10">
              <p className="eyebrow">Elsewhere</p>
              <div className="mt-5 flex gap-6">
                {contact.socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline text-sm text-bone-dim hover:text-bone"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </>
  )
}
