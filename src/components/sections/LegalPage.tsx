import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { PageHero } from '@/components/sections/PageHero';
import { LEGAL_LAST_UPDATED, type LegalBlock, type LegalSection } from '@/lib/legal';
import { ButtonLink } from '@/components/ui/Button';
import { BreadcrumbData } from '@/components/seo/BreadcrumbData';

/**
 * Renders a legal page: hero, review notice, contents, and sections.
 *
 * The review notice is deliberately prominent and not dismissible. These pages
 * are drafts: they are accurate about the implemented behaviour, but several
 * facts require founder confirmation and professional review before the site
 * goes live. Presenting them as final would misrepresent the business's
 * compliance position.
 */

export function ReviewNotice() {
  return (
    <div className="border-l-4 border-gold bg-gold-tint px-5 py-4 sm:px-6">
      <p className="font-display text-[0.72rem] font-bold uppercase tracking-[0.16em] text-gold-deep">
        Draft pending review
      </p>
      <p className="mt-2 max-w-3xl text-[0.9rem] leading-relaxed text-charcoal/85">
        This page describes how the website and service actually operate. Items that are not yet
        confirmed are marked{' '}
        <span className="border-b border-dashed border-gold-deep/70 font-semibold text-gold-deep">
          to be confirmed
        </span>{' '}
        rather than filled with assumptions. It should be reviewed by the business, and by a
        qualified adviser where appropriate, before the website is treated as final.
      </p>
    </div>
  );
}

function PendingBlock({ label, note }: { label: string; note: string }) {
  return (
    <div className="my-5 border border-dashed border-gold bg-gold-tint/60 px-5 py-4">
      <p className="flex items-start gap-2 font-sans text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-gold-deep">
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="mt-0.5 h-3.5 w-3.5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <circle cx="8" cy="8" r="6.6" />
          <path d="M8 4.6v4.2M8 11.2v.9" />
        </svg>
        To be confirmed before publication
      </p>
      <p className="mt-2 text-[0.92rem] font-semibold text-ink">{label}</p>
      <p className="mt-1 text-[0.88rem] leading-relaxed text-charcoal/75">{note}</p>
    </div>
  );
}

function Block({ block }: { block: LegalBlock }) {
  if (block.kind === 'paragraph') {
    return (
      <p className="mt-4 text-[1rem] leading-relaxed text-charcoal/85 first:mt-0">{block.text}</p>
    );
  }

  if (block.kind === 'list') {
    return (
      <ul className="mt-4 flex flex-col gap-2.5">
        {block.items.map((item) => (
          <li key={item} className="flex gap-3 text-[1rem] leading-relaxed text-charcoal/85">
            <span aria-hidden="true" className="mt-[0.62rem] h-1.5 w-1.5 shrink-0 bg-gold" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  return <PendingBlock label={block.label} note={block.note} />;
}

type LegalPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: LegalSection[];
  /** Slug used to build the contents anchors. */
  basePath: string;
  crossLink: { label: string; href: string };
};

export function LegalPageLayout({
  eyebrow,
  title,
  intro,
  sections,
  basePath,
  crossLink,
}: LegalPageProps) {
  const pendingCount = sections.reduce(
    (total, section) => total + section.blocks.filter((b) => b.kind === 'pending').length,
    0,
  );

  return (
    <>
      <BreadcrumbData trail={[{ name: title, path: basePath }]} />
      <PageHero
        eyebrow={eyebrow}
        title={title}
        intro={intro}
        meta={`Last updated ${LEGAL_LAST_UPDATED} · ${sections.length} sections · ${pendingCount} item${pendingCount === 1 ? '' : 's'} awaiting confirmation`}
      />

      <div className="bg-white py-12 sm:py-16 lg:py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[16rem_1fr] lg:gap-16">
            {/* Contents */}
            <nav aria-label="On this page" className="lg:sticky lg:top-28 lg:self-start">
              <h2 className="font-display text-[0.72rem] font-bold uppercase tracking-[0.18em] text-charcoal/65">
                On this page
              </h2>
              <ol className="mt-4 flex flex-col gap-2 border-l border-charcoal/10 pl-4">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="text-[0.86rem] leading-snug text-charcoal/70 transition-colors hover:text-royal"
                    >
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ol>
              <p className="mt-6 border-t border-charcoal/10 pt-4 text-[0.82rem] leading-relaxed text-charcoal/65">
                See also:{' '}
                <Link href={crossLink.href} className="text-royal underline underline-offset-2">
                  {crossLink.label}
                </Link>
              </p>
            </nav>

            {/* Body */}
            <div className="min-w-0 max-w-[46rem]">
              <ReviewNotice />

              <div className="mt-12 flex flex-col gap-12">
                {sections.map((section) => (
                  <section key={section.id} id={section.id}>
                    <h2 className="text-[1.35rem] font-bold leading-snug text-ink">
                      {section.heading}
                    </h2>
                    <div className="mt-4">
                      {section.blocks.map((block, index) => (
                        <Block key={`${section.id}-${index}`} block={block} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <div className="mt-14 flex flex-col gap-4 border-t border-charcoal/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[0.9rem] leading-relaxed text-charcoal/70">
                  Questions about this page? Send an enquiry and it will reach the right context.
                </p>
                <ButtonLink href="/contact" variant="primary" className="shrink-0">
                  Contact us
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
