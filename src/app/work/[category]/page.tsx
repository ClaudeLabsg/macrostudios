import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Gallery from '@/components/Gallery'
import PageHeader from '@/components/PageHeader'
import Reveal from '@/components/Reveal'
import { categories, categoryBySlug, site } from '@/data/site'
import { photosFor } from '@/lib/gallery'

export function generateStaticParams() {
  return categories.map((category) => ({ category: category.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<'/work/[category]'>): Promise<Metadata> {
  // params is a Promise in Next 16.
  const { category: slug } = await params
  const category = categoryBySlug(slug)
  if (!category) return {}

  return {
    title: `${category.title} Photography Singapore`,
    description: category.metaDescription,
    alternates: { canonical: `/work/${category.slug}` },
    openGraph: {
      title: `${category.title} Photography Singapore | ${site.name}`,
      description: category.metaDescription,
      url: `${site.url}/work/${category.slug}`,
    },
  }
}

export default async function CategoryPage({
  params,
}: PageProps<'/work/[category]'>) {
  const { category: slug } = await params
  const category = categoryBySlug(slug)
  if (!category) notFound()

  const photos = photosFor(category)
  const index = categories.findIndex((c) => c.slug === category.slug)
  const nextCategory = categories[(index + 1) % categories.length]

  return (
    <>
      <PageHeader
        eyebrow={`Portfolio — ${photos.length} images`}
        title={category.title}
        intro={category.intro}
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Gallery photos={photos} />
      </div>

      <section className="mt-24 border-t border-ink-line py-20 lg:mt-36 lg:py-28">
        <Reveal className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Next</p>
              <Link
                href={`/work/${nextCategory.slug}`}
                className="link-underline mt-4 inline-block font-display text-3xl text-bone sm:text-4xl"
              >
                {nextCategory.title} &rarr;
              </Link>
            </div>
            <Link
              href="/contact"
              className="shrink-0 self-start rounded-full border border-sand px-7 py-3.5 text-sm text-sand transition-colors duration-300 hover:bg-sand hover:text-ink sm:self-auto"
            >
              Enquire about a {category.shortTitle.toLowerCase()} shoot
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  )
}
