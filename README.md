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
| **Business hours** | `src/data/site.ts` → `contact.hours` | Shown in the footer and on /contact as when the inbox is watched. |
| **Response time** | `src/data/site.ts` → `contact.responseTime` | Promised on /contact and in the form's success message. Do not promise faster than you can deliver. |
| **Prices** | `src/data/site.ts` → `services[].priceFrom` | All `null`, so every package reads "On request". Put real numbers in and they render as "From $X". |
| **Testimonials** | `src/data/site.ts` → `testimonials` | Empty array; the homepage section is skipped entirely while it stays empty. See the note in that file. |
| **A photo of Larry** | `src/app/about/page.tsx` | The About page currently borrows an event frame. A personal brand needs a face. |
| **Email sending** | `.env.local` + Vercel env vars (below) | Until `RESEND_API_KEY` is set the form shows an error pointing at the email address rather than silently dropping enquiries. Check it with `npm run check:email`. |
| **Sender domain vs. site domain** | `ENQUIRY_FROM` | Enquiries send from `sera@claudecode.sg`. That domain *is* verified in Resend so delivery works, but on a macrostudios.sg site the From line reads oddly. Verify macrostudios.sg at [resend.com/domains](https://resend.com/domains) and switch when DNS moves. |

### Contact policy

Email is the only channel published on the site. There is no phone number, no `tel:`
link and no WhatsApp button anywhere, and `telephone` is deliberately absent from the
`ProfessionalService` structured data — every enquiry is meant to land in one inbox.
The form's phone field is optional and is for reaching the client on the shoot day;
replies still go back by email. See the note above `contact` in `src/data/site.ts`.

### Environment variables

`cp .env.example .env.local` for development, and set the same keys in the Vercel
project (Settings → Environment Variables) for production. `.env.example` documents
each one; the short version is a Resend API key, an inbox, and a verified sender.

Then verify the whole path without going near the form:

```bash
npm run check:email
```

It reports which of the three usual failures you have — key missing, key rejected, or
sender domain unverified — and on success sends one real test message. **"The enquiry
form is not connected yet" always means `RESEND_API_KEY` is unset**; the action refuses
to pretend it sent something it did not.

Until a domain is verified at [resend.com/domains](https://resend.com/domains), Resend's
sandbox sender (`onboarding@resend.dev`) works with no DNS setup, but only delivers to
the address that owns the Resend account.

#### Who the enquiry appears to come from

`ENQUIRY_FROM` must be an address on a domain you have verified. It cannot be the
enquirer's own address — sending as a domain you do not control fails SPF and DKIM, so
the message is refused or filed as spam. What the action does instead:

| Header | Value | Effect in the inbox |
|---|---|---|
| `From` | `Jane Tan via Macrostudios <ENQUIRY_FROM>` | The sender column shows who enquired, not one identical address every time. |
| `Reply-To` | the enquirer's address | Hitting reply goes straight back to them. |

The display name is stripped of `"`, `<`, `>`, `@` and newlines before it goes near a
header — it is attacker-controlled text, and those are the characters that turn a
display name into a forged second header.

### Form validation

The server action in `src/app/contact/actions.ts` is the only validation that counts —
the form posts to it directly, so `required`/`min`/`maxLength` in the markup are a
courtesy that saves a round trip, not a gate. It checks lengths on every field, email
and phone shape, and the shoot date: it must be a real calendar date, not in the past,
and no more than `MAX_BOOKING_YEARS` ahead.

"Today" is computed in `Asia/Singapore` (`src/app/contact/dates.ts`), not in the
server's timezone. On a UTC host, a Singapore morning is still the previous UTC day, so
comparing against UTC would reject an enquiry for *today* as already past.

---

## Local development

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm start            # serve the production build
npm run lint
npm run check:email  # prove the enquiry form can actually send
```

**Stop `next dev` before running `next build`.** They share the `.next` directory, and a
build (or a manual `rm -rf .next`) pulls the compiled output from under a running dev
server — every route then 500s with a bogus "Module not found" for the Google font
loader. The fix is always: stop the server, delete `.next`, start it again.

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
                              ContactForm, Reveal, PageHeader
  data/
    site.ts                   ⟵ business details, nav, categories, services, testimonials
    gallery.generated.json    ⟵ generated, do not edit by hand
    captions.json             ⟵ hand-written caption overrides
  lib/gallery.ts              manifest → typed photos, alt text, covers
scripts/
  optimize-images.mjs         image + logo pipeline
  caption-report.mjs          which images need captions
  measure.mjs                 first-visit transfer size per page
  check-email.mjs             diagnoses and tests the enquiry form's email path
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
