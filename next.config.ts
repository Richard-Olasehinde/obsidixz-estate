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

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  images: {
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
