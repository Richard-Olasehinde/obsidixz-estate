import { siteConfig } from '@/lib/site';

type BreadcrumbDataProps = {
  /** Trail excluding the home entry, which is added automatically. */
  trail: { name: string; path: string }[];
};

/**
 * BreadcrumbList JSON-LD for inner pages.
 *
 * Accurate by construction: every entry is a route that exists, and the names
 * match the page headings. No hierarchy is invented — this site is one level
 * deep, and the breadcrumb reflects exactly that.
 */
export function BreadcrumbData({ trail }: BreadcrumbDataProps) {
  const itemListElement = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
    ...trail.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 2,
      name: entry.name,
      item: `${siteConfig.url}${entry.path}`,
    })),
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement,
        }),
      }}
    />
  );
}
