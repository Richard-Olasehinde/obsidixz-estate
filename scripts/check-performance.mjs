#!/usr/bin/env node
/**
 * Production performance budget check.
 *
 * Runs against a served production build (npm run build && npm run start) and
 * measures what a visitor actually transfers, not what the source tree weighs.
 *
 *   SITE_ORIGIN=http://localhost:3100 npm run perf
 *
 * Budgets are deliberately simple and conservative for a small business site.
 * A failure here is a signal to look, not a hard architectural rule — but it
 * should never be raised silently to make a build green.
 */
const ORIGIN = (process.env.SITE_ORIGIN || 'http://localhost:3100').replace(/\/$/, '');

/**
 * `fetch()` transparently decompresses, so its reported length is the *decoded*
 * size — the wrong number for a transfer budget. This uses the raw http client
 * and counts bytes as they arrive, which is what the visitor actually downloads.
 */
import http from 'node:http';
import https from 'node:https';

function rawGet(url, extraHeaders = {}) {
  const client = url.startsWith('https:') ? https : http;
  return new Promise((resolve, reject) => {
    const req = client.get(
      url,
      {
        headers: {
          'accept-encoding': 'gzip, br, deflate',
          'user-agent': 'obsidixz-perf-check/1.0',
          ...extraHeaders,
        },
      },
      (res) => {
        let bytes = 0;
        res.on('data', (chunk) => {
          bytes += chunk.length;
        });
        res.on('end', () =>
          resolve({
            bytes,
            status: res.statusCode,
            headers: res.headers,
            encoding: res.headers['content-encoding'] ?? 'identity',
          }),
        );
        res.on('error', reject);
      },
    );
    req.on('error', reject);
    req.setTimeout(15000, () => req.destroy(new Error('timeout')));
  });
}

/** Fetches decoded text (for parsing HTML), separately from the byte budget. */
async function getText(url) {
  const res = await fetch(url);
  return res.text();
}

const BUDGETS = {
  /** Gzipped JS a first-time visitor must download for the heaviest page. */
  jsGzipKbPerPage: 220,
  /** Gzipped HTML. Server-rendered marketing pages should be small. */
  htmlGzipKbPerPage: 40,
  /** Gzipped CSS. */
  cssGzipKbPerPage: 20,
  /** Bytes of an above-the-fold hero image at 1200px in the best supported format. */
  heroImageKb: 120,
};

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m'}  ${name}${detail ? `\n      ${detail}` : ''}`);
}

async function transferSize(url, headers = {}) {
  const { bytes, headers: resHeaders } = await rawGet(url, headers);
  return { bytes, type: resHeaders['content-type'] ?? '' };
}

const pages = ['/', '/about', '/services', '/how-it-works', '/who-we-serve', '/contact', '/privacy-policy', '/terms-of-service'];

console.log(`\nPerformance budget — measuring ${ORIGIN}`);
console.log('='.repeat(64));

let worstJs = { page: '', kb: 0 };
let worstHtml = { page: '', kb: 0 };

for (const page of pages) {
  const html = await getText(`${ORIGIN}${page}`);

  const assetUrls = new Set();
  for (const match of html.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+)"/g)) {
    assetUrls.add(match[1]);
  }

  const js = [...assetUrls].filter((u) => u.endsWith('.js'));
  const css = [...assetUrls].filter((u) => u.endsWith('.css'));

  let jsBytes = 0;
  for (const asset of js) jsBytes += (await transferSize(`${ORIGIN}${asset}`)).bytes;
  let cssBytes = 0;
  for (const asset of css) cssBytes += (await transferSize(`${ORIGIN}${asset}`)).bytes;
  const htmlBytes = (await transferSize(`${ORIGIN}${page}`)).bytes;

  const jsKb = jsBytes / 1024;
  const cssKb = cssBytes / 1024;
  const htmlKb = htmlBytes / 1024;

  if (jsKb > worstJs.kb) worstJs = { page, kb: jsKb };
  if (htmlKb > worstHtml.kb) worstHtml = { page, kb: htmlKb };

  check(
    `${page} JS within budget`,
    jsKb <= BUDGETS.jsGzipKbPerPage,
    `${jsKb.toFixed(0)} KB gzip (${js.length} files, budget ${BUDGETS.jsGzipKbPerPage} KB)`,
  );
  check(`${page} HTML within budget`, htmlKb <= BUDGETS.htmlGzipKbPerPage, `${htmlKb.toFixed(1)} KB gzip (budget ${BUDGETS.htmlGzipKbPerPage} KB)`);
  check(`${page} CSS within budget`, cssKb <= BUDGETS.cssGzipKbPerPage, `${cssKb.toFixed(1)} KB gzip (budget ${BUDGETS.cssGzipKbPerPage} KB)`);
}

/* Hero image: must be served in a modern format and within budget. */
{
  const url = `${ORIGIN}/_next/image?url=%2Fimages%2Fhero-neighbourhood.jpg&w=1200&q=75`;
  const avif = await transferSize(url, { accept: 'image/avif,image/webp,*/*' });
  check(
    'hero image is served as AVIF when supported',
    avif.type.includes('avif'),
    `${(avif.bytes / 1024).toFixed(0)} KB, ${avif.type}`,
  );
  check(
    'hero image within budget',
    avif.bytes / 1024 <= BUDGETS.heroImageKb,
    `${(avif.bytes / 1024).toFixed(0)} KB (budget ${BUDGETS.heroImageKb} KB)`,
  );
}

/* Static assets must be immutable-cacheable. */
{
  const html = await getText(`${ORIGIN}/`);
  const firstJs = html.match(/\/_next\/static\/[^"]+\.js/)?.[0];
  if (firstJs) {
    const res = await rawGet(`${ORIGIN}${firstJs}`);
    const cacheControl = res.headers['cache-control'] ?? '';
    check(
      'hashed static assets are immutable-cacheable',
      /max-age=\d{6,}/.test(cacheControl) && /immutable/.test(cacheControl),
      cacheControl || 'no cache-control header',
    );
  } else {
    check('hashed static assets are immutable-cacheable', false, 'no static chunk found on the homepage');
  }
}

/* Compression must be on. */
{
  const gz = await rawGet(`${ORIGIN}/`);
  const plain = await rawGet(`${ORIGIN}/`, { 'accept-encoding': 'identity' });
  check(
    'HTML is compressed in transit',
    gz.encoding !== 'identity',
    `${gz.encoding}: ${(plain.bytes / 1024).toFixed(0)} KB uncompressed → ${(gz.bytes / 1024).toFixed(0)} KB on the wire`,
  );
}

const failed = results.filter((r) => !r.ok);
console.log('\n' + '='.repeat(64));
console.log(`Heaviest JS:   ${worstJs.page} at ${worstJs.kb.toFixed(0)} KB gzip`);
console.log(`Heaviest HTML: ${worstHtml.page} at ${worstHtml.kb.toFixed(1)} KB gzip`);
console.log(`Result: ${results.length - failed.length}/${results.length} performance checks passed, ${failed.length} failed`);
process.exit(failed.length > 0 ? 1 : 0);
