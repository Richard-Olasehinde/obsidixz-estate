import type { ReactNode } from 'react';
import { Eyebrow } from './Eyebrow';

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: 'left' | 'center';
  tone?: 'light' | 'dark';
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
};

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = 'left',
  tone = 'light',
  className = '',
  as: Heading = 'h2',
}: SectionHeadingProps) {
  const isCenter = align === 'center';

  return (
    <div
      className={[
        isCenter ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl',
        'flex flex-col gap-4',
        className,
      ].join(' ')}
    >
      {eyebrow ? (
        <div className={isCenter ? 'flex justify-center' : ''}>
          <Eyebrow tone={tone === 'dark' ? 'inverse' : 'royal'}>{eyebrow}</Eyebrow>
        </div>
      ) : null}
      <Heading
        className={[
          'text-h2 font-bold',
          tone === 'dark' ? 'text-white' : 'text-ink',
        ].join(' ')}
      >
        {title}
      </Heading>
      {intro ? (
        <div
          className={[
            'text-lead',
            tone === 'dark' ? 'text-[#c9d0da]' : 'text-charcoal/80',
          ].join(' ')}
        >
          {intro}
        </div>
      ) : null}
    </div>
  );
}
