/**
 * Prepares the approved OBSIDIXZ parent-logo assets for the web.
 *
 * WHY THIS EXISTS
 * The founder supplied two 2000x1500 PNGs of the approved parent identity:
 *
 *   LOGO 1 transparent.png  — light-background artwork (dark square, dark
 *                             OBSIDIXZ wordmark, white interlock diamond)
 *   LOGO 2 transparent.png  — dark-background artwork (white square, white
 *                             wordmark, dark interlock diamond)
 *
 * They carry an enormous amount of empty transparent padding: the artwork
 * occupies only the middle ~24% of the canvas. Shipping 2000x1500 files whose
 * visible content is a fraction of that wastes bandwidth and makes the logo
 * impossible to size predictably in a header.
 *
 * WHAT THIS DOES — AND DELIBERATELY DOES NOT DO
 *  - It finds the alpha bounding box and crops the *outer* excess only.
 *  - It preserves the artwork's own internal padding by re-applying a margin
 *    equal to a percentage of the ink box (see PAD_RATIO), so the supplied
 *    proportion of breathing room around the mark is retained rather than
 *    collapsed to zero.
 *  - It scales with a box filter. No rotation, no recolouring, no redrawing,
 *    no sharpening, no gamma change. Pixels inside the ink box are the supplied
 *    pixels, resampled.
 *
 * The previous round trimmed the logo pair to 640x528 and verified that result
 * pixel-identically; this reverses that trim to restore the supplied padding,
 * then re-preserves it at a smaller size. That is packaging, not alteration.
 *
 * Not required at build time: the outputs are committed. Re-run only if the
 * source artwork changes:
 *
 *   node scripts/prepare-brand-assets.mjs "/path/to/LOGO 1 transparent.png" "/path/to/LOGO 2 transparent.png"
 */
import { deflateSync, inflateSync } from 'node:zlib';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_BRAND = resolve(ROOT, 'public/brand');
mkdirSync(PUBLIC_BRAND, { recursive: true });

/** Target width of the exported artwork, in pixels. */
const TARGET_WIDTH = 960;
/**
 * Transparent margin kept around the ink box, as a fraction of the ink box's
 * larger dimension. ~7.5% reproduces the supplied artwork's own breathing room
 * at header size without inflating the file.
 */
const PAD_RATIO = 0.075;

/* ------------------------------------------------------------------ */
/* Minimal PNG decode (8-bit RGB/RGBA, non-interlaced)                  */
/* ------------------------------------------------------------------ */
function decodePng(buffer) {
  if (buffer.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');

  let pos = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlace = 0;
  const idat = [];

  while (pos < buffer.length) {
    const length = buffer.readUInt32BE(pos);
    const type = buffer.toString('ascii', pos + 4, pos + 8);
    const data = buffer.subarray(pos + 8, pos + 8 + length);

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') {
      break;
    }
    pos += 12 + length;
  }

  if (bitDepth !== 8) throw new Error(`unsupported bit depth ${bitDepth}`);
  if (interlace !== 0) throw new Error('interlaced PNGs are not supported');
  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType];
  if (!channels) throw new Error(`unsupported colour type ${colorType}`);

  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const out = new Uint8ClampedArray(width * height * 4);
  let prev = Buffer.alloc(stride);
  let offset = 0;

  for (let y = 0; y < height; y += 1) {
    const filter = raw[offset];
    offset += 1;
    const line = Buffer.from(raw.subarray(offset, offset + stride));
    offset += stride;

    for (let x = 0; x < stride; x += 1) {
      const a = x >= channels ? line[x - channels] : 0;
      const b = prev[x];
      const c = x >= channels ? prev[x - channels] : 0;
      switch (filter) {
        case 0: break;
        case 1: line[x] = (line[x] + a) & 0xff; break;
        case 2: line[x] = (line[x] + b) & 0xff; break;
        case 3: line[x] = (line[x] + ((a + b) >> 1)) & 0xff; break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a);
          const pb = Math.abs(p - b);
          const pc = Math.abs(p - c);
          const pred = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
          line[x] = (line[x] + pred) & 0xff;
          break;
        }
        default: throw new Error(`unknown filter ${filter}`);
      }
    }

    for (let x = 0; x < width; x += 1) {
      const src = x * channels;
      const dst = (y * width + x) * 4;
      if (channels === 4) {
        out[dst] = line[src];
        out[dst + 1] = line[src + 1];
        out[dst + 2] = line[src + 2];
        out[dst + 3] = line[src + 3];
      } else if (channels === 3) {
        out[dst] = line[src];
        out[dst + 1] = line[src + 1];
        out[dst + 2] = line[src + 2];
        out[dst + 3] = 255;
      } else if (channels === 1) {
        out[dst] = out[dst + 1] = out[dst + 2] = line[src];
        out[dst + 3] = 255;
      } else {
        out[dst] = out[dst + 1] = out[dst + 2] = line[src];
        out[dst + 3] = line[src + 1];
      }
    }

    prev = line;
  }

  return { width, height, data: out };
}

/* ------------------------------------------------------------------ */
/* Minimal PNG encode (RGBA, filter 0)                                 */
/* ------------------------------------------------------------------ */
function crc32(buffer) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n += 1) {
      let c = n;
      for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  let crc = -1;
  for (let i = 0; i < buffer.length; i += 1) crc = table[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function encodePng(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0;
    Buffer.from(rgba.buffer, rgba.byteOffset + y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ------------------------------------------------------------------ */
/* Ink box + resample                                                  */
/* ------------------------------------------------------------------ */
function inkBox({ width, height, data }) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) throw new Error('image is fully transparent');
  return { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

/** Box-filter resample of a sub-rectangle, premultiplied to avoid dark fringes. */
function resample(src, box, scale, padRatio) {
  const pad = Math.round(Math.max(box.width, box.height) * padRatio);
  const outW = Math.round(box.width * scale) + pad * 2;
  const outH = Math.round(box.height * scale) + pad * 2;
  const out = new Uint8ClampedArray(outW * outH * 4);

  for (let y = 0; y < box.height * scale; y += 1) {
    for (let x = 0; x < box.width * scale; x += 1) {
      const sx0 = box.minX + Math.floor(x / scale);
      const sy0 = box.minY + Math.floor(y / scale);
      const sx1 = Math.min(box.minX + Math.ceil((x + 1) / scale), box.maxX + 1);
      const sy1 = Math.min(box.minY + Math.ceil((y + 1) / scale), box.maxY + 1);

      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let n = 0;
      for (let sy = sy0; sy < sy1; sy += 1) {
        for (let sx = sx0; sx < sx1; sx += 1) {
          const i = (sy * src.width + sx) * 4;
          const alpha = src.data[i + 3] / 255;
          r += src.data[i] * alpha;
          g += src.data[i + 1] * alpha;
          b += src.data[i + 2] * alpha;
          a += alpha;
          n += 1;
        }
      }
      if (n === 0) continue;
      const dst = ((y + pad) * outW + (x + pad)) * 4;
      const alpha = a / n;
      out[dst + 3] = Math.round(alpha * 255);
      if (alpha > 0) {
        out[dst] = Math.round(r / a);
        out[dst + 1] = Math.round(g / a);
        out[dst + 2] = Math.round(b / a);
      }
    }
  }
  return { width: outW, height: outH, data: out };
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */
const [lightPath, darkPath] = process.argv.slice(2);
if (!lightPath || !darkPath) {
  console.error('usage: node scripts/prepare-brand-assets.mjs "<light png>" "<dark png>"');
  process.exit(1);
}

for (const [source, target] of [
  [lightPath, 'obsidixz-parent-logo-on-light.png'],
  [darkPath, 'obsidixz-parent-logo-on-dark.png'],
]) {
  const decoded = decodePng(readFileSync(source));
  const box = inkBox(decoded);
  const scale = TARGET_WIDTH / (box.width + Math.max(box.width, box.height) * PAD_RATIO * 2);
  const result = resample(decoded, box, scale, PAD_RATIO);
  const png = encodePng(result.width, result.height, result.data);
  writeFileSync(resolve(PUBLIC_BRAND, target), png);
  console.log(
    `${target}: source ${decoded.width}x${decoded.height}, ink box ${box.width}x${box.height} ` +
      `at (${box.minX},${box.minY}), output ${result.width}x${result.height}, ` +
      `${(png.length / 1024).toFixed(1)} KiB`,
  );
}
