import Image from 'next/image';
import type { Metadata } from 'next';
import { Section } from '@/components/layout/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { CardTitle } from '@/components/ui/Card';
import { ButtonLink } from '@/components/ui/Button';
import { Diamond } from '@/components/ui/Motifs';
import { FieldList } from '@/components/ui/FieldList';
import { ProcessSteps } from '@/components/ui/ProcessSteps';
import { CtaBand } from '@/components/sections/CtaBand';
import { HomeHero } from '@/components/sections/HomeHero';
import { buildMetadata } from '@/lib/metadata';
import { homeBriefInputs, homeDeliverableGroups, researchChallenges } from '@/lib/content';

export const metadata: Metadata = buildMetadata({
  title: 'Obsidixz Real Estate — US Property Lead Research',
  description:
    'Manual US residential property research for independent investors and small acquisition teams, with agreed criteria, source references and uncertainty notes.',
  path: '/',
  isHome: true,
  ogTitle: 'Smarter Research. Better Real Estate Opportunities.',
});

export default function HomePage() {
  return (
    <>
      {/* Hero: audience, service and the next step. */}
      <HomeHero />

      {/* The research challenge: why scattered records need careful checking. */}
      <Section tone="mist" spacing="lg" aria-labelledby="challenge-heading">
        <SectionHeading
          eyebrow="The research challenge"
          title={<span id="challenge-heading">Finding a prospect is only the beginning.</span>}
          intro="Property details are spread across separate public records. The work is matching a brief to those records, then checking that the parcel and details line up."
        />

        <div className="mt-12 grid gap-px border border-charcoal/10 bg-charcoal/10 sm:grid-cols-2 lg:grid-cols-3">
          {researchChallenges.map((item) => (
            <div key={item.title} className="bg-white p-7 sm:p-8">
              <CardTitle>{item.title}</CardTitle>
              <p className="mt-3 text-[0.97rem] leading-relaxed text-charcoal/80">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Inputs and research: a concrete brief, not a claimed client example. */}
      <Section tone="white" spacing="lg" aria-labelledby="brief-heading">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Your brief"
              title={<span id="brief-heading">Research starts with your requirements</span>}
              intro="Tell us what you are looking for. We confirm what available records can support and agree the scope before research begins."
            />

            <dl className="mt-8 divide-y divide-charcoal/10 border-y border-charcoal/10">
              {homeBriefInputs.map((item) => (
                <div key={item.label} className="grid gap-1.5 py-4 sm:grid-cols-[8.5rem_1fr] sm:gap-5">
                  <dt className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-royal">
                    {item.label}
                  </dt>
                  <dd className="text-[0.93rem] leading-relaxed text-charcoal/80">{item.body}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-5 text-[0.84rem] leading-relaxed text-charcoal/60">
              These are illustrative brief details only—not an actual client request, available
              property or promise that every condition can be researched.
            </p>
            <div className="mt-6">
              <ButtonLink href="/contact" variant="secondary">
                Discuss Your Requirements
              </ButtonLink>
            </div>
          </div>

          <figure className="relative">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-mist">
              <Image
                src="/images/research-desk.jpg"
                alt="A printed property research schedule, notebook and pen arranged on a desk"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-3 flex items-start gap-2 text-[0.82rem] leading-relaxed text-charcoal/60">
              <Diamond className="mt-1 h-2 w-2 shrink-0 text-gold" />
              <span>Illustrative image. Research is reviewed against the agreed brief.</span>
            </figcaption>
            <p className="mt-6 border-l-2 border-royal pl-4 text-[0.9rem] leading-relaxed text-charcoal/75">
              This is a research service, not brokerage, property management or sales representation.
              A criteria match does not establish that a property is available or that an owner wants
              to sell.
            </p>
          </figure>
        </div>
      </Section>

      {/* Deliverable: field groups, sources and the limits of recorded information. */}
      <Section tone="ink" spacing="lg" aria-labelledby="deliverables-heading">
        <div aria-hidden="true" className="grid-lines pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative">
          <SectionHeading
            eyebrow="What you receive"
            tone="dark"
            title={<span id="deliverables-heading">A structured file you can review</span>}
            intro="A spreadsheet or report, with fields agreed in advance. The file records what was found and makes missing or uncertain details visible."
          />

          <div className="mt-10">
            <FieldList items={homeDeliverableGroups} tone="dark" columns={2} />
          </div>

          <div className="mt-8 flex flex-col gap-4 border-t border-white/12 pt-7 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-3xl text-[0.9rem] leading-relaxed text-[#9da9b7]">
              Owner or contact information is included only when appropriate and lawfully available
              or obtained; it is not assumed for every property. Research does not promise a motivated
              seller, a profitable deal or an investment return.
            </p>
            <ButtonLink href="/services" variant="inverse" className="shrink-0">
              See the service details
            </ButtonLink>
          </div>
        </div>
      </Section>

      {/* Process: from the email discussion to delivery. */}
      <Section tone="mist" spacing="lg" aria-labelledby="process-heading">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="How it works"
            title={<span id="process-heading">From email discussion to research file</span>}
            intro="We agree what to research and what the available sources can support before work starts."
          />
          <div className="shrink-0">
            <ButtonLink href="/how-it-works" variant="secondary">
              Read the full process
            </ButtonLink>
          </div>
        </div>

        <div className="mt-10">
          <ProcessSteps variant="compact" />
        </div>
      </Section>

      {/* Research standards: one concise explanation, not another promise stack. */}
      <Section tone="white" spacing="md" aria-labelledby="standards-heading">
        <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-16">
          <SectionHeading
            eyebrow="Research standards"
            title={<span id="standards-heading">Sources and uncertainty stay visible</span>}
          />
          <p className="max-w-3xl border-l-2 border-royal pl-5 text-[1rem] leading-relaxed text-charcoal/80">
            Prospects are reviewed against the agreed criteria. Source references and the research
            date show where information came from; missing, conflicting or unconfirmed details are
            noted rather than filled in by assumption.
          </p>
        </div>
      </Section>

      <CtaBand
        eyebrow="Next step"
        title="Discuss your proposed brief"
        body="Email your target location and the conditions that matter to you. We will discuss what available records can support and agree scope, format, volume, timing and any fee before research begins."
        primaryLabel="Discuss Your Requirements"
        primaryHref="/contact"
        secondaryLabel="Explore the service"
        secondaryHref="/services"
      />
    </>
  );
}
