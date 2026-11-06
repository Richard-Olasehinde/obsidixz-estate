/**
 * Restrained geometric motifs derived from the Obsidixz "Interlock" direction:
 * squares, rectangles, diamonds, intersections and structured divisions.
 *
 * These are decorative ornaments only — they are NOT the parent logo and must
 * not be presented as such. All are aria-hidden.
 */

type MotifProps = {
  className?: string;
};

/** Interlocking square + diamond. Used as a small accent beside headings. */
export function InterlockMark({ className = '' }: MotifProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      focusable="false"
    >
      <rect x="1" y="1" width="22" height="22" stroke="currentColor" strokeWidth="2" />
      <rect x="25" y="25" width="22" height="22" stroke="currentColor" strokeWidth="2" />
      <path d="M24 8v32M8 24h32" stroke="currentColor" strokeWidth="1" opacity="0.45" />
      <path d="M34 8 44 18 34 28 24 18Z" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
    </svg>
  );
}

/** Outlined diamond used as a list bullet. */
export function Diamond({ className = '' }: MotifProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      className={className}
      fill="none"
      focusable="false"
    >
      <path d="M6 0.75 11.25 6 6 11.25 0.75 6Z" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/** Structured division: nested rectangles suggesting a plan or grid. */
export function DivisionGrid({ className = '' }: MotifProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      focusable="false"
    >
      <rect x="0.5" y="0.5" width="199" height="199" stroke="currentColor" strokeWidth="1" />
      <rect x="24.5" y="24.5" width="151" height="151" stroke="currentColor" strokeWidth="1" />
      <rect x="48.5" y="48.5" width="103" height="103" stroke="currentColor" strokeWidth="1" />
      <path d="M0 100h200M100 0v200" stroke="currentColor" strokeWidth="1" />
      <path d="M100 48.5 151.5 100 100 151.5 48.5 100Z" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/** Large decorative block grid for hero/CTA backgrounds. */
export function BlockField({ className = '' }: MotifProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 320 320"
      className={className}
      fill="none"
      focusable="false"
    >
      <rect x="0" y="0" width="160" height="160" stroke="currentColor" strokeWidth="1" />
      <rect x="160" y="160" width="160" height="160" stroke="currentColor" strokeWidth="1" />
      <rect x="200" y="0" width="120" height="120" stroke="currentColor" strokeWidth="1" />
      <rect x="0" y="200" width="120" height="120" stroke="currentColor" strokeWidth="1" />
      <path d="M160 200 280 320M280 200 160 320" stroke="currentColor" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}
