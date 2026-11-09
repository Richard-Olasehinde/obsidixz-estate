import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site';

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  /** Set true for the homepage so the title is not suffixed. */
  isHome?: boolean;
  /** Optional override of the Open Graph title. */
  ogTitle?: string;
  noIndex?: boolean;
};

/**
 * Produces consistent page metadata: title, description, canonical URL,
 * Open Graph and Twitter card data. Canonical/OG URLs are always absolute and
 * derived from the configured site URL, never from the request host.
 */
export function buildMetadata({
  title,
  description,
  path,
  isHome = false,
  ogTitle,
  noIndex = false,
}: PageMetaInput): Metadata {
  const fullTitle = isHome ? title : `${title} | ${siteConfig.name}`;
  const url = `${siteConfig.url}${path === '/' ? '' : path}`;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      title: ogTitle ?? fullTitle,
      description,
      url,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} — property lead research`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle ?? fullTitle,
      description,
      images: ['/og-image.png'],
    },
  };
}
