import type { Metadata } from 'next';
import { LegalPageLayout } from '@/components/sections/LegalPage';
import { buildMetadata } from '@/lib/metadata';
import { privacySections } from '@/lib/legal';

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy',
  description:
    'How Obsidixz Real Estate handles information submitted through the website enquiry form, what is collected during ordinary website operation, and how to make a privacy request.',
  path: '/privacy-policy',
});

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="Privacy Policy"
      intro="What this website collects, why it is collected, and what happens to it. Written to describe the site as it is actually built rather than a generic template."
      sections={privacySections}
      basePath="/privacy-policy"
      crossLink={{ label: 'Terms of Service', href: '/terms-of-service' }}
    />
  );
}
