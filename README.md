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
| Current stage | **Stage 8 — Deployment preparation (complete)** |
| Stages complete | 1, 2, 3, 4, 5, 6, 7, 8 |
| Production build | Passing (`npm run build`) |
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
| `npm run check` | typecheck + lint + build in one pass |
| `npm run smoke` | Route/SEO/link/http checks against a running build (see below) |

## Testing

There is no unit-test framework in the project. Verification is done with three layers:

1. **Static checks** — `npm run typecheck` and `npm run lint`.
2. **Build check** — `npm run build` must complete with no errors.
3. **Smoke test** — `npm run smoke` crawls the production build and asserts every required
   route returns HTML, contains its expected title/canonical, has no unresolved placeholder
   markers, and that internal links resolve. It also exercises the contact API for the
   reject paths (invalid payload, honeypot, rate limits, unconfigured delivery).

```bash
npm run build && npm run start &   # serve on :3000
npm run smoke                      # in another shell
# or point it at another origin:
SITE_ORIGIN=http://localhost:3100 npm run smoke
```

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
