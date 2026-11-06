import type { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  /** `plain` = bordered white card. `filled` = light grey card. `ink` = dark card. */
  variant?: 'plain' | 'filled' | 'ink' | 'accent';
  className?: string;
  /** Optional small marker rendered at the top-left (e.g. a step number). */
  marker?: string;
  as?: 'div' | 'li' | 'article';
};

const variants = {
  plain: 'bg-white border border-charcoal/10',
  filled: 'bg-mist border border-transparent',
  ink: 'bg-ink border border-white/10 text-[#c9d0da]',
  accent: 'bg-white border border-royal/25',
};

const markerTones = {
  plain: 'text-royal',
  filled: 'text-royal',
  ink: 'text-gold',
  accent: 'text-gold',
};

export function Card({
  children,
  variant = 'plain',
  className = '',
  marker,
  as: Tag = 'div',
}: CardProps) {
  return (
    <Tag
      className={[
        'relative flex flex-col gap-4 p-6 sm:p-7 transition-colors duration-200',
        variants[variant],
        className,
      ].join(' ')}
    >
      {marker ? (
        <span
          aria-hidden="true"
          className={`font-display text-sm font-bold tracking-[0.16em] ${markerTones[variant]}`}
        >
          {marker}
        </span>
      ) : null}
      {children}
    </Tag>
  );
}

type CardTitleProps = {
  children: ReactNode;
  tone?: 'light' | 'dark';
  as?: 'h2' | 'h3' | 'h4';
};

export function CardTitle({ children, tone = 'light', as: Tag = 'h3' }: CardTitleProps) {
  return (
    <Tag
      className={[
        'text-h3 font-semibold',
        tone === 'dark' ? 'text-white' : 'text-ink',
      ].join(' ')}
    >
      {children}
    </Tag>
  );
}

export function CardBody({ children }: { children: ReactNode }) {
  return <p className="text-[0.98rem] leading-relaxed">{children}</p>;
}
