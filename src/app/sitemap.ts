/**
 * Required for `output: 'export'`. These routes are metadata generators that
 * produce a static file; without this Next refuses to export them.
 */
export const dynamic = 'force-static';

import type { MetadataRoute } from 'next';
import { sitemapRoutes } from '@/lib/routes';
import { siteConfig } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return sitemapRoutes.map((route) => ({
    url: route.path === '/' ? siteConfig.url : `${siteConfig.url}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
