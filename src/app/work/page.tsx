import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import Reveal from '@/components/Reveal'
import { categories } from '@/data/site'
import { coverFor, photoCount } from '@/lib/gallery'

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Portfolio of corporate event, portrait, product and advertising photography shot in Singapore by Macrostudios.',
  alternates: { canonical: '/work' },
}

export default function WorkPage() {
  return (
    <>
      <PageHeader
        eyebrow="Portfolio"
        title="The work"
        intro="Five categories, shot over twenty years for agencies, listed companies and luxury brands. Every image below is from a commissioned job."
      />

      <div className="mx-auto max-w-7xl px-6 pb-24 lg:px-10 lg:pb-36">
        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((category, i) => {
            const cover = coverFor(category)
            return (
              <Reveal key={category.slug} delay={i * 70}>
                <Link
                  href={`/work/${category.slug}`}
                  className="group relative block overflow-hidden bg-ink-raised"
                >
                  <div className="relative aspect-[4/3]">
                    {cover && (
                      <Image
                        src={cover.src}
                        alt={cover.alt}
                        fill
                        quality={82}
                        sizes="(min-width: 640px) 50vw, 100vw"
                        placeholder={cover.blurDataURL ? 'blur' : 'empty'}
                        blurDataURL={cover.blurDataURL || undefined}
                        className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                      />
                    )}
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent"
                    />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-7 lg:p-9">
                    <div className="flex items-baseline justify-between gap-4">
                      <h2 className="font-display text-2xl text-bone lg:text-3xl">
                        {category.title}
                      </h2>
                      <span className="shrink-0 text-xs text-bone-dim">
                        {photoCount(category)} images
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
    </>
  )
}
