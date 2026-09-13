import Link from 'next/link'
import { site, contact, categories, nav } from '@/data/site'

export default function Footer() {
  return (
    <footer className="border-t border-ink-line bg-ink">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="font-display text-3xl text-bone">{site.name}</p>
            <p className="mt-1 text-[0.65rem] uppercase tracking-[0.28em] text-bone-dim">
              {site.tagline}
            </p>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-bone-dim">
              {site.yearsExperience} years of corporate, event, product and
              advertising photography in Singapore.
            </p>
            <div className="mt-6 flex gap-5">
              {contact.socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline text-sm text-bone-dim hover:text-bone"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Portfolio">
            <p className="eyebrow">Portfolio</p>
            <ul className="mt-4 space-y-2.5">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/work/${c.slug}`}
                    className="link-underline text-sm text-bone-dim hover:text-bone"
                  >
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <nav aria-label="Footer">
              <p className="eyebrow">Studio</p>
              <ul className="mt-4 space-y-2.5">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="link-underline text-sm text-bone-dim hover:text-bone"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <p className="eyebrow mt-8">Contact</p>
            <ul className="mt-4 space-y-2.5 text-sm text-bone-dim">
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="link-underline hover:text-bone"
                >
                  {contact.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${contact.phone.replace(/\s/g, '')}`}
                  className="link-underline hover:text-bone"
                >
                  {contact.phone}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-ink-line pt-8 text-xs text-bone-dim sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {site.legalName}. All photographs
            remain the property of {site.name}.
          </p>
          <p>UEN {site.uen}</p>
        </div>
      </div>
    </footer>
  )
}
