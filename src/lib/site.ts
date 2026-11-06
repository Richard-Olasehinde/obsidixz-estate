/**
 * Central site configuration.
 *
 * Every piece of business-identifying information that is NOT yet confirmed by
 * the founder lives in `PENDING_BUSINESS_DETAILS` so it can be found, reviewed
 * and supplied in one place. Nothing here invents a fact: blank values are
 * blank on purpose and are surfaced in the UI / documentation as pending.
 */

const FALLBACK_SITE_URL = 'https://realestate.obsidixz.pp.ua';

function normaliseUrl(value: string | undefined): string {
  const raw = (value ?? '').trim();
  if (!raw) return FALLBACK_SITE_URL;
  try {
    const url = new URL(raw);
    return `${url.protocol}//${url.host}`;
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export const siteConfig = {
  name: 'Obsidixz Real Estate',
  shortName: 'Obsidixz',
  parentOrganisation: 'Obsidixz',
  url: normaliseUrl(process.env.NEXT_PUBLIC_SITE_URL),
  domain: 'realestate.obsidixz.pp.ua',
  tagline: 'Real-estate research and lead generation',
  positioning:
    'Helping property professionals identify relevant opportunities through useful real-estate research and lead generation.',
  description:
    'Obsidixz Real Estate helps US residential real-estate investors and property acquisition operators identify relevant property prospects through structured, criteria-based research and lead generation.',
  locale: 'en_US',
  language: 'en',
  market: 'United States residential real estate',
  operatingBase: 'Nigeria (remote)',
} as const;

/**
 * Founder-supplied values. Only populate from environment variables that the
 * founder sets — never hardcode an address, phone number or mailbox here.
 */
export const businessContact = {
  email: (process.env.NEXT_PUBLIC_BUSINESS_EMAIL ?? '').trim(),
  phone: (process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? '').trim(),
} as const;

export const hasPublicEmail = businessContact.email.length > 0;
export const hasPublicPhone = businessContact.phone.length > 0;

/**
 * Details that must be supplied before launch. Kept as a single readable list
 * so the founder can work through it, and reused by the legal pages to render
 * explicitly marked placeholders instead of invented facts.
 */
export const PENDING_BUSINESS_DETAILS = {
  legalEntityName: null,
  registeredAddress: null,
  companyRegistrationNumber: null,
  governingLaw: null,
  privacyContactEmail: null,
  dataRetentionPeriod: null,
  hostingRegion: null,
  approvedLogoAsset: null,
} as const;

export type NavItem = {
  label: string;
  href: string;
  description?: string;
};

export const primaryNav: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Who We Serve', href: '/who-we-serve' },
  { label: 'Contact', href: '/contact' },
];

export const legalNav: NavItem[] = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Service', href: '/terms-of-service' },
];
