import Image from 'next/image';
import type { Metadata } from 'next';
import { Section } from '@/components/layout/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card, CardTitle, CardBody } from '@/components/ui/Card';
import { ButtonLink } from '@/components/ui/Button';
import { Diamond, DivisionGrid } from '@/components/ui/Motifs';
import { FieldList } from '@/components/ui/FieldList';
import { ProcessSteps } from '@/components/ui/ProcessSteps';
import { CtaBand } from '@/components/sections/CtaBand';
import { HomeHero } from '@/components/sections/HomeHero';
import { buildMetadata } from '@/lib/metadata';
import {
  approachPrinciples,
  deliverableFields,
  homeIntroPoints,
  investorScenarios,
  researchChallenges,
} from '@/lib/content';

export const metadata: Metadata = buildMetadata({
  title: 'Obsidixz Real Estate — US Property Lead Research',
  description:
    'Obsidixz Real Estate helps US residential real-estate investors identify relevant property prospects through structured, criteria-based research and lead generation.',
  path: '/',
  isHome: true,
  ogTitle: 'Smarter Research. Better Real Estate Opportunities.',
});

export default function HomePage() {
  return (
    <>
      {/* 1 — HERO */}
      <HomeHero />

      {/* 2 — INTRODUCTION */}
      <Section tone="white" spacing="lg" aria-labelledby="intro-heading">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Introduction"
              title={<span id="intro-heading">A research-led approach to property prospecting</span>}
              intro="Obsidixz Real Estate is a research and lead-generation business. We do one thing at this stage, and we do it carefully: we research residential property prospects against the criteria a client sets, and we hand back organised, sourced information."
            />
            <div className="mt-8">
              <ButtonLink href="/about" variant="secondary">
                More about the business
              </ButtonLink>
            </div>
          </div>

          <div className="flex flex-col">
            <dl className="divide-y divide-charcoal/10 border-y border-charcoal/10">
              {homeIntroPoints.map((point) => (
                <div key={point.label} className="grid gap-2 py-6 sm:grid-cols-[9rem_1fr] sm:gap-6">
                  <dt className="flex items-start gap-2.5 font-sans text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-royal">
                    <Diamond className="mt-1 h-2 w-2 shrink-0 text-gold" />
                    {point.label}
                  </dt>
                  <dd className="text-[1rem] leading-relaxed text-charcoal/85">{point.body}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-[0.9rem] leading-relaxed text-charcoal/65">
              We are an emerging business, operating remotely and serving US clients. We would
              rather describe the service accurately than present it as something larger than it
              is.
            </p>
          </div>
        </div>
      </Section>

      {/* 3 — THE RESEARCH CHALLENGE */}
      <Section tone="mist" spacing="lg" aria-labelledby="challenge-heading">
        <SectionHeading
          eyebrow="The research challenge"
          title={<span id="challenge-heading">Finding prospects is the easy part. Checking them is not.</span>}
          intro="Residential property research is slow for reasons that have nothing to do with effort. The information a serious buyer needs is spread across sources that were never designed to work together."
        />

        <div className="mt-12 grid gap-px border border-charcoal/10 bg-charcoal/10 sm:grid-cols-2">
          {researchChallenges.map((item) => (
            <div key={item.title} className="bg-white p-7 sm:p-8">
              <CardTitle>{item.title}</CardTitle>
              <p className="mt-3 text-[0.97rem] leading-relaxed text-charcoal/80">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-l-2 border-royal pl-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-[1rem] leading-relaxed text-charcoal/85">
            This is the work Obsidixz Real Estate is built around — doing the initial research
            thoroughly, so that your time goes into evaluating opportunities rather than
            assembling information.
          </p>
          <ButtonLink href="/how-it-works" variant="secondary" className="shrink-0">
            See how the research works
          </ButtonLink>
        </div>
      </Section>

      {/* 4 — SERVICE INTRODUCTION */}
      <Section tone="white" spacing="lg" aria-labelledby="service-heading">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-start lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Our service"
              title={<span id="service-heading">Property Lead Research</span>}
              intro="You provide your target location and property requirements. We research potential property prospects against those criteria and deliver a structured, referenced research file explaining why each prospect matches."
            />

            <ul className="mt-9 flex flex-col gap-5">
              {[
                {
                  title: 'Criteria-driven, not list-driven',
                  body: 'The brief comes from you. We research against the requirements you actually use, not a generic list of addresses.',
                },
                {
                  title: 'Manually researched',
                  body: 'Prospects are researched and reviewed by hand. Technology supports the internal workflow; it is not a product we are selling.',
                },
                {
                  title: 'Referenced and annotated',
                  body: 'Every available detail carries its source, and every prospect carries a short note explaining the match.',
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 grid h-7 w-7 shrink-0 place-items-center border border-royal/30"
                  >
                    <span className="h-1.5 w-1.5 bg-gold" />
                  </span>
                  <div>
                    <h3 className="text-[1.05rem] font-semibold text-ink">{item.title}</h3>
                    <p className="mt-1 text-[0.95rem] leading-relaxed text-charcoal/80">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-9">
              <ButtonLink href="/services" variant="primary" withArrow>
                Explore Our Services
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
              <span>
                Research is compiled and reviewed manually against the agreed brief. Illustrative
                image.
              </span>
            </figcaption>

            <div className="mt-8 border border-charcoal/10 bg-mist p-6">
              <h3 className="font-display text-[0.72rem] font-bold uppercase tracking-[0.18em] text-royal">
                What the service is not
              </h3>
              <p className="mt-3 text-[0.93rem] leading-relaxed text-charcoal/80">
                We are not a brokerage or agency, we do not sell or manage property, we do not
                provide investment advice, and we do not advertise wholesaling. We research and
                organise property information — nothing further is implied.
              </p>
            </div>
          </figure>
        </div>
      </Section>

      {/* 5 — WHAT CUSTOMERS RECEIVE */}
      <Section tone="ink" spacing="lg" aria-labelledby="deliverables-heading">
        <div aria-hidden="true" className="grid-lines pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="What you receive"
              tone="dark"
              title={<span id="deliverables-heading">A research file you can actually work from</span>}
              intro="The deliverable is a structured spreadsheet or report, scoped with you beforehand. Not every field will be available for every prospect — what is missing is recorded rather than hidden."
            />
            <div aria-hidden="true" className="hidden shrink-0 text-white/10 lg:block">
              <DivisionGrid className="h-40 w-40" />
            </div>
          </div>

          <div className="mt-12">
            <FieldList items={deliverableFields} tone="dark" />
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-white/12 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-[0.93rem] leading-relaxed text-[#9da9b7]">
              The exact fields, format and volume are agreed before research starts, along with
              anything in your brief the available records cannot support.
            </p>
            <ButtonLink href="/contact" variant="primary" className="shrink-0">
              Discuss Your Requirements
            </ButtonLink>
          </div>
        </div>
      </Section>

      {/* 6 — WHO WE SERVE */}
      <Section tone="white" spacing="lg" aria-labelledby="audience-heading">
        <SectionHeading
          eyebrow="Who we serve"
          title={<span id="audience-heading">Built for residential investors first</span>}
          intro="Our work is designed around a small US residential investor or acquisition operator running their own sourcing — not a large institution and not a consumer looking for a home."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <Card variant="accent" className="gap-5">
            <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-gold-deep">
              Primary audience
            </p>
            <CardTitle>Residential real-estate investors</CardTitle>
            <CardBody>
              Independent investors and small investment teams looking for relevant residential
              property prospects in selected US markets, who want the initial research done
              properly before committing their own time to it.
            </CardBody>
            <ul className="mt-1 grid gap-3 sm:grid-cols-2">
              {investorScenarios.map((scenario) => (
                <li key={scenario.title} className="border-t border-charcoal/10 pt-3">
                  <p className="text-[0.92rem] font-semibold text-ink">{scenario.title}</p>
                </li>
              ))}
            </ul>
            <div className="mt-2">
              <ButtonLink href="/who-we-serve" variant="secondary">
                Who We Serve in detail
              </ButtonLink>
            </div>
          </Card>

          <div className="flex flex-col gap-6">
            <Card variant="filled" className="gap-4">
              <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-charcoal/65">
                Secondary audience
              </p>
              <CardTitle>Property acquisition operators</CardTitle>
              <CardBody>
                Smaller acquisition-focused teams that use structured prospect research to support
                their sourcing activity.
              </CardBody>
            </Card>

            <div className="border-l-2 border-gold/60 pl-5">
              <p className="text-[0.9rem] leading-relaxed text-charcoal/70">
                We do not position ourselves as equally focused on every category of property
                professional. If your work sits outside these two groups, we would rather say so
                than stretch the service to fit.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-8 text-[0.88rem] leading-relaxed text-charcoal/60">
          Note on scope: we do not advertise wholesaling, brokerage, property management,
          financing, or sales representation, and we do not provide legal, tax or investment
          advice.
        </p>
      </Section>

      {/* 7 — HOW THE PROCESS WORKS */}
      <Section tone="mist" spacing="lg" aria-labelledby="process-heading">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="How it works"
            title={<span id="process-heading">Five steps from brief to research file</span>}
            intro="An agreed brief, manual research, a reviewed deliverable. No automated pipeline and no black box — you know what happens at each stage."
          />
          <div className="shrink-0">
            <ButtonLink href="/how-it-works" variant="secondary">
              Read the full process
            </ButtonLink>
          </div>
        </div>

        <div className="mt-12">
          <ProcessSteps variant="compact" />
        </div>
      </Section>

      {/* 8 — OUR APPROACH */}
      <Section tone="white" spacing="lg" aria-labelledby="approach-heading">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              eyebrow="Our approach"
              title={<span id="approach-heading">Research quality, described plainly</span>}
              intro="These are working commitments, not badges. They describe how the research is done and what you can reasonably expect from the deliverable."
            />
            <div aria-hidden="true" className="mt-10 hidden text-royal/25 lg:block">
              <DivisionGrid className="h-36 w-36" />
            </div>
          </div>

          <ol className="grid gap-px border border-charcoal/10 bg-charcoal/10 sm:grid-cols-2">
            {approachPrinciples.map((principle, index) => (
              <li key={principle.title} className="bg-white p-6">
                <span
                  aria-hidden="true"
                  className="font-display text-[0.72rem] font-bold tracking-[0.16em] text-gold-deep"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-[1.02rem] font-semibold text-ink">{principle.title}</h3>
                <p className="mt-2 text-[0.92rem] leading-relaxed text-charcoal/80">
                  {principle.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* 9 — FINAL ENQUIRY CTA */}
      <CtaBand
        eyebrow="Next step"
        title="Tell us what you are looking for"
        body="Send your target location and the criteria that matter to you. We will confirm what the available records can support and what the research would cover before anything starts."
        primaryLabel="Discuss Your Requirements"
        primaryHref="/contact"
        secondaryLabel="Read the process"
        secondaryHref="/how-it-works"
      />
    </>
  );
}
