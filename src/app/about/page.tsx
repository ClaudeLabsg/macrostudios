import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import Reveal from '@/components/Reveal'
import { site, contact } from '@/data/site'
import { photosFor } from '@/lib/gallery'
import { categories } from '@/data/site'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Larry Lim has photographed corporate events, portraits, products and campaigns in Singapore for twenty years. How he works, and what that means for your shoot.',
  alternates: { canonical: '/about' },
}

/** Looks up one photograph by name, falling back to the category's first frame. */
function pick(source: string, name: string) {
  const category = categories.find((c) => c.source === source)!
  const photos = photosFor(category)
  return photos.find((p) => p.src.endsWith(`/${name}.webp`)) ?? photos[0]
}

/*
 * TODO: a photograph of Larry. A personal brand needs a face and this is the page
 * people look for one on; none was recoverable from the old site.
 *
 * Until then the column carries work rather than a person, and carries three frames
 * rather than one so it reads unmistakably as a portfolio strip. A single uncaptioned
 * image sitting under the heading "Larry Lim" reads as a portrait of him — that has
 * already been got wrong once here, with a frame of models at an event.
 *
 * Chosen for range rather than for being the prettiest: an event shot, a portrait and
 * a still life is the whole business on one screen. The DBS frame leads because it is
 * the one that argues for the craft — a dark ballroom lit by lasers and candles is the
 * hardest thing on this page to expose, and it is the reason a client pays for a
 * photographer instead of a phone.
 */
export default function AboutPage() {
  const lead = pick('events', 'dbs-private-bank-13')
  const pair = [
    pick('corporate', 'standard-chartered-6'),
    pick('products', 'hais-sambal-chilli'),
  ]

  return (
    <>
      <PageHeader
        eyebrow="About"
        title="Larry Lim"
        intro={`Photographer, ${site.name}. Singapore. Behind a camera professionally since before most of my clients had a marketing department.`}
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <Reveal>
            <p className="eyebrow">Selected work</p>

            <figure className="mt-5">
              <div className="relative aspect-[4/5] overflow-hidden bg-ink-raised">
                {lead && (
                  <Image
                    src={lead.src}
                    alt={lead.alt}
                    fill
                    quality={85}
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    placeholder={lead.blurDataURL ? 'blur' : 'empty'}
                    blurDataURL={lead.blurDataURL || undefined}
                    className="object-cover"
                  />
                )}
              </div>
              <figcaption className="mt-3 text-xs text-bone-dim">
                {lead?.caption} &middot; Singapore
              </figcaption>
            </figure>

            <div className="mt-6 grid grid-cols-2 gap-4">
              {pair.map((photo) =>
                photo ? (
                  <figure key={photo.src}>
                    <div className="relative aspect-square overflow-hidden bg-ink-raised">
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        quality={85}
                        sizes="(min-width: 1024px) 20vw, 45vw"
                        placeholder={photo.blurDataURL ? 'blur' : 'empty'}
                        blurDataURL={photo.blurDataURL || undefined}
                        className="object-cover"
                      />
                    </div>
                    <figcaption className="mt-3 text-xs text-bone-dim">
                      {photo.caption}
                    </figcaption>
                  </figure>
                ) : null
              )}
            </div>

            <Link
              href="/work"
              className="tap-row link-underline mt-7 inline-block text-sm text-sand"
            >
              See the full portfolio &rarr;
            </Link>
          </Reveal>

          <Reveal delay={100} className="space-y-6 text-base leading-relaxed text-bone-dim">
            <p className="font-display text-2xl leading-snug text-bone sm:text-3xl">
              I started Macrostudios in {site.foundedYear}, after years of
              shooting for other people. The idea was simple: one photographer,
              answerable to the client, from the brief to the final file.
            </p>
            <p>
              That has not changed. When you book Macrostudios, I am the person
              who turns up. Not an associate, not whoever was free that Saturday.
              For corporate work this matters more than it sounds — the second
              time I shoot your annual dinner, I already know which VIPs need to
              be in frame and which sponsor backdrop the CMO cares about.
            </p>
            <p>
              The work has taken me through ballrooms, boardrooms, studios and
              the occasional racecourse. Chanel, DBS, HSBC, L&rsquo;Oréal,
              Nintendo, Land Rover, Royal Caribbean, SMU. Conferences with
              three hundred delegates and headshot sessions with three.
            </p>
            <p>
              What I actually sell is not photographs — it is the absence of
              anxiety about photographs. You have an event to run. The pictures
              should be the thing you never have to think about.
            </p>
            <p className="text-bone">
              And despite the corporate client list: I promise I don&rsquo;t
              bite.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/work"
                className="rounded-full bg-bone px-7 py-3.5 text-sm font-medium text-ink transition-colors duration-300 hover:bg-sand"
              >
                See the work
              </Link>
              <a
                href={`mailto:${contact.email}`}
                className="rounded-full border border-ink-line px-7 py-3.5 text-sm text-bone transition-colors duration-300 hover:border-bone"
              >
                {contact.email}
              </a>
            </div>
          </Reveal>
        </div>

        {/* ---------------- Facts ---------------- */}
        <div className="mt-24 grid gap-px border-y border-ink-line bg-ink-line sm:grid-cols-3 lg:mt-36">
          {[
            { value: `${site.yearsExperience}+`, label: 'Years photographing professionally' },
            { value: '60+', label: 'Brands and agencies commissioned' },
            { value: 'Singapore', label: 'Based here, shoots regionally' },
          ].map((fact, i) => (
            <Reveal key={fact.label} delay={i * 70} className="bg-ink p-8 lg:p-10">
              <p className="font-display text-4xl text-sand lg:text-5xl">
                {fact.value}
              </p>
              <p className="mt-3 text-sm text-bone-dim">{fact.label}</p>
            </Reveal>
          ))}
        </div>
      </div>

      <section className="py-24 lg:py-36">
        <Reveal className="mx-auto max-w-3xl px-6 text-center lg:px-10">
          <h2 className="font-display text-[clamp(2rem,5vw,3.25rem)] leading-tight text-bone">
            Let&rsquo;s talk about your shoot.
          </h2>
          <Link
            href="/contact"
            className="mt-9 inline-block rounded-full border border-sand px-8 py-3.5 text-sm text-sand transition-colors duration-300 hover:bg-sand hover:text-ink"
          >
            Start an enquiry
          </Link>
        </Reveal>
      </section>
    </>
  )
}
