# DEPLOYMENT

> **Status: to be completed in Stage 8.** This file currently records the deployment
> decisions made during Stage 1 so nothing is lost if the project pauses.

## Build

```bash
npm ci
npm run build
npm run start        # serves the production build on :3000
```

The build prerenders every page except `/api/enquiry`. No database, no cron, no worker.

## Environment

See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md). The only variables a production host
strictly needs are:

- `NEXT_PUBLIC_SITE_URL` — the real public origin.
- `ENQUIRY_DELIVERY_MODE` + `ENQUIRY_WEBHOOK_URL` (+ `ENQUIRY_WEBHOOK_TOKEN` if the destination
  requires authentication) — required for the contact form to accept enquiries.

## Hosting requirements

- Node.js 20.9+ runtime (Next.js server), **or** Vercel's zero-config Next.js support.
- HTTPS at the apex/subdomain being served. `Strict-Transport-Security` is left to the host.
- One writable process is enough. Horizontal scaling works, but the in-memory rate limiter is
  then per instance (documented limitation).

## Domain

Target address: **`realestate.obsidixz.pp.ua`** (a subdomain of the Obsidixz parent domain).

Full DNS, TLS, redirect and verification steps are added in Stage 8.
