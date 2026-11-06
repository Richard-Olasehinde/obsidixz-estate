import Image from 'next/image';

/**
 * OBSIDIXZ LOGO LOCKUP
 * ====================
 *
 * Renders the approved Obsidixz logo artwork, supplied by the founder as a
 * transparent PNG pair (2000×1500 RGBA source). No part of the mark is redrawn,
 * recoloured, re-proportioned or approximated: the files in `public/brand/` are
 * the supplied artwork with surrounding transparent padding trimmed and the
 * image downscaled to its display size. Verified pixel-identical to the resized
 * source.
 *
 * Two variants, chosen by the `tone` prop:
 *
 *   tone="dark"  (default) → `obsidixz-logo-on-light.png`
 *     Dark square, black OBSIDIXZ wordmark, black-outlined white interlock
 *     diamond. For light backgrounds. Used in the site header.
 *
 *   tone="light"           → `obsidixz-logo-on-dark.png`
 *     White square, white OBSIDIXZ wordmark, white-outlined black interlock
 *     diamond. For dark backgrounds. Used in the footer.
 *
 * Accessibility: the artwork contains the wordmark text, so the image itself is
 * `alt=""` and `aria-hidden`. The surrounding link supplies the accessible name
 * (`aria-label="Obsidixz Real Estate — home"`). This avoids the screen reader
 * announcing "Obsidixz" twice.
 *
 * The supplied artwork is PNG, not SVG. If vector source is ever provided, drop
 * it in as `obsidixz-logo-on-light.svg` / `-on-dark.svg` and switch the two
 * `src` values below; nothing else needs to change.
 */

const LOCKUP_WIDTH = 160;
const LOCKUP_HEIGHT = 132;

type LogoLockupProps = {
  /** `dark` = artwork for light backgrounds. `light` = artwork for dark backgrounds. */
  tone?: 'dark' | 'light';
  className?: string;
  /** Renders the logo at a smaller size (used where vertical space is tight). */
  compact?: boolean;
};

export function LogoLockup({ tone = 'dark', className = '', compact = false }: LogoLockupProps) {
  const src = tone === 'light' ? '/brand/obsidixz-logo-on-dark.png' : '/brand/obsidixz-logo-on-light.png';

  const width = compact ? Math.round(LOCKUP_WIDTH * 0.82) : LOCKUP_WIDTH;
  const height = compact ? Math.round(LOCKUP_HEIGHT * 0.82) : LOCKUP_HEIGHT;

  return (
    <Image
      src={src}
      alt=""
      aria-hidden="true"
      width={width}
      height={height}
      priority={tone === 'dark'}
      sizes={`${width}px`}
      className={`h-auto w-auto ${className}`}
      style={{ maxHeight: compact ? 44 : 54 }}
    />
  );
}
