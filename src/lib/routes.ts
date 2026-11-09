/**
 * Single source of truth for public routes.
 *
 * Consumed by:
 *  - `app/sitemap.ts`      → XML sitemap
 *  - `scripts/smoke-test.mjs` → route verification
 *  - footer / navigation helpers
 *
 * Adding a page means adding it here; the sitemap and the tests follow
 * automatically, so a route cannot be silently left out of either.
 */

export type RouteDefinition = {
  path: string;
  /** Expected `<title>` value (exact). */
  title: string;
  /** Short description used for verification, not for rendering. */
  description: string;
  /** Included in the XML sitemap. Legal pages are included; 404 is not. */
  inSitemap: boolean;
  changeFrequency: 'weekly' | 'monthly' | 'yearly';
  priority: number;
};

export const routes: RouteDefinition[] = [
  {
    path: '/',
    title: 'Obsidixz Real Estate — US Property Lead Research',
    description: 'Homepage',
    inSitemap: true,
    changeFrequency: 'monthly',
    priority: 1,
  },
  {
    path: '/about',
    title: 'About Us | Obsidixz Real Estate',
    description: 'Business background and operating philosophy',
    inSitemap: true,
    changeFrequency: 'yearly',
    priority: 0.7,
  },
  {
    path: '/services',
    title: 'Property Lead Research Services | Obsidixz Real Estate',
    description: 'Property Lead Research in detail',
    inSitemap: true,
    changeFrequency: 'monthly',
    priority: 0.9,
  },
  {
    path: '/how-it-works',
    title: 'How It Works | Obsidixz Real Estate',
    description: 'The five-step research workflow',
    inSitemap: true,
    changeFrequency: 'yearly',
    priority: 0.8,
  },
  {
    path: '/who-we-serve',
    title: 'Who We Serve | Obsidixz Real Estate',
    description: 'Residential investors and acquisition operators',
    inSitemap: true,
    changeFrequency: 'yearly',
    priority: 0.7,
  },
  {
    path: '/contact',
    title: 'Contact | Obsidixz Real Estate',
    description: 'Enquiry form and contact information',
    inSitemap: true,
    changeFrequency: 'yearly',
    priority: 0.9,
  },
  {
    path: '/privacy-policy',
    title: 'Privacy Policy | Obsidixz Real Estate',
    description: 'How enquiry information is handled',
    inSitemap: true,
    changeFrequency: 'yearly',
    priority: 0.4,
  },
  {
    path: '/terms-of-service',
    title: 'Terms of Service | Obsidixz Real Estate',
    description: 'Terms governing website use and the research service',
    inSitemap: true,
    changeFrequency: 'yearly',
    priority: 0.4,
  },
];

export const sitemapRoutes = routes.filter((route) => route.inSitemap);
