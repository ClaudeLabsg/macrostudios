'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { nav, site, categories } from '@/data/site'

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

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled || open
          ? 'border-b border-ink-line bg-ink/90 backdrop-blur-md'
          : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link
          href="/"
          className="group flex flex-col leading-none"
          aria-label={`${site.name} home`}
        >
          <span className="font-display text-2xl tracking-wide text-bone">
            {site.name}
          </span>
          <span className="mt-0.5 text-[0.6rem] uppercase tracking-[0.28em] text-bone-dim transition-colors group-hover:text-sand">
            {site.tagline}
          </span>
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
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="relative z-50 flex h-10 w-10 items-center justify-center md:hidden"
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

      {/* Mobile drawer */}
      <div
        id="mobile-nav"
        className={`overflow-hidden border-t border-ink-line bg-ink md:hidden ${
          open ? 'max-h-[80vh]' : 'max-h-0 border-transparent'
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
          <ul className="mt-3 space-y-2">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/work/${c.slug}`}
                  className="block text-sm text-bone-dim"
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
