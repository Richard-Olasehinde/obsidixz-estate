# RECOVERY NOTES

Everything needed to resume this project in a fresh conversation, or hand it to another developer,
without the original chat history.

Read this file first. Then read `DEVELOPMENT_STATUS.md` for the current state, and
`DECISION_LOG.md` for why things are the way they are.

---

## 1. What this project is

The public marketing website for **Obsidixz Real Estate** — an emerging real-estate research and
lead-generation business serving US residential property investors and acquisition operators.

Its single initial service is **Property Lead Research**: manually researched, criteria-based
property prospect identification, delivered as a structured spreadsheet or report with sources,
qualification notes and identified gaps.

It is **not** a brokerage, agency, marketplace, listing portal, property manager, fund or
investment adviser. It has **no** client portfolio, transactions, years of experience, US office
or proprietary platform. Every page must remain consistent with that. Fabricating any of it would
breach the project's core content rule.

---

## 2. Repository and branch

| | |
| --- | --- |
| Repository | `Richard-Olasehinde/obsidixz-estate` |
| Development branch | `arena/3d880e89-obsidixz-estate` |
| Baseline | `main` at `301be26` — contained only a one-line `README.md` |
| Production domain | `https://realestate.obsidixz.pp.ua` |

---

## 3. Architecture in one page

```
Browser
  │
  ├── Prerendered HTML for 7 of 8 pages (static, cacheable)
  │     └── React 19 server components composed from Section/Container/Card primitives
  │
  ├── /contact  (dynamic — must report live delivery status)
  │     └── EnquiryForm (client component): validates with the shared validator,
  │         POSTs JSON to /api/enquiry, renders loading / success / failure honestly
  │
  └── POST /api/enquiry  (Node runtime)
        ├── method → content-type → 16 KB body cap → per-IP rate limit
        ├── honeypot → submit-timing
        ├── validateEnquiryRequest()  ← same module the browser uses
        └── deliverEnquiry()  →  webhook | console | unconfigured
```

**Key invariant:** success is shown only when the configured destination returns 2xx. With no
destination, the API returns `503 delivery_not_configured` and the form says so. There is no code
path that fakes a successful submission.

**Validation lives in exactly one file:** `src/lib/enquiry-schema.ts`. Do not add a second copy in
the form or the route. (Zod was removed on purpose — it cost 120 KB in the browser bundle; see
DECISION_LOG D33.)

---

## 4. Where to look for what

| Question | File |
| --- | --- |
| Brand colours, fonts, type scale, spacing | `src/app/globals.css` (`@theme` block) |
| Business identity, navigation, contact values | `src/lib/site.ts` |
| Page copy that repeats across pages | `src/lib/content.ts` |
| Privacy and Terms content, pending markers | `src/lib/legal.ts` |
| Route list (drives sitemap and tests) | `src/lib/routes.ts` |
| Per-page metadata | `src/lib/metadata.ts` |
| Form validation rules | `src/lib/enquiry-schema.ts` |
| Enquiry delivery | `src/lib/enquiry-delivery.ts` |
| ~~The one place to swap the logo~~ | `src/components/brand/LogoLockup.tsx` |
| Header and mobile menu | `src/components/layout/SiteHeader.tsx` |
| Footer | `src/components/layout/SiteFooter.tsx` |

---

## 5. Current state

All eight stages complete. Eight pages live, form functional but awaiting a destination, SEO
foundation in place, five committed verification gates.

| Gate | Command | Current |
| --- | --- | --- |
| Types | `npm run typecheck` | ✅ pass |
| Lint | `npm run lint` | ✅ pass |
| Layout metrics | `npm run layout` | ✅ 26/26 |
| Accessibility | `npm run a11y` | ✅ pass |
| Build | `npm run build` | ✅ pass |
| Route/SEO/API suite | `npm run smoke` | ✅ 135/135 |
| Performance budgets | `npm run perf` | ✅ 28/28 |

Open blockers: enquiry destination (BLK-01), business email (BLK-02), approved logo (BLK-03), and
nine legal review items (LR-01…LR-09). All are listed in `DEVELOPMENT_STATUS.md`.

---

## 6. How to resume

```bash
git clone https://github.com/Richard-Olasehinde/obsidixz-estate.git
cd obsidixz-estate
git checkout arena/3d880e89-obsidixz-estate     # or the branch that replaces it
npm ci
cp .env.example .env.local                       # optional: the site runs with it blank
npm run check                                    # must pass before you change anything
npm run dev                                      # http://localhost:3000
```

Then, in a fresh Arena conversation, paste:

> Continue the Obsidixz Real Estate website project. Read `RECOVERY_NOTES.md`,
> `DEVELOPMENT_STATUS.md` and the tail of `DECISION_LOG.md` first. All eight development stages
> are complete; the remaining work is limited to the launch blockers and legal review items
> listed in `DEVELOPMENT_STATUS.md`. Do not rewrite existing architecture, do not invent business
> or legal facts, and run `npm run check` before and after any change.

### If the work needs to continue

The likely tasks, in order:

1. **Founder supplies the enquiry destination** → set the two env vars, send one real test
   enquiry, close BLK-01.
2. **Founder supplies the business email** → set `NEXT_PUBLIC_BUSINESS_EMAIL`, close BLK-02.
3. **Founder supplies the logo** → replace the placeholder marker in `LogoLockup.tsx`, regenerate
   favicons and the OG card, close BLK-03.
4. **Legal review** → resolve each gold "to be confirmed" panel in `src/lib/legal.ts`, then delete
   the corresponding entry from the review register.
5. **Visual verification** → browser check at the five widths, screen reader, cross-browser.

---

## 7. Rules that must not be broken

These are the constraints that make the site honest. They are not style preferences.

1. **Never invent business facts.** No clients, transactions, years of experience, statistics,
   awards, certifications, staff numbers, US office, or coverage claims. No pricing or delivery
   times — use "Discuss your requirements".
2. **Never invent legal facts.** Entity name, registration number, address, governing law,
   jurisdiction, retention period and privacy contact all remain marked as pending until the
   founder supplies them.
3. **Never advertise wholesaling**, brokerage, property management, financing or sales
   representation. Do not imply a proprietary platform or AI product.
4. **Never promise outcomes**: no guaranteed sellers, availability, contact accuracy, deals,
   returns or exclusivity.
5. **Never fabricate a form success.** If delivery is not configured, the form must say so.
6. **Never commit secrets.** `.env*` is git-ignored except `.env.example`, which contains variable
   names and placeholders only.
7. **Do not recreate the Obsidixz logo.** Use the supplied asset or leave the text lockup.

`npm run smoke` enforces rules 1, 3 and 4 mechanically with 18 content patterns. Rules 2, 5 and 6
are enforced by structure (the pending-marker component, the delivery adapter, `.gitignore`) and
reviewed by hand.

---

## 8. Environment

Nothing is required to run the site. The contact form intentionally stays unconfigured until the
founder supplies a destination. See `ENVIRONMENT_SETUP.md`.

---

## 9. What was tried and rejected

Recorded so the next person does not repeat the work:

| Attempt | Outcome |
| --- | --- |
| Headless Chromium for real screenshots | Impossible in this environment: `@sparticuz/chromium` needs `libnss3`, the apt index is unreachable and the Playwright CDN is blocked. Replaced with font-metric measurement, which catches the overflow class specifically. |
| Dev-server HTML for design review | Turbopack inlines CSS in dev, so the emitted stylesheet could only be inspected from a production build. Production builds were used instead. |
| Stock photography from image search | Nearly all results were watermarked agency previews or Pinterest repins. Two images were produced for the project instead; provenance is in `ASSETS_PENDING.md`. |
| Zod for form validation | 120 KB in the browser bundle for seven fields. Replaced with a hand-written shared validator. |
| `FlatCompat` for ESLint | `eslint-config-next` v16 ships native flat configs; the shim threw "Converting circular structure to JSON". Spread the configs directly. |
