import Image from 'next/image';

/**
 * OBSIDIXZ parent brand lockup, with the "Real Estate" secondary label.
 *
 * COMPOSITION — and what must not change
 * The supplied parent logo is a *complete* identity: the interlock-diamond
 * symbol with the OBSIDIXZ wordmark beneath it. That whole composition is kept
 * intact. "Real Estate" is placed immediately to its **right**, vertically
 * centred against the complete logo, as a smaller secondary label.
 *
 * It is explicitly NOT a replacement wordmark and NOT text underneath the logo.
 * The arrangement is horizontal at every supported width — the label never
 * wraps below the mark, never forces the mark to clip, and never distorts it.
 *
 * GEOMETRY
 * The parent-logo widths (`w-20 sm:w-24 lg:w-28`) and the label sizes
 * (`text-xs sm:text-sm`) are the approved reference proportions. The image is
 * always `h-auto`, so its aspect ratio and its transparent padding are
 * preserved exactly as supplied.
 *
 * LABEL SIZING ON NARROW SCREENS
 * "Real Estate" is a long label relative to a 80px mark. It is set
 * `whitespace-nowrap` and allowed to occupy its natural width: at 12px
 * semibold Montserrat the label measures ~71px, so the whole lockup is ~157px
 * at the smallest breakpoint. That fits beside the 44px menu control at 320px.
 * Shrinking, truncating or wrapping it would each be a worse outcome than a
 * slightly wider lockup.
 *
 * ACCESSIBILITY
 * The artwork contains the OBSIDIXZ wordmark and the label repeats the trading
 * name, so the entire lockup is decorative: the image is `alt=""` plus
 * `aria-hidden`, and the label is `aria-hidden` too. The surrounding link
 * supplies the accessible name ("Obsidixz Real Estate home"), so a screen
 * reader announces the destination once rather than spelling out
 * "Obsidixz… OBSIDIXZ… Real Estate".
 */

type LogoLockupProps = {
  /** `dark` = artwork for light backgrounds. `light` = artwork for dark backgrounds. */
  tone?: 'dark' | 'light';
  className?: string;
  /** Hides the "Real Estate" label. Used only where space is genuinely absent. */
  hideLabel?: boolean;
};

/** Intrinsic pixel size of the committed artwork. Aspect ratio must be preserved. */
const ART_WIDTH = 931;
const ART_HEIGHT = 785;

export function LogoLockup({ tone = 'dark', className = '', hideLabel = false }: LogoLockupProps) {
  const src =
    tone === 'light'
      ? '/brand/obsidixz-parent-logo-on-dark.png'
      : '/brand/obsidixz-parent-logo-on-light.png';

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <Image
        src={src}
        alt=""
        aria-hidden="true"
        width={ART_WIDTH}
        height={ART_HEIGHT}
        priority={tone === 'dark'}
        sizes="(min-width: 1024px) 112px, (min-width: 640px) 96px, 80px"
        className="h-auto w-20 shrink-0 sm:w-24 lg:w-28"
      />
      {hideLabel ? null : (
        <span
          aria-hidden="true"
          className={[
            'whitespace-nowrap font-display text-xs font-semibold',
            // 0.02em tracking, as approved.
            'tracking-[0.02em]',
            tone === 'light' ? 'text-royal-soft' : 'text-royal',
            'sm:text-sm',
          ].join(' ')}
        >
          Real Estate
        </span>
      )}
    </span>
  );
}
