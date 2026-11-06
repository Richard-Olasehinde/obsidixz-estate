# PROJECT FILE MAP

Reference for locating anything in this repository.

```
obsidixz-estate/
├── src/
│   ├── app/                    Next.js App Router — every route lives here
│   ├── components/             Reusable UI
│   └── lib/                    Configuration, content data and validation logic
├── public/                     Static files served from the site root
├── scripts/                    Developer utilities (not part of the build)
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
| `ui/` | `Button` (`ButtonLink`, `ButtonAnchor`), `Card`, `Eyebrow`, `SectionHeading`, `Motifs`, `Stat`/list helpers |
| `brand/` | `LogoLockup` — **the single place** to swap in the approved logo |
| `sections/` | Page-level composed sections: `CtaBand`, `ProcessSteps`, `FeatureList`, `PageHero`, `LegalPage` |
| `forms/` | `EnquiryForm` (client component) and its field primitives |

## `src/lib/`

| File | Responsibility |
| --- | --- |
| `site.ts` | Business identity, navigation, contact values from env, pending-detail register |
| `metadata.ts` | `buildMetadata()` — per-page title/description/canonical/OG/Twitter |
| `routes.ts` | Single source of truth for public routes (sitemap, smoke test, footer) |
| `enquiry-schema.ts` | Zod schema shared by the client form and the API route |
| `enquiry-delivery.ts` | Delivery adapter: `webhook` / `console` / `unconfigured` |
| `rate-limit.ts` | In-memory per-IP submission limiter |
| `sanitise.ts` | Input normalisation used before delivery |
| `content/` | Page copy as typed data where the page is list-heavy (services, process, audiences) |
| `legal.ts` | Privacy and Terms sections, with typed `pending` markers |

## `public/`

| File | Notes |
| --- | --- |
| `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` | **Placeholder** icons — replace when the approved logo arrives |
| `og-image.png` | 1200×630 social card |
| `images/` | Illustrative photographs, credits in `ASSETS_PENDING.md` |
| `site.webmanifest` | Optional; `manifest.ts` generates it instead |

## `scripts/`

| File | Purpose |
| --- | --- |
| `generate-favicons.mjs` | Regenerates the placeholder favicon PNGs (pure Node, no deps) |
| `generate-og-image.sh` | Regenerates the social card (needs ImageMagick + fonttools) |
| `smoke-test.mjs` | Route, SEO, link, asset and enquiry-API verification |

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
