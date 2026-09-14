'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Photo } from '@/lib/gallery'

/**
 * Slideshow pacing. These two belong together: the visible hold on each frame is
 * INTERVAL minus FADE, so raising the fade without raising the interval eats the
 * still moment and the hero reads as one permanent dissolve. Keep INTERVAL at
 * roughly three times FADE.
 */
const INTERVAL = 3200
const FADE = 900

/**
 * A click gets a much shorter crossfade than the timer does. The unattended fade is
 * slow on purpose - it is ambient - but once someone asks for the next photograph
 * that same fade reads as lag, so a user-driven change resolves in a third the time.
 */
const MANUAL_FADE = 300

/**
 * Hero slideshow.
 *
 * Two layouts off one set of images, switched by the `bleed` variant (defined in
 * globals.css, where the reasoning lives): full-bleed behind the copy when the
 * viewport is at least 4:3, and a photograph band above the copy when it is not.
 * The second is what phones get - these are 3:2 frames of rooms full of people,
 * and cropping one to a phone's 0.46:1 throws away two thirds of the width.
 *
 * Only the first frame is preloaded - it is the LCP element - and the rest stay
 * lazy so the initial payload is one image.
 */
export default function Hero({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(0)
  const [fade, setFade] = useState(FADE)
  /*
    Bumped on every manual change so the effect below tears down its timer and
    starts a fresh one. Without it a click can land a moment before a scheduled
    advance and the photograph you just asked for is gone again immediately.
  */
  const [nudge, setNudge] = useState(0)

  useEffect(() => {
    if (photos.length < 2) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const id = setInterval(() => {
      setFade(FADE)
      setIndex((i) => (i + 1) % photos.length)
    }, INTERVAL)
    return () => clearInterval(id)
  }, [photos.length, nudge])

  /** Any human-driven change: quick crossfade, and the clock restarts. */
  const show = (next: number) => {
    setFade(MANUAL_FADE)
    setIndex(next)
    setNudge((n) => n + 1)
  }

  return (
    /*
      `mt-20` clears the fixed header, which is `h-20` and carries its own surface:
      the hero starts below the bar rather than running underneath it, so no part of
      a photograph is ever hidden behind the nav. That is also why there is no longer
      a scrim across the top of the frame — there is nothing sitting on it to keep
      legible. Other pages clear the same 5rem through PageHeader's own top padding.

      The `bleed` height subtracts the bar for the same reason, so the bar plus the
      hero still come to exactly one screen.

      `on-media` keeps the scrim and the copy on the dark palette in both themes. It
      covers the copy in the split layout too, where that copy has left the
      photograph: the hero stays one dark object either way.
    */
    <section className="on-media relative mt-20 flex flex-col bg-ink bleed:h-[calc(100svh-5rem)] bleed:min-h-[520px] bleed:justify-end">
      {/*
        The photograph. A band in normal flow on a phone; the whole section from
        `bleed` up, with the copy sitting on top of it.
      */}
      <div className="relative aspect-[4/3] max-h-[36svh] w-full overflow-hidden bleed:absolute bleed:inset-0 bleed:aspect-auto bleed:max-h-none">
        {photos.map((photo, i) => (
          <Image
            key={photo.src}
            src={photo.src}
            alt={i === 0 ? photo.alt : ''}
            aria-hidden={i !== 0}
            fill
            preload={i === 0}
            quality={85}
            sizes="100vw"
            placeholder={photo.blurDataURL ? 'blur' : 'empty'}
            blurDataURL={photo.blurDataURL || undefined}
            /* Duration inline rather than a Tailwind class so it stays tied to the
               constant above. The reduced-motion rule in globals.css uses !important,
               so it still overrides this. */
            style={{ transitionDuration: `${fade}ms` }}
            className={`object-cover transition-opacity ease-[cubic-bezier(0.22,1,0.36,1)] ${
              i === index ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        {/*
          One scrim doing two jobs. Split, it is a short fade at the foot of the
          band so the photograph resolves into the copy below it rather than
          stopping at a hard line. Full-bleed, it opens out to cover the frame and
          carry the headline, which is sitting on the photograph there.
        */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink to-transparent bleed:inset-0 bleed:h-auto bleed:via-ink/65 bleed:to-ink/30"
        />
        {/*
          Tap anywhere on the photograph to advance. It sits above the scrims but
          below the indicators, and it is scoped to the band rather than the whole
          section so that on a phone the copy underneath is not also a slide
          control.

          Hidden from assistive tech and skipped in the tab order on purpose: it is
          a pointer convenience that duplicates the indicators, and a focus ring
          around the entire photograph helps nobody.
        */}
        {photos.length > 1 && (
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => show((index + 1) % photos.length)}
            className="absolute inset-0 cursor-pointer"
          />
        )}

        {/*
          Slide indicators double as manual controls. They live inside the band so
          they stay on the photograph in both layouts, and they now show on a phone
          too - hidden, nothing announced that the hero was a slideshow at all. The
          rule is still a hairline; the 44px box around it is the tap target.
        */}
        {photos.length > 1 && (
          <div className="absolute inset-x-0 bottom-2 flex justify-end gap-3 px-6 bleed:bottom-4 lg:px-10">
            {photos.map((photo, i) => (
              <button
                key={photo.src}
                type="button"
                onClick={() => show(i)}
                aria-label={`Show image ${i + 1} of ${photos.length}`}
                aria-current={i === index}
                className="group flex h-11 w-10 items-center"
              >
                <span
                  className={`h-px w-full transition-colors duration-500 ${
                    i === index ? 'bg-sand' : 'bg-bone/30 group-hover:bg-bone/60'
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/*
        Full-bleed, this block floats over the photograph and passes clicks through
        to the advance target behind it, except on its own links.
      */}
      <div className="relative mx-auto w-full max-w-7xl px-6 pb-14 pt-8 sm:pb-16 sm:pt-9 lg:px-10 lg:pb-28 bleed:pointer-events-none bleed:pt-0">
        <p className="eyebrow">Singapore &middot; Est. 2014</p>

        <h1 className="mt-4 max-w-4xl font-display text-[clamp(2.75rem,8vw,6rem)] leading-[0.95] tracking-tight text-bone sm:mt-5">
          Twenty years of
          <br />
          <span className="text-sand">getting the shot.</span>
        </h1>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-bone-dim sm:mt-7 sm:text-lg">
          Corporate events, portraits, products and campaigns — photographed for
          brands that only get one take.
        </p>

        {/* pointer-events restored here only, so these stay clickable. */}
        <div className="pointer-events-auto mt-8 flex flex-wrap gap-4 sm:mt-10">
          <Link
            href="/work"
            className="rounded-full bg-bone px-7 py-3.5 text-sm font-medium text-ink transition-colors duration-300 hover:bg-sand"
          >
            See the work
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-bone/30 px-7 py-3.5 text-sm text-bone transition-colors duration-300 hover:border-bone hover:bg-bone/10"
          >
            Check availability
          </Link>
        </div>
      </div>
    </section>
  )
}
