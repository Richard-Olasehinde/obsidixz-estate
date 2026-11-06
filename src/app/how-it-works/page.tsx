import type { Metadata } from 'next';
import { Section } from '@/components/layout/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PageHero } from '@/components/sections/PageHero';
import { CtaBand } from '@/components/sections/CtaBand';
import { ButtonLink } from '@/components/ui/Button';
import { ProcessSteps } from '@/components/ui/ProcessSteps';
import { Diamond } from '@/components/ui/Motifs';
import { buildMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'How It Works',
  description:
    'The five-step Obsidixz Real Estate research workflow: submit requirements, confirm scope, research prospects, organise findings, receive your research.',
  path: '/how-it-works',
});

const briefingChecklist = [
  'The target US location — a state, metro, county or specific city',
  'The property type you are interested in',
  'Size, age or characteristic ranges that matter to you',
  'Any ownership or record-based criteria you use',
  'The fields you need in the deliverable',
  'Whether a spreadsheet, a report, or both would suit you',
];

const honestyNotes = [
  {
    title: 'Not an automated pipeline',
    body: 'There is no dashboard to log into and no automated scraper producing a list overnight. The five steps below are carried out by people, and the fourth step — review and organise — is where most of the value is created.',
  },
  {
    title: 'Not a black box',
    body: 'You know what is being researched, in what area, against which criteria, and in what format you will receive it. Scope is agreed before work begins, not after.',
  },
  {
    title: 'Not a promise of outcomes',
    body: 'A thorough research file improves the quality of the prospects you look at. It does not make a seller motivated, a property available or a deal profitable, and we do not suggest otherwise.',
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="Five steps, agreed up front"
        intro="Every engagement follows the same sequence. The work is manual and reviewed at each stage, and the scope is settled before research starts so there are no surprises in the deliverable."
        meta="Workflow · 5 stages"
      >
        <ButtonLink href="/contact" variant="primary" withArrow>
          Discuss Your Requirements
        </ButtonLink>
        <ButtonLink href="/services" variant="inverse">
          About the service
        </ButtonLink>
      </PageHero>

      {/* The five steps */}
      <Section tone="white" spacing="lg" aria-labelledby="steps-heading">
        <SectionHeading
          eyebrow="The workflow"
          title={<span id="steps-heading">From first brief to finished research</span>}
          intro="Each step has a defined output. Nothing moves forward until the previous step is complete."
        />
        <div className="mt-12">
          <ProcessSteps variant="full" />
        </div>
      </Section>

      {/* What to prepare */}
      <Section tone="mist" spacing="lg" aria-labelledby="prepare-heading">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Before you start"
              title={<span id="prepare-heading">What a useful brief contains</span>}
              intro="You do not need a formal document. A clear paragraph covering the points below is enough for us to scope the work."
            />
            <div className="mt-8">
              <ButtonLink href="/contact" variant="primary" withArrow>
                Start an enquiry
              </ButtonLink>
            </div>
          </div>

          <ul className="flex flex-col border-t border-charcoal/10">
            {briefingChecklist.map((item) => (
              <li key={item} className="flex items-start gap-3.5 border-b border-charcoal/10 py-4">
                <Diamond className="mt-[0.45rem] h-2.5 w-2.5 shrink-0 text-gold" />
                <span className="text-[0.98rem] leading-relaxed text-charcoal/85">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Scoping and what happens at each stage */}
      <Section tone="white" spacing="lg" aria-labelledby="detail-heading">
        <SectionHeading
          eyebrow="In detail"
          title={<span id="detail-heading">What happens, and what you get at each stage</span>}
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {honestyNotes.map((note) => (
            <div key={note.title} className="border-t-2 border-royal pt-5">
              <h3 className="text-[1.02rem] font-semibold text-ink">{note.title}</h3>
              <p className="mt-2.5 text-[0.93rem] leading-relaxed text-charcoal/80">{note.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-px border border-charcoal/10 bg-charcoal/10 lg:grid-cols-2">
          <div className="bg-white p-7">
            <h3 className="font-display text-[0.72rem] font-bold uppercase tracking-[0.18em] text-royal">
              What you provide
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {[
                'Your target location and property criteria',
                'Any preferences on deliverable format',
                'A named contact for questions during the work',
                'Review of the research once delivered',
              ].map((item) => (
                <li key={item} className="flex gap-3 text-[0.94rem] leading-relaxed text-charcoal/80">
                  <span aria-hidden="true" className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 bg-royal/40" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-mist p-7">
            <h3 className="font-display text-[0.72rem] font-bold uppercase tracking-[0.18em] text-gold-deep">
              What we provide
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {[
                'A written scope before any research is carried out',
                'Research against the agreed criteria',
                'Source references and qualification notes per prospect',
                'Verification notes identifying what is missing, uncertain or unconfirmed',
                'The structured deliverable in the agreed format',
              ].map((item) => (
                <li key={item} className="flex gap-3 text-[0.94rem] leading-relaxed text-charcoal/80">
                  <span aria-hidden="true" className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 bg-gold/60" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Timings */}
      <Section tone="mist" spacing="md" aria-labelledby="timing-heading">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <SectionHeading
            eyebrow="Timing"
            title={<span id="timing-heading">Set per brief, not published</span>}
          />
          <div className="flex flex-col gap-4 text-[0.97rem] leading-relaxed text-charcoal/85">
            <p>
              We do not publish a delivery time, because it depends on the size of the market, the
              number of criteria involved, how many sources must be consulted and the volume of
              prospects in scope. A figure quoted without knowing those things would be a guess.
            </p>
            <p>
              A realistic expectation is discussed and agreed during step two, before research
              begins, and confirmed in writing as part of the scope.
            </p>
            <p className="border-l-2 border-royal pl-4 text-charcoal/75">
              If you have a fixed deadline, say so in the enquiry. We will tell you honestly whether
              it is achievable rather than accept it and miss it.
            </p>
          </div>
        </div>
      </Section>

      <CtaBand
        eyebrow="Step one"
        title="Send your first brief"
        body="Your target location and the criteria that matter to you are enough to start. We will come back on scope, format and what the sources can realistically support."
        primaryLabel="Discuss Your Requirements"
        secondaryLabel="Explore Our Services"
        secondaryHref="/services"
      />
    </>
  );
}
