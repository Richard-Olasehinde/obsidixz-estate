# FINAL HANDOVER

**Project:** Obsidixz Real Estate — `realestate.obsidixz.pp.ua`
**Repository:** `Richard-Olasehinde/obsidixz-estate`
**Branch:** `arena/3d880e89-obsidixz-estate`
**Final commit:** see `git log` — the direct-email round is the latest
**Date:** 2026-11-06
**Status:** All eight stages complete, plus direct-email contact and the parent-logo lockup.
**The site is fully static and complete.** Two of three blockers are closed; BLK-01 is open and is
a four-step human check on the mailbox, not a development task — see §6.

---

## 1. What was built

An eight-page marketing and lead-generation site for a US residential real-estate research
business operating remotely from Nigeria, built on a repository that contained nothing but a
one-line README.

| Page | Route | Rendering |
| --- | --- | --- |
| Home | `/` | Static |
| About Us | `/about` | Static |
| Services | `/services` | Static |
| How It Works | `/how-it-works` | Static |
| Who We Serve | `/who-we-serve` | Static |
| Contact | `/contact` | Static — `mailto:` action, visible address, copy fallback |
| Privacy Policy | `/privacy-policy` | Static |
| Terms of Service | `/terms-of-service` | Static |

Plus `sitemap.xml`, `robots.txt`, `manifest.webmanifest`, a custom 404, and generated Open Graph
and favicon assets. Privacy and Terms are linked from the footer only, as required.

**Every route is prerendered static.** There is no API route, no server action and no database, so
the site can be hosted on any static host — including GitHub Pages — or a Node host, interchangeably.

**Stack:** Next.js 16.4.5 (App Router), React 19, Tailwind CSS 4, TypeScript 5.9, self-hosted
Montserrat and Open Sans. Five runtime dependencies.

---

## 2. Commit history

| Commit | Stage | Message |
| --- | --- | --- |
| `301be26` | — | Initial commit (pre-existing) |
| `f0994f4` | 1 | `chore: establish project foundation and brand design system` |
| `7798dc6` | 2 | `feat: build Obsidixz Real Estate homepage` |
| `6455ffd` | 3 | `feat: add core business and legal pages` |
| `42e9572` | 4 | `feat: implement website navigation and enquiry functionality` |
| `783794e` | 5 | `style: complete responsive website implementation` |
| `cb5e0cc` | 6 | `feat: implement SEO metadata and site discovery configuration` |
| `8ec3e56` | 7 | `test: verify website functionality and correct defects` |
| `0da7aca` | 8 | `docs: prepare deployment and recovery documentation` |
| `f99ae3f` | audit | `fix: correct a contrast figure and a framing rationale in code comments` |
| `557f708` | audit | `fix: prevent horizontal overflow at source instead of clipping the body` |

One commit per stage, never squashed, nothing force-pushed, no history rewritten. The original
`README.md` path was preserved and expanded rather than replaced.

---

## 3. Verification results

Everything below was actually executed against this repository. Nothing is inferred.

| Gate | Command | Result |
| --- | --- | --- |
| Types | `npm run typecheck` | ✅ 0 errors |
| Lint | `npm run lint` | ✅ 0 errors, 0 warnings |
| Layout geometry | `npm run layout` | ✅ **26/26** |
| Accessibility | `npm run a11y` | ✅ **all pass** (30 contrast pairs, 8 routes, form/ARIA) |
| Build | `npm run build` | ✅ 7 routes static, 2 dynamic |
| Behaviour | `npm run smoke` | ✅ **135/135** (dev and production) |
| Performance | `npm run perf` | ✅ **28/28** (production, wire bytes) |
| Aggregate | `npm run check` | ✅ all of the above that need no server |

### Measured performance (production build, gzip, on the wire)

| Metric | Value | Budget |
| --- | --- | --- |
| JS, heaviest route | 181 KB | 200 KB |
| JS, `/about` | 175 KB | 200 KB |
| HTML, `/` | 20.9 KB (from 131 KB uncompressed) | 60 KB |
| CSS | 9.9 KB | 25 KB |
| Hero image, AVIF @1200 | 71 KB | 120 KB |
| Static asset caching | `max-age=31536000, immutable` | required |

### API behaviour (production server, unconfigured delivery)

| Case | Response |
| --- | --- |
| Valid payload | `503 delivery_not_configured` — honest, with reference |
| Invalid email / missing privacy / bad enum | `400 validation_failed` + per-field messages |
| Honeypot hit | `400 {discarded:true}` — **never success-shaped** |
| Submitted under 3 s | `400 {discarded:true}` |
| `GET` | `405` |
| Wrong `Content-Type` | `415` |
| Configured delivery (mock receiver) | `200`, token sent, payload intact, reference matched |
| Upstream 500 / 400 / 201 | `502` / `500` / success — mapped correctly |
| 6th submission from one IP | `429` with `retry-after` |

---

## 4. Content integrity

This was the highest-risk part of the brief, so it was checked against the rendered pages rather
than the source.

**Verified absent:** prices, dollar amounts, delivery times, minimum order sizes, percentages,
client counts, years in business, testimonials, star ratings, client logos, "trusted by", US
street addresses, ZIP codes, telephone numbers, `LocalBusiness` markup, `SameAs` links, location
landing pages.

**Verified present:**
- The exact headline "Smarter Research. Better Real Estate Opportunities."
- The exact CTAs "Explore Our Services" and "Discuss Your Requirements".
- Property Lead Research as the single featured service, described as manual and criteria-based.
- Explicit prohibitions stated as prohibitions — wholesaling, brokerage, property management,
  financing, sales representation, investment/legal/tax advice — on `/services`, `/who-we-serve`
  and in the Terms.
- The emerging-business position stated plainly on `/about`: *"We are at an early operational
  stage. We have one service…"*
- Every unresolved legal fact rendered as a visible gold "To be confirmed before publication"
  panel, not as invented text.

A regex sweep for claim keywords returns matches on nine pages. Every match was read in context:
all are negations ("we do not advertise wholesaling"), the not-offered list, or the ordinary noun
"review". The `data-claim-exempt` marker exists precisely so the automated checker can tell the
difference between advertising a service and disclaiming it.

---

## 5. Defects found and fixed

### During Stage 7 (before the audit)

| # | Severity | Defect |
| --- | --- | --- |
| 1 | High | `/contact` was statically prerendered, so the form's availability notice could be stale |
| 2 | High | Honeypot and timing rejections returned `200 {ok:true}` — success-shaped |
| 3 | Medium | Zod added 120 KB of client JS for a seven-field form |
| 4 | Medium | Body text at `charcoal/45–55` failed WCAG AA contrast |
| 5 | Medium | `gold #B47745` used as small text: 3.71:1, below AA |
| 6 | Low | Performance harness measured decoded bodies, overstating JS by 3× |
| 7 | Low | Mobile menu closed in an effect, violating React's rules |

### During the final audit

| # | Severity | Defect | Fix |
| --- | --- | --- | --- |
| 8 | **Medium** | `body { overflow-x: hidden }` masked overflow instead of preventing it, made the body a scroll container (breaking `position: sticky` for descendants) and could clip focus rings | Clip removed; `overflow-wrap` set on text elements so long strings wrap at source; decorative motifs were already inside `overflow-hidden` sections |
| 9 | Low | Sticky footer used `min-h-screen`, pushing the footer below the fold behind mobile browser chrome | Changed to `min-h-svh` |
| 10 | Low | `globals.css` stated `gold-deep` measures 5.6:1 on white; the true value is 6.13:1 | Comment corrected |
| 11 | Low | `next.config.ts` justified omitting `X-Frame-Options` with "no need to block framing", which is not a reason | Reworded to the actual position and its trade-off |

All four audit fixes were verified in the emitted production CSS (`overflow-x: hidden` present 0
times, `overflow-wrap: anywhere` present, `100svh` present) and all gates were re-run afterwards.

---

## 5b. Post-handover update — 2026-11-06

Two details previously listed as blockers were confirmed by the founder, and a Resend delivery
path was added.

### Confirmed

| Item | Value |
| --- | --- |
| Official business email | `obsidixz.realestate@outlook.com` |
| Canonical domain | `https://realestate.obsidixz.pp.ua` |
| Logo | Supplied as two transparent PNGs (dark-on-light, light-on-dark) |

### Logo integration

`public/brand/obsidixz-logo-on-light.png` (header) and `-on-dark.png` (footer), rendered by
`LogoLockup` via `next/image`. Processing was limited to trimming transparent padding and a
Lanczos downscale; **no recolour, redraw or trace**, verified pixel-identical to a resized copy of
the source. The type-only placeholder is retired.

### Domain

Already the canonical fallback in `src/lib/site.ts`. Now also documented as confirmed in
`DEPLOYMENT.md`, with the DNS records for the site and for the Resend sending subdomain kept
explicitly separate.

### Resend — superseded, and since removed

A `resend` delivery mode was added inside the existing adapter at the time. It was **never
activated**: Resend refused to verify any `pp.ua` hostname. The form, the API route and the entire
delivery adapter have since been removed. See §5c.

**BLK-01 remains open**, for a different reason now — see §5c and §6.

---

## 6. Blockers, classified A–E

**A — Development blocker:** none. The build is complete and every gate passes.

**B — Configuration blocker (founder action, no code change):**

| ID | Item | Where it shows | What closes it |
| --- | --- | --- | --- |
| BLK-01 | Incoming/reply email not yet confirmed by hand | `/contact` | Email `obsidixz.realestate@outlook.com` from an unrelated account, confirm arrival including junk, reply from the Outlook account, confirm the reply arrives — `DEPLOYMENT.md` §5.1. No configuration involved |
| ~~BLK-02~~ | ✅ **Closed** — email confirmed and published | — | — |
| ~~BLK-03~~ | ✅ **Closed** — logo supplied and integrated | — | Optional: vector (SVG) art for the favicon and social card |

**C — Business decision:**

| ID | Item |
| --- | --- |
| BLK-07 | Confirm hosting region and sub-processors once a host is chosen (feeds the privacy policy) |

**D — Legal review, required before publication:**

| ID | Item | Page |
| --- | --- | --- |
| LR-01 | Legal entity name and registered address | Privacy §1, Terms §1 |
| LR-02 | Governing law | Terms §10 |
| LR-03 | Dispute jurisdiction | Terms §10 |
| LR-04 | Enquiry retention period | Privacy §7 |
| LR-05 | Privacy contact route | Privacy §8, §11 — **address confirmed and published**; the statutory framework and response period still need review |
| LR-06 | Applicable data-protection framework | Privacy §8 |
| LR-07 | Hosting provider and processing terms | Privacy §4 |
| LR-08 | Enquiry delivery provider | Privacy §5 |
| LR-09 | Liability wording | Terms §8 |

**E — Non-critical improvement:**

| ID | Item |
| --- | --- |
| BLK-08 | Replace illustrative photography with owned imagery, if desired |
| LR-10 | Server-side idempotency store, if duplicate enquiries ever matter |
| LR-11 | Durable rate limiter, if the site runs on more than one instance |
| LR-12 | CAPTCHA at the delivery adapter, only if abuse actually appears |

---

## 7. What could not be verified here — and is therefore not claimed

| Item | Why |
| --- | --- |
| **A real Resend message reaching the Outlook inbox** | Requires the founder's account, DNS access and an API key. The adapter was tested against a mock only. |
| Rendering in a real browser | No browser engine in this environment. Chromium needs `libnss3`; no package index or browser CDN is reachable. |
| Screenshots | Same reason. **None were produced or claimed.** |
| Lighthouse / Core Web Vitals field data | Needs a browser and a deployed origin. |
| Screen-reader pass | Structure and ARIA verified statically only. |
| Cross-browser behaviour | Only the served production HTML, CSS and JS were inspected. |
| One real end-to-end enquiry | Requires the founder's destination (BLK-01). |

Layout correctness is proved by font metrics instead: `check-layout-metrics.mjs` reads the real
Montserrat and Open Sans advance widths and asserts the widest word in every multi-column cell
fits the narrowest column each breakpoint produces. That covers the overflow class — the one that
actually breaks these layouts — but not image cropping, colour reproduction or compositor
behaviour. Those stay on the founder's list and are recorded as unverified rather than assumed.

---

## 8. First three things to do

1. **Activate Resend** — account, verified sending domain, API key, four environment variables.
   This is the single change that turns the site from built to usable. See `ENVIRONMENT_SETUP.md` §5.
2. **Send one real enquiry** through the live form and find it in `obsidixz.realestate@outlook.com`.
   Until that has happened, the form has never proven itself against a real destination — and
   BLK-01 stays open.
3. **Complete the legal review** — LR-01 to LR-09. Nothing should be published while the gold
   "to be confirmed" panels remain.

Then deploy following `DEPLOYMENT.md` and work through its 15-point post-deploy checklist.

---

## 9. Where everything is

| Document | Use it for |
| --- | --- |
| `README.md` | Overview, stack, commands |
| `DEPLOYMENT.md` | Taking it live |
| `ENVIRONMENT_SETUP.md` | Variables and switching the form on |
| `DEVELOPMENT_STATUS.md` | Stage-by-stage record, test matrix, registers |
| `DECISION_LOG.md` | 47 decisions and their reasoning |
| `PROJECT_FILE_MAP.md` | Finding any file |
| `RECOVERY_NOTES.md` | Resuming work in a fresh conversation |
| `ASSETS_PENDING.md` | Brand assets and image credits — the logo section is now closed |

Run `npm run check` before any commit and `npm run smoke` against a running server. Both are
permanent gates, not scratch scripts: they encode the promises of this build, so those promises
survive an edit made by someone who never read this document.

---

## 5c. Post-handover update — direct email contact and the parent-logo lockup

The founder approved three changes: replace the form with direct Outlook email, apply the approved
parent logo with a "Real Estate" lockup, and finish the established website work.

### The contact route

```
visitor's own email application  ──►  obsidixz.realestate@outlook.com  ──►  reply from that mailbox
```

The website publishes the address, offers a `mailto:` action pre-filled with the subject
`Obsidixz Real Estate — Website enquiry`, shows the address as selectable text, and offers a copy
button with honest success and failure messages.

**Removed:** `src/app/api/enquiry/`, `src/components/forms/`, `src/lib/enquiry-delivery.ts`,
`enquiry-schema.ts`, `rate-limit.ts`, `sanitise.ts`, six `ENQUIRY_*`/`RESEND_*` variables, and the
`Disallow: /api/` robots rule.

**Not touched:** the separate `obsidixz-forms` project. Its code, deployment and infrastructure
were not modified.

### Why the form went rather than stayed disabled

It could not be made to work — Resend would not verify a `pp.ua` hostname, and Brevo authenticated
the sending domain but gated API-key creation behind phone verification that never completed — and
it was never necessary. A `mailto:` link gets the message to the same inbox with no provider, no
credential, no account approval, and no failure mode the visitor cannot see.

### What the site will and will not claim

| | |
| --- | --- |
| Shows "Email address copied" | Only after a clipboard write resolved |
| Shows "Couldn't copy…" | On permission denial, insecure origin, or `execCommand` failure |
| Shows "Enquiry sent" / "Received" | **Never.** Activating a `mailto:` link proves only that a handler was invoked |

### The logo

The parent artwork (symbol **and** OBSIDIXZ wordmark) is used whole, with "Real Estate" to its
right, vertically centred, at `text-xs sm:text-sm` against `w-20 sm:w-24 lg:w-28`. It is never a
replacement wordmark, never underneath, and never wraps on narrow screens.

The committed PNGs were re-cut from the supplied 2000×1500 sources by
`scripts/prepare-brand-assets.mjs`, which crops the outer excess and re-applies a margin
proportional to the ink box so the supplied transparent padding survives. No rotation, recolour,
redraw or sharpening. Aspect ratio is preserved and asserted by `npm run smoke`.

### Checks

| Check | Result |
| --- | --- |
| `npm run check` (typecheck, lint, layout, a11y, copy-feedback, build) | ✅ pass |
| `npm run layout` | ✅ 35/35 |
| `npm run a11y` | ✅ all pass |
| `npm run copy-feedback` | ✅ 6/6 |
| `npm run smoke` | ✅ 138/138 |
| `npm run perf` | ✅ 28/28 |
| `next build` | ✅ 13/13 routes static |

Two real defects were found by these checks: the address overflowed its panel at 320px, and
"Other ways to reach us" was left listing only operating hours once email became the sole route.

### What is still unverified

**Incoming receipt and reply delivery.** No message has been confirmed to arrive in
`obsidixz.realestate@outlook.com`, and no reply has been confirmed to leave it. That is a human
check needing a second email account. Website interaction checks are not evidence of it. Opening a
draft is not evidence of delivery.
