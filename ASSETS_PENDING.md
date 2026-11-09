# ASSETS PENDING

Nothing in this file has been invented or approximated. Each item below is either **missing**
and must be supplied by the founder, or is a **placeholder** that is clearly temporary.

---

## 1. Obsidixz logo — ✅ SUPPLIED 2026-11-06

The founder supplied the approved transparent artwork as two PNGs:

| Supplied file | Use | Committed as |
| --- | --- | --- |
| `LOGO 1 transparent.png` | Dark artwork for light backgrounds (header) | `public/brand/obsidixz-logo-on-light.png` |
| `LOGO 2 transparent.png` | Light artwork for dark backgrounds (footer) | `public/brand/obsidixz-logo-on-dark.png` |

Both are 2000×1500 RGBA with a genuine alpha channel (95.1% fully transparent). The artwork was
**not** redrawn, recoloured, re-proportioned or traced. Processing was limited to:

1. trimming the surrounding transparent padding (2000×1500 → 635×524 of actual content),
2. a Lanczos downscale to 640 px wide, about 4× the 160 px display width.

Verified by comparing each committed file against a resized copy of the source: pixel-identical.

### Where it is rendered

`src/components/brand/LogoLockup.tsx` chooses the variant from its `tone` prop:

- `SiteHeader` → `tone="dark"` → `obsidixz-logo-on-light.png`
- `SiteFooter` → `tone="light"` → `obsidixz-logo-on-dark.png`

The image is `alt=""` / `aria-hidden`; the surrounding link supplies the accessible name, so a
screen reader does not announce "Obsidixz" twice.

### Still open — vector source

The supplied files are PNG. A raster logo cannot be sharpened or recoloured safely, so:

| Item | Status |
| --- | --- |
| SVG wordmark + emblem, light and dark | ⬜ **Not supplied** — optional |
| Favicon set derived from the real mark | ✅ Browser/app icons now use the exact symbol cropped from the supplied parent-logo PNG; optional vector logo can replace the raster crop later |
| Social card using the real mark | ⬜ Still the generated placeholder |

When vector art arrives, drop it in as `public/brand/obsidixz-logo-on-light.svg` and
`-on-dark.svg` and change the two `src` values in `LogoLockup.tsx`. Nothing else needs to change.
The favicon generator now crops the real symbol directly from the supplied parent-logo raster without redrawing it. An optional vector logo would let a future favicon use vector source artwork; the current icon remains faithful to the supplied pixels.

**Do not** upscale, recolour or redraw the PNGs to fill those gaps. A placeholder that is honest
about being a placeholder is better than a degraded copy of an approved mark.

---

## 2. Font licence

Montserrat and Open Sans are self-hosted from the `@fontsource-variable` npm packages. Both are
licensed under the **SIL Open Font License 1.1**, which permits web embedding and commercial use.
The licence files ship inside `node_modules/@fontsource-variable/*/LICENSE`.

No licence action is required. Recorded here so the position is auditable.

---

## 3. Imagery

Illustrative photography only. No image depicts an Obsidixz property, client property, office, or
transaction — none of those exist or could be represented.

Images are served from `public/images/` through `next/image`, so they are optimised and
responsive. Alt text on every image describes the scene, not a business claim.

### Provenance

| File | Subject | Origin | Licensing position |
| --- | --- | --- | --- |
| `public/images/hero-neighbourhood.jpg` | Elevated view of an established US suburban residential neighbourhood | Produced for this project | Owned by the project. No third-party licence, no attribution obligation. |
| `public/images/research-desk.jpg` | Printed property schedule, notebook, pen and coffee on a desk | Produced for this project | Owned by the project. No third-party licence, no attribution obligation. |

Both images are **illustrative**. Neither depicts a client property, a live listing, an Obsidixz
office or a real research deliverable. The printed schedule in the desk image is intentionally
illegible so that no fabricated data is presented as real. Alt text and the visible caption state
this.

### Why generated rather than stock

Image search returned almost entirely watermarked agency previews (Getty, Alamy), Pinterest
repins, or images too small for a full-bleed hero. Shipping unlicensed or watermarked photography
on a commercial site is a legal risk, so the two images were produced for this project instead.

**If the founder would prefer licensed photography of a real US market**, that is a genuine
improvement in authenticity. Replace the two files at the same paths (1408×768, JPEG, quality
~82) and update `alt` text in `src/components/sections/HomeHero.tsx` and `src/app/page.tsx`.
Record the licence and the photographer here.

### Reviewed but not used

| Candidate | Source | Status |
| --- | --- | --- |
| Aerial suburban neighbourhood, `--X_GwzO73r4` | Unsplash (Unsplash License) | 3000×1759, authentic. A viable alternative for the hero if licensed stock is preferred over a generated image. Not used because the generated image grades better under the dark brand gradient. |

---

## 4. Optional assets (not blockers)

| Item | Notes |
| --- | --- |
| Founder portrait for About Us | Only if the founder wants one. A single real person photograph would strengthen credibility more than any stock image, but it is not required and must not be substituted with a stock portrait of a stranger. |
| Any real research deliverable sample | Only if the founder supplies a genuine anonymised example. Do **not** fabricate a sample spreadsheet. |
| Social profile URLs | For `sameAs` in structured data and footer links. Omit until real accounts exist. |
| **Vector logo (SVG)** | The strongest single improvement to the brand assets. Currently a 640 px PNG is used at 160 px, which is sharp, but only an SVG allows the favicon and social card to use the real mark at any size without a degraded copy. |
| Resend email template branding | Optional: a hosted email template with the logo instead of the inline HTML currently generated by `buildResendRequest()`. |
