import type { Metadata } from 'next';
import { Section } from '@/components/layout/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PageHero } from '@/components/sections/PageHero';
import { BreadcrumbData } from '@/components/seo/BreadcrumbData';
import { CtaBand } from '@/components/sections/CtaBand';
import { ButtonLink } from '@/components/ui/Button';
import { FieldList } from '@/components/ui/FieldList';
import { Diamond } from '@/components/ui/Motifs';
import { Card, CardTitle, CardBody } from '@/components/ui/Card';
import { buildMetadata } from '@/lib/metadata';
import { deliverableFields, serviceScope } from '@/lib/content';

export const metadata: Metadata = buildMetadata({
  title: 'Property Lead Research Services',
  description:
    'Property Lead Research from Obsidixz Real Estate: criteria-based US residential property prospects with sources, qualification notes and identified gaps.',
  path: '/services',
});

const formatOptions = [
  {
    title: 'Spreadsheet',
    body: 'One row per prospect, one column per agreed field, with source references and verification notes in dedicated columns. The practical format if you want to sort, filter and work through the list yourself.',
  },
  {
    title: 'Written report',
    body: 'A document with a short profile per prospect and a narrative qualification note. More readable where the research is being shared with a partner or reviewed at a meeting.',
  },
  {
    title: 'Both',
    body: 'A spreadsheet as the working artefact plus a summary report. Useful where one person will work the list and another needs the overview.',
  },
];

export default function ServicesPage() {
  return (
    <>
      <BreadcrumbData trail={[{ name: 'Services', path: '/services' }]} />
      <PageHero
        eyebrow="Services"
        title="Property Lead Research"
        intro="You set the target location and the property criteria. We research potential property prospects against them, gather the publicly available information that bears on your criteria, and deliver it in a structured format that explains why each prospect is there."
        meta="Primary service · Begins with your brief"
      >
        <ButtonLink href="/contact" variant="primary" withArrow>
          Discuss Your Requirements
        </ButtonLink>
        <ButtonLink href="/how-it-works" variant="inverse">
          See the process
        </ButtonLink>
      </PageHero>

      {/* What the service does */}
      <Section tone="white" spacing="lg" aria-labelledby="scope-heading">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <SectionHeading
            eyebrow="What it is"
            title={<span id="scope-heading">Research against your criteria</span>}
            intro="A single, defined service rather than a menu. The scope of each engagement is agreed with you before research begins."
          />

          <div className="grid gap-px border border-charcoal/10 bg-charcoal/10 sm:grid-cols-2">
            {serviceScope.map((item, index) => (
              <div key={item.title} className="bg-white p-6">
                <span
                  aria-hidden="true"
                  className="font-display text-[0.72rem] font-bold tracking-[0.16em] text-gold"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-[1.02rem] font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-[0.92rem] leading-relaxed text-charcoal/80">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* The process, condensed */}
      <Section tone="mist" spacing="lg" aria-labelledby="process-heading">
        <SectionHeading
          eyebrow="How the work runs"
          title={<span id="process-heading">From your brief to the finished research</span>}
        />
        <ol className="mt-10 grid gap-px border border-charcoal/10 bg-charcoal/10 sm:grid-cols-2 xl:grid-cols-5">
          {[
            { title: 'You provide requirements', body: 'Target location, property type, size and the criteria that matter.' },
            { title: 'Prospects are researched', body: 'Potential matches are identified and researched individually, by hand.' },
            { title: 'Information is collected and reviewed', body: 'Available details are gathered, then cross-checked against their sources.' },
            { title: 'Prospects are organised', body: 'Results are sorted and annotated against the agreed criteria.' },
            { title: 'Research is delivered', body: 'You receive the structured file in the agreed format.' },
          ].map((step, index) => (
            <li key={step.title} className="bg-white p-6">
              <span
                aria-hidden="true"
                className="font-display text-[0.72rem] font-bold tracking-[0.16em] text-royal"
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-3 text-[0.98rem] font-semibold leading-snug text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-[0.9rem] leading-relaxed text-charcoal/75">{step.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8">
          <ButtonLink href="/how-it-works" variant="secondary">
            Read the full five-step process
          </ButtonLink>
        </div>
      </Section>

      {/* What you receive */}
      <Section tone="ink" spacing="lg" aria-labelledby="deliverable-heading">
        <div aria-hidden="true" className="grid-lines pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative">
          <SectionHeading
            eyebrow="What you receive"
            tone="dark"
            title={<span id="deliverable-heading">The information, field by field</span>}
            intro="The deliverable may include the following. Availability varies by property and by source — not every field will be populated for every prospect, and that variability is recorded rather than smoothed over."
          />
          <div className="mt-12">
            <FieldList items={deliverableFields} tone="dark" columns={2} />
          </div>
        </div>
      </Section>

      {/* Format */}
      <Section tone="white" spacing="lg" aria-labelledby="format-heading">
        <SectionHeading
          eyebrow="Delivery format"
          title={<span id="format-heading">A format that fits how you work</span>}
          intro="The format is agreed as part of scoping. The fields, the structure and the level of detail are set before research begins."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {formatOptions.map((option) => (
            <Card key={option.title} variant="plain" className="gap-3">
              <span aria-hidden="true" className="text-gold">
                <Diamond className="h-3 w-3" />
              </span>
              <CardTitle>{option.title}</CardTitle>
              <CardBody>{option.body}</CardBody>
            </Card>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="border-l-4 border-royal bg-royal-tint px-6 py-5">
            <h3 className="font-display text-[0.78rem] font-bold uppercase tracking-[0.14em] text-royal">
              Agreed before work starts
            </h3>
            <p className="mt-2 text-[0.94rem] leading-relaxed text-charcoal/85">
              Scope, deliverable fields, format, volume, timing and any fee are confirmed in writing
              before research begins. If part of your brief cannot be supported by the available
              records, you will know at that point rather than after delivery.
            </p>
          </div>
          <div className="border-l-4 border-gold bg-gold-tint px-6 py-5">
            <h3 className="font-display text-[0.78rem] font-bold uppercase tracking-[0.14em] text-gold-deep">
              No published pricing
            </h3>
            <p className="mt-2 text-[0.94rem] leading-relaxed text-charcoal/85">
              We do not publish a price list or a fixed package, because a fair figure depends on
              the market, the criteria and the number of fields involved. Request a research
              proposal and we will set it out for your brief specifically.
            </p>
          </div>
        </div>
      </Section>

      {/* What is not offered */}
      <Section tone="mist" spacing="md" aria-labelledby="not-offered-heading">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <SectionHeading
            eyebrow="Scope limits"
            title={<span id="not-offered-heading">Services we do not offer</span>}
            intro="Stated plainly, so there is no ambiguity for either side."
          />
          {/* data-claim-exempt: this list enumerates services deliberately NOT
              offered, so the automated claim checker must not read the words as
              advertising them. See scripts/smoke-test.mjs. */}
          <ul data-claim-exempt="not-offered" className="grid gap-3 sm:grid-cols-2">
            {[
              'Property sales or purchase representation',
              'Brokerage or agency services',
              'Property management',
              'Financing or lending',
              'Wholesaling or assignment of contracts',
              'Investment, legal or tax advice',
              'Appraisals or valuations',
              'Nationwide or full-market coverage',
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 border border-charcoal/10 bg-white px-4 py-3 text-[0.92rem] text-charcoal/80"
              >
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 bg-charcoal/25" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <CtaBand
        eyebrow="Request a proposal"
        title="Tell us what you need researched"
        body="Share your target US location and the criteria a property needs to meet. We will come back with what the research would cover, what the sources can realistically support, and a proposal for your brief."
        primaryLabel="Discuss Your Requirements"
        secondaryLabel="Who We Serve"
        secondaryHref="/who-we-serve"
      />
    </>
  );
}
