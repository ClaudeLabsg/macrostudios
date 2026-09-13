import type { MetadataRoute } from 'next'
import { categories, site } from '@/data/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticRoutes = [
    { path: '', priority: 1 },
    { path: '/work', priority: 0.9 },
    { path: '/services', priority: 0.8 },
    { path: '/clients', priority: 0.7 },
    { path: '/about', priority: 0.7 },
    { path: '/contact', priority: 0.8 },
  ]

  return [
    ...staticRoutes.map((route) => ({
      url: `${site.url}${route.path}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: route.priority,
    })),
    ...categories.map((category) => ({
      url: `${site.url}/work/${category.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
