import type { Metadata } from 'next';
import Link from 'next/link';
import { Section } from '@/components/layout/Section';
import { Container } from '@/components/layout/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PageHero } from '@/components/sections/PageHero';
import { Diamond } from '@/components/ui/Motifs';
import { buildMetadata } from '@/lib/metadata';
import { businessContact, hasPublicEmail, hasPublicPhone } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'Contact',
  description:
    'Contact Obsidixz Real Estate about US residential property lead research. Send your target location and requirements, and we will confirm what the research can cover.',
  path: '/contact',
});

// The delivery state is read on the server so the page can state it honestly.
export const dynamic = 'force-dynamic';

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Discuss your research requirements"
        intro="Tell us the US market you are working and the criteria a property needs to meet. We will confirm what the available records can support, what the deliverable would contain, and what a research proposal would look like for your brief."
        meta="Enquiries answered in writing · English"
      />

      <Section tone="white" spacing="lg" aria-labelledby="form-heading">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
          {/* Form column */}
          <div className="min-w-0">
            <span id="form-heading">
              <SectionHeading eyebrow="Enquiry form" title="Send us your brief" as="h2" />
            </span>
            <div className="mt-6 border border-charcoal/12 bg-white p-7 text-[0.95rem] leading-relaxed text-charcoal/75">
              The enquiry form is implemented in the next stage.
            </div>
          </div>

          {/* Guidance column */}
          <aside className="min-w-0 lg:pt-2">
            <div className="border border-charcoal/10 bg-mist p-6 sm:p-7">
              <h2 className="font-display text-[0.72rem] font-bold uppercase tracking-[0.18em] text-royal">
                A useful enquiry includes
              </h2>
              <ul className="mt-4 flex flex-col gap-3">
                {[
                  'The target US location — state, metro, county or city',
                  'The property type and size range you are interested in',
                  'The criteria a property needs to meet for you',
                  'The fields you would want in the deliverable',
                  'Whether a spreadsheet, a report or both would suit you',
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-[0.92rem] leading-relaxed text-charcoal/80">
                    <Diamond className="mt-[0.4rem] h-2 w-2 shrink-0 text-gold" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t border-charcoal/10 pt-4 text-[0.85rem] leading-relaxed text-charcoal/60">
                You do not need a formal document. A clear description of what you are looking for
                is enough for us to reply usefully.
              </p>
            </div>

            <div id="other-routes" className="mt-6 border border-charcoal/10 bg-white p-6 sm:p-7">
              <h2 className="font-display text-[0.72rem] font-bold uppercase tracking-[0.18em] text-royal">
                Other ways to reach us
              </h2>

              <dl className="mt-4 flex flex-col divide-y divide-charcoal/10">
                {hasPublicEmail ? (
                  <div className="py-3 first:pt-0">
                    <dt className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-charcoal/50">
                      Email
                    </dt>
                    <dd className="mt-1">
                      <a
                        href={`mailto:${businessContact.email}`}
                        className="text-[0.95rem] font-medium text-royal underline underline-offset-2"
                      >
                        {businessContact.email}
                      </a>
                    </dd>
                  </div>
                ) : (
                  <div className="py-3 first:pt-0">
                    <dt className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-charcoal/50">
                      Email
                    </dt>
                    <dd className="mt-1 text-[0.9rem] leading-relaxed text-charcoal/65">
                      A monitored business address is being set up. It has not been published here
                      because no address has been confirmed.
                    </dd>
                  </div>
                )}

                {hasPublicPhone ? (
                  <div className="py-3">
                    <dt className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-charcoal/50">
                      Telephone
                    </dt>
                    <dd className="mt-1">
                      <a
                        href={`tel:${businessContact.phone.replace(/\s+/g, '')}`}
                        className="text-[0.95rem] font-medium text-royal underline underline-offset-2"
                      >
                        {businessContact.phone}
                      </a>
                    </dd>
                  </div>
                ) : null}

                <div className="py-3">
                  <dt className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-charcoal/50">
                    Operating hours
                  </dt>
                  <dd className="mt-1 text-[0.9rem] leading-relaxed text-charcoal/70">
                    The business operates remotely and is not aligned to US business hours.
                    Enquiries are answered in writing, in English, and are not auto-acknowledged.
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-6 border-l-2 border-royal pl-4">
              <p className="text-[0.87rem] leading-relaxed text-charcoal/70">
                Please do not send identity documents, financial account details or other sensitive
                personal information. Property research enquiries do not require it. See the{' '}
                <Link href="/privacy-policy" className="text-royal underline underline-offset-2">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </aside>
        </div>
      </Section>

      {/* What happens next */}
      <Section tone="mist" spacing="md" aria-labelledby="next-heading">
        <Container>
          <SectionHeading
            eyebrow="After you send"
            title={<span id="next-heading">What happens next</span>}
            intro="No chatbot, no automated sequence. A person reads the enquiry and replies."
          />
          <ol className="mt-10 grid gap-px border border-charcoal/10 bg-charcoal/10 sm:grid-cols-3">
            {[
              {
                title: 'We read it properly',
                body: 'Your enquiry is read and matched to whatever context already exists, rather than answered with a template.',
              },
              {
                title: 'We check the location and criteria',
                body: 'We consider whether the market and the criteria you describe can be researched from available records.',
              },
              {
                title: 'We reply on scope',
                body: 'You receive a considered reply covering what the research would cover, what it cannot, and what to do next.',
              },
            ].map((step, index) => (
              <li key={step.title} className="bg-white p-6">
                <span
                  aria-hidden="true"
                  className="font-display text-[0.72rem] font-bold tracking-[0.16em] text-gold"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-[1rem] font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-[0.92rem] leading-relaxed text-charcoal/78">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>
    </>
  );
}
