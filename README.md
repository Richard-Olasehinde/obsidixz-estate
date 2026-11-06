# Obsidixz Real Estate — Website

The official website for **Obsidixz Real Estate**, a research and lead-generation business
serving US residential real-estate investors and property acquisition operators.

> Helping property professionals identify relevant opportunities through useful real-estate
> research and lead generation.

This repository contains the public marketing website, including an eight-page information
architecture and a configurable enquiry form.

---

## Project status

| Item | Status |
| --- | --- |
| Current stage | **All eight stages complete** — awaiting founder-supplied configuration |
| Stages complete | 1, 2, 3, 4, 5, 6, 7, 8 |
| Production build | Passing (`npm run build`) |
| Verification | 135 route/SEO/API checks, 26 layout checks, 28 performance checks, full a11y pass |
| Contact form delivery | **Requires founder configuration** — see [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) |
| Approved logo asset | **Not supplied** — temporary text lockup in use, see [ASSETS_PENDING.md](./ASSETS_PENDING.md) |

Detailed, always-current status lives in [DEVELOPMENT_STATUS.md](./DEVELOPMENT_STATUS.md).

---

## Technology stack

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | **Next.js 16** (App Router) | Static-first rendering, file-based routing, built-in metadata API, easy deployment on any Node host or Vercel |
| UI library | **React 19** | Required by Next.js |
| Styling | **Tailwind CSS 4** | Design tokens live in CSS (`@theme`), no config sprawl |
| Language | **TypeScript** (strict) | Type safety across components and the form contract |
| Validation | **Zod 4** | One schema shared by the client form and the server route handler |
| Fonts | **`@fontsource-variable`** (self-hosted) | Montserrat + Open Sans served from own origin: no third-party font CDN, no cookie/consent implications, better performance |
| Icons / motifs | Inline SVG | No icon library dependency |
| Images | Photographs in `/public/images` served through `next/image` | Optimised, sized, lazy-loaded |

No CSS-in-JS runtime, no state-management library, no UI kit. The site is deliberately
dependency-light.

---

## Requirements

- **Node.js 20.9 or newer** (developed on Node 22)
- npm 10 or newer (pnpm/yarn also work, but `package-lock.json` is committed for npm)

## Setup

```bash
# 1. Clone and enter the project
git clone https://github.com/Richard-Olasehinde/obsidixz-estate.git
cd obsidixz-estate

# 2. Install dependencies
npm install

# 3. Create your local environment file
cp .env.example .env.local
#    Then edit .env.local — at minimum set NEXT_PUBLIC_SITE_URL.
#    The site runs fine with everything left blank; the contact form will
#    report "submission not configured" until a destination is supplied.

# 4. Start the development server
npm run dev
#    http://localhost:3000
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server with hot reload (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build (run `build` first) |
| `npm run lint` | ESLint (Next.js core-web-vitals + TypeScript rules) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run check` | typecheck + lint + layout metrics + accessibility + build |
| `npm run layout` | Proves text fits every multi-column cell at 360–1440 px |
| `npm run a11y` | Contrast, landmarks, labels and ARIA references against a running build |
| `npm run perf` | Performance budgets against a served production build |
| `npm run smoke` | Route/SEO/link/asset/claim/API checks against a running build |

## Testing

There is no unit-test framework in the project. Verification is done with three layers:

1. **Static checks** — `npm run typecheck` and `npm run lint`.
2. **Build check** — `npm run build` must complete with no errors.
3. **Behavioural suites** — run against a served build (dev or production):

   - `npm run smoke` — 135 checks: every route returns HTML with a unique title, description and
     absolute canonical; one `<h1>` per page with no skipped levels; every internal link and
     in-page anchor resolves; every referenced asset returns 200; no fabricated business claims;
     JSON-LD parses and contains no invented address; robots and sitemap are correct; security
     headers are present; and the enquiry API rejects invalid input while never reporting success
     when delivery is unconfigured.
   - `npm run layout` — 26 geometric assertions that the widest word in every multi-column cell
     fits the narrowest column at 360/390/640/768/1024/1280/1440 px, measured with the real font
     metrics the site serves.
   - `npm run a11y` — 30 contrast pairs plus document structure, form labels, ARIA references and
     focus semantics.
   - `npm run perf` — gzipped JS/HTML/CSS budgets per page, hero image format and size, immutable
     caching and compression.

```bash
npm run build
npm run start &                                    # serve on :3000
npm run smoke
npm run a11y
SITE_ORIGIN=http://localhost:3000 npm run perf
```

`npm run check` runs the static gates (types, lint, layout, a11y) plus the build, and is what to
run before every commit.

Manual checks performed across stages are listed in
[DEVELOPMENT_STATUS.md](./DEVELOPMENT_STATUS.md#tests-performed).

---

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Homepage — positioning, service, audience, process, approach, enquiry CTA |
| `/about` | Who Obsidixz Real Estate is, operating philosophy, parent relationship |
| `/services` | Property Lead Research explained in detail |
| `/how-it-works` | Five-step research workflow |
| `/who-we-serve` | Primary audience (residential investors) and secondary (acquisition operators) |
| `/contact` | Enquiry form with validation and real delivery states |
| `/privacy-policy` | Privacy policy drafted from the actual implementation |
| `/terms-of-service` | Terms of service for a research service |
| `/api/enquiry` | `POST` endpoint that validates and delivers enquiries |
| `not-found` | Custom 404 |

---

## Documentation

| Document | Contents |
| --- | --- |
| [DEVELOPMENT_STATUS.md](./DEVELOPMENT_STATUS.md) | Stage-by-stage status, tests, outstanding items |
| [DECISION_LOG.md](./DECISION_LOG.md) | Technical and design decisions with reasoning |
| [PROJECT_FILE_MAP.md](./PROJECT_FILE_MAP.md) | Directory and file reference |
| [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) | Every environment variable, and how to handle credentials |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Build, host, domain, post-deploy verification |
| [RECOVERY_NOTES.md](./RECOVERY_NOTES.md) | How to resume this project from scratch |
| [ASSETS_PENDING.md](./ASSETS_PENDING.md) | Brand assets and imagery that must be supplied |

---

## Business accuracy rules (important for future editors)

This website represents an **emerging** business. When editing copy or adding sections:

- **Never add** testimonials, client logos, case studies, transaction counts, investment
  returns, awards, certifications, staff numbers, years of experience, or a US office
  address. None of these exist.
- **Never describe** the business as a brokerage, agency, property manager, fund, marketplace
  or property-listing portal.
- **Never advertise** wholesaling. It has been considered but is not a service on offer.
- **Never promise** guaranteed sellers, availability, accuracy of contacts, profitable deals,
  exclusivity or investment returns.
- **Never invent** pricing, delivery times, or minimum order quantities. Use "Discuss your
  requirements".
- **Never invent** legal details: entity names, registration numbers, addresses, governing law
  or jurisdiction. Use the marked placeholders in `src/lib/legal.ts`.

These constraints are enforced by a content check in `npm run smoke`.

---

## Licence and ownership

Proprietary. © Obsidixz. All rights reserved. Not for redistribution.
