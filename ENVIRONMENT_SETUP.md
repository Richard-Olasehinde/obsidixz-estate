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
| Values | `unconfigured`, `webhook`, `console` |

- `unconfigured` — delivery disabled. The API returns HTTP 503 and the form shows
  "submission is not currently available". **This is the safe default.**
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
| Required | No, but strongly recommended before launch |
| Scope | Public |

These are **not invented anywhere in the codebase**. Leave them blank until a real, monitored
business mailbox exists. When blank:

- the footer omits the email link,
- the contact page shows the enquiry form as the only route and labels direct email as
  "being set up",
- the privacy policy shows a clearly marked placeholder for the privacy contact.

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

## 4. Switching the contact form on

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
