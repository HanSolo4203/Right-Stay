#!/usr/bin/env node
/**
 * Pre-generate static WebP hero variants, LQIP blur data, and Google-sized favicons.
 * Run from repo root: node scripts/optimize-marketing-images.mjs
 *
 * Keep WIDTHS in sync with HERO_VARIANT_WIDTHS in lib/marketing-images.ts.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, 'public');
const WIDTHS = [800, 1280, 1920, 2560];

const HERO_JPEGS = [
  'images/hero-home.jpg',
  'images/hero-stay.jpg',
  'images/hero-host.jpg',
  'images/hero-contact.jpg',
  'images/hero-lions-head.jpg',
  'images/services-experiences.jpg',
  'images/testimonial-ribbon-flow-brand.jpg',
  'images/d953ad7f-2dd7-42f7-8f74-593d55181036_3840w_1.jpg',
];

const BLUR_JPEGS = [
  ...HERO_JPEGS,
  'images/services-accommodation.jpg',
  'images/tile-premium-accommodation.jpg',
  'images/tile-experiences.jpg',
  'images/tile-asset-management.jpg',
  'images/tile-we-know.jpg',
  'images/services-exterior.jpg',
  'images/services-living.jpg',
  'images/services-asset-management.jpg',
];

function publicUrl(rel) {
  return `/${rel.replaceAll('\\', '/')}`;
}

function variantWidths(masterWidth) {
  const widths = WIDTHS.filter((width) => width < masterWidth);
  if (masterWidth >= 640) widths.push(masterWidth);
  return [...new Set(widths)].sort((a, b) => a - b);
}

function webpQuality(width) {
  if (width <= 800) return 80;
  if (width <= 1280) return 84;
  return 85;
}

async function optimizeHeroes() {
  for (const rel of HERO_JPEGS) {
    const input = path.join(PUBLIC, rel);
    if (!fs.existsSync(input)) {
      console.warn('skip missing', rel);
      continue;
    }
    const parsed = path.parse(input);
    const meta = await sharp(input).metadata();
    const origKb = Math.round(fs.statSync(input).size / 1024);
    const masterWidth = meta.width || 1920;
    console.log(`\n${rel}  ${meta.width}x${meta.height}  ${origKb}KB`);

    const stale = fs
      .readdirSync(parsed.dir)
      .filter((name) => name.startsWith(`${parsed.name}-`) && name.endsWith('.webp'));
    for (const name of stale) {
      fs.unlinkSync(path.join(parsed.dir, name));
    }

    for (const width of variantWidths(masterWidth)) {
      const outPath = path.join(parsed.dir, `${parsed.name}-${width}.webp`);
      const quality = webpQuality(width);
      await sharp(input)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality, effort: 6, smartSubsample: false })
        .toFile(outPath);
      const kb = Math.round(fs.statSync(outPath).size / 1024);
      console.log(`  -> ${path.basename(outPath)}  q${quality}  ${kb}KB`);
    }
  }
}

async function writeBlurFile() {
  const blurs = {};
  const dimensions = {};

  for (const rel of BLUR_JPEGS) {
    const input = path.join(PUBLIC, rel);
    if (!fs.existsSync(input)) continue;
    const meta = await sharp(input).metadata();
    dimensions[publicUrl(rel)] = {
      width: meta.width || 0,
      height: meta.height || 0,
    };
    const buf = await sharp(input)
      .rotate()
      .resize({ width: 32 })
      .jpeg({ quality: 38, mozjpeg: true })
      .toBuffer();
    blurs[publicUrl(rel)] = `data:image/jpeg;base64,${buf.toString('base64')}`;
  }

  const blurEntries = Object.entries(blurs)
    .map(([key, value]) => `  '${key}': '${value}',`)
    .join('\n');
  const dimEntries = Object.entries(dimensions)
    .map(([key, value]) => `  '${key}': { width: ${value.width}, height: ${value.height} },`)
    .join('\n');

  const file = `/** Auto-generated LQIP blur data for marketing images. */
export const MARKETING_IMAGE_BLUR: Record<string, string> = {
${blurEntries}
};

export const MARKETING_IMAGE_DIMENSIONS: Record<string, { width: number; height: number }> = {
${dimEntries}
};
`;

  fs.writeFileSync(path.join(ROOT, 'lib/marketing-image-blur.ts'), file);
  console.log('\nWrote lib/marketing-image-blur.ts');
}

async function writeFavicons() {
  const svgPath = path.join(PUBLIC, 'favicon.svg');
  const applePath = path.join(PUBLIC, 'apple-touch-icon.png');
  const source = fs.existsSync(svgPath) ? svgPath : applePath;

  for (const size of [96, 192]) {
    const out = path.join(PUBLIC, `favicon-${size}x${size}.png`);
    await sharp(source)
      .resize(size, size, { fit: 'cover' })
      .png({ compressionLevel: 9 })
      .toFile(out);
    console.log(`Wrote ${path.basename(out)} (${Math.round(fs.statSync(out).size / 1024)}KB)`);
  }
}

await optimizeHeroes();
await writeBlurFile();
await writeFavicons();
console.log('\nDone.');
