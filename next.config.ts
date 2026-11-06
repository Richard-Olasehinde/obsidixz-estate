import type { NextConfig } from 'next';

/**
 * Security headers.
 *
 * Deliberately omitted:
 * - `X-Frame-Options` / `Content-Security-Policy: frame-ancestors` — nothing on this site is
 *   private or state-changing, so there is nothing for frame-busting to protect. A blanket `DENY`
 *   would break legitimate embedding and hosted preview environments.
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

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
