#!/usr/bin/env node
/**
 * Layout metrics check — catches the defect class the smoke test cannot.
 *
 * WHY THIS EXISTS
 * Most "unintended horizontal scrolling" bugs on a small marketing site come
 * from one thing: a word that is wider than the column holding it. At narrow
 * widths a single long word ("requirements", "recommendations") in a multi-
 * column grid forces the grid wider than the container, and every element to
 * its right inherits the overflow.
 *
 * This script measures the real advance widths of the strings that are laid out
 * in multi-column cells, using the actual Montserrat and Open Sans metrics that
 * ship with the site, and asserts that the widest word fits the narrowest
 * column each breakpoint produces.
 *
 * It runs without a browser (none is available in CI or in the build sandbox),
 * so it is a static geometric proof rather than a rendering test. What it does
 * NOT cover: image aspect ratios, absolutely positioned decoration, or the
 * behaviour of user-supplied text. Those are checked by the rules listed in
 * DEVELOPMENT_STATUS.md.
 *
 * Run: node scripts/check-layout-metrics.mjs
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/* ------------------------------------------------------------------ */
/* Minimal TrueType metric reader                                      */
/* ------------------------------------------------------------------ */
/**
 * The static instances in scripts/fonts/ are cut from the same
 * @fontsource-variable files the site ships (see scripts/fonts/README.md), so
 * the metrics measured here are the metrics the browser uses. Shipping small
 * static TTFs keeps this check dependency-free and offline — no font library,
 * no network, no woff2 decoder to get wrong.
 */
function loadFont(relativePath) {
  const sfnt = readFileSync(resolve(ROOT, relativePath));

  const numTables = sfnt.readUInt16BE(4);
  const tables = {};
  for (let i = 0; i < numTables; i += 1) {
    const base = 12 + i * 16;
    const tag = sfnt.toString('ascii', base, base + 4).trim();
    tables[tag] = {
      offset: sfnt.readUInt32BE(base + 8),
      length: sfnt.readUInt32BE(base + 12),
    };
  }

  const unitsPerEm = sfnt.readUInt16BE(tables.head.offset + 18);
  const numGlyphs = sfnt.readUInt16BE(tables.maxp.offset + 4);
  const numberOfHMetrics = sfnt.readUInt16BE(tables.hhea.offset + 34);

  const hmtx = tables.hmtx.offset;
  const advance = new Uint16Array(numGlyphs);
  let last = 0;
  for (let g = 0; g < numGlyphs; g += 1) {
    if (g < numberOfHMetrics) last = sfnt.readUInt16BE(hmtx + g * 4);
    advance[g] = last;
  }

  // cmap: use the Windows Unicode BMP subtable (format 4).
  const cmapBase = tables.cmap.offset;
  const numSub = sfnt.readUInt16BE(cmapBase + 2);
  let bmp = null;
  for (let i = 0; i < numSub; i += 1) {
    const rec = cmapBase + 4 + i * 8;
    const platform = sfnt.readUInt16BE(rec);
    const encoding = sfnt.readUInt16BE(rec + 2);
    const sub = cmapBase + sfnt.readUInt32BE(rec + 4);
    if (sfnt.readUInt16BE(sub) === 4 && (platform === 3 || platform === 0)) {
      bmp = sub;
      if (platform === 3 && encoding === 1) break;
    }
  }
  if (bmp === null) throw new Error(`no format-4 cmap in ${relativePath}`);

  const segX2 = sfnt.readUInt16BE(bmp + 6);
  const segCount = segX2 / 2;
  const endBase = bmp + 14;
  const startBase = endBase + segX2 + 2;
  const deltaBase = startBase + segX2;
  const rangeBase = deltaBase + segX2;

  const glyphFor = (codePoint) => {
    for (let s = 0; s < segCount; s += 1) {
      if (codePoint > sfnt.readUInt16BE(endBase + s * 2)) continue;
      const start = sfnt.readUInt16BE(startBase + s * 2);
      if (codePoint < start) return 0;
      const delta = sfnt.readInt16BE(deltaBase + s * 2);
      const rangeOffset = sfnt.readUInt16BE(rangeBase + s * 2);
      if (rangeOffset === 0) return (codePoint + delta) & 0xffff;
      const address = rangeBase + s * 2 + rangeOffset + (codePoint - start) * 2;
      const glyph = sfnt.readUInt16BE(address);
      return glyph === 0 ? 0 : (glyph + delta) & 0xffff;
    }
    return 0;
  };

  return {
    unitsPerEm,
    width(text, px, trackingEm = 0) {
      let total = 0;
      for (const char of text) {
        total += advance[glyphFor(char.codePointAt(0))] ?? advance[0];
      }
      return (total / unitsPerEm) * px + trackingEm * px * text.length;
    },
  };
}

/* ------------------------------------------------------------------ */
/* Measurement helpers                                                 */
/* ------------------------------------------------------------------ */
const MONSERRAT = loadFont('scripts/fonts/Montserrat-SemiBold.ttf');
const MONSERRAT_BOLD = loadFont('scripts/fonts/Montserrat-Bold.ttf');
const OPEN_SANS = loadFont('scripts/fonts/OpenSans-SemiBold.ttf');

/** Container content width for a viewport, mirroring Container.tsx. */
function contentWidth(vw) {
  const padding = vw < 640 ? 40 : 64; // px-5 (20 each side) / sm:px-8 (32 each side)
  return Math.min(vw - padding, 1216); // max-w-[76rem]
}

/** Widths a multi-column grid produces, considering the 1px gap. */
function cellInner(vw, columns, paddingX) {
  const content = contentWidth(vw);
  const cell = (content - (columns - 1)) / columns;
  return cell - paddingX;
}

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m'}  ${name}${detail ? `\n      ${detail}` : ''}`);
}

function widestWord(text, font, sizePx, trackingEm = 0) {
  const words = text.split(/\s+/).filter(Boolean);
  let worst = { word: '', width: 0 };
  for (const word of words) {
    const width = font.width(word, sizePx, trackingEm);
    if (width > worst.width) worst = { word, width };
  }
  return worst;
}

function assertFits(label, strings, font, sizePx, inner, trackingEm = 0) {
  let failing = null;
  for (const text of strings) {
    const { word, width } = widestWord(text, font, sizePx, trackingEm);
    if (width > inner) {
      failing = `"${word}" needs ${width.toFixed(0)}px but the cell allows ${inner.toFixed(0)}px`;
      break;
    }
  }
  check(label, failing === null, failing ?? `fits ${inner.toFixed(0)}px cells`);
}

console.log('\nLayout metrics — verifying words fit the columns they are laid out in');
console.log('='.repeat(66));

/* --- Hero headline: explicit line breaks must fit the copy column ------ */
const heroLines = ['Smarter Research.', 'Better Real Estate', 'Opportunities.'];
function heroFontSize(vw) {
  // text-display: clamp(2.15rem, 1.05rem + 3.4vw, 3.75rem)
  return Math.max(2.15 * 16, Math.min(1.05 * 16 + 0.034 * vw, 3.75 * 16));
}
for (const vw of [360, 390, 768, 1024, 1280, 1440]) {
  const heroColumn = vw < 1280 ? contentWidth(vw) : (contentWidth(vw) - 56) * 0.6;
  const size = heroFontSize(vw);
  let failing = null;
  for (const line of heroLines) {
    const width = MONSERRAT_BOLD.width(line, size, -0.028);
    if (width > heroColumn) {
      failing = `"${line}" needs ${width.toFixed(0)}px, column is ${heroColumn.toFixed(0)}px`;
    }
  }
  check(
    `hero headline fits at ${vw}px`,
    failing === null,
    failing ?? `widest line fits ${heroColumn.toFixed(0)}px at ${size.toFixed(1)}px type`,
  );
}

/* --- Header: logo + nav + CTA must fit on one line -------------------- */
/*
 * The header logo is the approved parent artwork plus the "Real Estate"
 * secondary label. The artwork width is the Tailwind class on the image
 * (`w-20 sm:w-24 lg:w-28`), so the measured width must be the *resolved* width
 * at each viewport, not a single constant. The label is measured with the real
 * Montserrat metrics at its own breakpoint size, plus the `gap-1.5` (6px)
 * between logo and label.
 *
 * If the artwork sizes or the label change, these constants must change with
 * them or this check silently stops testing the real thing.
 */
const LOCKUP_GAP = 6; // gap-1.5
const LOGO_WIDTH_AT = (vw) => (vw >= 1024 ? 112 : vw >= 640 ? 96 : 80); // w-28 / w-24 / w-20
const LABEL_SIZE_AT = (vw) => (vw >= 640 ? 14 : 12); // text-sm / text-xs
const HEADER_HEIGHT_AT = (vw) => (vw >= 1024 ? 104 : vw >= 640 ? 92 : 80); // h-[5rem] sm:h-[5.75rem] lg:h-[6.5rem]
const LOGO_HEIGHT_AT = (vw) => (LOGO_WIDTH_AT(vw) * 785) / 931; // exact supplied artwork ratio

for (const vw of [320, 640, 768, 1024, 1280]) {
  const clearance = (HEADER_HEIGHT_AT(vw) - LOGO_HEIGHT_AT(vw)) / 2;
  check(
    `full parent-logo lockup has 4px vertical clearance at ${vw}px`,
    clearance >= 4,
    `${HEADER_HEIGHT_AT(vw)}px header − ${LOGO_HEIGHT_AT(vw).toFixed(1)}px supplied artwork = ${(clearance * 2).toFixed(1)}px total clearance`,
  );
}

for (const vw of [1280, 1440, 1920]) {
  const content = contentWidth(vw);
  const navLabels = ['Home', 'About Us', 'Services', 'How It Works', 'Who We Serve', 'Contact'];
  const navWidth = navLabels.reduce((sum, label) => sum + OPEN_SANS.width(label, 14.72), 0) + 7 * 28;
  const logoWidth = LOGO_WIDTH_AT(vw);
  const labelWidth = MONSERRAT.width('Real Estate', LABEL_SIZE_AT(vw), 0.02);
  const lockupWidth = logoWidth + LOCKUP_GAP + labelWidth;
  const ctaWidth = OPEN_SANS.width('Discuss Your Requirements', 15.2) + 48;
  const total = lockupWidth + 24 + navWidth + 24 + ctaWidth;
  check(
    `header fits on one line at ${vw}px`,
    total <= content,
    `lockup(${lockupWidth.toFixed(0)}=logo ${logoWidth}+gap+label ${labelWidth.toFixed(0)})+nav+cta = ${total.toFixed(0)}px, content = ${content.toFixed(0)}px`,
  );
}

/*
 * Narrow screens: the lockup and the 44px menu control share one row. The
 * label must never wrap underneath the mark or force the mark to shrink, so
 * the lockup has to fit beside the control with the container gutter intact.
 */
for (const vw of [320, 360, 375, 414, 768]) {
  const gutter = vw >= 1024 ? 48 : vw >= 640 ? 40 : 20;
  const content = vw - gutter * 2;
  const logoWidth = LOGO_WIDTH_AT(vw);
  const labelWidth = MONSERRAT.width('Real Estate', LABEL_SIZE_AT(vw), 0.02);
  const lockupWidth = logoWidth + LOCKUP_GAP + labelWidth;
  const controlWidth = 44;
  const gap = 16;
  check(
    `lockup fits beside the menu control at ${vw}px`,
    lockupWidth + gap + controlWidth <= content,
    `lockup ${lockupWidth.toFixed(0)}px + gap ${gap} + control ${controlWidth} = ${(lockupWidth + gap + controlWidth).toFixed(0)}px, content ${content.toFixed(0)}px`,
  );
}

/* --- Multi-column grids: the widest word in each cell ----------------- */
const stepTitles = [
  'Submit your requirements',
  'Review and scope',
  'Research prospects',
  'Review and organise',
  'Receive your research',
];
const h3Size = (vw) => Math.max(1.2 * 16, Math.min(1 * 16 + 0.007 * vw, 1.45 * 16));

assertFits('process steps fit 2-up at 640px', stepTitles, MONSERRAT, h3Size(640), cellInner(640, 2, 48));
assertFits('process steps fit 2-up at 1024px', stepTitles, MONSERRAT, h3Size(1024), cellInner(1024, 2, 48));
assertFits('process steps fit 5-up at 1280px', stepTitles, MONSERRAT, h3Size(1280), cellInner(1280, 5, 48));
assertFits('process steps fit 5-up at 1440px', stepTitles, MONSERRAT, h3Size(1440), cellInner(1440, 5, 48));

assertFits(
  'service scope cards fit 2-up at 640px',
  ['Requirements you set', 'Research against those criteria', 'A structured deliverable', 'An honest account of the gaps'],
  MONSERRAT,
  16.32,
  cellInner(640, 2, 48),
);
assertFits(
  'contact next-steps fit 3-up at 768px',
  ['We read it properly', 'We check the location and criteria', 'We reply on scope'],
  OPEN_SANS,
  14.72,
  cellInner(768, 3, 48),
);
assertFits(
  'not-for list fits 2-up at 640px',
  ['Consumers looking for a home to buy or rent', 'Investors seeking advice, recommendations or returns'],
  OPEN_SANS,
  14.72,
  cellInner(640, 2, 40),
);
assertFits(
  'format cards fit 3-up at 768px',
  ['Spreadsheet', 'Written report', 'Both'],
  MONSERRAT,
  16.32,
  cellInner(768, 3, 56),
);
/*
 * The business address is a single unbreakable token. If it does not fit the
 * panel it breaks mid-address, which is legible but ugly. Measure it against
 * the panel's real inner width at the narrowest supported viewport.
 */
for (const [vw, sizeRem, label] of [
  [320, 0.86, 'narrow step'],
  [360, 0.86, 'narrow step'],
  [640, 1.05, 'sm and up'],
  [1280, 1.05, 'sm and up'],
]) {
  const gutter = 20;
  const content = vw - gutter * 2;
  const panelInner = content - 20 * 2 - 2; // px-5 both sides + 1px borders
  check(
    `business email fits the address panel at ${vw}px (${label})`,
    MONSERRAT.width('obsidixz.realestate@outlook.com', sizeRem * 16) <= panelInner,
    `${MONSERRAT.width('obsidixz.realestate@outlook.com', sizeRem * 16).toFixed(0)}px of ${panelInner.toFixed(0)}px`,
  );
}

assertFits(
  'intro labels fit their 9rem column',
  ['What we do', 'Who it is for', 'How it is done'],
  MONSERRAT,
  11.52,
  144,
  0.16,
);

/* --- Full-width buttons at 360px ------------------------------------- */
for (const label of ['Explore Our Services', 'Discuss Your Requirements', 'Sending enquiry…']) {
  const width = OPEN_SANS.width(label, 16) + 56;
  check(`button "${label}" fits at 360px`, width <= contentWidth(360), `${width.toFixed(0)}px of ${contentWidth(360)}px`);
}

/* --- Longest single word anywhere in body copy ----------------------- */
const longWords = ['recommendations', 'requirements', 'classification', 'unconfirmed', 'acknowledgement'];
for (const word of longWords) {
  const width = OPEN_SANS.width(word, 17); // base body size
  check(`long word "${word}" fits the narrowest body column`, width <= contentWidth(360), `${width.toFixed(0)}px of ${contentWidth(360)}px`);
}

const failed = results.filter((r) => !r.ok);
console.log('\n' + '='.repeat(66));
console.log(`Result: ${results.length - failed.length}/${results.length} layout checks passed, ${failed.length} failed`);
process.exit(failed.length > 0 ? 1 : 0);
