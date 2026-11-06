# RECOVERY NOTES

Purpose: allow development to resume in a fresh Arena conversation, or by any developer, with no
need for the original chat history.

> **Status: to be completed in Stage 8.** What follows is the architecture and state as it
> stands after Stage 1.

---

## 1. What this project is

The public marketing website for **Obsidixz Real Estate** — an emerging research and
lead-generation business serving US residential real-estate investors and property acquisition
operators. Its single initial service is **Property Lead Research**: manually researched,
criteria-based property prospect identification delivered as a structured report or spreadsheet.

It is **not** a brokerage, marketplace, listing portal, property manager, fund or investment
adviser. It has no client portfolio, no transactions, no years of experience, no US office and
no proprietary platform. Every page must remain consistent with that.

## 2. Repository and branch

- Repository: `Richard-Olasehinde/obsidixz-estate`
- Development branch: `arena/3d880e89-obsidixz-estate`
- Baseline commit on `main`: `301be26` — only `README.md` existed

## 3. Architecture

- Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS 4.
- Design tokens are CSS custom properties in `src/app/globals.css` (`@theme` block).
- Every page is a server component composed from `Section`, `Container`, `Card`,
  `SectionHeading` and the `ui/` primitives. Only interactive parts are client components
  (`SiteHeader`, `EnquiryForm`).
- The contact form posts JSON to `/api/enquiry`, which validates with a shared Zod schema,
  applies spam checks, then hands off to a delivery adapter. With no destination configured it
  returns HTTP 503 and the UI says so — it never fakes success.
- No secrets in the client bundle. Only `NEXT_PUBLIC_*` variables are public.

## 4. Where to look first

| Question | File |
| --- | --- |
| What is decided and why | `DECISION_LOG.md` |
| What is done and what is not | `DEVELOPMENT_STATUS.md` |
| Which file does what | `PROJECT_FILE_MAP.md` |
| Brand colours, fonts, spacing | `src/app/globals.css` |
| Business identity and navigation | `src/lib/site.ts` |
| Placeholder legal markers | `src/lib/legal.ts` |
| The one place to swap the logo | `src/components/brand/LogoLockup.tsx` |

## 5. Current state after Stage 1

- Foundation, design system, header, footer and documentation established.
- Homepage is a placeholder; six business pages and two legal pages are not built yet.
- Contact form not built yet.
- Logo is a text lockup — the approved asset has not been supplied.

## 6. Exact instructions to resume

1. Read `DEVELOPMENT_STATUS.md` → "Current stage" and the outstanding register.
2. Read the last few entries of `DECISION_LOG.md` for context on why things are the way they are.
3. Run `npm install`, then `npm run check` — this must pass before any new work.
4. Continue from the next incomplete stage in the eight-stage workflow. Do not skip ahead.
5. After each stage: update `DEVELOPMENT_STATUS.md`, append to `DECISION_LOG.md`, set the commit
   hash in the stage register, and commit with the suggested message.
6. Never fabricate business, legal or performance facts. Use the pending markers in
   `src/lib/legal.ts` and the register in `DEVELOPMENT_STATUS.md` instead.

## 7. Environment

Nothing is required to run the site. The contact form intentionally remains unconfigured until
the founder supplies a destination — see `ENVIRONMENT_SETUP.md`.
