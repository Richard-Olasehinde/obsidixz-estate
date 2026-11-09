import type { NextConfig } from 'next';

/**
 * Security headers.
 *
 * Deliberately omitted:
 * - `X-Frame-Options` / `Content-Security-Policy: frame-ancestors` — nothing on this site is
 *   private or state-changing, so there is nothing for frame-busting to protect, and framing is
 *   not an attack surface here. Kept out deliberately: an earlier justification claimed a blanket
 *   `DENY` would break hosted previews, which is not true (the preview proxies the app directly).
 *   If framing protection is ever wanted it can be added as `SAMEORIGIN` with no downside.
 * - `Strict-Transport-Security` — only meaningful over HTTPS at the production host, where the
 *   host (e.g. Vercel) manages it. Documented in DEPLOYMENT.md.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
];

/**
 * Sub-path hosting.
 *
 * Blank by default, which is correct for a domain root, a subdomain, or any
 * host serving the site at "/" (vercel.app, pages.dev, netlify.app). Set
 * NEXT_PUBLIC_BASE_PATH=/<repo> only for a GitHub Pages *project* site, which
 * serves from https://<user>.github.io/<repo>/. Without it every asset and
 * route URL would resolve one level too high — the HTML would return 200 while
 * all CSS, JS and links 404'd.
 */
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').trim().replace(/\/$/, '');

/**
 * TRUE STATIC EXPORT.
 *
 * `next build` on its own produces a server-runnable build: the HTML lives in
 * `.next/server/app/`, which the Next server knows how to serve and a plain
 * static host does not. Uploading `.next/` to GitHub Pages therefore yields a
 * site whose `index.html` is not at the artifact root — every URL 404s.
 *
 * Setting NEXT_OUTPUT_EXPORT=1 switches to `output: 'export'`, which emits a
 * genuinely static `out/` directory with `index.html` at the root. CI sets it;
 * local development and `next start` do not, so the existing verification
 * workflow is unaffected.
 *
 * Two consequences, both deliberate:
 *  - `images.unoptimized` is required, because a static export cannot re-encode
 *    images on demand. The committed artwork is already sized for its use.
 *  - `trailingSlash` is enabled so `/contact` is emitted as
 *    `contact/index.html`, which is what GitHub Pages serves for a directory.
 */
const staticExport = process.env.NEXT_OUTPUT_EXPORT === '1';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  ...(staticExport ? { output: 'export' as const, trailingSlash: true } : {}),
  images: {
    ...(staticExport ? { unoptimized: true } : {}),
    // The served artwork is one generation from the supplied originals, which
    // peak at 1408x768, so 1280 is the widest size worth offering. Listed
    // explicitly because a static export cannot re-encode images on demand.
    deviceSizes: [320, 420, 640, 768, 1024, 1200, 1280],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
