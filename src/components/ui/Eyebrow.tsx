import type { ReactNode } from 'react';

type EyebrowProps = {
  children: ReactNode;
  tone?: 'royal' | 'gold' | 'inverse';
  className?: string;
};

const tones = {
  royal: 'text-royal',
  gold: 'text-gold',
  inverse: 'text-[#c9d6ea]',
};

const bars = {
  royal: 'bg-gold',
  gold: 'bg-royal',
  inverse: 'bg-gold',
};

/** Small uppercase label with a geometric accent bar. */
export function Eyebrow({ children, tone = 'royal', className = '' }: EyebrowProps) {
  return (
    <p className={`eyebrow ${tones[tone]} ${className}`}>
      <span aria-hidden="true" className={`h-[2px] w-6 ${bars[tone]}`} />
      {children}
    </p>
  );
}
