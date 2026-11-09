/**
 * Regenerates the Obsidixz browser icons from the founder-provided transparent
 * parent-symbol asset.
 *
 * Source: public/brand/obsidixz-parent-symbol-transparent.png
 *
 * ImageMagick trims only fully transparent outer canvas, then proportionally
 * downsamples the supplied pixels into a square transparent favicon canvas.
 * The mark is never redrawn, recoloured, rotated, or stretched.
 *
 * Requirements: ImageMagick `convert` on PATH.
 * Run:         node scripts/generate-favicons.mjs
 * Output:      public/favicon.svg, favicon-32.png, apple-touch-icon.png
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const PUBLIC = resolve(ROOT, 'public');
const SOURCE = resolve(PUBLIC, 'brand/obsidixz-parent-symbol-transparent.png');

function convert(args) {
  const result = spawnSync('convert', args, { encoding: 'utf8' });
  if (result.error || result.status !== 0) {
    const reason = result.error?.message || result.stderr || `exit ${result.status}`;
    throw new Error(`ImageMagick failed: ${reason}`);
  }
}

function render(size, filename) {
  convert([
    SOURCE,
    '-trim',
    '+repage',
    '-resize', `${size}x${size}`,
    '-gravity', 'center',
    '-background', 'none',
    '-extent', `${size}x${size}`,
    resolve(PUBLIC, filename),
  ]);
}

render(32, 'favicon-32.png');
render(180, 'apple-touch-icon.png');

const png = readFileSync(resolve(PUBLIC, 'favicon-32.png')).toString('base64');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-label="Obsidixz">
  <!-- The exact founder-provided transparent PNG, trimmed only outside its artwork. -->
  <image href="data:image/png;base64,${png}" width="32" height="32" />
</svg>
`;
writeFileSync(resolve(PUBLIC, 'favicon.svg'), svg);
console.log('Wrote transparent browser icons from the founder-provided parent-symbol PNG');
