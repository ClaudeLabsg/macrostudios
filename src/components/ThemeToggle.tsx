'use client'

/** Kept in step with the surface colours in globals.css. */
const SURFACE = { light: '#edeae4', dark: '#0b0b0c' } as const

/**
 * Light/dark switch.
 *
 * Deliberately stateless. Both icons are rendered and CSS shows the one for the
 * theme you are not in (see globals.css), which means the button is correct on the
 * server, correct before hydration, and cannot mismatch — the alternative is reading
 * localStorage in an effect and flashing the wrong icon on every load.
 */
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const toggle = () => {
    const el = document.documentElement
    const next = el.classList.contains('theme-dark') ? 'light' : 'dark'

    el.classList.remove('theme-light', 'theme-dark')
    el.classList.add(`theme-${next}`)
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', SURFACE[next])

    // Private browsing can throw on write; the theme still applies for this visit.
    try {
      localStorage.setItem('theme', next)
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex h-11 w-11 items-center justify-center rounded-full text-bone-dim transition-colors duration-300 hover:bg-bone/10 hover:text-bone ${className}`}
    >
      <span className="sr-only" data-theme-icon="sun">
        Switch to light theme
      </span>
      <span className="sr-only" data-theme-icon="moon">
        Switch to dark theme
      </span>

      <svg
        data-theme-icon="sun"
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="h-[18px] w-[18px]"
      >
        <circle cx="12" cy="12" r="4.25" />
        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
      </svg>

      <svg
        data-theme-icon="moon"
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[18px] w-[18px]"
      >
        <path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2Z" />
      </svg>
    </button>
  )
}
