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

## 3. Hosting

**Current state: there is no deployment.** This was checked rather than assumed — see §3.1.

### 3.1 What was checked, and what was found

| Check | Result |
| --- | --- |
| Deployment config in the repo (`vercel.json`, `netlify.toml`, `wrangler.*`, `.vercel/`, `.netlify/`, `staticwebapp.config.json`, `firebase.json`, `app.yaml`) | **None present** |
| `.github/workflows/` | **Absent until this change** (a Pages workflow was added — see §3.3) |
| Git branches | `main` and the working branch only; no deployment branch |
| Commits mentioning deploy/hosting | Only the documentation commits from Stage 8 |
| GitHub Pages configured on the repository | `has_pages: false` |
| Repository homepage field | `null` |
| `realestate.obsidixz.pp.ua` | **NXDOMAIN** |
| Candidate platform hostnames | No `*.pages.dev`; `*.vercel.app`, `*.netlify.app` and `*.onrender.com` answer at DNS level because those platforms **wildcard every subdomain**, not because a site exists. None could be fetched. |
| Deploy tokens in this environment (`VERCEL_*`, `NETLIFY_*`, `CLOUDFLARE_*`) | **None** |

**Conclusion: no hosting destination exists, and none could be created from here.** The remaining
gap is a one-time account-level action by the founder.

### 3.2 Recommendation: GitHub Pages

The site is **fully static** — `next build` marks all 13 routes as prerendered, with no API route,
no server action and no database. That removes the reason a Node host was previously required.

GitHub Pages is recommended because it needs **no new account**: the code is already in this
repository, so enabling Pages is a settings change, not a signup.

| Requirement | GitHub Pages |
| --- | --- |
| Account | Already exists (the repository) |
| Cost | Free for public repositories |
| Runtime needed | None — correct for this site |
| Custom domain | Supported, free, automatic HTTPS via Let's Encrypt |
| Preview URL | `https://<user>.github.io/<repo>/` from the first successful run |
| Limitation | **Public repositories only** on the free tier |

> **Repository visibility.** Free GitHub Pages requires a public repository; paid plans can serve
> Pages from a private one. This was checked before publication: a full scan of **all history**
> found no secret-shaped strings, no API keys, no phone numbers, and only `.env.example` ever
> committed — never a real env file. What becomes public is the business contact mailbox, the
> correspondence address (already published on the site), and the code itself. No secrets.

**Alternatives**, if the repository should stay private:

| Host | Why it would work | Trade-off |
| --- | --- | --- |
| Cloudflare Pages | Free, private repos allowed, static, excellent CDN | New account |
| Netlify | Free, private repos allowed | New account |
| Vercel | Zero-config for Next.js, private repos allowed | New account; commercial-use terms differ on the free tier |

### 3.3 The included workflow

`.github/workflows/deploy-pages.yml` runs on every push to `main`.

**Three things in it are load-bearing. Each fixes a failure that returns HTTP 200 and therefore
cannot be caught by a status check.**

#### 1. A true static export, not `next build`

`next build` alone produces a *server* build: the HTML lands in `.next/server/app/`, which only the
Next server knows how to serve. Uploading `.next/` to GitHub Pages gives a site whose `index.html`
is not at the artifact root — every URL 404s.

Setting `NEXT_OUTPUT_EXPORT=1` switches `next.config.ts` to `output: 'export'`, producing `out/`
with `index.html` at the root. Two consequences, both required:

- `images.unoptimized` — a static export cannot re-encode images on demand.
- `trailingSlash` — `/contact` becomes `contact/index.html`, which is what a static host serves for
  a directory.

`manifest.ts`, `robots.ts` and `sitemap.ts` also need `export const dynamic = 'force-static'`,
without which the export refuses to build.

#### 1a. Checks must not expect a server before the export exists

`npm run check` is the **local** aggregate and includes `npm run a11y`, which fetches routes from a
running server. GitHub Actions has no site server at that point, so running `check` fails with
`TypeError: fetch failed` before `next build` can be reached. That is why the first deployment
attempts failed in roughly a minute without a build or certificate request.

The Pages workflow now runs `npm run check:offline` (typecheck, lint, layout, copy-feedback), then
builds the export. It starts Python's built-in static file server against `out/` and runs both
`npm run a11y` and `npm run smoke` **against that exact artifact**, before upload. This both avoids
the false CI failure and makes the check meaningful: we test the files GitHub Pages will receive.

#### 2. No base path, because this site is on a custom domain

A Pages *project* site serves from `/<repo>/` — but **a custom domain serves the site at `/`**.
GitHub's own documentation states this. A build carrying `/<repo>` prefixes is correct for the
`github.io` URL and **wrong for `realestate.obsidixz.pp.ua`**, where every stylesheet and image
would 404.

Since the custom domain is the destination, the build sets **no** base path, and the workflow fails
the run if a repository prefix ever reappears in `out/index.html`.

> **Consequence, stated plainly:** the bare `https://richard-olasehinde.github.io/obsidixz-estate/`
> URL is **not a usable preview** for this build and will render unstyled. Preview on the custom
> domain once the certificate is issued. This is a deliberate trade, and an earlier revision of this
> workflow got it backwards.

#### 3. `.nojekyll` and `CNAME`

- Without `.nojekyll`, Jekyll skips every directory beginning with an underscore — including
  `/_next/`, i.e. the entire CSS and JS bundle.
- `CNAME` is written into the published output so the artifact binds the custom domain. GitHub
  writes one into the *branch* when the domain is saved in Settings, but that mechanism does not
  apply to an Actions artifact.

### 3.4 Response headers: not available on GitHub Pages

`next.config.ts` still defines the security headers, and they are applied whenever the site runs
behind the Next server. **A static host cannot set response headers, and GitHub Pages does not
support them at all** — `_headers` is a Netlify and Cloudflare Pages feature.

On GitHub Pages, therefore, these are **absent**:

| Header | What is lost |
| --- | --- |
| `X-Content-Type-Options: nosniff` | MIME sniffing protection |
| `Referrer-Policy: strict-origin-when-cross-origin` | Referrer trimming on outbound navigation |
| `Permissions-Policy` | Explicit denial of camera, microphone, geolocation |

**How much this matters here.** All three are defence-in-depth, not load-bearing. The site has no
user accounts, no forms, no cookies, no third-party scripts, no inline event handlers and no API.
Nothing on it consumes a camera, microphone or location. The practical risk of their absence is
low — but it is a real reduction in posture compared with the server build, and it is recorded
rather than glossed over.

`npm run smoke` reports these as **host-provided** rather than asserting them, so the absence is
visible in every run instead of silently skipped.

**If these headers matter**, the options are:

1. **Cloudflare in front of GitHub Pages** (free) — a Transform Rule can add them at the edge, and
   the site keeps its Pages hosting.
2. **Cloudflare Pages or Netlify** instead — both read a `_headers` file, and the same static
   `out/` directory deploys unchanged.

Option 1 is the smallest change. Option 2 is the cleanest if the repository is private anyway.

## 3a. Exact DNS records

Do not add these until a deployment is green in the hosting dashboard — a CNAME pointing at a host
that does not yet recognise the domain will serve that host's 404 page.

### Before you touch anything: what must not change

`obsidixz.pp.ua` is a live zone with working mail. These records are **not** to be touched:

| Record | Current value | Why it must stay |
| --- | --- | --- |
| `obsidixz.pp.ua` `A` | `185.199.108.153` and 3 siblings | GitHub Pages serving the apex |
| `www` `CNAME` | `richard-olasehinde.github.io` | Existing site |
| `obsidixz.pp.ua` `MX` | `mx.zoho.com` 10, `mx2` 20, `mx3` 50 | Inbound mail for the apex domain |
| `obsidixz.pp.ua` `TXT` | `v=spf1 include:zohomail.com ~all` | SPF. **Never create a second SPF record** |
| `_dmarc.obsidixz.pp.ua` `TXT` | `v=DMARC1; p=none; rua=mailto:admin@obsidixz.pp.ua` | In use. Do not edit or replace |

**All of these sit on the apex or `www`.** The only record this deployment adds is on
`realestate`, a name that currently does not exist. **There is no collision surface at all** — the
new record cannot affect apex mail, the existing site, or DMARC.

### The record to add

Assuming GitHub Pages with the repository at `Richard-Olasehinde/obsidixz-estate`, and the site
served from the **custom domain** `realestate.obsidixz.pp.ua`:

| Field | Value |
| --- | --- |
| Type | `CNAME` |
| Name | `realestate` |
| Value / Target | `richard-olasehinde.github.io` |
| TTL | `3600` (or "Automatic" if uadns offers it) |
| Proxy setting | **Not applicable** — uadns is a plain authoritative DNS host, not a proxy. There is no orange-cloud equivalent to set. |

**The trailing dot matters.** A CNAME target must be fully qualified. If you enter the value
without a trailing dot and uadns treats it as relative, you get
`richard-olasehinde.github.io.obsidixz.pp.ua`, which does not exist. This project has already hit
exactly that fault once, on the DKIM records. If uadns offers no way to express the absolute form,
the record is still correct — verify with `dig` or `nslookup` afterwards rather than assuming.

**Verification record:** GitHub Pages does **not** require a separate `TXT`
`_github-pages-challenge-…` record for a *custom domain on a user or organisation account* when
the domain is configured through the repository settings. If GitHub's domain panel presents one,
add it exactly as shown — but do not invent one.

### If the hosting choice changes

| Host | Type | Name | Value |
| --- | --- | --- | --- |
| Cloudflare Pages | `CNAME` | `realestate` | `<project>.pages.dev` |
| Netlify | `CNAME` | `realestate` | `<site>.netlify.app` |
| Vercel | `CNAME` | `realestate` | `cname.vercel-dns.com` |

Vercel may issue a **project-specific** target of the form
`<hash>.vercel-dns-017.com` instead. Use whichever value Vercel's own domain panel shows for this
project — *not* the generic one — if the two differ. Do not copy a value from this document.

### Order of operations

1. Deploy. Confirm the platform's own preview URL serves the site.
2. Add `realestate.obsidixz.pp.ua` as a custom domain **in the hosting dashboard** and let it show
   you its required record.
3. Add the CNAME at uadns. Confirm it resolves.
4. Wait for the host to verify the domain and issue the certificate.
5. Only then change `NEXT_PUBLIC_SITE_URL` if the canonical host has changed, and redeploy.

### Three separate statuses — do not conflate them

| Status | What it means | How to check |
| --- | --- | --- |
| **Deployment** | The build is published and served by the host | Open the platform's preview URL. Green in the Actions tab. |
| **DNS** | `realestate.obsidixz.pp.ua` resolves to the host | `nslookup realestate.obsidixz.pp.ua` returns the host's target |
| **HTTPS** | A valid certificate is issued for the custom domain | `https://realestate.obsidixz.pp.ua` loads with no certificate warning |

The site can be fully **deployed** while **DNS** is still NXDOMAIN — that is the preview-URL stage.
DNS can resolve while **HTTPS** is still provisioning; that generally takes minutes but can take
hours. None of the three implies the others.

### Sub-path detail for GitHub Pages

A project site is served from `/<repo>/`, so the build **must** set
`NEXT_PUBLIC_BASE_PATH=/<repo>` (the workflow does this automatically from the repository name).
When GitHub Pages serves the site on its **custom domain**, the path is still `/<repo>/` unless a
`CNAME` file is present in the published output — GitHub's custom-domain handling rewrites the
root, but the safest approach is to leave the base path in place and confirm with a real fetch.

If the site 404s on assets at the custom domain but works on `github.io/<repo>/`, the base path is
the first thing to check.

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

**Inbox behaviour** — *cannot* be automated and must be done by a person.

You need **any one** email account that is not the business mailbox. That is the only requirement.
Do not assume the apex Zoho records mean a usable mailbox exists there: published MX records prove
only that the domain accepts mail, not that anyone can sign in to the other end.

If you have no second account at all, the cheapest honest route is whichever is easiest for you — a
free webmail account, or your own existing personal or work address, since what is being tested is
whether the business mailbox accepts and answers mail.

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
| `obsidixz.pp.ua` | `MX` | `mx.zoho.com` (10), `mx2.zoho.com` (20), `mx3.zoho.com` (50) | Zoho accepts mail for the apex. **This is a DNS fact only** — it does not establish that a Zoho mailbox is provisioned, reachable or in use |
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
      steps, in §5.1. ✅ **Closed 2026-11-06 on the founder's confirmation.** Re-run this check
      after any change to the mailbox or its provider.
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
