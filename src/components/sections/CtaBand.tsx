import { Section } from '@/components/layout/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ButtonLink } from '@/components/ui/Button';
import { InterlockMark } from '@/components/ui/Motifs';

type CtaBandProps = {
  eyebrow?: string;
  title: string;
  body: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  id?: string;
};

/** Reusable full-width enquiry invitation used at the foot of most pages. */
export function CtaBand({
  eyebrow = 'Start a conversation',
  title,
  body,
  primaryLabel = 'Discuss Your Requirements',
  primaryHref = '/contact',
  secondaryLabel = 'Explore Our Services',
  secondaryHref = '/services',
  id,
}: CtaBandProps) {
  return (
    <Section id={id} tone="ink" spacing="lg" className="overflow-hidden">
      <div aria-hidden="true" className="grid-lines pointer-events-none absolute inset-0 opacity-70" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 hidden text-white/10 lg:block"
      >
        <InterlockMark className="h-64 w-64" />
      </div>
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading eyebrow={eyebrow} title={title} intro={body} tone="dark" className="lg:max-w-2xl" />
        <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0 lg:pb-1">
          <ButtonLink href={primaryHref} variant="primary" size="lg">
            {primaryLabel}
          </ButtonLink>
          {secondaryLabel ? (
            <ButtonLink href={secondaryHref} variant="inverse" size="lg">
              {secondaryLabel}
            </ButtonLink>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
