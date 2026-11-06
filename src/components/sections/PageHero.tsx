import type { ReactNode } from 'react';
import { Container } from '@/components/layout/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { BlockField } from '@/components/ui/Motifs';

type PageHeroProps = {
  eyebrow: string;
  title: string;
  intro: string;
  children?: ReactNode;
  /** Small metadata line under the intro, e.g. a section index. */
  meta?: string;
};

/** Consistent page-opening band used on every page except the homepage. */
export function PageHero({ eyebrow, title, intro, children, meta }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-ink">
      <div aria-hidden="true" className="grid-lines pointer-events-none absolute inset-0 opacity-60" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 hidden text-white/[0.07] lg:block"
      >
        <BlockField className="h-[26rem] w-[26rem]" />
      </div>
      <Container>
        <div className="relative max-w-3xl pb-14 pt-16 sm:pb-16 sm:pt-20 lg:pb-20 lg:pt-24">
          <Eyebrow tone="inverse">{eyebrow}</Eyebrow>
          <h1 className="mt-5 text-h2 font-bold text-white">{title}</h1>
          <p className="mt-6 max-w-2xl text-lead text-[#aab6c4]">{intro}</p>
          {meta ? (
            <p className="mt-7 font-sans text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#7d8a99]">
              {meta}
            </p>
          ) : null}
          {children ? <div className="mt-9 flex flex-col gap-3 sm:flex-row">{children}</div> : null}
        </div>
      </Container>
      <div aria-hidden="true" className="h-[3px] w-full bg-gold" />
    </section>
  );
}
