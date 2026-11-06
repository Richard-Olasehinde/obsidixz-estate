import type { ReactNode } from 'react';

type ContainerProps = {
  children: ReactNode;
  className?: string;
  /** `wide` keeps the full content width; `narrow` is for long-form reading. */
  size?: 'default' | 'wide' | 'narrow';
};

const sizes = {
  default: 'max-w-[76rem]',
  wide: 'max-w-[88rem]',
  narrow: 'max-w-[48rem]',
};

export function Container({ children, className = '', size = 'default' }: ContainerProps) {
  return (
    <div className={`mx-auto w-full px-5 sm:px-8 ${sizes[size]} ${className}`}>{children}</div>
  );
}
