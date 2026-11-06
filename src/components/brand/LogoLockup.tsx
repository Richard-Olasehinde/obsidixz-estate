/**
 * TEMPORARY TEXT-BASED BUSINESS LOCKUP.
 *
 * The approved parent Obsidixz logo asset (wordmark and emblem, light and dark
 * variants) has NOT been supplied in this repository. Per the brand rules, the
 * logo must not be recreated, approximated or substituted with a final mark.
 *
 * This component therefore renders a restrained, type-only business lockup that
 * can be swapped for the supplied SVG in one place. See ASSETS_PENDING.md.
 */

type LogoLockupProps = {
  /** `dark` = for light backgrounds. `light` = for dark backgrounds. */
  tone?: 'dark' | 'light';
  className?: string;
  /** Compact variant removes the descriptor line (used in the mobile bar). */
  compact?: boolean;
};

export function LogoLockup({ tone = 'dark', className = '', compact = false }: LogoLockupProps) {
  const isLight = tone === 'light';

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Placeholder geometric marker — retained only until the real emblem is supplied. */}
      <span
        aria-hidden="true"
        className={[
          'grid h-8 w-8 shrink-0 place-items-center border',
          isLight ? 'border-white/45' : 'border-royal/45',
        ].join(' ')}
      >
        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden="true">
          <rect
            x="1"
            y="1"
            width="6"
            height="6"
            stroke={isLight ? '#FFFFFF' : '#315C9B'}
            strokeWidth="1.6"
          />
          <rect
            x="9"
            y="9"
            width="6"
            height="6"
            stroke="#B47745"
            strokeWidth="1.6"
          />
        </svg>
      </span>

      <span className="flex flex-col leading-none">
        <span
          className={[
            'font-display text-[0.98rem] font-bold uppercase tracking-[0.14em]',
            isLight ? 'text-white' : 'text-ink',
          ].join(' ')}
        >
          Obsidixz
        </span>
        <span
          className={[
            'mt-1 font-sans text-[0.58rem] font-semibold uppercase tracking-[0.24em]',
            isLight ? 'text-[#AFC0D8]' : 'text-charcoal/65',
            compact ? 'sr-only' : '',
          ].join(' ')}
        >
          Real Estate
        </span>
      </span>
    </span>
  );
}
