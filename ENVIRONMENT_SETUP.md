# ENVIRONMENT SETUP

Everything you need to run the site locally and to switch on the contact form.

> **Never commit real credentials.** `.gitignore` excludes `.env`, `.env.local` and every
> `.env.*` variant except `.env.example`. Only variable *names* and explanations belong in
> the repository.

---

## 1. Quick start

```bash
npm install
cp .env.example .env.local     # then edit if needed
npm run dev                    # http://localhost:3000
```

The site runs with **every variable empty**. Only the contact form's delivery is affected: it
will validate input, then report honestly that submission is not yet available. Nothing is
silently discarded — the visitor is shown a direct-contact fallback.

---

## 2. Variable reference

### `NEXT_PUBLIC_SITE_URL`

| | |
| --- | --- |
| Required | Recommended. Falls back to `https://realestate.obsidixz.pp.ua` |
| Scope | Public (inlined into the build) |
| Used for | Canonical URLs, Open Graph URLs, `sitemap.xml`, `robots.txt`, JSON-LD |

Set this to the real deployed origin, with no trailing slash. In local development you can
leave it alone; if you set it to `http://localhost:3000`, remember to change it back before
deploying, otherwise canonicals will point at localhost.

### `ENQUIRY_DELIVERY_MODE`

| | |
| --- | --- |
| Required | No. Defaults to `unconfigured` |
| Values | `unconfigured`, `resend`, `webhook`, `console` |

- `unconfigured` — delivery disabled. The API returns HTTP 503 and the form shows
  "submission is not currently available". **This is the safe default.**
- `resend` — send the enquiry as a transactional email through Resend. Requires
  `RESEND_API_KEY`, `ENQUIRY_FROM_EMAIL` and `ENQUIRY_TO_EMAIL`; if any is missing the mode
  behaves as `unconfigured` and nothing is sent. **This is the recommended mode.** See §5.
- `webhook` — POST the enquiry as JSON to `ENQUIRY_WEBHOOK_URL`.
- `console` — print the enquiry to the server log. **Development only**; the server refuses
  this mode when `NODE_ENV=production`, so a live site can never silently swallow enquiries
  into a log file.

### `ENQUIRY_WEBHOOK_URL`

| | |
| --- | --- |
| Required | Only when `ENQUIRY_DELIVERY_MODE=webhook` |
| Scope | Server-side only — never reaches the browser |

Any endpoint that accepts `POST` with `Content-Type: application/json` and answers `2xx` on
success. That includes Formspree, Formspark, Basin, Make, Zapier, n8n, a Cloudflare Worker, a
serverless function, or your own CRM's intake endpoint. Anything other than a `2xx` response is
treated as a failure and reported to the visitor as a failure.

### `ENQUIRY_WEBHOOK_TOKEN`

Optional bearer token, sent as `Authorization: Bearer <token>`. Server-side only. Leave empty if
the destination is unauthenticated (most form services use an unguessable URL instead).

### `ENQUIRY_WEBHOOK_TIMEOUT_MS`

Optional. Default `10000`. The delivery request is aborted after this many milliseconds and
treated as a failure.

### `ENQUIRY_RATE_LIMIT_MAX` / `ENQUIRY_RATE_LIMIT_WINDOW_MINUTES`

Optional. Defaults `5` and `60`. Limits submissions per IP address.

> **Limitation, stated plainly:** the limiter is held in memory in the server process. It resets
> when the process restarts and is per instance, so on a multi-instance deployment the effective
> limit is per instance. This is deliberate — adding Redis or a database for an eight-page site
> would be unnecessary complexity. If abuse becomes a real problem, replace the store in
> `src/lib/rate-limit.ts`.

### `NEXT_PUBLIC_BUSINESS_EMAIL` / `NEXT_PUBLIC_BUSINESS_PHONE`

| | |
| --- | --- |
| Required | No |
| Scope | Public |
| Confirmed value | `obsidixz.realestate@outlook.com` (email only) |

**Email — confirmed 2026-11-06.** The founder confirmed the official business mailbox. It is
set as a dated default in `src/lib/site.ts` (`CONFIRMED_BUSINESS_EMAIL`), so the footer, the
contact page and the privacy policy always display a working address even if the deployment
environment forgets to set the variable. The environment variable still takes precedence, so the
address can be changed by configuration alone. It is also the default `ENQUIRY_TO_EMAIL`.

**Telephone — not confirmed.** There is no default and no fallback. While blank, no telephone
number is rendered anywhere and none is invented.

---

---

## 3. Handling credentials safely

1. **Never** put a real value into `.env.example`. That file is committed.
2. Put real values in `.env.local` (or your host's environment-variable UI).
3. If a secret is ever committed by accident: rotate it at the provider first, then remove it
   from history. Rotating first matters — the old value is already public.
4. `ENQUIRY_WEBHOOK_TOKEN` must never be given a `NEXT_PUBLIC_` prefix. The prefix inlines the
   value into JavaScript that every visitor downloads.

Checking before you commit:

```bash
git status --short
git diff --cached --name-only | grep -E '\.env' || echo "no env files staged"
```

---

## 4. Switching the contact form on (webhook route)

> **Prefer Resend — see §5**, which is the recommended path and needs no third-party form
> service. This section documents the generic webhook route, kept because it works with any
> endpoint and is useful if you already have one.

1. Create the destination. For example, a Formspree form is one signup and gives you an
   endpoint like `https://formspree.io/f/abcdwxyz`. Any HTTP endpoint that accepts JSON works.
2. Copy the endpoint into `.env.local`:

   ```dotenv
   ENQUIRY_DELIVERY_MODE=webhook
   ENQUIRY_WEBHOOK_URL=https://formspree.io/f/your-form-id
   ```

3. Restart the dev server (`npm run dev` does not hot-reload `.env.local`).
4. Submit one real test enquiry through the browser and confirm it arrives.
5. Add the same two variables to the production host's environment settings.
6. Record the change in [DEVELOPMENT_STATUS.md](./DEVELOPMENT_STATUS.md) and close
   **BLK-01**.

If your destination needs the field names to match, the JSON body sent is:

```json
{
  "fullName": "…",
  "businessEmail": "…",
  "companyName": "…",
  "enquiryType": "property-lead-research",
  "targetLocation": "…",
  "message": "…",
  "privacyAcknowledged": true,
  "submittedAt": "2026-01-01T00:00:00.000Z",
  "source": "website-contact-form"
}
```

---

## 5. Resend transactional email

The recommended delivery path. It keeps the existing architecture: the browser posts to
`/api/enquiry`, the route validates, sanitises and rate-limits, and only then does the delivery
adapter send an email. **No API credential ever reaches the browser.**

### 5.1 How the flow works

```
Browser form  →  POST /api/enquiry  →  validate → honeypot → timing → rate limit → sanitise
                                              ↓
                                     deliverEnquiry()  [mode=resend]
                                              ↓
                          POST https://api.resend.com/emails
                                              ↓
                         Resend accepts (2xx) → 200 to the visitor
                         Anything else        → 502/500, never success
```

The notification email is sent **from** an address on a domain verified in Resend, **to**
`ENQUIRY_TO_EMAIL` (the official Outlook inbox), with `reply_to` set to the enquirer's address so
the founder can reply directly without copying it.

### 5.2 What "success" means here — read this before claiming it works

A `200` from the route means **Resend accepted the message for delivery**. It does **not** prove
the message reached the Outlook inbox. Resend hands the message to the receiving mail system, and
what happens next is outside this code's visibility.

Therefore:

> **Delivery is not to be described as working until a real enquiry has been submitted through
> the live site and found in `obsidixz.realestate@outlook.com`.** Check the spam folder too, and
> mark the sender as safe if it lands there.

This is tracked as **BLK-01** and stays open until that manual confirmation happens.

### 5.3 Account and domain setup

1. **Create a Resend account** at `resend.com` using the business address
   `obsidixz.realestate@outlook.com`.
2. **Add the domain.** In Resend's *Add Domain* field, enter the **base domain**
   `realestate.obsidixz.pp.ua` — **not** `send.realestate.obsidixz.pp.ua`.

   Resend then creates its records on a `send.` subdomain of what you added, which gives you the
   sending subdomain `send.realestate.obsidixz.pp.ua`. That is the recommended pattern: it keeps
   sending reputation separate from the website host and from any future mailbox hosting.

   > **Correction (2026-11-06):** this section previously said to add
   > `send.realestate.obsidixz.pp.ua` directly. That is wrong — it would make Resend generate
   > records on `send.send.realestate.obsidixz.pp.ua`. Add the base domain.
3. **Publish the DNS records** Resend shows for that domain. Resend generates them; copy them
   exactly rather than typing them. The pattern is:

   | Type | Name / Host | Value | Purpose |
   | --- | --- | --- | --- |
   | `MX` | `send.realestate` | `feedback-smtp.<region>.amazonses.com` (priority 10) | Bounce handling / Return-Path |
   | `TXT` | `send.realestate` | `v=spf1 include:amazonses.com ~all` | SPF for the sending subdomain |
   | `TXT` | `resend._domainkey.send.realestate` | `p=…` (long public key from Resend) | DKIM signing |

   Notes that matter:
   - **The Resend dashboard is authoritative for these values, not the table above.** Resend has
     changed where it places DKIM over time (apex `resend._domainkey` in older setups, under
     `send.` in newer ones). Copy the three records exactly as shown on the domain's page.
   - Your DNS provider may append the root domain automatically. If it does, the host fields
     become `send` and `resend._domainkey.send`, **not** the full names above.
   - The DKIM value is long enough that panels sometimes truncate it or split it into quoted
     strings. Paste it; do not retype it. A truncated DKIM record leaves the domain permanently
     "pending".
   - If the DNS provider is Cloudflare, set these records to **DNS only** (grey cloud), not
     proxied.
   - Region varies (`us-east-1`, `eu-west-1`, …). Use the exact host Resend displays.
4. **Do not enable Receiving.** If the domain page offers inbound/receiving, leave it off. It
   would add an MX record on the apex and intercept mail addressed to that hostname.

5. **Add DMARC** (Resend does not create it):

   | Type | Name | Value |
   | --- | --- | --- |
   | `TXT` | `_dmarc.realestate` | `v=DMARC1; p=none; rua=mailto:obsidixz.realestate@outlook.com` |

   Start at `p=none` and read the reports before tightening to `quarantine` or `reject`.
   Tightening before every legitimate sender is aligned will filter your own mail.
6. **Wait for verification.** Usually minutes; DNS propagation can take up to 72 hours. The
   domain must show **Verified** in Resend before sending will work.
7. **Create an API key** at `resend.com/api-keys`, scoped to **Sending access** only. It begins
   with `re_`. Treat it as a password.

### 5.4 Environment variables

```dotenv
ENQUIRY_DELIVERY_MODE=resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
ENQUIRY_FROM_EMAIL=enquiries@send.realestate.obsidixz.pp.ua
ENQUIRY_TO_EMAIL=obsidixz.realestate@outlook.com
```

The sender mailbox (`enquiries@…`) does not need to exist as a real mailbox — Resend sends on
behalf of the domain, not from an account. Replies are not routed to it either: the adapter sets
`reply_to` to the **enquirer's** address, so hitting Reply in Outlook answers the visitor directly.
That is also why the apex `send.` MX record exists — it catches bounces, not real replies.

| Variable | Required | Notes |
| --- | --- | --- |
| `RESEND_API_KEY` | Yes | Server-side only. **Never** prefix with `NEXT_PUBLIC_`. |
| `ENQUIRY_FROM_EMAIL` | Yes | Local part can be anything (`enquiries@`, `noreply@`, `website@`); the domain part must be the verified sending subdomain. `send.realestate.obsidixz.pp.ua` is the domain verified in Resend, so it is the safe choice. |
| `ENQUIRY_TO_EMAIL` | Yes | The monitored inbox. No default is guessed — if absent, nothing is sent. |
| `ENQUIRY_WEBHOOK_TIMEOUT_MS` | No | Reused for the Resend request. Default 10000, capped 30000. |

### 5.5 Verifying it yourself

1. Set the four variables and restart the server (`npm run dev` does not hot-reload env files).
2. Visit `/contact`. The page should say **"Online enquiries are open."** If it still says
   "not yet switched on", a variable is missing — the page reads the live configuration.
3. Submit a real enquiry with your own name.
4. Confirm it in `obsidixz.realestate@outlook.com`. Reply to it to confirm `reply_to` works.
5. Only then close **BLK-01** in `DEVELOPMENT_STATUS.md`.

### 5.6 What was tested here, and what was not

Tested against a local mock endpoint with the same request shape, using the dev-only
`RESEND_ENDPOINT_OVERRIDE` seam (see §5.7):

| Case | Result |
| --- | --- |
| Valid enquiry, authorisation header, payload shape | ✅ `200`, `Bearer` header sent, `from`/`to`/`reply_to`/`subject`/`html`/`text` correct |
| HTML injection in name and message | ✅ Escaped (`&lt;script&gt;`), never raw markup |
| Resend returns 500 | ✅ `502`, retryable, no success |
| Resend returns 401 | ✅ `500`, non-retryable, no key or response body leaked |
| `ENQUIRY_TO_EMAIL` absent | ✅ `503 not_configured`, nothing sent |
| Existing validation, honeypot, timing, rate limit | ✅ Unchanged and still enforced |

**Not tested:** a real Resend account, a real verified domain, and a real message arriving in the
Outlook inbox. Those require the founder's account and are outstanding.

### 5.7 `RESEND_ENDPOINT_OVERRIDE` — test seam

Used only to exercise the delivery path against a local mock. **Ignored entirely when
`NODE_ENV=production`**, so it cannot redirect a live enquiry. Do not set it in production; the
variable is documented here so it is not mistaken for a supported integration point.

---
