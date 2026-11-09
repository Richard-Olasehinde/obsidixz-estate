import { siteConfig } from '@/lib/site';

/**
 * JSON-LD for the homepage.
 *
 * Deliberately limited to fields that are verified:
 *   name, url, description, logo, areaServed (region-level only).
 *
 * Deliberately absent: postal address, telephone, founding date, employee count,
 * price range, ratings, reviews, social profiles. None of those have been
 * supplied, and inventing them would both mislead visitors and breach search
 * quality guidance.
 *
 * `areaServed` names the *market being served*, not an operational office.
 */
export function SiteStructuredData() {
  const organisation = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    alternateName: siteConfig.parentOrganisation,
    url: siteConfig.url,
    logo: `${siteConfig.url}/apple-touch-icon.png`,
    description: siteConfig.description,
    slogan: siteConfig.positioning,
    areaServed: {
      '@type': 'Country',
      name: 'United States',
    },
    knowsAbout: [
      'Real estate research',
      'Property lead research',
      'Residential property prospecting',
      'Property acquisition research',
    ],
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    inLanguage: 'en-US',
    publisher: { '@id': `${siteConfig.url}/#organization` },
  };

  return (
    <script
      type="application/ld+json"
      // Content is a static, developer-authored object — no user input is interpolated.
      dangerouslySetInnerHTML={{ __html: JSON.stringify([organisation, website]) }}
    />
  );
}
