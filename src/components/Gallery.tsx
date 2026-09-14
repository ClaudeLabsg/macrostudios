'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Photo } from '@/lib/gallery'

/**
 * Masonry gallery with a lightbox.
 *
 * Images keep their native aspect ratio — the old site forced everything into
 * 1024x1024 squares, which destroys the composition that is the whole point of
 * hiring a photographer. CSS columns give a masonry layout with no JS measuring
 * and therefore no layout thrash.
 */
export default function Gallery({ photos }: { photos: Photo[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const close = useCallback(() => setOpenIndex(null), [])
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i + 1) % photos.length)),
    [photos.length]
  )
  const prev = useCallback(
    () =>
      setOpenIndex((i) =>
        i === null ? i : (i - 1 + photos.length) % photos.length
      ),
    [photos.length]
  )

  return (
    <>
      {/*
        Two columns on a phone, not one. A 52-image category ran to 17,000px of
        single-column scroll, and because each thumbnail was then 342px wide the
        browser fetched 342px-wide files — about 1.9 MB before you were halfway
        down. Paired columns halve the scroll and quarter the bytes, and the
        lightbox is where an image gets looked at properly anyway.
      */}
      <div className="columns-2 gap-3 sm:gap-4 lg:columns-3">
        {photos.map((photo, i) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="group mb-3 block w-full break-inside-avoid overflow-hidden bg-ink-raised sm:mb-4"
            aria-label={`Open image: ${photo.caption}`}
          >
            <span className="relative block overflow-hidden">
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                quality={82}
                sizes="(min-width: 1024px) 33vw, 50vw"
                placeholder={photo.blurDataURL ? 'blur' : 'empty'}
                blurDataURL={photo.blurDataURL || undefined}
                // Two columns puts roughly twice as many in the first screenful.
                loading={i < 6 ? 'eager' : 'lazy'}
                className="h-auto w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/20"
              />
            </span>
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <Lightbox
          photos={photos}
          index={openIndex}
          onClose={close}
          onNext={next}
          onPrev={prev}
        />
      )}
    </>
  )
}

function Lightbox({
  photos,
  index,
  onClose,
  onNext,
  onPrev,
}: {
  photos: Photo[]
  index: number
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}) {
  const photo = photos[index]
  const closeRef = useRef<HTMLButtonElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement
    closeRef.current?.focus()
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = overflow
      // Return focus to the thumbnail that opened the lightbox.
      previouslyFocused.current?.focus()
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNext()
      if (e.key === 'ArrowLeft') onPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onNext, onPrev])

  /*
    Swipe to move between photographs — the gesture anyone who has used a phone
    photo viewer will try first, and without it the only way through 52 images was
    to hit a 48px arrow 51 times.

    A swipe has to travel 45px and be more horizontal than vertical before it
    counts, so a tap with a shaky thumb still reads as a tap and a diagonal scrub
    does not fire a change nobody asked for.
  */
  const swipeStart = useRef<{ x: number; y: number } | null>(null)

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    swipeStart.current = { x: t.clientX, y: t.clientY }
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    const from = swipeStart.current
    swipeStart.current = null
    if (!from) return

    const t = e.changedTouches[0]
    const dx = t.clientX - from.x
    const dy = t.clientY - from.y
    if (Math.abs(dx) < 45 || Math.abs(dx) <= Math.abs(dy)) return

    if (dx < 0) onNext()
    else onPrev()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.caption}
      // Fully opaque: at 97% the fixed header showed through behind the photograph.
      className="on-media fixed inset-0 z-[60] flex flex-col bg-ink"
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-6 py-5">
        <p className="text-sm text-bone-dim">
          {index + 1} / {photos.length}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="flex h-11 items-center rounded-full border border-ink-line px-5 text-sm text-bone-dim transition-colors hover:border-bone hover:text-bone"
        >
          Close
        </button>
      </div>

      <div
        className="relative flex flex-1 items-center justify-center px-4 pb-4"
        // Clicks on the image itself should not close the dialog.
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <button
          type="button"
          onClick={onPrev}
          aria-label="Previous image"
          className="absolute left-1 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-ink/45 text-2xl text-bone/80 backdrop-blur-sm transition-colors hover:bg-bone/10 hover:text-bone sm:left-6 sm:bg-transparent sm:text-bone/60 sm:backdrop-blur-none"
        >
          &#8249;
        </button>

        <Image
          key={photo.src}
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          quality={90}
          sizes="100vw"
          placeholder={photo.blurDataURL ? 'blur' : 'empty'}
          blurDataURL={photo.blurDataURL || undefined}
          className="max-h-full w-auto max-w-full object-contain"
        />

        <button
          type="button"
          onClick={onNext}
          aria-label="Next image"
          className="absolute right-1 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-ink/45 text-2xl text-bone/80 backdrop-blur-sm transition-colors hover:bg-bone/10 hover:text-bone sm:right-6 sm:bg-transparent sm:text-bone/60 sm:backdrop-blur-none"
        >
          &#8250;
        </button>
      </div>

      <p className="px-6 pb-6 text-center text-sm text-bone-dim">
        {photo.caption}
      </p>
    </div>
  )
}
