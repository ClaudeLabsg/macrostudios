import Image from 'next/image'
import { clientLogos } from '@/lib/gallery'

/**
 * Client logo wall.
 *
 * These were buried on a separate page on the old site. Chanel, DBS, HSBC and
 * Nintendo above the fold do more selling than any amount of body copy, so the
 * homepage surfaces a subset and links through to the full list.
 *
 * The source files are a mix of black-on-white JPEGs and transparent PNGs, so the
 * build step (scripts/optimize-images.mjs) reduces each one to a bone-coloured
 * silhouette. They are already monochrome here — no CSS filter needed — and sit at
 * reduced opacity so the wall reads as texture until you look at it directly.
 */
export default function LogoWall({ limit }: { limit?: number }) {
  const logos = limit ? clientLogos().slice(0, limit) : clientLogos()

  return (
    <ul className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-10 lg:gap-y-14">
      {logos.map((logo) => (
        <li key={logo.src} className="flex items-center justify-center">
          <Image
            src={logo.src}
            alt={`${logo.name} — Macrostudios client`}
            width={logo.width}
            height={logo.height}
            loading="lazy"
            quality={90}
            sizes="(min-width: 1024px) 160px, (min-width: 640px) 20vw, 40vw"
            className="h-9 w-auto max-w-[150px] object-contain opacity-60 transition-opacity duration-500 hover:opacity-100 lg:h-11"
          />
        </li>
      ))}
    </ul>
  )
}
