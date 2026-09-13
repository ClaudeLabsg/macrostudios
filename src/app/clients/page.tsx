import type { Metadata } from 'next'
import Link from 'next/link'
import LogoWall from '@/components/LogoWall'
import PageHeader from '@/components/PageHeader'
import Reveal from '@/components/Reveal'
import { clientLogos } from '@/lib/gallery'

export const metadata: Metadata = {
  title: 'Clients',
  description:
    'Brands photographed by Macrostudios in Singapore, including Chanel, DBS, HSBC, L’Oréal, Nintendo, Land Rover, Royal Caribbean and SMU.',
  alternates: { canonical: '/clients' },
}

export default function ClientsPage() {
  const count = clientLogos().length

  return (
    <>
      <PageHeader
        eyebrow={`${count} brands`}
        title="Clients"
        intro="Agencies, listed companies, luxury houses and universities. Some for a single campaign, several for over a decade."
      />

      <div className="mx-auto max-w-7xl px-6 pb-24 lg:px-10 lg:pb-36">
        <Reveal>
          <LogoWall />
        </Reveal>

        <Reveal className="mt-24 border-t border-ink-line pt-16 lg:mt-36">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-lg">
              <p className="eyebrow">Working together</p>
              <h2 className="mt-4 font-display text-3xl leading-tight text-bone sm:text-4xl">
                Most of these started as one event.
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-bone-dim">
                Brief me once and the next booking takes an email. I keep your
                brand&rsquo;s colour treatment, crop preferences and delivery
                format on file.
              </p>
            </div>
            <Link
              href="/contact"
              className="shrink-0 self-start rounded-full bg-bone px-7 py-3.5 text-sm font-medium text-ink transition-colors duration-300 hover:bg-sand"
            >
              Start an enquiry
            </Link>
          </div>
        </Reveal>
      </div>
    </>
  )
}
