'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Photo } from '@/lib/gallery'

const INTERVAL = 6500

/**
 * Full-bleed hero with a slow crossfade.
 *
 * Replaces the old Slider Revolution hero. Only the first frame is `priority` —
 * it is the LCP element — and the rest stay lazy so the initial payload is one image.
 */
export default function Hero({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (photos.length < 2) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const id = setInterval(
      () => setIndex((i) => (i + 1) % photos.length),
      INTERVAL
    )
    return () => clearInterval(id)
  }, [photos.length])

  return (
    <section className="relative flex h-[100svh] min-h-[600px] items-end overflow-hidden">
      {photos.map((photo, i) => (
        <Image
          key={photo.src}
          src={photo.src}
          alt={i === 0 ? photo.alt : ''}
          aria-hidden={i !== 0}
          fill
          priority={i === 0}
          quality={85}
          sizes="100vw"
          placeholder={photo.blurDataURL ? 'blur' : 'empty'}
          blurDataURL={photo.blurDataURL || undefined}
          className={`object-cover transition-opacity duration-[2000ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {/*
        Two scrims. The first darkens the bottom two-thirds where the headline sits;
        the second is a short gradient under the fixed header, without which the nav
        links disappear entirely over a pale frame (the Chanel retail shot, for one).
      */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-ink via-ink/65 to-ink/30"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/85 to-transparent"
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 pb-20 lg:px-10 lg:pb-28">
        <p className="eyebrow">Singapore &middot; Est. 2014</p>

        <h1 className="mt-5 max-w-4xl font-display text-[clamp(2.75rem,8vw,6rem)] leading-[0.95] tracking-tight text-bone">
          Twenty years of
          <br />
          <span className="text-sand">getting the shot.</span>
        </h1>

        <p className="mt-7 max-w-xl text-base leading-relaxed text-bone-dim sm:text-lg">
          Corporate events, portraits, products and campaigns — photographed for
          brands that only get one take.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
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

      {/* Slide indicators double as manual controls. */}
      {photos.length > 1 && (
        <div className="absolute bottom-8 right-6 hidden gap-2 lg:right-10 lg:flex">
          {photos.map((photo, i) => (
            <button
              key={photo.src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show image ${i + 1} of ${photos.length}`}
              aria-current={i === index}
              className={`h-px w-10 transition-colors duration-500 ${
                i === index ? 'bg-sand' : 'bg-bone/30 hover:bg-bone/60'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
