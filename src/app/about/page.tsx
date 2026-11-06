import type { Metadata } from 'next';
import { Section } from '@/components/layout/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PageHero } from '@/components/sections/PageHero';
import { BreadcrumbData } from '@/components/seo/BreadcrumbData';
import { CtaBand } from '@/components/sections/CtaBand';
import { ButtonLink } from '@/components/ui/Button';
import { Diamond, DivisionGrid } from '@/components/ui/Motifs';
import { Card, CardTitle, CardBody } from '@/components/ui/Card';
import { buildMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'About Us',
  description:
    'Obsidixz Real Estate is an early-stage property research and lead-generation business serving US residential investors, operating remotely as part of Obsidixz.',
  path: '/about',
});

const facts = [
  { term: 'Business', detail: 'Real-estate research and lead generation' },
  { term: 'Part of', detail: 'Obsidixz' },
  { term: 'Initial service', detail: 'Property Lead Research' },
  { term: 'Primary market', detail: 'United States — residential' },
  { term: 'Operating base', detail: 'Nigeria, operating remotely' },
  { term: 'Stage', detail: 'Early operational stage' },
];

export default function AboutPage() {
  return (
    <>
      <BreadcrumbData trail={[{ name: 'About Us', path: '/about' }]} />
      <PageHero
        eyebrow="About us"
        title="An emerging research business, described accurately"
        intro="Obsidixz Real Estate is part of the Obsidixz organisation. We research residential property prospects for US investors, and we are at an early stage of building that service. This page sets out what the business is, how it works, and what it is not."
        meta="Obsidixz Real Estate · Research and lead generation"
      >
        <ButtonLink href="/services" variant="primary" withArrow>
          Explore Our Services
        </ButtonLink>
        <ButtonLink href="/contact" variant="inverse">
          Discuss Your Requirements
        </ButtonLink>
      </PageHero>

      {/* What the business is */}
      <Section tone="white" spacing="lg" aria-labelledby="what-heading">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="The business"
              title={<span id="what-heading">What Obsidixz Real Estate is</span>}
            />
            <div className="mt-6 flex flex-col gap-5 text-[1rem] leading-relaxed text-charcoal/85">
              <p>
                Obsidixz Real Estate is a technology-enabled real-estate research and lead
                generation business. Its purpose is straightforward: help residential property
                investors spend less time finding and checking property prospects, and more time
                evaluating the ones that matter.
              </p>
              <p>
                The business sits within the wider Obsidixz organisation. It operates as its own
                service line with a defined focus — US residential real estate — rather than as a
                general advisory or property business.
              </p>
              <p>
                We are at an early operational stage. We have one service, Property Lead Research,
                and we would rather do that well than claim a breadth of capability we have not
                built.
              </p>
            </div>
          </div>

          <div className="border border-charcoal/10 bg-mist p-6 sm:p-8">
            <h3 className="font-display text-[0.72rem] font-bold uppercase tracking-[0.18em] text-royal">
              At a glance
            </h3>
            <dl className="mt-5 flex flex-col divide-y divide-charcoal/10">
              {facts.map((fact) => (
                <div key={fact.term} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:justify-between sm:gap-6">
                  <dt className="font-sans text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-charcoal/65">
                    {fact.term}
                  </dt>
                  <dd className="text-[0.95rem] font-medium text-ink sm:text-right">{fact.detail}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 border-t border-charcoal/10 pt-4 text-[0.82rem] leading-relaxed text-charcoal/60">
              No client names, transaction counts or years of experience are listed here because
              the business does not yet have a track record to report.
            </p>
          </div>
        </div>
      </Section>

      {/* Focus and audience */}
      <Section tone="mist" spacing="lg" aria-labelledby="focus-heading">
        <SectionHeading
          eyebrow="Focus"
          title={<span id="focus-heading">A deliberately narrow focus</span>}
          intro="Two things define the business: the market it serves and the kind of work it does. Both are narrow on purpose."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Card variant="plain" className="gap-4">
            <span aria-hidden="true" className="text-royal">
              <DivisionGrid className="h-10 w-10" />
            </span>
            <CardTitle>The US residential market</CardTitle>
            <CardBody>
              Our work is directed at US residential property — single-family homes and small
              residential buildings — for investors and acquisition operators working in selected
              markets. We research a location when it has been agreed as part of a brief; we do not
              claim coverage of every market, and we do not work outside the United States.
            </CardBody>
          </Card>

          <Card variant="plain" className="gap-4">
            <span aria-hidden="true" className="text-royal">
              <DivisionGrid className="h-10 w-10" />
            </span>
            <CardTitle>Research, not representation</CardTitle>
            <CardBody>
              We identify and document property prospects. We do not sell property, represent
              sellers or buyers, manage assets, arrange finance or advise on investment decisions.
              Keeping the scope this narrow is what allows the research itself to be thorough.
            </CardBody>
          </Card>
        </div>

        <div className="mt-8 border-l-2 border-gold/60 pl-5">
          <p className="max-w-3xl text-[0.95rem] leading-relaxed text-charcoal/75">
            Our initial customer segment is small US residential investors and acquisition
            operators running their own sourcing. If your requirement sits outside that, we would
            prefer to say so early than to accept work we cannot do well.
          </p>
        </div>
      </Section>

      {/* Operating philosophy */}
      <Section tone="white" spacing="lg" aria-labelledby="philosophy-heading">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <SectionHeading
            eyebrow="Operating philosophy"
            title={<span id="philosophy-heading">Research-led, by choice</span>}
            intro="The way we work follows from one view: in property research, the value is in the checking, not the searching."
          />

          <div className="flex flex-col gap-6">
            {[
              {
                title: 'Manual research is the product',
                body: 'Prospects are researched by hand against the agreed criteria. The judgement involved — deciding whether two records describe the same parcel, or whether a detail is confirmed or merely likely — is the part that matters, and it is done deliberately rather than assumed.',
              },
              {
                title: 'Technology supports the process, and that is all',
                body: 'Tools are used to organise work and reduce administrative effort internally. We do not present that as a platform, a product feature or an analytical capability. Nothing on this website asks you to believe in software you cannot see.',
              },
              {
                title: 'Accuracy before completeness',
                body: 'A deliverable that states what is unknown is more useful than one that fills every field. Missing, inconsistent and unconfirmed details are recorded in verification notes as a normal part of the output.',
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <Diamond className="mt-[0.5rem] h-2.5 w-2.5 shrink-0 text-gold" />
                <div>
                  <h3 className="text-[1.05rem] font-semibold text-ink">{item.title}</h3>
                  <p className="mt-1.5 text-[0.96rem] leading-relaxed text-charcoal/80">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Remote operation */}
      <Section tone="ink" spacing="lg" aria-labelledby="remote-heading">
        <div aria-hidden="true" className="grid-lines pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <SectionHeading
            eyebrow="How we operate"
            tone="dark"
            title={<span id="remote-heading">Based in Nigeria. Working with US clients.</span>}
            intro="Obsidixz Real Estate operates remotely from Nigeria and serves clients in the United States. That is a deliberate arrangement, and it is worth being clear about what it means in practice."
          />

          <div className="flex flex-col gap-5 text-[0.98rem] leading-relaxed text-[#aeb9c6]">
            <p>
              There is no US office and no US-based team. Research is carried out remotely using
              publicly accessible US property records and other lawfully accessible sources.
            </p>
            <p>
              Correspondence is in English and conducted in writing, which keeps a clear record of
              what was agreed for each brief. Because of the time difference, replies are not
              instantaneous during US business hours — but every enquiry receives a considered
              response rather than an automated one.
            </p>
            <p className="border-l-2 border-gold pl-4 text-[#c8d1db]">
              If a US-based presence or in-person inspection is a requirement for your process, we
              are not the right fit, and we would rather tell you that at the start.
            </p>
          </div>
        </div>
      </Section>

      {/* Relationship with Obsidixz */}
      <Section tone="white" spacing="lg" aria-labelledby="parent-heading">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <SectionHeading
            eyebrow="The parent organisation"
            title={<span id="parent-heading">Part of Obsidixz</span>}
          />
          <div className="flex flex-col gap-5 text-[1rem] leading-relaxed text-charcoal/85">
            <p>
              Obsidixz Real Estate operates under the Obsidixz parent brand and follows its approved
              visual identity — the royal blue, burnished gold and charcoal palette, Montserrat and
              Open Sans typography, and the restrained geometric treatment used throughout this
              site.
            </p>
            <p>
              The parent organisation is active in technology-enabled services. Obsidixz Real
              Estate is the real-estate research arm: it applies that orientation to a specific
              commercial problem, which is the time and checking effort involved in residential
              property prospecting.
            </p>
            <div className="mt-2 border border-charcoal/10 bg-mist px-5 py-4">
              <p className="text-[0.88rem] leading-relaxed text-charcoal/75">
                <span className="font-semibold text-ink">What this page does not claim:</span> any
                founding history, registration details, staff numbers, certifications, awards,
                client list or completed transactions. None of these have been supplied, and none
                are stated anywhere on this website.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <CtaBand
        eyebrow="Next step"
        title="If this sounds like the right kind of help"
        body="Send your target location and the criteria that matter to you. We will tell you honestly whether the available records can support what you are asking for."
        primaryLabel="Discuss Your Requirements"
        secondaryLabel="Read about the service"
        secondaryHref="/services"
      />
    </>
  );
}
