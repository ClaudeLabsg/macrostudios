# Macrostudios

Rebuild of [macrostudios.sg](https://www.macrostudios.sg) — corporate, event, product and
advertising photography, Singapore. Next.js 16 (App Router) + Tailwind v4, deployed on Vercel.

Replaces a WordPress/Kenza build that was running Elementor and WPBakery simultaneously,
shipping an empty `<title>` on the homepage and serving up to 16 MB per gallery page.

---

## Before you go live

Every item below is a value that could not be verified from the old site. Search the
codebase for `TODO` to find them all in place.

| What | Where | Why it matters |
|---|---|---|
| **Phone number** | `src/data/site.ts` → `contact.phone` | Currently `+65 0000 0000`. Powers the `tel:` link in the footer and on /contact. |
| **WhatsApp number** | `src/data/site.ts` → `contact.whatsapp` | Digits only, no `+` or spaces (e.g. `6591234567`). Powers the floating button on every page. |
| **Business hours** | `src/data/site.ts` → `contact.hours` | Shown next to the phone number. |
| **Response time** | `src/data/site.ts` → `contact.responseTime` | Promised on /contact and in the form's success message. Do not promise faster than you can deliver. |
| **Prices** | `src/data/site.ts` → `services[].priceFrom` | All `null`, so every package reads "On request". Put real numbers in and they render as "From $X". |
| **Testimonials** | `src/data/site.ts` → `testimonials` | Empty array; the homepage section is skipped entirely while it stays empty. See the note in that file. |
| **A photo of Larry** | `src/app/about/page.tsx` | The About page currently borrows an event frame. A personal brand needs a face. |
| **Email sending** | Vercel env vars (below) | Until `RESEND_API_KEY` is set the form shows an error pointing at the email address rather than silently dropping enquiries. |

### Environment variables

Set these in the Vercel project (Settings → Environment Variables):

```
RESEND_API_KEY=re_...                          # from resend.com
ENQUIRY_TO=larry@macrostudios.sg                # where enquiries land
ENQUIRY_FROM=Macrostudios <site@macrostudios.sg> # must be a verified sender on your domain
```

---

## Local development

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm start            # serve the production build
npm run lint
```

---

## Images

Photographs live in `public/images/<category>/` as WebP. They are generated from the
originals in `scripts/raw/` (git-ignored, ~243 MB — these were pulled from the old
WordPress site and are kept locally so the pipeline can be re-run).

```bash
npm run images       # scripts/raw/ -> public/images/ + src/data/gallery.generated.json
```

The pipeline resizes to a 2000 px long edge, converts to WebP, and records each image's
dimensions plus a tiny base64 blur placeholder so nothing shifts as it loads. Result:
**243 MB → 31.6 MB, an 87% reduction.**

Client logos get separate treatment. The source files are an inconsistent mix of
black-on-white JPEGs and transparent PNGs — dropped onto a dark page as-is, the dark ones
vanish and the JPEGs show as white rectangles. `logoMask()` reduces each one to a
bone-coloured silhouette, picking between three strategies based on raw pixel analysis.
54 of 55 convert cleanly; Royal Caribbean is mixed-polarity in the source (white-on-navy
*and* navy-on-yellow) so no single interpretation is right. `LOGO_STRATEGY` in
`scripts/optimize-images.mjs` lets you pin a strategy per logo by slug.

### Adding photographs

1. Drop files into `scripts/raw/<category>/`
2. `npm run images`
3. Commit `public/images/` and `src/data/gallery.generated.json`

### Alt text and captions

Alt text is derived from filenames: `allianz-ap-summit-1.webp` becomes
*"Allianz AP Summit — corporate events by Macrostudios Singapore"*. Camera-roll names
(`dsc-4503e`, `img-2231`) carry no meaning and fall back to the category name.

```bash
npm run captions     # lists images needing a hand-written caption, as pasteable JSON
```

Put overrides in `src/data/captions.json` (`{ "dsc-4503e": "Gold Kili taxi wrap" }`).
They take priority over the derived text and appear in the lightbox caption too.

---

## Structure

```
src/
  app/
    page.tsx                  home — hero, logo wall, category grid, why, CTA
    work/page.tsx             portfolio index
    work/[category]/page.tsx  gallery (SSG, one per category)
    services/page.tsx         packages, inclusions, process
    clients/page.tsx          full logo wall
    about/page.tsx            Larry's story
    contact/                  page + server action + shared shoot types
    sitemap.ts robots.ts not-found.tsx
  components/                 Header, Footer, Hero, Gallery (+lightbox), LogoWall,
                              ContactForm, Reveal, PageHeader, WhatsAppButton
  data/
    site.ts                   ⟵ business details, nav, categories, services, testimonials
    gallery.generated.json    ⟵ generated, do not edit by hand
    captions.json             ⟵ hand-written caption overrides
  lib/gallery.ts              manifest → typed photos, alt text, covers
scripts/
  optimize-images.mjs         image + logo pipeline
  caption-report.mjs          which images need captions
  measure.mjs                 first-visit transfer size per page
```

`src/data/site.ts` is the single file to edit for copy, contact details and pricing.

---

## What changed from the old site

**Fixed**

- Homepage `<title>` was empty. Every page now has a unique title and meta description.
- Homepage had no `<h1>` (only an empty `<h2>`).
- 90 of 93 images on the advertising page had empty `alt`. All images now carry alt text.
- No `Cache-Control` on images, so every visit re-downloaded every photograph.
- Nine overlapping top-level nav items reduced to five.
- No phone or WhatsApp anywhere. WhatsApp is now on every page, phone in the footer and on /contact.
- The contact form asked only name/email/message — every lead needed a follow-up just to
  establish what and when. It now captures shoot type and date.
- Square `1024x1024` crops destroyed composition. Galleries are masonry at native aspect ratio.
- Orphan pages (`/vcard/`, `/pf-sample/`, `/sgpools/`, `/portfolio/events-new/`,
  `/portfolio/additional-events1025/`) were publicly indexed. All redirect now.
- Added `ProfessionalService` structured data, a sitemap, and security headers.

**Performance**

| | Old | New |
|---|---|---|
| Homepage | ~2.2 MB | **373 KB** |
| Advertising gallery (89 images) | ~16 MB | **480 KB** |
| Events gallery (52 images) | ~11 MB | **737 KB** |
| Stylesheets | 23 | 1 |
| Page builders loaded | 2 (Elementor + WPBakery) | 0 |

New figures are brotli-compressed text plus only the images the browser fetches
immediately; the rest lazy-load. Re-measure any time with `npm run measure`
(`node scripts/measure.mjs` against a running production build).

### Redirects

All the old URLs 301 to their new homes — see `legacyRedirects` in `next.config.ts`.
Twenty years of accumulated links and search rankings point at those paths, so keep them.

---

## Deploying

Push to GitHub and import the repo at [vercel.com/new](https://vercel.com/new). Framework
detection and build settings need no changes. Add the environment variables above, then
point the `macrostudios.sg` DNS at Vercel.

**Before switching DNS:** export anything still wanted from WordPress. Once the domain
moves, the old site is unreachable. `scripts/raw/` holds the images that were scraped,
but not posts, pages or any form submissions stored in the WordPress database.
