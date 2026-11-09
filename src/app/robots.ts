/**
 * Required for `output: 'export'`. These routes are metadata generators that
 * produce a static file; without this Next refuses to export them.
 */
export const dynamic = 'force-static';

import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        // There is no API surface left: the site is fully static and contact
        // happens through the visitor's own email application.
        allow: '/',
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
