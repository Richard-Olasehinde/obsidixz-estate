/**
 * Generates the temporary placeholder favicon raster assets.
 *
 * WHY THIS EXISTS
 * The approved Obsidixz logo / emblem has not been supplied in this repository.
 * Brand rules forbid recreating it. These files are therefore a NEUTRAL
 * geometric placeholder (royal field, white and gold interlocking squares) used
 * only for browser tabs and home-screen icons. They are not a substitute logo
 * and must be replaced once the approved asset is supplied.
 *
 * Run with:  node scripts/generate-favicons.mjs
 * Output:    public/favicon.svg, public/favicon-32.png, public/apple-touch-icon.png
 *
 * The social sharing card (public/og-image.png) is generated separately by
 * scripts/generate-og-image.sh because it needs a text renderer.
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = resolve(ROOT, 'public');
mkdirSync(PUBLIC, { recursive: true });

const ROYAL = [0x31, 0x5c, 0x9b];
const GOLD = [0xb4, 0x77, 0x45];
const WHITE = [0xff, 0xff, 0xff];
const INK = [0x11, 0x11, 0x11];

/* ------------------------------------------------------------------ */
/* Minimal RGBA canvas with box-filter downsampling for smooth edges    */
/* ------------------------------------------------------------------ */
function createCanvas(size) {
  const data = new Uint8ClampedArray(size * size * 4);
  const api = {
    size,
    data,
    fill(color) {
      for (let i = 0; i < size * size; i += 1) {
        data[i * 4] = color[0];
        data[i * 4 + 1] = color[1];
        data[i * 4 + 2] = color[2];
        data[i * 4 + 3] = 255;
      }
    },
    rect(x, y, w, h, color) {
      for (let py = Math.round(y); py < Math.round(y + h); py += 1) {
        for (let px = Math.round(x); px < Math.round(x + w); px += 1) {
          if (px < 0 || py < 0 || px >= size || py >= size) continue;
          const i = (py * size + px) * 4;
          data[i] = color[0];
          data[i + 1] = color[1];
          data[i + 2] = color[2];
          data[i + 3] = 255;
        }
      }
    },
  };
  return api;
}

/** Box-filter downsample by an integer factor. */
function downsample(canvas, factor) {
  const out = canvas.size / factor;
  if (!Number.isInteger(out)) throw new Error('downsample factor must divide canvas size');
  const target = createCanvas(out);
  for (let y = 0; y < out; y += 1) {
    for (let x = 0; x < out; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = 0; sy < factor; sy += 1) {
        for (let sx = 0; sx < factor; sx += 1) {
          const i = ((y * factor + sy) * canvas.size + (x * factor + sx)) * 4;
          r += canvas.data[i];
          g += canvas.data[i + 1];
          b += canvas.data[i + 2];
          a += canvas.data[i + 3];
        }
      }
      const n = factor * factor;
      const o = (y * out + x) * 4;
      target.data[o] = r / n;
      target.data[o + 1] = g / n;
      target.data[o + 2] = b / n;
      target.data[o + 3] = a / n;
    }
  }
  return target;
}

/* ------------------------------------------------------------------ */
/* PNG encoder (truecolour + alpha, 8 bit)                             */
/* ------------------------------------------------------------------ */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let c = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) c = CRC_TABLE[(c ^ buffer[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, body) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(body.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, body])), 0);
  return Buffer.concat([length, typeBuf, body, crc]);
}

function encodePng(canvas) {
  const { size, data } = canvas;
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  // Filter type 0 (None) prefixed per scanline.
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y += 1) {
    raw[y * (size * 4 + 1)] = 0;
    Buffer.from(data.buffer, y * size * 4, size * 4).copy(raw, y * (size * 4 + 1) + 1);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ------------------------------------------------------------------ */
/* Placeholder mark: royal field, white square, gold square            */
/* ------------------------------------------------------------------ */
function drawFavicon(canvas) {
  const s = canvas.size;
  canvas.fill(ROYAL);
  const unit = s / 16;
  // white outlined square (top-left)
  const stroke = Math.max(1, Math.round(unit * 0.55));
  const box = Math.round(unit * 6.4);
  const offset = Math.round(unit * 3.2);
  drawOutline(canvas, offset, offset, box, box, stroke, WHITE);
  // gold filled square (bottom-right)
  canvas.rect(s - offset - box, s - offset - box, box, box, GOLD);
}

function drawOutline(canvas, x, y, w, h, t, color) {
  canvas.rect(x, y, w, t, color);
  canvas.rect(x, y + h - t, w, t, color);
  canvas.rect(x, y, t, h, color);
  canvas.rect(x + w - t, y, t, h, color);
}

function renderIcon(target, factor = 4) {
  const big = createCanvas(target * factor);
  drawFavicon(big);
  return downsample(big, factor);
}

/* ------------------------------------------------------------------ */
/* SVG source for the browser tab                                      */
/* ------------------------------------------------------------------ */
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="Obsidixz Real Estate">
  <rect width="32" height="32" fill="#315C9B"/>
  <rect x="6.5" y="6.5" width="13" height="13" fill="none" stroke="#FFFFFF" stroke-width="1.6"/>
  <rect x="14" y="14" width="11.5" height="11.5" fill="#B47745"/>
</svg>
`;

writeFileSync(resolve(PUBLIC, 'favicon.svg'), faviconSvg);
writeFileSync(resolve(PUBLIC, 'favicon-32.png'), encodePng(renderIcon(32, 4)));
writeFileSync(resolve(PUBLIC, 'apple-touch-icon.png'), encodePng(renderIcon(180, 4)));
console.log('Wrote public/favicon.svg, favicon-32.png, apple-touch-icon.png');
