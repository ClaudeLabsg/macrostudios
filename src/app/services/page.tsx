import type { Metadata } from 'next'
import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import Reveal from '@/components/Reveal'
import { services, categoryBySlug, contact } from '@/data/site'

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Photography services in Singapore — corporate events, executive portraits, product and advertising. What each shoot involves, what you get back, and how booking works.',
  alternates: { canonical: '/services' },
}

const process = [
  {
    step: '01',
    title: 'Tell me the date',
    body: 'Date, venue and roughly what you need the images for. A two-line email is enough to check availability.',
  },
  {
    step: '02',
    title: 'Agree the scope',
    body: 'A written outline of hours, deliverables and licence, usually the same working day, so we both know what the shoot covers before anything is booked.',
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
        title="What I shoot"
        intro="Four kinds of commission, each a different sort of day on set. Here is what the work involves and what lands in your inbox afterwards."
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/*
          One hairline grid: the `gap-px` over an ink-line background draws the rules
          between cells, so four equal squares read as a single block rather than four
          floating cards. Four services fill it exactly — adding a fifth leaves a hole
          in the bottom row, so give the odd one `md:col-span-2`.
        */}
        <div className="grid gap-px bg-ink-line md:grid-cols-2">
          {services.map((service, i) => {
            const category = categoryBySlug(service.category)
            return (
              <Reveal
                key={service.name}
                as="article"
                delay={i * 70}
                className="flex flex-col bg-ink p-8 lg:p-10"
              >
                <h2 className="font-display text-2xl text-bone lg:text-[1.75rem]">
                  {service.name}
                </h2>
                {/* Matches the .eyebrow step: 12px on a phone, 11.2px from sm up. */}
                <p className="mt-2 text-[0.75rem] uppercase tracking-[0.14em] text-sand sm:text-[0.7rem]">
                  {service.format}
                </p>

                <p className="mt-4 text-sm leading-relaxed text-bone-dim">
                  {service.description}
                </p>

                <ul className="mt-6 space-y-2.5">
                  {service.includes.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-sm leading-relaxed text-bone-dim"
                    >
                      <span
                        aria-hidden
                        className="mt-[0.45rem] h-px w-3 shrink-0 bg-sand"
                      />
                      {item}
                    </li>
                  ))}
                </ul>

                {category && (
                  /* mt-auto pins this to the bottom, so the links line up across a row
                     even when one card carries a longer description. */
                  <Link
                    href={`/work/${category.slug}`}
                    className="tap-row link-underline mt-auto self-start pt-7 text-sm text-bone"
                  >
                    See the {category.shortTitle.toLowerCase()} work
                  </Link>
                )}
              </Reveal>
            )
          })}
        </div>

        <Reveal className="mt-10 border border-ink-line p-8 text-sm leading-relaxed text-bone-dim lg:p-10">
          Not every job fits a box. A multi-day conference, a shoot outside
          Singapore, an unusual licence, or something that spans two of the four
          above — tell me what you have in mind and I will put together a plan for
          it.{' '}
          <a href={`mailto:${contact.email}`} className="link-underline text-sand">
            Email me
          </a>{' '}
          or{' '}
          <Link href="/contact" className="link-underline text-sand">
            send an enquiry
          </Link>
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
              Check a date
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
