# PROJECT FILE MAP

Reference for locating anything in this repository.

```
obsidixz-estate/
├── src/
│   ├── app/                    Next.js App Router — every route lives here
│   ├── components/             Reusable UI (layout, ui, sections, seo, forms, brand)
│   └── lib/                    Configuration, content data and validation logic
├── public/                     Static files served from the site root
│   ├── images/                 The two illustrative photographs
│   └── favicon*, og-image.png  Placeholder brand assets (see ASSETS_PENDING.md)
├── scripts/                    Verification gates and asset generators (not part of the build)
│   └── fonts/                  Measurement-only font instances
├── docs root                   Project documentation (*.md)
└── configuration files         Root-level
```

---

## `src/app/` — routes

| Path | Route | Notes |
| --- | --- | --- |
| `layout.tsx` | — | Root layout: fonts, metadata base, header, footer, skip link |
| `globals.css` | — | **Design tokens**, base styles, component primitives, motion rules |
| `page.tsx` | `/` | Homepage |
| `about/page.tsx` | `/about` | About Us |
| `services/page.tsx` | `/services` | Services |
| `how-it-works/page.tsx` | `/how-it-works` | How It Works |
| `who-we-serve/page.tsx` | `/who-we-serve` | Who We Serve |
| `contact/page.tsx` | `/contact` | Contact + enquiry form |
| `privacy-policy/page.tsx` | `/privacy-policy` | Privacy Policy (draft, marked) |
| `terms-of-service/page.tsx` | `/terms-of-service` | Terms of Service (draft, marked) |
| `api/enquiry/route.ts` | `POST /api/enquiry` | Enquiry validation, spam checks, delivery |
| `sitemap.ts` | `/sitemap.xml` | Generated from `src/lib/routes.ts` |
| `robots.ts` | `/robots.txt` | Generated |
| `not-found.tsx` | 404 | Custom not-found page |
| `manifest.ts` | `/manifest.webmanifest` | Web app manifest |

## `src/components/`

| Directory | Contents |
| --- | --- |
| `layout/` | `Container`, `Section` (tone/spacing wrapper), `SiteHeader`, `SiteFooter` |
| `ui/` | `Button` (`ButtonLink`, `ButtonAnchor`), `Card`, `Eyebrow`, `SectionHeading`, `Motifs`, `ProcessSteps`, `FieldList` |
| `brand/` | `LogoLockup` — **the single place** to swap in the approved logo |
| `sections/` | `HomeHero`, `PageHero` (with breadcrumb), `CtaBand`, `LegalPage` |
| `seo/` | `StructuredData` (Organization + WebSite), `BreadcrumbData` (per inner page) |
| `forms/` | `EnquiryForm` (client component) and `fields.tsx` (labelled field primitives) |

## `src/lib/`

| File | Responsibility |
| --- | --- |
| `site.ts` | Business identity, navigation, contact values from env, pending-detail register |
| `metadata.ts` | `buildMetadata()` — per-page title/description/canonical/OG/Twitter |
| `routes.ts` | Single source of truth for public routes (sitemap, smoke test, footer) |
| `enquiry-schema.ts` | **The single validator**, shared by the client form and the API route |
| `enquiry-delivery.ts` | Delivery adapter: `webhook` / `console` / `unconfigured` |
| `rate-limit.ts` | In-memory per-IP submission limiter |
| `sanitise.ts` | Input normalisation used before delivery |
| `content.ts` | Page copy as typed data (deliverable fields, process steps, audiences, principles) |
| `legal.ts` | Privacy and Terms sections, with typed `pending` markers |

## `public/`

| File | Notes |
| --- | --- |
| `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` | **Placeholder** icons — replace when the approved logo arrives |
| `og-image.png` | 1200×630 social card |
| `images/hero-neighbourhood.jpg`, `images/research-desk.jpg` | Illustrative photographs, credits in `ASSETS_PENDING.md` |

## `scripts/`

| File | Purpose |
| --- | --- |
| `generate-favicons.mjs` | Regenerates the placeholder favicon PNGs (pure Node, no deps) |
| `generate-og-image.sh` | Regenerates the social card (needs ImageMagick + fonttools) |
| `smoke-test.mjs` | **135** checks: routes, metadata, headings, links, assets, forbidden claims, JSON-LD, robots/sitemap, headers, enquiry API |
| `check-layout-metrics.mjs` | **26** geometric assertions that text fits its column from 360–1440 px |
| `check-accessibility.mjs` | **30** contrast pairs plus document structure, label and ARIA-reference checks |
| `check-performance.mjs` | **28** budgets measured on the wire with the raw HTTP client |
| `fonts/` | Static Montserrat / Open Sans instances used only by the layout check (OFL — see its README) |

## Configuration files

| File | Purpose |
| --- | --- |
| `next.config.ts` | Image formats, security headers, compiler settings |
| `tsconfig.json` | TypeScript strict, `@/*` → `src/*` path alias |
| `postcss.config.mjs` | Tailwind 4 PostCSS plugin |
| `eslint.config.mjs` | Flat config, `next/core-web-vitals` + `next/typescript` |
| `package.json` | Scripts and dependencies |
| `.env.example` | Variable names and explanations — **no values** |
| `.gitignore` | Excludes builds, caches, logs and all real env files |

## Documentation

| File | Purpose |
| --- | --- |
| `README.md` | Overview, stack, setup, commands, testing |
| `DEVELOPMENT_STATUS.md` | Stage register, tests, outstanding items |
| `DECISION_LOG.md` | Decisions and reasoning |
| `PROJECT_FILE_MAP.md` | This file |
| `ENVIRONMENT_SETUP.md` | Variables, credentials, form activation |
| `DEPLOYMENT.md` | Build, host, domain, verification |
| `RECOVERY_NOTES.md` | Resume development from a fresh conversation |
| `ASSETS_PENDING.md` | Missing brand assets and image credits |


---

## Routes at a glance

| Route | Type | Rendered |
| --- | --- | --- |
| `/` | Static | Prerendered |
| `/about` | Static | Prerendered |
| `/services` | Static | Prerendered |
| `/how-it-works` | Static | Prerendered |
| `/who-we-serve` | Static | Prerendered |
| `/contact` | **Dynamic** | Server-rendered per request (reports live delivery status) |
| `/privacy-policy` | Static | Prerendered |
| `/terms-of-service` | Static | Prerendered |
| `/api/enquiry` | API | Node route handler, POST only |
| `/sitemap.xml` | Generated | From `src/lib/routes.ts` |
| `/robots.txt` | Generated | `app/robots.ts` |
| `/manifest.webmanifest` | Generated | `app/manifest.ts` |
| `/og-image.png` | Static | Social sharing card |
| 404 | Static | `app/not-found.tsx` |

## Test commands

| Command | Needs a running server | Assertions |
| --- | --- | --- |
| `npm run typecheck` | No | TypeScript strict, no errors |
| `npm run lint` | No | ESLint, Next core-web-vitals + TS |
| `npm run layout` | No | 26 layout-metric checks |
| `npm run build` | No | Production build |
| `npm run a11y` | Yes | 30 contrast pairs + structure + labels + ARIA |
| `npm run smoke` | Yes | 135 route/SEO/link/asset/claim/API checks |
| `npm run perf` | Yes (production build) | 28 performance budgets |
| `npm run check` | No | typecheck + lint + layout + a11y + build |

`npm run a11y` and `npm run smoke` default to `http://localhost:3000`;
`npm run perf` defaults to `http://localhost:3100`. Override with `SITE_ORIGIN`.
