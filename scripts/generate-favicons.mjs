/**
 * Regenerates the browser icons from the supplied Obsidixz parent-logo artwork.
 *
 * The 32px browser mark is a proportional crop of the exact symbol already
 * present in `public/brand/obsidixz-parent-logo-on-light.png`. It is not
 * redrawn, recoloured, rotated, or stretched. ImageMagick is used only to crop
 * and downsample that source raster while preserving its colours/aspect ratio.
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
const SOURCE = resolve(PUBLIC, 'brand/obsidixz-parent-logo-on-light.png');

function convert(args) {
  const result = spawnSync('convert', args, { encoding: 'utf8' });
  if (result.error || result.status !== 0) {
    const reason = result.error?.message || result.stderr || `exit ${result.status}`;
    throw new Error(`ImageMagick failed: ${reason}`);
  }
}

// Exact bounds of the supplied interlock-diamond artwork within the committed
// parent-logo raster (931x785). Both outputs are centered on white to remain
// clear in browser chrome/home-screen launchers, while mark pixels remain as
// supplied.
const mark = ['-crop', '629x521+254+48', '+repage'];
convert([
  SOURCE,
  ...mark,
  '-resize', '32x32',
  '-gravity', 'center',
  '-background', 'white',
  '-alpha', 'remove',
  '-alpha', 'off',
  '-extent', '32x32',
  resolve(PUBLIC, 'favicon-32.png'),
]);

convert([
  SOURCE,
  ...mark,
  '-resize', '164x164',
  '-gravity', 'center',
  '-background', 'white',
  '-alpha', 'remove',
  '-alpha', 'off',
  '-extent', '180x180',
  resolve(PUBLIC, 'apple-touch-icon.png'),
]);

const png = readFileSync(resolve(PUBLIC, 'favicon-32.png')).toString('base64');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-label="Obsidixz">
  <!-- Exact crop of the supplied parent-logo artwork; no logo redraw. -->
  <image href="data:image/png;base64,${png}" width="32" height="32" />
</svg>
`;
writeFileSync(resolve(PUBLIC, 'favicon.svg'), svg);
console.log('Wrote faithful browser icons from public/brand/obsidixz-parent-logo-on-light.png');
