'use client';

import type { ReactNode } from 'react';

/**
 * Form field primitives.
 *
 * Accessibility notes:
 * - Every control has an associated <label>.
 * - Errors are announced with role="alert" and linked via aria-describedby.
 * - Invalid controls get aria-invalid, which assistive tech announces.
 * - Required fields are marked visually *and* with `required`, so the browser's
 *   own validation is a fallback if JavaScript has not yet hydrated.
 */

export const inputBase =
  'w-full border bg-white px-3.5 py-2.5 text-[0.97rem] text-ink placeholder:text-charcoal/40 ' +
  'transition-colors duration-150 focus:outline-none focus-visible:outline-none ' +
  'disabled:cursor-not-allowed disabled:bg-mist disabled:text-charcoal/50';

export function fieldClasses(hasError: boolean) {
  return [
    inputBase,
    hasError
      ? 'border-[#B3261E] focus:border-[#B3261E] focus:ring-2 focus:ring-[#B3261E]/25'
      : 'border-charcoal/20 hover:border-charcoal/35 focus:border-royal focus:ring-2 focus:ring-royal/20',
  ].join(' ');
}

type FieldWrapperProps = {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: (props: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
};

export function FieldWrapper({
  id,
  label,
  required,
  optional,
  hint,
  error,
  children,
}: FieldWrapperProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[0.88rem] font-semibold text-ink">
          {label}
          {required ? (
            <span className="ml-1 text-[#B3261E]" aria-hidden="true">
              *
            </span>
          ) : null}
          {required ? <span className="sr-only"> (required)</span> : null}
        </label>
        {optional ? (
          <span className="font-sans text-[0.72rem] uppercase tracking-[0.1em] text-charcoal/45">
            Optional
          </span>
        ) : null}
      </div>

      {hint ? (
        <p id={hintId} className="text-[0.82rem] leading-relaxed text-charcoal/60">
          {hint}
        </p>
      ) : null}

      {children({ id, describedBy, invalid: Boolean(error) })}

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="flex items-start gap-1.5 text-[0.82rem] font-medium leading-snug text-[#B3261E]"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className="mt-0.5 h-3.5 w-3.5 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <circle cx="8" cy="8" r="6.5" />
            <path d="M8 4.5v4.2M8 11.1v.9" />
          </svg>
          {error}
        </p>
      ) : null}
    </div>
  );
}
