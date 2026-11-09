/**
 * Required for `output: 'export'`. These routes are metadata generators that
 * produce a static file; without this Next refuses to export them.
 */
export const dynamic = 'force-static';

import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: '/',
    scope: '/',
    display: 'browser',
    background_color: '#FFFFFF',
    theme_color: '#315C9B',
    lang: 'en-US',
    dir: 'ltr',
    categories: ['business', 'services'],
    icons: [
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
