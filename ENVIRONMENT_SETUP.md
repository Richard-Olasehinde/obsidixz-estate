# ENVIRONMENT SETUP

Everything an operator needs in order to run this site, and what to do about secrets.

The headline: **there is almost nothing to configure.** The site is fully static, has no backend
and no sending service. There are no credentials to obtain, no accounts to activate and no DNS
records to add.

---

## 1. Quick start

```bash
git clone https://github.com/Richard-Olasehinde/obsidixz-estate.git
cd obsidixz-estate
npm install
npm run dev          # http://localhost:3000
```

That is the whole setup. `.env.local` is optional.

```bash
cp .env.example .env.local   # only if you want to override a default
```

Both variables in `.env.example` have working defaults in `src/lib/site.ts`, so **the site builds
and runs correctly with no environment file at all.**

---

## 2. Variable reference

Only two variables exist. Both are public, non-secret values.

### `NEXT_PUBLIC_SITE_URL`

| | |
| --- | --- |
| Default | `https://realestate.obsidixz.pp.ua` |
| Secret | **No** — baked into canonical URLs, the sitemap and `robots.txt` |
| Used by | Canonical tags, Open Graph URLs, `sitemap.xml`, `robots.txt` |

The public origin of the deployment, with no trailing slash. An invalid or empty value falls back
to the canonical production domain rather than producing a broken canonical.

### `NEXT_PUBLIC_BUSINESS_EMAIL`

| | |
| --- | --- |
| Default | `obsidixz.realestate@outlook.com` |
| Secret | **No** — this address is deliberately published on the site |
| Used by | The `mailto:` action, the visible address, the copy button, the footer, the legal pages |

The address the whole website points at. It is a Microsoft Outlook mailbox that the business
monitors and replies from. Changing this variable moves every contact route at once.

### `NEXT_PUBLIC_BUSINESS_PHONE`

| | |
| --- | --- |
| Default | *(empty)* |
| Secret | No |

**Deliberately blank.** No telephone number has been confirmed, so none is displayed. The site
does not fabricate one, and the contact page omits the telephone row entirely while this is empty.

---

## 3. Variables that no longer exist

Earlier stages of this project described an enquiry form with a server-side delivery adapter. That
has been **removed**, and so have its variables. If you are looking for them, this is why they are
gone:

| Removed | What it was |
| --- | --- |
| `ENQUIRY_DELIVERY_MODE` | Chose between `webhook`, `resend`, `console` |
| `ENQUIRY_WEBHOOK_URL`, `ENQUIRY_WEBHOOK_TOKEN`, `ENQUIRY_WEBHOOK_TIMEOUT_MS` | Webhook delivery |
| `RESEND_API_KEY`, `RESEND_ENDPOINT_OVERRIDE`, `ENQUIRY_FROM_EMAIL`, `ENQUIRY_TO_EMAIL` | Transactional sending via Resend |
| `ENQUIRY_RATE_LIMIT_MAX`, `ENQUIRY_RATE_LIMIT_WINDOW_MINUTES` | Per-IP limit on form submissions |

**Setting any of them now has no effect.** They are not read by any code.

The reason for the removal is recorded in [DECISION_LOG.md](./DECISION_LOG.md) D59–D61. In short:
the sending-service route could not be completed — Resend would not verify a `pp.ua` hostname, and
Brevo authenticated the domain but blocked API access behind phone verification that never
completed — and none of it was necessary. A visitor's own email application can send to the
business mailbox directly, with no provider in the middle and nothing that can silently fail.

---

## 4. Handling credentials safely

There is now nothing to keep secret in this repository. That is not an invitation to relax; it is
the point of the change.

- **Never commit `.env.local`.** It is ignored by `.gitignore` (`.env.*`, with `!.env.example`).
  Verify with `git check-ignore -v .env.local`.
- **Never add a `NEXT_PUBLIC_` variable that holds a secret.** Every `NEXT_PUBLIC_` value is
  inlined into the client bundle and is readable by anyone.
- If a future change does introduce a credential, it belongs in the host's environment settings,
  never in a file that is committed, and never in a chat message, ticket or screenshot.

The only values in `.env.example` are a public domain and a public email address. Both are already
printed on every page of the site.

---

## 5. How contact works, and what it does not do

```
visitor's mail client  ──►  obsidixz.realestate@outlook.com  ──►  reply from the same mailbox
        (their own email account)
```

The website's entire role is to publish the address and offer a `mailto:` link. Specifically:

- It **does not** send anything. There is no API route, no server action, no third-party form.
- It **does not** receive or store anything. There is no copy of an enquiry on the server or in
  any database.
- It **cannot tell** whether a message was sent, or whether a draft even opened.
- It **never** displays "Enquiry sent", "Received" or any delivery confirmation. Clicking a
  `mailto:` link proves only that a handler was invoked.

For the reasoning, and for what would have to be true before any of that could honestly be added,
see [DECISION_LOG.md](./DECISION_LOG.md) D59–D63.

### Why the fallback is always present

There is no reliable way for a web page to detect whether an email application is configured. Any
attempt would be guesswork that fails silently — exactly the failure this design exists to avoid.
So instead of detecting, the page:

1. shows the **full address as selectable text**, always, whether or not script runs;
2. offers **Copy email address**, with distinct success and failure messages;
3. tells the visitor in plain words what will happen and what to do if nothing does.

If copying fails, the message says so — *"Couldn't copy. Please select and copy the email address
above."* — and focus moves to the address so it can be selected immediately.

---

## 6. Verifying a deployment

Nothing here requires an account.

```bash
npm run build
npm run start &                        # or SITE_ORIGIN=https://your-host
SITE_ORIGIN=http://localhost:3000 npm run smoke
SITE_ORIGIN=http://localhost:3000 npm run a11y
SITE_ORIGIN=http://localhost:3000 npm run perf
npm run layout
npm run copy-feedback
```

Then, by hand, in a browser:

1. Open `/contact`. The button reads **Email your enquiry** and the address is visible below it.
2. Click the button. Your mail client opens with `obsidixz.realestate@outlook.com` in the **To**
   field and `Obsidixz Real Estate — Website enquiry` in the **Subject** field, and **no
   confirmation appears on the page**.
3. Click **Copy email address**. Paste somewhere. It should be the address, and the page should say
   **Email address copied**.
4. Deny clipboard permission (or use a browser without it) and click again. The page should say
   **Couldn't copy. Please select and copy the email address above.**
5. Tab through the page with the keyboard only. The skip link, the email button, the copy button and
   the address itself must all be reachable with a visible focus ring.

**What none of the above proves:** that an email sent to that address arrives, or that a reply from
it arrives. That is a human check and is tracked separately — see
[DEVELOPMENT_STATUS.md](./DEVELOPMENT_STATUS.md#email-verification).
