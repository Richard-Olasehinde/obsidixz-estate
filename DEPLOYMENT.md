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
| Build output | `.next/` — one server process plus prerendered pages |
| Database | **None** |
| Background workers / cron | **None** |
| Filesystem writes | **None** at runtime (the rate limiter holds state in memory only) |
| Required ports | One HTTP port (host-provided `PORT`) |

Everything except `/api/enquiry` and `/contact` is prerendered to static HTML. The contact page is
dynamic so its delivery status is always truthful.

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
| `ENQUIRY_DELIVERY_MODE` | **Yes** | `webhook` |
| `ENQUIRY_WEBHOOK_URL` | **Yes** | Your destination endpoint (see §5) |
| `ENQUIRY_WEBHOOK_TOKEN` | If required | Bearer token, server-side only |
| `ENQUIRY_WEBHOOK_TIMEOUT_MS` | No | Default `10000` |
| `ENQUIRY_RATE_LIMIT_MAX` | No | Default `5` |
| `ENQUIRY_RATE_LIMIT_WINDOW_MINUTES` | No | Default `60` |
| `NEXT_PUBLIC_BUSINESS_EMAIL` | Recommended | The monitored business mailbox |
| `NEXT_PUBLIC_BUSINESS_PHONE` | No | Only if a business number should be published |

`ENQUIRY_DELIVERY_MODE=console` is **refused** when `NODE_ENV=production`, deliberately, so a live
site can never send enquiries into a log nobody reads.

---

## 5. Contact form activation

The form is fully implemented but will report honestly that submission is unavailable until a
destination exists.

**Recommended: Resend transactional email.** One account, no third-party form service, and the
confirmation email goes straight to `obsidixz.realestate@outlook.com`. Full setup — account,
domain verification, DNS records, variables and the manual confirmation step — is in
[ENVIRONMENT_SETUP.md §5](./ENVIRONMENT_SETUP.md#5-resend-transactional-email). In short:

```dotenv
ENQUIRY_DELIVERY_MODE=resend
RESEND_API_KEY=re_xxxxxxxxxxxx
ENQUIRY_FROM_EMAIL=enquiries@send.realestate.obsidixz.pp.ua
ENQUIRY_TO_EMAIL=obsidixz.realestate@outlook.com
```

**Alternative: a generic webhook.** Anything that accepts `POST` with a JSON body and returns
`2xx`:
   - *Formspree* — free tier, one signup, gives `https://formspree.io/f/xxxxxxxx`
   - *Formspark*, *Basin* — similar
   - *Make / Zapier / n8n* — a webhook that forwards to email or a spreadsheet
   - Your own CRM intake endpoint or serverless function

2. **Set the variables** (§4) and redeploy.

3. **Send one real enquiry** through the live form. Confirm:
   - it arrives at the destination;
   - the browser shows the success state (only shown on a genuine `2xx`);
   - the reference shown on screen matches the `reference` field in the payload.

   > **For Resend, this step is mandatory and cannot be skipped.** A `200` only means Resend
   > accepted the message; it does not prove arrival. Do not record delivery as working — and do
   > not close **BLK-01** — until the email is visibly present in
   > `obsidixz.realestate@outlook.com`, checked including the spam folder.

4. If it fails, the visitor sees an honest failure message and their text stays in the form. Check
   the server log: failures are logged with the reference and the upstream status.

The JSON body sent is documented in [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md#4-switching-the-contact-form-on),
so a destination can be mapped without reading the source.

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

### DNS records for email sending

The site's DNS and the sending-domain DNS live on the same zone but must not collide. Publishing
the Resend records on the **apex** of `realestate.obsidixz.pp.ua` would take over its inbound mail;
they belong on a `send.` subdomain. See [ENVIRONMENT_SETUP.md §5.3](./ENVIRONMENT_SETUP.md#53-account-and-domain-setup)
for the exact values, which Resend generates and you copy.

| Type | Name | Purpose |
| --- | --- | --- |
| `MX` | `send.realestate` | Bounce handling / Return-Path |
| `TXT` | `send.realestate` | SPF |
| `TXT` | `resend._domainkey.send.realestate` | DKIM |
| `TXT` | `_dmarc.realestate` | DMARC (`p=none` to start) |

The site records (`CNAME`/`A` for `realestate`) and the mail records (`send.realestate`) are
independent: adding the mail records does not affect site hosting, and vice versa.

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
| Rotate the webhook token | If it is ever exposed | Change it at the destination, update the host env, redeploy. Rotate first — the old value is already public. |
| Rotate the Resend API key | Immediately if it is ever exposed, or every 6 months | Create a new key in Resend, update `RESEND_API_KEY` on the host, redeploy, then revoke the old key. Rotating first matters: the old key is already public. |
| Check the Resend domain stays verified | Monthly | Resend dashboard → Domains. If it flips to pending, a DNS record was changed or removed. |
| Check the sending reputation | Monthly | Resend dashboard → Emails. Watch for a rise in bounces or complaints; both damage deliverability for the Outlook inbox. |
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

- [ ] **Enquiry destination configured and tested** (`ENQUIRY_DELIVERY_MODE=webhook`,
      `ENQUIRY_WEBHOOK_URL` set; one real enquiry received). Without this the form tells visitors
      enquiries are unavailable. **BLK-01**
- [ ] **Business email supplied** (`NEXT_PUBLIC_BUSINESS_EMAIL`) and confirmed to be monitored.
      **BLK-02**
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
