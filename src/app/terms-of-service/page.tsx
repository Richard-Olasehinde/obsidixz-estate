import type { Metadata } from 'next';
import { LegalPageLayout } from '@/components/sections/LegalPage';
import { buildMetadata } from '@/lib/metadata';
import { termsSections } from '@/lib/legal';

export const metadata: Metadata = buildMetadata({
  title: 'Terms of Service',
  description:
    'The terms that govern use of the Obsidixz Real Estate website and the nature of the property lead research service, including what the service does not promise.',
  path: '/terms-of-service',
});

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="Terms of Service"
      intro="The terms for using this website, the nature of the research service, and — set out plainly — the outcomes the service does not promise."
      sections={termsSections}
      basePath="/terms-of-service"
      crossLink={{ label: 'Privacy Policy', href: '/privacy-policy' }}
    />
  );
}
