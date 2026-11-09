import Image from 'next/image';
import { Container } from '@/components/layout/Container';
import { ButtonLink } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { InterlockMark } from '@/components/ui/Motifs';

/**
 * Homepage hero.
 *
 * The photograph is illustrative market imagery, not a client property. The
 * gradient overlay guarantees AA contrast for the headline regardless of the
 * image behind it.
 */
export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden bg-ink">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/hero-neighbourhood.jpg"
          alt="Aerial view of an established US suburban residential neighbourhood at late afternoon"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Brand gradient: guarantees legible white type over any crop */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(100deg,rgba(17,17,17,0.96)_0%,rgba(17,17,17,0.92)_38%,rgba(17,17,17,0.68)_62%,rgba(17,17,17,0.42)_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_top,rgba(17,17,17,0.85)_0%,transparent_45%)]"
        />
      </div>

      <div aria-hidden="true" className="grid-lines pointer-events-none absolute inset-0 -z-10 opacity-40" />

      <Container>
        <div className="relative grid items-end gap-12 pb-16 pt-16 sm:pb-20 sm:pt-20 xl:grid-cols-[1.5fr_1fr] xl:gap-14 lg:pb-24 lg:pt-28">
          {/* Copy */}
          <div>
            <Eyebrow tone="inverse">Property research</Eyebrow>

            <h1 className="mt-6 text-display font-bold text-white">
              <span className="block">Smarter Research.</span>
              <span className="block">Better Real Estate</span>
              <span className="block text-gold">Opportunities.</span>
            </h1>

            <p className="mt-7 max-w-xl text-lead text-[#c2cbd6]">
              We help US residential real-estate investors identify relevant property prospects
              through structured research, careful information review and criteria-based lead
              generation.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/services" variant="primary" size="lg" withArrow>
                Explore Our Services
              </ButtonLink>
              <ButtonLink href="/contact" variant="inverse" size="lg">
                Discuss Your Requirements
              </ButtonLink>
            </div>

            <p className="mt-8 max-w-lg border-l border-white/15 pl-4 text-[0.86rem] leading-relaxed text-[#8e9aa8]">
              An early-stage research and lead-generation business. We do not sell property,
              broker deals or manage assets — we research prospects against the criteria you set.
            </p>
          </div>

          {/* Fact panel — mirrors the deliverable structure without inventing data */}
          <aside
            aria-label="What the service involves"
            className="relative border border-white/15 bg-white/[0.045] p-6 backdrop-blur-[2px] sm:p-7 xl:mb-1"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-display text-[0.72rem] font-bold uppercase tracking-[0.2em] text-white">
                Service at a glance
              </h2>
              <InterlockMark className="h-7 w-7 shrink-0 text-gold" />
            </div>

            <dl className="mt-6 flex flex-col divide-y divide-white/10">
              {[
                { term: 'Service', detail: 'Property Lead Research' },
                { term: 'Coverage', detail: 'Selected US markets, agreed per brief' },
                { term: 'Method', detail: 'Manual, criteria-based research' },
                { term: 'Deliverable', detail: 'Structured spreadsheet or report' },
                { term: 'Prepared for', detail: 'Residential investors and acquisition operators' },
              ].map((row) => (
                <div key={row.term} className="py-3.5 first:pt-0 last:pb-0">
                  <dt className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#7f8c9b]">
                    {row.term}
                  </dt>
                  <dd className="mt-1 text-[0.95rem] text-[#d3dae2]">{row.detail}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 border-t border-white/10 pt-4 text-[0.8rem] leading-relaxed text-[#8b96a4]">
              Scope, format and volume are agreed per engagement. There is no fixed package to
              buy from this page.
            </p>
          </aside>
        </div>
      </Container>
    </section>
  );
}
