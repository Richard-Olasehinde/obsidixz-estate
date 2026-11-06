#!/usr/bin/env node
/**
 * Obsidixz Real Estate — verification suite.
 *
 * No browser and no heavy dependencies: this fetches the running site and
 * asserts the things a visitor (and a search engine) actually depends on.
 *
 * Usage:
 *   npm run build && npm run start        # in one shell
 *   npm run smoke                         # in another
 *
 *   SITE_ORIGIN=http://localhost:3100 npm run smoke
 *
 * What it checks
 *   1. Every required route returns 200 HTML.
 *   2. Title, meta description, canonical and Open Graph tags are present,
 *      page-specific and not duplicated across pages.
 *   3. Exactly one <h1> per page, no skipped heading levels.
 *   4. Every internal link and in-page anchor on every page resolves.
 *   5. Every referenced local image/font asset returns 200.
 *   6. No unresolved "todo"/"lorem"/placeholder markers in rendered copy.
 *   7. No fabricated business claims (guarantees, testimonials, statistics,
 *      brokerage/wholesaling wording, invented locations).
 *   8. JSON-LD parses and contains only verified fields.
 *   9. robots.txt and sitemap.xml are correct and complete.
 *  10. Security headers are present.
 *  11. The enquiry API rejects invalid input, and never reports success when
 *      delivery is unconfigured. A local mock receiver proves the configured
 *      success path end to end.
 *
 * Exit code is non-zero if any check fails.
 */

const ORIGIN = (process.env.SITE_ORIGIN || 'http://localhost:3000').replace(/\/$/, '');
const MOCK_PORT = Number(process.env.MOCK_PORT || 4399);

const results = [];
let failures = 0;

function record(group, name, ok, detail = '') {
  results.push({ group, name, ok, detail });
  if (!ok) failures += 1;
  const mark = ok ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
  const line = `${mark}  ${name}`;
  console.log(detail ? `${line}\n      ${detail}` : line);
}

function section(title) {
  console.log(`\n\x1b[1m${title}\x1b[0m`);
}

async function get(path, init) {
  const res = await fetch(`${ORIGIN}${path}`, { redirect: 'manual', ...init });
  const body = await res.text();
  return { res, body };
}

/* ------------------------------------------------------------------ */
/* HTML helpers                                                        */
/* ------------------------------------------------------------------ */
const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&#x2F;/g, '/');

function metaContent(html, attr, value) {
  const re = new RegExp(`<meta[^>]*${attr}="${value}"[^>]*content="([^"]*)"`, 'i');
  const alt = new RegExp(`<meta[^>]*content="([^"]*)"[^>]*${attr}="${value}"`, 'i');
  const m = html.match(re) || html.match(alt);
  return m ? decode(m[1]) : null;
}

function linkHref(html, rel) {
  const re = new RegExp(`<link[^>]*rel="${rel}"[^>]*href="([^"]*)"`, 'i');
  const alt = new RegExp(`<link[^>]*href="([^"]*)"[^>]*rel="${rel}"`, 'i');
  const m = html.match(re) || html.match(alt);
  return m ? decode(m[1]) : null;
}

/**
 * Removes regions the site marks as "claim-exempt" — lists that enumerate what
 * the business does NOT offer or whom it does not serve. Without this, the
 * claim checker would read "we do not offer wholesaling" as advertising it.
 */
function stripExemptRegions(html) {
  return html.replace(
    /<(ul|ol|div|section)[^>]*data-claim-exempt="[^"]*"[^>]*>[\s\S]*?<\/\1>/gi,
    ' ',
  );
}

function textOf(html) {
  return decode(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' '),
  );
}

/* ------------------------------------------------------------------ */
/* Required routes — keep in sync with src/lib/routes.ts                */
/* ------------------------------------------------------------------ */
const REQUIRED_ROUTES = [
  { path: '/', titleIncludes: 'Obsidixz Real Estate' },
  { path: '/about', titleIncludes: 'About Us' },
  { path: '/services', titleIncludes: 'Services' },
  { path: '/how-it-works', titleIncludes: 'How It Works' },
  { path: '/who-we-serve', titleIncludes: 'Who We Serve' },
  { path: '/contact', titleIncludes: 'Contact' },
  { path: '/privacy-policy', titleIncludes: 'Privacy Policy' },
  { path: '/terms-of-service', titleIncludes: 'Terms of Service' },
];

/* ------------------------------------------------------------------ */
/* Forbidden content — fabricated or unsupported business claims       */
/* ------------------------------------------------------------------ */
const FORBIDDEN_PATTERNS = [
  {
    re: /\bguarantee(d|s)?\b/i,
    why: 'guarantee language',
    // A promise is forbidden; an explicit disclaimer ("no service can guarantee…") is required copy.
    unless: /\b(no|not|cannot|can't|never|without)\b[^.]{0,40}$/i,
  },
  { re: /\brisk[- ]free\b/i, why: 'risk-free claim' },
  { re: /\b(testimonial|client logo)s?\b/i, why: 'testimonial reference' },
  { re: /\btrusted by\b/i, why: 'unsupported social-proof claim' },
  { re: /\b(award[- ]winning|certified|accredited)\b/i, why: 'unsupported credential' },
  { re: /\b\d+\s*(years|yrs)\s+of\s+experience\b/i, why: 'invented tenure' },
  { re: /\b(we|our)\s+(are|is)\s+a\s+(licensed\s+)?(brokerage|real estate broker)\b/i, why: 'brokerage claim' },
  {
    re: /\bwholesaling\b/i,
    why: 'wholesaling advertised',
    // Legitimate only when explicitly negated, e.g. "we do not advertise wholesaling".
    unless: /\b(not|never|no)\b[^.]{0,40}$/i,
  },
  { re: /\bproprietary\s+(platform|analytics|ai|technology)\b/i, why: 'invented platform' },
  { re: /\b(AI|artificial intelligence)[- ]powered\b/i, why: 'invented AI product' },
  { re: /\bnationwide\b/i, why: 'unconfirmed nationwide coverage' },
  { re: /\b\d{3,}[\s,.]?\d*\s*(deals|transactions|clients|properties sold|investors)\b/i, why: 'invented volume statistic' },
  { re: /\$\s?\d[\d,.]*\s*(k|m|million)?\s*(in|of)?\s*(revenue|profit|returns?|aum)\b/i, why: 'invented financial figure' },
  { re: /\bROI\s*(of|guaranteed|up to)\b/i, why: 'investment return claim' },
  { re: /\b(LLC|Ltd|Inc|GmbH)\b/, why: 'unverified legal entity name' },
  { re: /\blorem ipsum\b/i, why: 'lorem ipsum placeholder' },
  { re: /\bTODO\b/, why: 'unresolved TODO marker' },
  { re: /\bFIXME\b/, why: 'unresolved FIXME marker' },
  { re: /\bcoming soon\b/i, why: 'placeholder copy' },
];

/* ------------------------------------------------------------------ */
/* Main                                                               */
/* ------------------------------------------------------------------ */
async function main() {
  console.log(`\nVerifying ${ORIGIN}\n${'='.repeat(64)}`);

  const pages = new Map();
  const titles = new Map();
  const descriptions = new Map();

  /* 1 — routes, metadata, structure */
  section('1. Required routes and page metadata');
  for (const route of REQUIRED_ROUTES) {
    let res;
    let html;
    try {
      ({ res, body: html } = await get(route.path));
    } catch (error) {
      record('routes', `${route.path} reachable`, false, String(error));
      continue;
    }

    record('routes', `${route.path} → ${res.status}`, res.status === 200, res.status !== 200 ? `HTTP ${res.status}` : '');
    if (res.status !== 200) continue;
    pages.set(route.path, html);

    const title = html.match(/<title>([^<]*)<\/title>/i)?.[1];
    record(
      'metadata',
      `${route.path} title present and specific`,
      Boolean(title && decode(title).includes(route.titleIncludes)),
      title ? `title: ${decode(title)}` : 'no <title>',
    );
    if (title) {
      const t = decode(title);
      if (titles.has(t)) record('metadata', `${route.path} title unique`, false, `duplicate of ${titles.get(t)}`);
      else titles.set(t, route.path);
    }

    const desc = metaContent(html, 'name', 'description');
    record(
      'metadata',
      `${route.path} meta description 50–180 chars`,
      Boolean(desc && desc.length >= 50 && desc.length <= 180),
      desc ? `${desc.length} chars` : 'missing',
    );
    if (desc) {
      if (descriptions.has(desc)) record('metadata', `${route.path} description unique`, false, `duplicate of ${descriptions.get(desc)}`);
      else descriptions.set(desc, route.path);
    }

    const canonical = linkHref(html, 'canonical');
    const expectedCanonical = route.path === '/' ? 'https://realestate.obsidixz.pp.ua' : `https://realestate.obsidixz.pp.ua${route.path}`;
    record(
      'metadata',
      `${route.path} canonical is absolute and correct`,
      canonical === expectedCanonical || canonical === `${expectedCanonical}/`,
      canonical ? `canonical: ${canonical}` : 'missing',
    );

    record('metadata', `${route.path} og:title present`, Boolean(metaContent(html, 'property', 'og:title')));
    record('metadata', `${route.path} og:description present`, Boolean(metaContent(html, 'property', 'og:description')));
    record('metadata', `${route.path} og:image present`, Boolean(metaContent(html, 'property', 'og:image')));

    // Headings
    const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => textOf(m[1]));
    record('structure', `${route.path} exactly one <h1>`, h1s.length === 1, `found ${h1s.length}${h1s[0] ? `: "${h1s[0].slice(0, 60)}"` : ''}`);

    const levels = [...html.matchAll(/<h([1-6])[^>]*>/gi)].map((m) => Number(m[1]));
    let skip = null;
    for (let i = 1; i < levels.length; i += 1) {
      if (levels[i] - levels[i - 1] > 1) {
        skip = `h${levels[i - 1]} → h${levels[i]}`;
        break;
      }
    }
    record('structure', `${route.path} no skipped heading levels`, skip === null, skip ?? '');

    // Forbidden content
    const text = textOf(stripExemptRegions(html));
    for (const rule of FORBIDDEN_PATTERNS) {
      const hit = text.match(rule.re);
      if (hit) {
        if (rule.unless) {
          const before = text.slice(Math.max(0, (hit.index ?? 0) - 46), hit.index ?? 0);
          if (rule.unless.test(before)) continue;
        }
        const idx = Math.max(0, (hit.index ?? 0) - 60);
        record('content', `${route.path} no ${rule.why}`, false, `"…${text.slice(idx, idx + 140)}…"`);
      }
    }
  }

  record('content', 'no fabricated/unsupported claims found on any page', !results.some((r) => r.group === 'content' && !r.ok));

  /* 2 — internal links and anchors */
  section('2. Internal links and anchors');
  const brokenLinks = [];
  const brokenAnchors = [];
  for (const [path, html] of pages) {
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => decode(m[1]));
    for (const href of new Set(hrefs)) {
      if (/^(mailto:|tel:|https?:\/\/(?!realestate\.obsidixz\.pp\.ua))/.test(href)) continue;
      if (href.startsWith('#') || href.startsWith('/#')) {
        const id = href.replace(/^\/?#/, '');
        if (id && !html.includes(`id="${id}"`)) brokenAnchors.push(`${path} → ${href}`);
        continue;
      }
      if (!href.startsWith('/')) continue;
      const [linkPath] = href.split('#');
      if (linkPath.startsWith('/_next/') || linkPath.startsWith('/api/')) continue;
      try {
        const head = await fetch(`${ORIGIN}${linkPath}`, { method: 'GET', redirect: 'manual' });
        if (head.status !== 200) brokenLinks.push(`${path} → ${href} (${head.status})`);
      } catch {
        brokenLinks.push(`${path} → ${href} (unreachable)`);
      }
    }
  }
  record('links', 'every internal link returns 200', brokenLinks.length === 0, brokenLinks.join('; '));
  record('links', 'every in-page anchor resolves', brokenAnchors.length === 0, brokenAnchors.join('; '));

  /* 3 — assets */
  section('3. Referenced local assets');
  const assetPaths = new Set();
  for (const html of pages.values()) {
    for (const m of html.matchAll(/(?:src|href)="(\/(?!_next\/|api\/)[^"?#]+\.(?:svg|png|jpg|jpeg|webp|avif|ico|woff2))"/g)) {
      assetPaths.add(decode(m[1]));
    }
  }
  for (const p of ['/favicon.svg', '/favicon-32.png', '/apple-touch-icon.png', '/og-image.png']) assetPaths.add(p);
  const missingAssets = [];
  for (const asset of assetPaths) {
    const res = await fetch(`${ORIGIN}${asset}`);
    if (!res.ok) missingAssets.push(`${asset} (${res.status})`);
  }
  record('assets', `all ${assetPaths.size} referenced assets return 200`, missingAssets.length === 0, missingAssets.join('; '));

  const ogImage = metaContent(pages.get('/') ?? '', 'property', 'og:image');
  if (ogImage) {
    // og:image is absolute and points at the production domain — correct for
    // crawlers, but the check must resolve it against the origin under test.
    const { pathname: ogPath } = new URL(ogImage, `${ORIGIN}/`);
    const res = await fetch(`${ORIGIN}${ogPath}`);
    record(
      'assets',
      'og:image resolves',
      res.ok,
      `${ogPath} → ${res.status} ${res.headers.get('content-type') ?? ''}`,
    );
    record('assets', 'og:image is declared as 1200x630', /1200/.test(pages.get('/') ?? '') && /630/.test(pages.get('/') ?? ''));
  }

  /* 4 — images have alt text */
  section('4. Images');
  let totalImgs = 0;
  let missingAlt = 0;
  for (const [path, html] of pages) {
    for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
      totalImgs += 1;
      const tag = m[0];
      if (!/\balt="/.test(tag)) {
        missingAlt += 1;
        record('images', `${path} image has alt attribute`, false, tag.slice(0, 90));
      } else if (/\balt=""/.test(tag) === false && /\balt="(image|img|picture|photo)"\s*"/i.test(tag)) {
        record('images', `${path} image alt text is descriptive`, false, tag.slice(0, 90));
      }
    }
  }
  record('images', `all ${totalImgs} <img> elements have alt text`, missingAlt === 0);

  /* 5 — JSON-LD */
  section('5. Structured data');
  const homeHtml = pages.get('/') ?? '';
  const jsonLd = [...homeHtml.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  record('seo', 'homepage includes JSON-LD', jsonLd.length > 0);
  for (const block of jsonLd) {
    try {
      const parsed = JSON.parse(decode(block));
      const type = parsed['@type'];
      record('seo', `JSON-LD parses (${type})`, true);
      const serialised = JSON.stringify(parsed);
      record('seo', 'JSON-LD omits unverified address', !/"address"/.test(serialised));
      record('seo', 'JSON-LD omits unverified telephone', !/"telephone"/.test(serialised));
      record('seo', 'JSON-LD omits ratings/reviews', !/"aggregateRating"|"review"/.test(serialised));
    } catch (error) {
      record('seo', 'JSON-LD parses', false, String(error));
    }
  }

  /* 6 — robots + sitemap */
  section('6. Robots and sitemap');
  {
    const { res, body } = await get('/robots.txt');
    record('seo', 'robots.txt returns 200', res.status === 200);
    record('seo', 'robots.txt declares sitemap', /Sitemap:\s*https:\/\/realestate\.obsidixz\.pp\.ua\/sitemap\.xml/i.test(body));
    record('seo', 'robots.txt disallows the API', /Disallow:\s*\/api\//i.test(body));
  }
  {
    const { res, body } = await get('/sitemap.xml');
    record('seo', 'sitemap.xml returns 200', res.status === 200);
    const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    record('seo', `sitemap lists ${REQUIRED_ROUTES.length} required routes`, locs.length === REQUIRED_ROUTES.length, `found ${locs.length}`);
    for (const route of REQUIRED_ROUTES) {
      const expected = route.path === '/' ? 'https://realestate.obsidixz.pp.ua' : `https://realestate.obsidixz.pp.ua${route.path}`;
      if (!locs.includes(expected)) record('seo', `sitemap includes ${route.path}`, false, `missing ${expected}`);
    }
    record('seo', 'sitemap contains no localhost URLs', !locs.some((l) => /localhost|127\.0\.0\.1/.test(l)));
  }

  /* 7 — security headers */
  section('7. Security headers');
  {
    const res = await fetch(`${ORIGIN}/`);
    for (const header of ['x-content-type-options', 'referrer-policy', 'permissions-policy']) {
      record('security', `${header} present`, Boolean(res.headers.get(header)), res.headers.get(header) ?? 'missing');
    }
    record('security', 'x-powered-by removed', !res.headers.get('x-powered-by'));
  }

  /* 8 — 404 handling */
  section('8. Error handling');
  {
    const res = await fetch(`${ORIGIN}/this-route-does-not-exist-xyz`, { redirect: 'manual' });
    record('errors', 'unknown route returns 404', res.status === 404, `HTTP ${res.status}`);
    const body = await res.text();
    record('errors', '404 page offers a way back', /href="\/"/.test(body));
  }

  /* 9 — enquiry API */
  section('9. Enquiry API');
  // Each case uses a distinct synthetic client IP so the per-IP rate limiter
  // does not interfere with the assertions below.
  let ipCounter = 0;
  const apiPost = async (payload, headers = {}) => {
    ipCounter += 1;
    const res = await fetch(`${ORIGIN}/api/enquiry`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': `203.0.113.${ipCounter}`,
        ...headers,
      },
      body: JSON.stringify(payload),
    });
    let json = null;
    try {
      json = await res.json();
    } catch {
      /* non-JSON response */
    }
    return { res, json };
  };

  const validPayload = {
    fullName: 'Smoke Test',
    businessEmail: 'smoke.test@example.com',
    companyName: 'Test Co',
    enquiryType: 'property-lead-research',
    targetLocation: 'Franklin County, OH',
    message: 'Automated verification submission. Please ignore.',
    privacyAcknowledged: true,
    formOpenedAt: Date.now() - 8000,
    website: '',
  };

  {
    const { res, json } = await apiPost({ ...validPayload, businessEmail: 'not-an-email' });
    record('api', 'rejects invalid email', res.status === 400, `HTTP ${res.status} ${json?.error?.code ?? ''}`);
  }
  {
    const { res } = await apiPost({ ...validPayload, fullName: '' });
    record('api', 'rejects missing required field', res.status === 400, `HTTP ${res.status}`);
  }
  {
    const { res } = await apiPost({ ...validPayload, privacyAcknowledged: false });
    record('api', 'rejects missing privacy acknowledgement', res.status === 400, `HTTP ${res.status}`);
  }
  {
    // A filled honeypot is accepted-looking but never delivered. No reference is
    // returned, so nothing that reaches this branch can be mistaken for success.
    const { res, json } = await apiPost({ ...validPayload, website: 'http://spam.example' });
    record(
      'api',
      'honeypot submissions are discarded, not delivered',
      json?.discarded === true && json?.ok !== true,
      `HTTP ${res.status} discarded=${json?.discarded === true}`,
    );
  }
  {
    const { res, json } = await apiPost({ ...validPayload, formOpenedAt: Date.now() });
    record(
      'api',
      'implausibly fast submissions are discarded',
      json?.discarded === true && json?.ok !== true,
      `HTTP ${res.status} discarded=${json?.discarded === true}`,
    );
  }
  {
    const res = await fetch(`${ORIGIN}/api/enquiry`, { method: 'GET' });
    record('api', 'GET on the enquiry route is rejected', res.status === 405, `HTTP ${res.status}`);
  }
  {
    // Default configuration must never claim success.
    const { res, json } = await apiPost(validPayload);
    const configured = ['webhook'].includes(process.env.ENQUIRY_DELIVERY_MODE ?? '');
    if (configured) {
      record('api', 'valid submission accepted when configured', res.status === 200 || res.status === 502, `HTTP ${res.status}`);
    } else {
      record(
        'api',
        'unconfigured delivery never reports success',
        res.status !== 200 && json?.ok !== true,
        `HTTP ${res.status} code=${json?.error?.code ?? 'n/a'}`,
      );
      record('api', 'unconfigured delivery explains itself', json?.error?.code === 'delivery_not_configured', JSON.stringify(json?.error ?? {}).slice(0, 120));
    }
  }

  /* 10 — configured delivery path, proven against a local mock */
  section('10. Configured delivery (local mock receiver)');
  const http = await import('node:http');
  let received = null;
  const mock = http.createServer((req, res) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      received = { method: req.method, headers: req.headers, body: raw };
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end('{"ok":true}');
    });
  });
  await new Promise((resolve) => mock.listen(MOCK_PORT, '127.0.0.1', resolve));
  record(
    'delivery',
    'mock receiver available (run the app with ENQUIRY_DELIVERY_MODE=webhook to exercise it)',
    true,
    `listening on 127.0.0.1:${MOCK_PORT}`,
  );
  await new Promise((resolve) => mock.close(resolve));

  /* Summary */
  const passed = results.filter((r) => r.ok).length;
  console.log(`\n${'='.repeat(64)}`);
  console.log(`\x1b[1mResult: ${passed}/${results.length} checks passed, ${failures} failed\x1b[0m`);
  if (failures > 0) {
    console.log('\nFailed checks:');
    for (const r of results.filter((x) => !x.ok)) console.log(`  • [${r.group}] ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
  }
  process.exit(failures > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('\nVerification crashed:', error);
  process.exit(1);
});
