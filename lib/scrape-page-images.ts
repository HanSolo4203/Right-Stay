import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36';

const MAX_HTML_BYTES = 2_000_000;
const MAX_REDIRECTS = 5;
const FETCH_TIMEOUT_MS = 15_000;

const META_IMAGE_NAMES = new Set([
  'og:image',
  'og:image:url',
  'og:image:secure_url',
  'twitter:image',
  'twitter:image:src',
]);

const JUNK_IMAGE =
  /(?:favicon|apple-touch|sprite|avatar|placeholder|spinner|1x1|pixel|tracking|spacer|emoji|doubleclick|analytics|\/ads\/|adserver|logo|icon|badge|widget|rating|social)/i;

export type ScrapedImageCandidate = {
  url: string;
  key: string;
};

export class PageImageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PageImageError';
  }
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)));
}

function prepareHtml(html: string) {
  return html
    .replace(/\\u002F/gi, '/')
    .replace(/\\u0026/gi, '&')
    .replace(/\\\//g, '/')
    .replace(/&amp;/gi, '&');
}

function isPrivateIpv4(ip: string) {
  const parts = ip.split('.').map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return true;
  }
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a >= 224) return true;
  return false;
}

function isPrivateIp(ip: string) {
  const normalized = ip.toLowerCase();
  if (normalized.includes(':')) {
    if (normalized === '::1' || normalized === '::') return true;
    if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
    if (/^fe[89ab]/.test(normalized)) return true;
    const mapped = normalized.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateIpv4(mapped[1]);
    return false;
  }
  return isPrivateIpv4(normalized);
}

async function assertPublicHttpUrl(raw: string) {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new PageImageError('Enter a full website URL, including https://');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new PageImageError('Only http and https website URLs can be imported.');
  }
  if (url.username || url.password) {
    throw new PageImageError('Website URLs with a username or password are not supported.');
  }

  const host = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (
    !host ||
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host === 'metadata.google.internal'
  ) {
    throw new PageImageError('That URL cannot be imported.');
  }

  if (isIP(host)) {
    if (isPrivateIp(host)) throw new PageImageError('That URL cannot be imported.');
    return url;
  }

  let records: { address: string }[];
  try {
    records = await lookup(host, { all: true, verbatim: true });
  } catch {
    throw new PageImageError('Could not open that website.');
  }
  if (records.length === 0 || records.some((record) => isPrivateIp(record.address))) {
    throw new PageImageError('That URL cannot be imported.');
  }
  return url;
}

function parseAttributes(tag: string) {
  const attrs: Record<string, string> = {};
  const pattern = /([:@\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(tag))) {
    attrs[match[1].toLowerCase()] = decodeHtml(match[2] ?? match[3] ?? match[4] ?? '');
  }
  return attrs;
}

function hintedWidth(raw: string) {
  const queryWidth = raw.match(/[?&](?:w|width)=(\d{2,5})/i);
  if (queryWidth) return Number(queryWidth[1]);
  const size = raw.match(/[-_/](\d{2,5})x(\d{2,5})(?:[-_.]|$)/i);
  if (size) return Math.max(Number(size[1]), Number(size[2]));
  const px = raw.match(/(\d{2,5})px/i);
  if (px) return Number(px[1]);
  return 0;
}

function looksLikeImageUrl(raw: string) {
  if (/\.(?:jpe?g|png|webp|avif|gif)(?:$|[?#])/i.test(raw)) return true;
  if (/tripadvisor\.com\/media\/photo-/i.test(raw)) return true;
  if (/googleusercontent\.com\/.+=s\d+/i.test(raw)) return true;
  if (/images\.unsplash\.com/i.test(raw)) return true;
  if (/upload\.wikimedia\.org/i.test(raw)) return true;
  return false;
}

function upgradeImageUrl(url: URL) {
  const host = url.hostname.toLowerCase();
  if (host.endsWith('tripadvisor.com') && /\/media\/photo-[a-z]\//.test(url.pathname)) {
    url.pathname = url.pathname.replace(/\/media\/photo-[a-z]\//, '/media/photo-o/');
    url.searchParams.set('w', '1200');
    url.searchParams.delete('h');
  }

  if (host.endsWith('wikimedia.org') && url.pathname.includes('/thumb/')) {
    const parts = url.pathname.split('/');
    const file = parts[parts.length - 1] || '';
    const px = file.match(/^(\d+)px-/i);
    if (px && Number(px[1]) < 1000) {
      parts[parts.length - 1] = file.replace(/^\d+px-/i, '1280px-');
      url.pathname = parts.join('/');
    }
  }

  return url;
}

function identityKey(url: URL) {
  const path = url.pathname.replace(/\/media\/photo-[a-z]\//, '/media/photo/');
  return `${url.hostname.toLowerCase()}${path}`;
}

function addCandidate(
  bucket: Map<string, { url: string; key: string; score: number }>,
  raw: string,
  baseUrl: string,
  score: number
) {
  const trimmed = decodeHtml(raw).trim();
  if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return;

  let absolute: URL;
  try {
    const withProtocol = trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;
    absolute = new URL(withProtocol, baseUrl);
  } catch {
    return;
  }
  if (absolute.protocol !== 'http:' && absolute.protocol !== 'https:') return;

  const width = hintedWidth(`${absolute.pathname}${absolute.search}`);
  if (width > 0 && width < 180) return;

  const fingerprint = `${absolute.hostname}${absolute.pathname}${absolute.search}`;
  if (JUNK_IMAGE.test(fingerprint)) return;
  if (!looksLikeImageUrl(absolute.href) && width < 400) return;

  upgradeImageUrl(absolute);
  const key = identityKey(absolute);
  let nextScore = score;
  if (width >= 900) nextScore += 25;
  else if (width >= 400) nextScore += 10;
  if (/\.(?:jpe?g|webp|avif)(?:$|\?)/i.test(absolute.pathname)) nextScore += 5;
  if (/\.gif(?:$|\?)/i.test(absolute.pathname)) nextScore -= 30;

  const existing = bucket.get(key);
  if (!existing || nextScore > existing.score) {
    bucket.set(key, { url: absolute.toString(), key, score: nextScore });
  }
}

function addSrcset(
  bucket: Map<string, { url: string; key: string; score: number }>,
  srcset: string,
  baseUrl: string,
  score: number
) {
  const entries = srcset
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  let best: { url: string; width: number } | null = null;
  for (const entry of entries) {
    const [url, descriptor] = entry.split(/\s+/);
    const width = Number((descriptor || '').replace(/w$/i, '')) || hintedWidth(url);
    if (!best || width > best.width) best = { url, width };
  }
  if (best?.url) addCandidate(bucket, best.url, baseUrl, score + (best.width >= 800 ? 15 : 0));
}

function walkJsonImages(value: unknown, found: string[], depth = 0) {
  if (depth > 6 || found.length > 24) return;
  if (typeof value === 'string') {
    if (looksLikeImageUrl(value) || /^https?:\/\//i.test(value)) found.push(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) walkJsonImages(item, found, depth + 1);
    return;
  }
  if (!value || typeof value !== 'object') return;
  const record = value as Record<string, unknown>;
  for (const field of ['image', 'thumbnailUrl', 'contentUrl', 'url']) {
    if (field in record) walkJsonImages(record[field], found, depth + 1);
  }
}

export function extractImageCandidates(html: string, baseUrl: string, limit: number) {
  const source = prepareHtml(html);
  const bucket = new Map<string, { url: string; key: string; score: number }>();

  for (const tag of source.match(/<meta\b[^>]*>/gi) || []) {
    const attrs = parseAttributes(tag);
    const name = (attrs.property || attrs.name || attrs.itemprop || '').toLowerCase();
    const content = attrs.content || '';
    if (!content) continue;
    if (META_IMAGE_NAMES.has(name) || name === 'image') {
      addCandidate(bucket, content, baseUrl, name.startsWith('og:') ? 100 : 90);
    }
  }

  for (const tag of source.match(/<link\b[^>]*>/gi) || []) {
    const attrs = parseAttributes(tag);
    const rel = (attrs.rel || '').toLowerCase();
    const href = attrs.href || '';
    if (!href) continue;
    if (rel === 'image_src' || (rel === 'preload' && (attrs.as || '').toLowerCase() === 'image')) {
      addCandidate(bucket, href, baseUrl, 85);
    }
  }

  for (const block of source.match(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi) ||
    []) {
    const json = block.replace(/^<script\b[^>]*>/i, '').replace(/<\/script>$/i, '').trim();
    try {
      const found: string[] = [];
      walkJsonImages(JSON.parse(json), found);
      for (const imageUrl of found) addCandidate(bucket, imageUrl, baseUrl, 80);
    } catch {
      // Ignore broken JSON-LD blocks.
    }
  }

  for (const tag of source.match(/<img\b[^>]*>/gi) || []) {
    const attrs = parseAttributes(tag);
    if (attrs.srcset) addSrcset(bucket, attrs.srcset, baseUrl, 70);
    for (const field of ['data-src', 'data-lazy-src', 'data-original', 'data-hi-res-src', 'src']) {
      if (attrs[field]) addCandidate(bucket, attrs[field], baseUrl, field === 'src' ? 55 : 65);
    }
  }

  for (const tag of source.match(/<source\b[^>]*>/gi) || []) {
    const attrs = parseAttributes(tag);
    if (attrs.srcset) addSrcset(bucket, attrs.srcset, baseUrl, 60);
  }

  const loose =
    source.match(/https?:\/\/[^\s"'<>]+\.(?:jpe?g|png|webp|avif)(?=$|[?#\s"'<>])/gi) || [];
  for (const imageUrl of loose.slice(0, 40)) {
    addCandidate(bucket, imageUrl, baseUrl, 35);
  }

  return [...bucket.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ url, key }) => ({ url, key }));
}

async function readLimited(response: Response, maxBytes: number) {
  const declared = Number(response.headers.get('content-length') || 0);
  if (declared > maxBytes) {
    throw new PageImageError('That page is too large to import photos from.');
  }

  const reader = response.body?.getReader();
  if (!reader) {
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > maxBytes) {
      throw new PageImageError('That page is too large to import photos from.');
    }
    return buffer;
  }

  const chunks: Buffer[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new PageImageError('That page is too large to import photos from.');
    }
    chunks.push(Buffer.from(value));
  }
  return Buffer.concat(chunks);
}

function looksBlocked(status: number, html: string) {
  if (status === 401 || status === 403 || status === 429) return true;
  if (html.length > 80_000) return false;
  return /datadome|cf-challenge|cf-mitigated|just a moment|attention required|enable javascript and cookies/i.test(
    html
  );
}

async function fetchPage(startUrl: string) {
  let current = (await assertPublicHttpUrl(startUrl)).toString();

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const response = await fetch(current, {
      method: 'GET',
      redirect: 'manual',
      cache: 'no-store',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        'User-Agent': BROWSER_UA,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en',
      },
    });

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      if (!location || hop === MAX_REDIRECTS) {
        throw new PageImageError('That website redirected too many times.');
      }
      current = (await assertPublicHttpUrl(new URL(location, current).toString())).toString();
      continue;
    }

    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    if (contentType.startsWith('image/')) {
      return { finalUrl: current, html: '', directImage: current };
    }

    const buffer = await readLimited(response, MAX_HTML_BYTES);
    const html = buffer.toString('utf8');
    if (!response.ok || looksBlocked(response.status, html)) {
      throw new PageImageError(
        'This website blocked the photo import. TripAdvisor and some other sites do that. Drop the photos in above, or use Import Google photos.'
      );
    }
    if (!contentType.includes('html') && !contentType.includes('xml') && !html.includes('<')) {
      throw new PageImageError('That URL did not return a web page.');
    }
    return { finalUrl: current, html, directImage: '' };
  }

  throw new PageImageError('Could not open that website.');
}

export async function scrapePageImages(pageUrl: string, limit = 6): Promise<ScrapedImageCandidate[]> {
  const page = await fetchPage(pageUrl.trim());
  if (page.directImage) {
    const url = await assertPublicHttpUrl(page.directImage);
    return [{ url: url.toString(), key: identityKey(url) }];
  }

  const candidates = extractImageCandidates(page.html, page.finalUrl, limit);
  if (candidates.length === 0) {
    throw new PageImageError('No photos were found on that page.');
  }
  return candidates;
}

export async function assertPublicImageUrl(raw: string) {
  return assertPublicHttpUrl(raw);
}
