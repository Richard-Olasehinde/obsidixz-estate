import type { Metadata } from 'next';
import { Section } from '@/components/layout/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ButtonLink } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'The page you requested could not be found on the Obsidixz Real Estate website.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <Section tone="white" spacing="lg">
      <div className="max-w-2xl">
        <p className="font-display text-[0.75rem] font-bold uppercase tracking-[0.2em] text-gold">
          404
        </p>
        <SectionHeading
          as="h1"
          title="This page could not be found"
          intro="The address you followed may be out of date, or the page may have moved. The links below will take you back to the main parts of the website."
          className="mt-4"
        />
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/" variant="primary" size="lg">
            Return to the homepage
          </ButtonLink>
          <ButtonLink href="/contact" variant="secondary" size="lg">
            Contact us
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}
