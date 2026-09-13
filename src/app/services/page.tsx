import type { Metadata } from 'next'
import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import Reveal from '@/components/Reveal'
import { services, contact, whatsappLink } from '@/data/site'

export const metadata: Metadata = {
  title: 'Services & Rates',
  description:
    'Photography services and rates in Singapore — corporate events, executive portraits, product and advertising. What is included, and how booking works.',
  alternates: { canonical: '/services' },
}

const process = [
  {
    step: '01',
    title: 'Tell me the date',
    body: 'Date, venue and roughly what you need the images for. A WhatsApp message is enough to check availability.',
  },
  {
    step: '02',
    title: 'Get a fixed quote',
    body: 'A written quote with hours, deliverables and licence, usually the same working day. No hourly surprises afterwards.',
  },
  {
    step: '03',
    title: 'The shoot',
    body: 'I arrive early, find the light, and stay out of the way. For events I work from a running order so nothing scheduled is missed.',
  },
  {
    step: '04',
    title: 'Delivery',
    body: 'A preview selection the next day and the full edited gallery shortly after, in web and print crops.',
  },
]

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="What it costs, and what you get"
        intro="Rates depend on hours, crew and how widely you licence the images — but you should not have to send an email to find that out. Indicative pricing is below."
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-px bg-ink-line md:grid-cols-2">
          {services.map((service, i) => (
            <Reveal key={service.name} delay={i * 70} className="bg-ink p-8 lg:p-10">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-display text-2xl text-bone">{service.name}</h2>
                <p className="shrink-0 text-right">
                  <span className="block font-display text-2xl text-sand">
                    {service.priceFrom === null
                      ? 'On request'
                      : `From $${service.priceFrom}`}
                  </span>
                  <span className="mt-1 block text-[0.7rem] text-bone-dim">
                    {service.unit}
                  </span>
                </p>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-bone-dim">
                {service.description}
              </p>

              <ul className="mt-7 space-y-2.5">
                {service.includes.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-sm leading-relaxed text-bone-dim"
                  >
                    <span aria-hidden className="mt-[0.45rem] h-px w-3 shrink-0 bg-sand" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 border border-ink-line p-8 text-sm leading-relaxed text-bone-dim lg:p-10">
          Every job is quoted in writing before anything is booked. If a package
          above does not fit — a multi-day conference, a shoot outside Singapore,
          an unusual licence — tell me what you need and I will price it.{' '}
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline text-sand"
          >
            Ask on WhatsApp
          </a>{' '}
          or{' '}
          <a
            href={`mailto:${contact.email}`}
            className="link-underline text-sand"
          >
            email me
          </a>
          .
        </Reveal>
      </div>

      {/* ---------------- Process ---------------- */}
      <section className="mt-24 border-t border-ink-line py-20 lg:mt-36 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <p className="eyebrow">How it works</p>
            <h2 className="mt-4 max-w-xl font-display text-3xl leading-tight text-bone sm:text-4xl">
              Four steps, no back-and-forth.
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((item, i) => (
              <Reveal key={item.step} delay={i * 70}>
                <p className="font-display text-4xl text-sand/40">{item.step}</p>
                <h3 className="mt-4 font-display text-xl text-bone">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-bone-dim">
                  {item.body}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-16">
            <Link
              href="/contact"
              className="inline-block rounded-full bg-bone px-8 py-3.5 text-sm font-medium text-ink transition-colors duration-300 hover:bg-sand"
            >
              Get a quote
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
