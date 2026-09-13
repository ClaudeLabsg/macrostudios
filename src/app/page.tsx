import Image from 'next/image'
import Link from 'next/link'
import Hero from '@/components/Hero'
import LogoWall from '@/components/LogoWall'
import Reveal from '@/components/Reveal'
import { categories, testimonials, site } from '@/data/site'
import { coverFor, heroPhotos, photoCount } from '@/lib/gallery'

export default function HomePage() {
  const heroes = heroPhotos()

  return (
    <>
      <Hero photos={heroes} />

      {/* ---------------- Proof, immediately ---------------- */}
      <section className="border-t border-ink-line py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Trusted by</p>
              <h2 className="mt-4 max-w-xl font-display text-3xl leading-tight text-bone sm:text-4xl">
                Brands that only get one take.
              </h2>
            </div>
            <Link
              href="/clients"
              className="link-underline shrink-0 text-sm text-bone-dim hover:text-bone"
            >
              See all clients &rarr;
            </Link>
          </Reveal>

          <Reveal className="mt-14" delay={100}>
            <LogoWall limit={15} />
          </Reveal>
        </div>
      </section>

      {/* ---------------- The work ---------------- */}
      <section className="border-t border-ink-line py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <p className="eyebrow">Portfolio</p>
            <h2 className="mt-4 max-w-2xl font-display text-3xl leading-tight text-bone sm:text-4xl">
              Five things I photograph, and photograph often.
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, i) => {
              const cover = coverFor(category)
              // The first card spans two columns on desktop to break the grid rhythm.
              const wide = i === 0
              return (
                <Reveal
                  key={category.slug}
                  delay={i * 70}
                  className={wide ? 'lg:col-span-2' : ''}
                >
                  <Link
                    href={`/work/${category.slug}`}
                    className="group relative block h-full overflow-hidden bg-ink-raised"
                  >
                    <div
                      className={`relative ${wide ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}
                    >
                      {cover && (
                        <Image
                          src={cover.src}
                          alt={cover.alt}
                          fill
                          quality={82}
                          sizes={
                            wide
                              ? '(min-width: 1024px) 66vw, 100vw'
                              : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
                          }
                          placeholder={cover.blurDataURL ? 'blur' : 'empty'}
                          blurDataURL={cover.blurDataURL || undefined}
                          className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                        />
                      )}
                      <div
                        aria-hidden
                        className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent transition-opacity duration-500 group-hover:opacity-90"
                      />
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-6 lg:p-8">
                      <div className="flex items-baseline justify-between gap-4">
                        <h3 className="font-display text-2xl text-bone lg:text-3xl">
                          {category.title}
                        </h3>
                        <span className="shrink-0 text-xs text-bone-dim">
                          {photoCount(category)}
                        </span>
                      </div>
                      <p className="mt-2 max-w-md text-sm leading-relaxed text-bone-dim">
                        {category.blurb}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ---------------- Why ---------------- */}
      <section className="border-t border-ink-line py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
            <Reveal>
              <p className="eyebrow">Why Macrostudios</p>
              <h2 className="mt-4 font-display text-3xl leading-tight text-bone sm:text-4xl">
                {site.yearsExperience} years means I have already solved your
                lighting problem.
              </h2>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-bone-dim">
                Ballrooms with terrible uplighting. Keynotes that start late.
                Twelve executives who each have four minutes. None of it is new,
                which is why none of it shows up in the photographs.
              </p>
              <Link
                href="/about"
                className="link-underline mt-8 inline-block text-sm text-sand"
              >
                More about how I work &rarr;
              </Link>
            </Reveal>

            <div className="grid gap-px bg-ink-line sm:grid-cols-2">
              {[
                {
                  title: 'One photographer, every time',
                  body: 'You brief me, I shoot it. No rotating roster of freelancers who have never seen your brand guidelines.',
                },
                {
                  title: 'Fast turnaround',
                  body: 'A preview selection the next day, so your comms team can post while the event is still current.',
                },
                {
                  title: 'Corporate-fluent',
                  body: 'I know who the CEO is, which handshake matters, and when to disappear. Discretion is part of the job.',
                },
                {
                  title: 'Licensed for real use',
                  body: 'Images come cleared for the channels you actually publish to, not restricted to a single press release.',
                },
              ].map((item, i) => (
                <Reveal
                  key={item.title}
                  delay={i * 70}
                  className="bg-ink p-8 lg:p-10"
                >
                  <h3 className="font-display text-xl text-bone">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-bone-dim">
                    {item.body}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/*
        Testimonials render only when real ones exist in src/data/site.ts.
        See the note on the `testimonials` export — inventing quotes and attributing
        them to named companies is not an option.
      */}
      {testimonials.length > 0 && (
        <section className="border-t border-ink-line py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal>
              <p className="eyebrow">In their words</p>
            </Reveal>
            <div className="mt-12 grid gap-px bg-ink-line md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t, i) => (
                <Reveal key={t.name} delay={i * 70} className="bg-ink p-8 lg:p-10">
                  <blockquote className="font-display text-xl leading-snug text-bone">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <footer className="mt-6 text-sm text-bone-dim">
                    {t.name} &middot; {t.role}, {t.company}
                  </footer>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------------- Close ---------------- */}
      <section className="border-t border-ink-line py-24 lg:py-36">
        <Reveal className="mx-auto max-w-3xl px-6 text-center lg:px-10">
          <p className="eyebrow">Next step</p>
          <h2 className="mt-5 font-display text-[clamp(2rem,5vw,3.5rem)] leading-tight text-bone">
            Tell me the date. I will tell you if it is free.
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-bone-dim">
            Most enquiries are answered the same working day, usually with a
            price attached.
          </p>
          <Link
            href="/contact"
            className="mt-10 inline-block rounded-full bg-bone px-8 py-3.5 text-sm font-medium text-ink transition-colors duration-300 hover:bg-sand"
          >
            Start an enquiry
          </Link>
        </Reveal>
      </section>
    </>
  )
}
