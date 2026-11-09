import type { ReactNode } from 'react';
import { Container } from './Container';

type SectionProps = {
  children: ReactNode;
  id?: string;
  /** Background treatment. */
  tone?: 'white' | 'mist' | 'ink' | 'royal' | 'gold-tint';
  /** Vertical rhythm. */
  spacing?: 'sm' | 'md' | 'lg';
  className?: string;
  containerSize?: 'default' | 'wide' | 'narrow';
  /** Adds a hairline divider along the top edge. */
  divided?: boolean;
  'aria-labelledby'?: string;
};

const tones: Record<NonNullable<SectionProps['tone']>, string> = {
  white: 'bg-white text-charcoal',
  mist: 'bg-mist text-charcoal',
  ink: 'bg-ink text-[#c9d0da]',
  royal: 'bg-royal text-white',
  'gold-tint': 'bg-gold-tint text-charcoal',
};

const spacings = {
  sm: 'py-12 sm:py-16',
  md: 'py-16 sm:py-20 lg:py-24',
  lg: 'py-20 sm:py-24 lg:py-32',
};

export function Section({
  children,
  id,
  tone = 'white',
  spacing = 'md',
  className = '',
  containerSize = 'default',
  divided = false,
  ...rest
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={rest['aria-labelledby']}
      className={[
        'relative',
        tones[tone],
        spacings[spacing],
        divided ? 'border-t border-charcoal/10' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Container size={containerSize}>{children}</Container>
    </section>
  );
}
