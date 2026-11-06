import type { Metadata } from 'next';
import { Section } from '@/components/layout/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PageHero } from '@/components/sections/PageHero';
import { BreadcrumbData } from '@/components/seo/BreadcrumbData';
import { CtaBand } from '@/components/sections/CtaBand';
import { ButtonLink } from '@/components/ui/Button';
import { Diamond } from '@/components/ui/Motifs';
import { Card, CardTitle, CardBody } from '@/components/ui/Card';
import { buildMetadata } from '@/lib/metadata';
import { operatorScenarios } from '@/lib/content';

export const metadata: Metadata = buildMetadata({
  title: 'Who We Serve',
  description:
    'Obsidixz Real Estate is built for small US residential real-estate investors, with secondary support for property acquisition operators running structured sourcing.',
  path: '/who-we-serve',
});

const investorScenarios = [
  {
    title: 'Building a working prospect list',
    body: 'You know the market and the property profile you want. You need a list of relevant prospects to work through, instead of starting the search from nothing every week.',
  },
  {
    title: 'Testing a new market',
    body: 'You are considering a county or metro you have not worked in and want to understand what is actually there — and what the records can tell you — before committing time or budget.',
  },
  {
    title: 'Criteria that are hard to filter for',
    body: 'Your requirements combine several conditions: property type, ownership pattern, age, recorded characteristics. No single public search handles that combination well.',
  },
  {
    title: 'Extending limited sourcing capacity',
    body: 'You are doing your own research on top of everything else. The initial research is the part you would most like done properly so your time goes into evaluation and outreach.',
  },
];

const notForYou = [
  'Consumers looking for a home to buy or rent',
  'Sellers wanting representation or a listing',
  'Anyone seeking property management services',
  'Investors seeking advice, recommendations or returns',
  'Institutional or large-scale acquisition programmes',
  'Requirements outside the United States',
];

export default function WhoWeServePage() {
  return (
    <>
      <BreadcrumbData trail={[{ name: 'Who We Serve', path: '/who-we-serve' }]} />
      <PageHero
        eyebrow="Who we serve"
        title="Residential investors, first"
        intro="The service is designed around small US residential real-estate investors. Property acquisition operators are served as a secondary audience. We are deliberately narrow here — a service built for everyone tends to work for no one."
        meta="Primary: residential investors · Secondary: acquisition operators"
      >
        <ButtonLink href="/contact" variant="primary" withArrow>
          Discuss Your Requirements
        </ButtonLink>
        <ButtonLink href="/services" variant="inverse">
          Explore Our Services
        </ButtonLink>
      </PageHero>

      {/* Primary audience */}
      <Section tone="white" spacing="lg" aria-labelledby="primary-heading">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gold">
              Primary audience
            </p>
            <SectionHeading
              title={<span id="primary-heading">Residential real-estate investors</span>}
              intro="Independent investors and small investment teams looking for relevant residential property prospects in selected US markets — typically people who research their own sourcing and want the initial work done thoroughly."
              className="mt-3"
            />
            <div className="mt-8 border-l-2 border-royal pl-4">
              <p className="text-[0.92rem] leading-relaxed text-charcoal/75">
                We do not ask you to change how you evaluate opportunities. We provide the organised,
                sourced prospect research that comes before that evaluation.
              </p>
            </div>
          </div>

          <div className="grid gap-px border border-charcoal/10 bg-charcoal/10 sm:grid-cols-2">
            {investorScenarios.map((scenario, index) => (
              <div key={scenario.title} className="bg-white p-6">
                <span
                  aria-hidden="true"
                  className="font-display text-[0.72rem] font-bold tracking-[0.16em] text-gold"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-[1rem] font-semibold leading-snug text-ink">
                  {scenario.title}
                </h3>
                <p className="mt-2 text-[0.91rem] leading-relaxed text-charcoal/78">
                  {scenario.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Secondary audience */}
      <Section tone="mist" spacing="lg" aria-labelledby="secondary-heading">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div>
            <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-charcoal/50">
              Secondary audience
            </p>
            <SectionHeading
              title={<span id="secondary-heading">Property acquisition operators</span>}
              intro="Smaller acquisition-focused teams may use structured prospect research to support their sourcing activity — where a consistent, documented intake of researched prospects helps the team work through opportunities in a repeatable way."
              className="mt-3"
            />
            <p className="mt-6 text-[0.93rem] leading-relaxed text-charcoal/70">
              This is a secondary audience. Our service and its documentation are designed first
              around the individual investor, and we will say so if a larger or more complex
              requirement sits beyond what we can currently support well.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {operatorScenarios.map((scenario) => (
              <Card key={scenario.label} variant="plain" className="gap-2">
                <div className="flex items-center gap-2.5">
                  <Diamond className="h-2.5 w-2.5 text-royal" />
                  <CardTitle>{scenario.label}</CardTitle>
                </div>
                <CardBody>{scenario.body}</CardBody>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* Who this is not for */}
      <Section tone="ink" spacing="lg" aria-labelledby="not-heading">
        <div aria-hidden="true" className="grid-lines pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <SectionHeading
            eyebrow="Being clear"
            tone="dark"
            title={<span id="not-heading">Who this is not for</span>}
            intro="Saying who we are not set up to help is as useful as saying who we are. If you fall into any of the groups below, this service is unlikely to be a good fit."
          />

          {/* data-claim-exempt: enumerates audiences we do NOT serve. */}
          <ul
            data-claim-exempt="not-for"
            className="grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2"
          >
            {notForYou.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 bg-ink px-5 py-4 text-[0.92rem] leading-relaxed text-[#a9b4c1]"
              >
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 bg-gold/70" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* What we ask of clients */}
      <Section tone="white" spacing="lg" aria-labelledby="expect-heading">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <SectionHeading
            eyebrow="A good working relationship"
            title={<span id="expect-heading">What we ask of you</span>}
            intro="Research is only as good as the brief behind it. Three things make a material difference."
          />

          <div className="flex flex-col divide-y divide-charcoal/10 border-y border-charcoal/10">
            {[
              {
                label: 'A specific brief',
                body: 'A clear location and a defined set of criteria produce a far more useful deliverable than a broad request to "find deals".',
              },
              {
                label: 'A realistic scope',
                body: 'Some criteria cannot be evidenced from public records. We will say so during scoping rather than produce output that implies otherwise.',
              },
              {
                label: 'Your own verification',
                body: 'Review the research and verify what matters to your decision. Our verification notes tell you where to look.',
              },
            ].map((item) => (
              <div key={item.label} className="grid gap-2 py-6 sm:grid-cols-[11rem_1fr] sm:gap-6">
                <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-royal">
                  {item.label}
                </p>
                <p className="text-[0.95rem] leading-relaxed text-charcoal/82">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <CtaBand
        eyebrow="Enquiries"
        title="Does this describe your situation?"
        body="If you are a residential investor or an acquisition operator working a US market, send your brief. We will confirm whether the research is a good fit before any work begins."
        primaryLabel="Discuss Your Requirements"
        secondaryLabel="How It Works"
        secondaryHref="/how-it-works"
      />
    </>
  );
}
