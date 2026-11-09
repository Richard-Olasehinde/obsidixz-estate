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
 * Founder-supplied values.
 *
 * The business email below is the founder-confirmed official address
 * (2026-11-06), not an invented one. It is a deliberate, dated default so the
 * published site and its legal pages always show a working contact route even
 * when the deployment environment has not set the variable. The environment
 * variable still wins, so the address can be changed by configuration alone.
 *
 * The telephone number has NOT been confirmed and remains blank. It is not
 * defaulted, not inferred and not published.
 */
const CONFIRMED_BUSINESS_EMAIL = 'obsidixz.realestate@outlook.com';

export const businessContact = {
  email: (process.env.NEXT_PUBLIC_BUSINESS_EMAIL ?? '').trim() || CONFIRMED_BUSINESS_EMAIL,
  phone: (process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? '').trim(),
} as const;

export const hasPublicPhone = businessContact.phone.length > 0;

/**
 * Business address — CONFIRMED BY THE FOUNDER 2026-11-06.
 *
 * Supplied directly by the founder as the real trading address, on the stated
 * principle that transparency is a core value of the business. It is recorded
 * here as fact, not assumed, inferred or approximated.
 *
 * It is deliberately NOT yet rendered on any public page. Publishing a
 * residential address on a public website is a decision with consequences that
 * a form field does not carry — see DECISION_LOG.md D56. Nothing is hidden: the
 * website states plainly that the business operates remotely, and the address is
 * available on request and to the email provider.
 */
export const businessAddress = {
  street: 'No 4, Adeoye Street',
  city: 'Ibadan',
  postalCode: '200109',
  country: 'Nigeria',
  /** Single-line form, for legal pages or email footers if ever published. */
  formatted: 'No 4, Adeoye Street, Ibadan 200109, Nigeria',
} as const;

/**
 * Details that must be supplied before launch. Kept as a single readable list
 * so the founder can work through it, and reused by the legal pages to render
 * explicitly marked placeholders instead of invented facts.
 */
export const PENDING_BUSINESS_DETAILS = {
  legalEntityName: null,
  // Resolved 2026-11-06: founder supplied the real trading address.
  registeredAddress: 'supplied',
  companyRegistrationNumber: null,
  governingLaw: null,
  privacyContactEmail: null,
  dataRetentionPeriod: null,
  hostingRegion: null,
  // Resolved 2026-11-06: the founder supplied the transparent logo pair. See
  // public/brand/ and DECISION_LOG.md D48.
  approvedLogoAsset: 'supplied',
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
