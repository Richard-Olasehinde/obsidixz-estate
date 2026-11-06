import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'inverse' | 'gold';
type Size = 'md' | 'lg';

type BaseProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  /** Appends a right-pointing arrow icon. */
  withArrow?: boolean;
};

const base =
  'group inline-flex items-center justify-center gap-2.5 font-semibold tracking-[0.01em] ' +
  'transition-[background-color,color,border-color,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ' +
  'focus-visible:outline-2 focus-visible:outline-offset-3 disabled:cursor-not-allowed disabled:opacity-60';

const variants: Record<Variant, string> = {
  primary:
    'bg-royal text-white hover:bg-royal-deep active:translate-y-px focus-visible:outline-royal',
  secondary:
    'border border-charcoal/25 text-ink hover:border-royal hover:text-royal bg-transparent active:translate-y-px',
  inverse:
    'border border-white/30 text-white hover:bg-white hover:text-ink active:translate-y-px',
  gold: 'bg-gold text-white hover:bg-gold-deep active:translate-y-px',
};

const sizes: Record<Size, string> = {
  md: 'text-[0.95rem] px-6 py-3',
  lg: 'text-[1rem] px-7 py-3.5',
};

function Arrow() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4 shrink-0 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="square"
    >
      <path d="M3 10h13M11.5 4.5 17 10l-5.5 5.5" />
    </svg>
  );
}

function classesFor({ variant = 'primary', size = 'md', className = '' }: BaseProps) {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`;
}

function content(children: ReactNode, withArrow?: boolean) {
  return (
    <>
      <span>{children}</span>
      {withArrow ? <Arrow /> : null}
    </>
  );
}

type ButtonLinkProps = BaseProps & ComponentPropsWithoutRef<typeof Link>;

export function ButtonLink({ children, withArrow, ...rest }: ButtonLinkProps) {
  const { variant, size, className, ...linkProps } = rest;
  return (
    <Link {...linkProps} className={classesFor({ children, variant, size, className })}>
      {content(children, withArrow)}
    </Link>
  );
}

type ButtonProps = BaseProps & ComponentPropsWithoutRef<'button'>;

export function Button({ children, withArrow, ...rest }: ButtonProps) {
  const { variant, size, className, type = 'button', ...buttonProps } = rest;
  return (
    <button
      {...buttonProps}
      type={type}
      className={classesFor({ children, variant, size, className })}
    >
      {content(children, withArrow)}
    </button>
  );
}

type ButtonAnchorProps = BaseProps & ComponentPropsWithoutRef<'a'>;

export function ButtonAnchor({ children, withArrow, ...rest }: ButtonAnchorProps) {
  const { variant, size, className, ...anchorProps } = rest;
  return (
    <a {...anchorProps} className={classesFor({ children, variant, size, className })}>
      {content(children, withArrow)}
    </a>
  );
}
