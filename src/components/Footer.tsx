import Image from 'next/image'
import Link from 'next/link'
import { site, contact, categories, nav } from '@/data/site'
import brand from '@/data/brand.generated.json'

export default function Footer() {
  return (
    <footer className="border-t border-ink-line bg-ink">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            {/* Room to breathe down here, so the lockup runs stacked as drawn. */}
            <Image
              src={brand.logo.src}
              alt={`${site.name} — ${site.tagline}`}
              width={brand.logo.width}
              height={brand.logo.height}
              loading="lazy"
              className="logo-mono h-24 w-auto"
            />
            <p className="mt-7 max-w-sm text-sm leading-relaxed text-bone-dim">
              {site.yearsExperience} years of corporate, event, product and
              advertising photography in Singapore.
            </p>
            <div className="mt-6 flex gap-8 sm:gap-5">
              {contact.socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap-row link-underline text-sm text-bone-dim hover:text-bone"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Portfolio">
            <p className="eyebrow">Portfolio</p>
            {/* space-y on mobile is the 44px pitch `.tap-row` overlays need. */}
            <ul className="mt-4 space-y-6 sm:space-y-2.5">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/work/${c.slug}`}
                    className="tap-row link-underline text-sm text-bone-dim hover:text-bone"
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
              <ul className="mt-4 space-y-6 sm:space-y-2.5">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="tap-row link-underline text-sm text-bone-dim hover:text-bone"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <p className="eyebrow mt-8">Contact</p>
            <ul className="mt-4 space-y-6 text-sm text-bone-dim sm:space-y-2.5">
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="tap-row link-underline hover:text-bone"
                >
                  {contact.email}
                </a>
              </li>
              <li>{contact.hours}</li>
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
