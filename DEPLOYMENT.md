# DEPLOYMENT

Everything needed to put this website live at **`realestate.obsidixz.pp.ua`**, and to verify it
afterwards.

> **Read first:** two items must be supplied by the founder before the site is genuinely
> launch-ready. Everything else is prepared. See [Launch checklist](#10-launch-checklist).

---

## 1. Build

```bash
npm ci                 # reproducible install from package-lock.json
npm run check          # typecheck + lint + layout metrics + a11y + production build
```

`npm run check` must pass before deploying. It runs four gates:

| Gate | Command | What it protects |
| --- | --- | --- |
| Types | `npm run typecheck` | Contract drift between the form, the API and the content |
| Lint | `npm run lint` | React correctness rules, unused code |
| Layout metrics | `npm run layout` | Text overflow in multi-column grids at 360–1440 px |
| Accessibility | `npm run a11y` | Contrast, landmarks, labels, ARIA references |
| Build | `npm run build` | The artefact itself |

Verify the built artefact:

```bash
npm run start &                 # serves on :3000
npm run smoke                   # 135 route/SEO/form/API checks
SITE_ORIGIN=http://localhost:3000 npm run perf   # 28 performance budget checks
```

---

## 2. Runtime requirements

| Requirement | Value |
| --- | --- |
| Node.js | **20.9 or newer** (developed on 22) |
| Build output | `.next/` — **every route prerendered to static HTML** |
| Database | **None** |
| Background workers / cron | **None** |
| Filesystem writes | **None** at runtime |
| Server runtime | **Not required** — see below |

All thirteen routes are marked `○ (Static)` by `next build`. There is no API route, no server
action and no dynamic page, so **the site can be hosted as static files** on any static host, CDN
or object store, as well as on a Node host. This is a direct consequence of moving contact to the
visitor's own email application.

---

## 3. Hosting options

Any host that runs a Node.js server works. Two realistic choices:

### Option A — Vercel (least configuration)

1. Import the GitHub repository.
2. Framework is auto-detected as Next.js; build and output settings need no change.
3. Add the environment variables from §4 under **Settings → Environment Variables**.
4. Deploy.

No `vercel.json` is required. `npm run check` is separate — add it as a CI step if you want
deployments gated on the checks.

### Option B — Any Node host (Render, Railway, Fly.io, a VPS)

```bash
npm ci
npm run build
npm run start            # binds to $PORT, defaults to 3000
```

Run it behind a TLS-terminating reverse proxy (Caddy, nginx, or the host's own edge). The app
serves plain HTTP and expects HTTPS to be terminated upstream.

### Option C — Not recommended: static export

`output: 'export'` would remove the server, and with it server-side validation, the rate limiter
and secret-safe delivery. The form would have to post directly from the browser to a third party.
Avoid unless you accept those trade-offs.

---

## 4. Environment configuration

Full reference: [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md). For production, set:

| Variable | Required | Value |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | **Yes** | `https://realestate.obsidixz.pp.ua` — no trailing slash |
| `NEXT_PUBLIC_BUSINESS_EMAIL` | No | Defaults to `obsidixz.realestate@outlook.com` |
| `NEXT_PUBLIC_BUSINESS_PHONE` | No | Only if a business number should be published |

**That is the complete list.** There are no credentials, no API keys and no third-party accounts.
Both values are public and are rendered into the HTML.

---

## 5. Contact route

There is nothing to activate. Contact works the moment the site is served.

```
visitor's mail client  ──►  obsidixz.realestate@outlook.com  ──►  reply from the same mailbox
```

The site publishes the address, offers a `mailto:` link pre-filled with a subject, and shows the
address as selectable text with a copy button. It sends nothing, receives nothing, stores nothing
and cannot know whether a message was written or delivered — so it never claims otherwise.

### 5.1 Post-deploy verification

**Website behaviour** — automatable, and covered by `npm run smoke` against the deployed origin:

- `/contact` returns 200 and publishes a `mailto:` link whose recipient is exactly
  `obsidixz.realestate@outlook.com`;
- the subject parameter decodes to `Obsidixz Real Estate — Website enquiry`;
- the address appears as text in the document, not only inside the link;
- a copy control is present;
- no delivery or receipt confirmation appears anywhere on the page.

**Inbox behaviour** — *cannot* be automated and must be done by a person:

1. From an email account that is **not** the business mailbox, send a message to
   `obsidixz.realestate@outlook.com`.
2. Confirm it arrives, checking the junk folder too.
3. Reply to it from that Outlook account.
4. Confirm the reply reaches the original sender.

Only after all four steps may incoming and reply delivery be described as verified. See
[DEVELOPMENT_STATUS.md](./DEVELOPMENT_STATUS.md#email-verification) for the current state of that
check.

> A `mailto:` link opening a draft is **not** evidence of delivery. Neither is a rendered page.



The JSON body sent is documented in [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md#4-switching-the-contact-form-on),
so a destination can be mapped without reading the source.

---

## 5a. Current DNS state of `obsidixz.pp.ua` (measured 2026-11-06)

Recorded because these are **live, working** records that must not be disturbed. Measured by
direct DNS query, not assumed.

| Name | Type | Value | What it serves |
| --- | --- | --- | --- |
| `obsidixz.pp.ua` | `A` | `185.199.108.153`, `.109.153`, `.110.153`, `.111.153` | **GitHub Pages** site at the apex |
| `www.obsidixz.pp.ua` | `CNAME` | `richard-olasehinde.github.io` | Same GitHub Pages site |
| `obsidixz.pp.ua` | `MX` | `mx.zoho.com` (10), `mx2.zoho.com` (20), `mx3.zoho.com` (50) | **Live Zoho Mail** at the apex |
| `obsidixz.pp.ua` | `TXT` | `v=spf1 include:zohomail.com ~all` | SPF for Zoho |
| `obsidixz.pp.ua` | `TXT` | `zoho-verification=…`, `google-site-verification=…` | Domain ownership proofs |
| `_dmarc.obsidixz.pp.ua` | `TXT` | `v=DMARC1; p=none; rua=mailto:admin@obsidixz.pp.ua` | **DMARC already published** |
| `realestate.obsidixz.pp.ua` | — | **Does not exist** (`NXDOMAIN` on A, AAAA, CNAME, TXT, MX) | Nothing yet |

**Authoritative nameservers:** `ns10.uadns.com`, `ns11.uadns.com`, `ns12.uadns.com` — the zone is
managed at **uadns.com**, not Cloudflare. The Cloudflare grey-cloud advice therefore does not
apply here.

### Consequences for this project

1. **Never put any third-party mail service's MX on the apex.** It would take over inbound mail
   for `obsidixz.pp.ua` and break Zoho.
2. **Never create a second apex SPF record.** There is exactly one, and it includes Zoho.
3. **Do not modify the existing `_dmarc.obsidixz.pp.ua`.** It is in use.
4. **`realestate` has no record at all**, so it resolves to nothing. It needs a site record before
   the domain will serve anything.

The sending-subdomain records described in earlier revisions of this document are no longer used
by the site. They remain harmless and may be left in place or removed at leisure; **nothing in the
application depends on them.** Do not add new ones.

### The site no longer needs a Node runtime

`next build` reports **every route as `○ (Static)`**. The former `/api/enquiry` endpoint — the only
thing that required a server — has been removed. **`realestate.obsidixz.pp.ua` can therefore be
served from any static host, including GitHub Pages**, which the parent apex already uses.

That is a change from earlier guidance in this document, which stated a Node host was mandatory.
It was true while the enquiry form had a server-side delivery path. It is not true now.

---

## 6. Domain configuration

Target: **`realestate.obsidixz.pp.ua`** — a subdomain of the parent `obsidixz.pp.ua` domain.

`pp.ua` is a free Ukrainian second-level domain. The subdomain is created **at the DNS provider
that hosts `obsidixz.pp.ua`** — you do not register `realestate.obsidixz.pp.ua` separately.

### Steps

1. In the host's dashboard, add `realestate.obsidixz.pp.ua` as a custom domain. The host will give
   you a DNS target — either a `CNAME` value or an `A`/`AAAA` record set.
2. At the DNS provider for `obsidixz.pp.ua`, create:
   - `Type: CNAME`, `Name: realestate`, `Value: <target from the host>`, `TTL: 3600` (or the
     host's recommended value), **or** the `A`/`AAAA` records if the host requires them.
3. Wait for propagation. `dig realestate.obsidixz.pp.ua CNAME +short` should return the host's
   target.
4. Issue TLS. On Vercel this is automatic once DNS resolves. On a VPS, use Caddy (automatic) or
   `certbot --nginx -d realestate.obsidixz.pp.ua`.
5. Confirm `https://realestate.obsidixz.pp.ua` serves the site and that
   `http://realestate.obsidixz.pp.ua` redirects to HTTPS.
6. **Only after the domain resolves**, confirm `NEXT_PUBLIC_SITE_URL` matches it exactly. If it is
   wrong, canonicals, the sitemap and Open Graph URLs will all point to the wrong host.

### DNS records for the website

Only one record is needed: point `realestate` at whatever serves the built site.

| Type | Name | Value |
| --- | --- | --- |
| `CNAME` | `realestate` | The static host or Node host that serves the build |

**No email records are required.** Contact runs through the visitor's own email application to an
Outlook mailbox, neither of which lives on this zone. Nothing needs to be added to
`obsidixz.pp.ua` or to `realestate.obsidixz.pp.ua` beyond the site record itself.

A reminder for anything added at uadns later: a **CNAME target must end with a trailing dot**, or
the zone name is appended and the record silently fails to resolve. That fault was encountered and
diagnosed on this project already.

### Canonical host — confirmed

`NEXT_PUBLIC_SITE_URL=https://realestate.obsidixz.pp.ua`. This is also the hardcoded fallback in
`src/lib/site.ts`, so canonicals, `sitemap.xml`, `robots.txt`, Open Graph URLs and JSON-LD are all
correct even if the variable is not set. Set it explicitly anyway so the deployed value is
visible in configuration rather than inherited from code.

HSTS is not set by the application. Enable it at the host once HTTPS is confirmed working, so a
misconfiguration cannot lock visitors out of an insecure origin.

---

## 7. Post-deployment verification

Run against the live origin — these commands verify the deployed site, not your local build:

```bash
SITE_ORIGIN=https://realestate.obsidixz.pp.ua npm run smoke
SITE_ORIGIN=https://realestate.obsidixz.pp.ua npm run perf
SITE_ORIGIN=https://realestate.obsidixz.pp.ua npm run a11y
```

Then check by hand:

| # | Check | Expected |
| --- | --- | --- |
| 1 | All eight pages load | 200, no console errors |
| 2 | Header navigation on desktop and mobile | All six links work; mobile panel opens, closes on link click and on Escape |
| 3 | Footer legal links | Both work |
| 4 | Every CTA button | Navigates to the intended page |
| 5 | `/contact` status notice | Says online enquiries are open (after §5) |
| 6 | Valid enquiry submission | Success state, **and the message is visibly present in `obsidixz.realestate@outlook.com`** (check spam). A success state alone is not enough — see §5 |
| 7 | Invalid enquiry (bad email) | Inline error, no submission sent |
| 8 | Enquiry with the network offline | Honest failure message, text preserved |
| 9 | `/robots.txt` | Allows `/`, disallows `/api/`, names the sitemap |
| 10 | `/sitemap.xml` | Eight URLs, all on the production domain |
| 11 | View source on any page | `<link rel="canonical">` points at the production domain |
| 12 | Share a page in a chat app | Preview shows the OG card and correct title |
| 13 | `/this-does-not-exist` | 404 page with a route back |
| 14 | Browser width 360 px | No horizontal scrolling; nothing clipped |
| 15 | Browser width 1440 px | Layout centred, nothing stretched |

---

## 8. Ongoing maintenance

| Task | When | How |
| --- | --- | --- |
| Re-run the verification suite | After any change | `npm run check`, then `npm run smoke` against a served build |
| Update contrast or layout if copy changes | After editing long copy or headings | `npm run layout` measures the strings it knows about; add new long strings to `scripts/check-layout-metrics.mjs` |
| Refresh the social card | If positioning changes | `./scripts/generate-og-image.sh` (needs ImageMagick + fonttools) |
| Check the business mailbox still receives | Monthly | Send a test message from an unrelated account and confirm it lands. Free mailboxes can lapse if unused; this is the single point of failure for contact. |
| Check the reply path | After any mailbox change | Reply to a test message from the Outlook account and confirm the reply reaches the sender. |
| Verify the published address | After any `NEXT_PUBLIC_BUSINESS_EMAIL` change | `npm run smoke` asserts the `mailto:` recipient, so a stale address fails the suite. |
| Review legal pages | Before launch and after any change to data handling | See the legal review register in [DEVELOPMENT_STATUS.md](./DEVELOPMENT_STATUS.md) |

---

## 9. Rollback

Deployments are immutable builds from Git. To roll back, redeploy the previous commit:

- **Vercel:** *Deployments → previous deployment → Promote to Production*.
- **Node host:** `git checkout <previous-sha> && npm ci && npm run build && npm run start`.

No database migrations exist, so a rollback has no data consequences.

---

## 10. Launch checklist

Copy this into an issue and tick it off.

### Must be done — the site is not honestly launchable without these

- [x] **Contact route built and verified on the website side** — `mailto:` recipient and subject
      asserted by `npm run smoke`; visible address and copy fallback verified by `npm run a11y`
      and `npm run copy-feedback`.
- [ ] **Incoming email reaches the Outlook mailbox, and replies leave it.** Human check, four
      steps, in §5.1. **BLK-01** — do not describe email delivery as verified until this is ticked.
- [x] **Business email supplied** — `obsidixz.realestate@outlook.com`. **BLK-02**
- [ ] **Legal pages reviewed** and all nine `to be confirmed` markers resolved by the founder
      and, where appropriate, a qualified adviser. **LR-01 … LR-09**
- [ ] **`NEXT_PUBLIC_SITE_URL` set to the production domain** exactly.
- [ ] **Domain resolving and HTTPS working** before the site is promoted publicly.

### Should be done — quality and credibility

- [ ] **Approved Obsidixz logo supplied** and `src/components/brand/LogoLockup.tsx` updated, plus
      the favicon and OG image regenerated. **BLK-03**
- [ ] **Visual check in a real browser** at 360 / 390 / 768 / 1024 / 1440 px.
- [ ] **Screen-reader pass** on Home, Contact and one legal page.
- [ ] **Cross-browser check** in Safari, Firefox, Chrome and Edge.
- [ ] **Lighthouse run** against the deployed origin.
- [ ] **Photography decision** — keep the illustrative images, or replace with licensed
      photography of a real market.

### After launch

- [ ] Submit `https://realestate.obsidixz.pp.ua/sitemap.xml` in Google Search Console.
- [ ] Add the site to Bing Webmaster Tools.
- [ ] Set a calendar reminder to review the privacy policy when the hosting or form provider
      changes.
- [ ] Confirm that enquiries actually reach a human: send a test enquiry a week after launch.
