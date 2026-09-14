'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import ThemeToggle from './ThemeToggle'
import { nav, site, categories } from '@/data/site'
import brand from '@/data/brand.generated.json'

export default function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Prevent the page behind the drawer from scrolling while it is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  /*
    The bar carries its own surface on every page, including the top of the home
    page: the hero now begins below it rather than running underneath, so there is
    never a photograph behind the nav links. That also means the header simply
    follows the theme — the previous build had to force the dark palette here while
    it floated over the hero, which was the only reason `on-media` was ever applied
    to a chrome element.

    `scrolled` still does something: the bar picks up its hairline and the blur only
    once the page has moved, so at rest it reads as part of the page rather than as
    a chrome strip laid on top of it.
  */
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 bg-ink transition-colors duration-500 ${
        scrolled || open
          ? 'border-b border-ink-line bg-ink/90 backdrop-blur-md'
          : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        {/*
          The supplied logo is a stacked lockup, which is illegible in a bar this
          tall, so scripts/brand-assets.mjs splits it and the two halves are re-set
          side by side here. Both images are decorative: the link carries the
          accessible name, and alt text on each would have a screen reader announce
          the brand twice.
        */}
        <Link
          href="/"
          className="group -my-2 flex items-center gap-3.5 py-2 transition-opacity duration-300 hover:opacity-80 sm:gap-4"
          aria-label={`${site.name} home`}
        >
          <Image
            src={brand.mark.src}
            alt=""
            width={brand.mark.width}
            height={brand.mark.height}
            priority
            sizes="40px"
            className="logo-mono h-9 w-auto sm:h-10"
          />
          <Image
            src={brand.wordmark.src}
            alt=""
            width={brand.wordmark.width}
            height={brand.wordmark.height}
            priority
            sizes="150px"
            className="logo-mono h-[22px] w-auto sm:h-[26px]"
          />
        </Link>

        <nav className="hidden items-center gap-9 md:flex" aria-label="Main">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`link-underline text-sm tracking-wide transition-colors ${
                isActive(item.href)
                  ? 'text-sand'
                  : 'text-bone-dim hover:text-bone'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="rounded-full border border-sand px-5 py-2 text-sm text-sand transition-colors duration-300 hover:bg-sand hover:text-ink"
          >
            Get a quote
          </Link>
          <ThemeToggle className="-mr-2" />
        </nav>

        <div className="flex items-center md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="relative z-50 flex h-11 w-11 items-center justify-center"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            <span aria-hidden className="relative block h-4 w-6">
              <span
                className={`absolute left-0 block h-px w-6 bg-bone transition-transform duration-300 ${
                  open ? 'top-2 rotate-45' : 'top-0'
                }`}
              />
              <span
                className={`absolute left-0 top-2 block h-px w-6 bg-bone transition-opacity duration-300 ${
                  open ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`absolute left-0 block h-px w-6 bg-bone transition-transform duration-300 ${
                  open ? 'top-2 -rotate-45' : 'top-4'
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        id="mobile-nav"
        /*
          Capped at the viewport minus the 80px bar and scrollable, rather than
          clipped: on a short phone in landscape the five nav links plus the
          portfolio list is taller than the screen, and the tail was unreachable.
          overflow-x stays hidden so the panel can never widen the page.

          The rule only exists while the panel is open. Closed, `max-h-0` leaves a
          zero-height content box but still a 1px border box, and `bg-ink` paints
          under a transparent border — which drew a solid black hairline across the
          hero photograph on every phone. Dropping the border, rather than clearing
          its colour, is what leaves nothing to paint.
        */
        className={`overflow-y-auto overflow-x-hidden bg-ink md:hidden ${
          open ? 'max-h-[calc(100svh-5rem)] border-t border-ink-line' : 'max-h-0'
        } transition-[max-height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]`}
      >
        {/*
          Closing on click (rather than in an effect watching the pathname) keeps the
          drawer to one piece of state and avoids a cascading render on every
          navigation. Clicks bubble from any link inside.
        */}
        <nav
          className="px-6 py-6"
          aria-label="Mobile"
          onClick={() => setOpen(false)}
        >
          <ul className="space-y-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block py-3 font-display text-3xl ${
                    isActive(item.href) ? 'text-sand' : 'text-bone'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="eyebrow mt-6">Portfolio</p>
          <ul className="mt-1">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/work/${c.slug}`}
                  className="tap-row text-sm text-bone-dim"
                >
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
