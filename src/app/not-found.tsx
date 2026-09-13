import Link from 'next/link'
import { categories } from '@/data/site'

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-6 py-36 lg:px-10">
      <p className="eyebrow">404</p>
      <h1 className="mt-5 font-display text-[clamp(2.5rem,6vw,4rem)] leading-tight text-bone">
        That page moved.
      </h1>
      <p className="mt-6 max-w-lg text-base leading-relaxed text-bone-dim">
        The site was rebuilt in 2026 and a few old links did not survive intact.
        The work is all still here:
      </p>

      <ul className="mt-8 space-y-2">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/work/${category.slug}`}
              className="link-underline font-display text-2xl text-bone"
            >
              {category.title}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-12 flex flex-wrap gap-4">
        <Link
          href="/"
          className="rounded-full bg-bone px-7 py-3.5 text-sm font-medium text-ink transition-colors duration-300 hover:bg-sand"
        >
          Back to home
        </Link>
        <Link
          href="/contact"
          className="rounded-full border border-ink-line px-7 py-3.5 text-sm text-bone transition-colors duration-300 hover:border-bone"
        >
          Contact
        </Link>
      </div>
    </div>
  )
}
