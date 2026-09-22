const BRAND_GREEN = '#337e2f';
const FALLBACK_COLOR = '#0f766e';

type IconNode = [string, Record<string, string | number>];

/** Lucide 24×24 stroke paths for guide category glyphs (lucide-react v0.344). */
const GUIDE_ICON_NODES: Record<string, IconNode[]> = {
  Utensils: [
    ['path', { d: 'M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2' }],
    ['path', { d: 'M7 2v20' }],
    ['path', { d: 'M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7' }],
  ],
  Camera: [
    ['path', { d: 'M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z' }],
    ['circle', { cx: '12', cy: '13', r: '3' }],
  ],
  Mountain: [['path', { d: 'm8 3 4 8 5-5 5 15H2L8 3z' }]],
  Waves: [
    ['path', { d: 'M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1' }],
    ['path', { d: 'M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1' }],
    ['path', { d: 'M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1' }],
  ],
  Martini: [
    ['path', { d: 'M8 22h8' }],
    ['path', { d: 'M12 11v11' }],
    ['path', { d: 'm19 3-7 8-7-8Z' }],
  ],
  Users: [
    ['path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }],
    ['circle', { cx: '9', cy: '7', r: '4' }],
    ['path', { d: 'M22 21v-2a4 4 0 0 0-3-3.87' }],
    ['path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' }],
  ],
  ShoppingBag: [
    ['path', { d: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z' }],
    ['path', { d: 'M3 6h18' }],
    ['path', { d: 'M16 10a4 4 0 0 1-8 0' }],
  ],
  TreePine: [
    [
      'path',
      {
        d: 'm17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z',
      },
    ],
    ['path', { d: 'M12 22v-3' }],
  ],
  Sun: [
    ['circle', { cx: '12', cy: '12', r: '4' }],
    ['path', { d: 'M12 2v2' }],
    ['path', { d: 'M12 20v2' }],
    ['path', { d: 'm4.93 4.93 1.41 1.41' }],
    ['path', { d: 'm17.66 17.66 1.41 1.41' }],
    ['path', { d: 'M2 12h2' }],
    ['path', { d: 'M20 12h2' }],
    ['path', { d: 'm6.34 17.66-1.41 1.41' }],
    ['path', { d: 'm19.07 4.93-1.41 1.41' }],
  ],
  Compass: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['polygon', { points: '16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76' }],
  ],
  Palette: [
    ['circle', { cx: '13.5', cy: '6.5', r: '.5', fill: '#fff' }],
    ['circle', { cx: '17.5', cy: '10.5', r: '.5', fill: '#fff' }],
    ['circle', { cx: '8.5', cy: '7.5', r: '.5', fill: '#fff' }],
    ['circle', { cx: '6.5', cy: '12.5', r: '.5', fill: '#fff' }],
    [
      'path',
      {
        d: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z',
      },
    ],
  ],
  Music: [
    ['path', { d: 'M9 18V5l12-2v13' }],
    ['circle', { cx: '6', cy: '18', r: '3' }],
    ['circle', { cx: '18', cy: '16', r: '3' }],
  ],
  Ship: [
    [
      'path',
      {
        d: 'M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1',
      },
    ],
    ['path', { d: 'M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76' }],
    ['path', { d: 'M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6' }],
    ['path', { d: 'M12 10v4' }],
    ['path', { d: 'M12 2v3' }],
  ],
  Bike: [
    ['circle', { cx: '18.5', cy: '17.5', r: '3.5' }],
    ['circle', { cx: '5.5', cy: '17.5', r: '3.5' }],
    ['circle', { cx: '15', cy: '5', r: '1' }],
    ['path', { d: 'M12 17.5V14l-3-3 4-3 2 3h2' }],
  ],
  Coffee: [
    ['path', { d: 'M17 8h1a4 4 0 1 1 0 8h-1' }],
    ['path', { d: 'M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z' }],
    ['line', { x1: '6', x2: '6', y1: '2', y2: '4' }],
    ['line', { x1: '10', x2: '10', y1: '2', y2: '4' }],
    ['line', { x1: '14', x2: '14', y1: '2', y2: '4' }],
  ],
  Home: [
    ['path', { d: 'm3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }],
    ['polyline', { points: '9 22 9 12 15 12 15 22' }],
  ],
};

export type GuideMarkerCategory = {
  icon: string;
  color: string;
};

export type GuideMarkerOptions = {
  isFeatured?: boolean;
  label?: string;
  appearDelayMs?: number;
  showLabel?: boolean;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function isSafeCssColor(color: string): boolean {
  return /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color.trim());
}

export function safeGuideColor(color: string | null | undefined, fallback = FALLBACK_COLOR): string {
  if (!color) return fallback;
  const trimmed = color.trim();
  return isSafeCssColor(trimmed) ? trimmed : fallback;
}

function expandHex(hex: string): string {
  const value = hex.replace('#', '');
  if (value.length === 3) {
    return `${value[0]}${value[0]}${value[1]}${value[1]}${value[2]}${value[2]}`;
  }
  return value.slice(0, 6);
}

export function colorWithAlpha(hex: string, alpha: number): string {
  const full = expandHex(safeGuideColor(hex));
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function nodesToInnerSvg(nodes: IconNode[]): string {
  return nodes
    .map(([tag, attrs]) => {
      const attrStr = Object.entries(attrs)
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');
      return `<${tag} ${attrStr}/>`;
    })
    .join('');
}

function renderLucideGlyph(iconName: string, size: number): string {
  const nodes = GUIDE_ICON_NODES[iconName] ?? GUIDE_ICON_NODES.Compass;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${nodesToInnerSvg(nodes)}</svg>`;
}

/**
 * Circular category pin for the Things To Do map.
 * Featured places render a larger pin with a soft glow ring.
 */
export function createGuideMarkerElement(
  category: GuideMarkerCategory,
  opts: GuideMarkerOptions = {}
): HTMLDivElement {
  const color = safeGuideColor(category.color);
  const isFeatured = Boolean(opts.isFeatured);
  const label = opts.label?.trim() ?? '';
  const showLabel = Boolean(opts.showLabel && label);
  const iconSize = isFeatured ? 16 : 14;

  const el = document.createElement('div');
  el.className = `guide-map-marker${isFeatured ? ' is-featured' : ''}`;
  el.setAttribute('role', 'presentation');
  el.style.setProperty('--guide-marker-color', color);
  el.style.setProperty('--guide-marker-glow', colorWithAlpha(color, 0.38));
  if (opts.appearDelayMs) {
    el.style.setProperty('--guide-marker-delay', `${opts.appearDelayMs}ms`);
  }

  const labelHtml = showLabel
    ? `<span class="guide-map-marker-label">${escapeHtml(label)}</span>`
    : '';

  el.innerHTML = `
    <div class="guide-map-marker-pop">
      <button type="button" class="guide-map-marker-hit" aria-pressed="false"${label ? ` aria-label="${escapeHtml(label)}"` : ''}>
        <span class="guide-map-marker-glow" aria-hidden="true"></span>
        <span class="guide-map-marker-dot" aria-hidden="true">
          ${renderLucideGlyph(category.icon, iconSize)}
        </span>
        <span class="guide-map-marker-caret" aria-hidden="true"></span>
        ${labelHtml}
      </button>
    </div>
  `.trim();

  return el;
}

export type GuidePopupContent = {
  name: string;
  photoUrl?: string | null;
  description?: string | null;
  category: {
    icon: string;
    color: string;
    name: string;
  };
};

/** Compact hover card — photo, name, Google description. Instant; no enter animation. */
export function createGuidePopupHTML(item: GuidePopupContent): string {
  const color = safeGuideColor(item.category.color);
  const name = escapeHtml(item.name);
  const categoryName = escapeHtml(item.category.name);
  const description = escapeHtml(item.description?.trim() || '');
  const photo = item.photoUrl?.trim() ?? '';
  const media = photo
    ? `<img class="guide-map-popup-photo" src="${escapeHtml(photo)}" alt="" draggable="false" />`
    : `<div class="guide-map-popup-photo guide-map-popup-photo--fallback" style="background:${color}">${renderLucideGlyph(item.category.icon, 18)}</div>`;
  const descriptionHtml = description
    ? `<p class="guide-map-popup-description">${description}</p>`
    : '';

  return `
    <div class="guide-map-popup-card">
      ${media}
      <div class="guide-map-popup-copy">
        <p class="guide-map-popup-name">${name}</p>
        ${descriptionHtml}
        <p class="guide-map-popup-category">
          <span class="guide-map-popup-swatch" style="background:${color}" aria-hidden="true"></span>
          <span>${categoryName}</span>
        </p>
      </div>
    </div>
  `.trim();
}

export type PropertyPopupContent = {
  name: string;
  isActiveStay?: boolean;
};

/** Compact hover card for a stay pin. */
export function createPropertyPopupHTML(item: PropertyPopupContent): string {
  const name = escapeHtml(item.name);
  const stayLine = item.isActiveStay
    ? `<p class="guide-map-popup-stay">You&rsquo;re staying here</p>`
    : `<p class="guide-map-popup-category"><span>Right Stay</span></p>`;

  return `
    <div class="guide-map-popup-card">
      <div class="guide-map-popup-photo guide-map-popup-photo--fallback" style="background:${BRAND_GREEN}">
        ${renderLucideGlyph('Home', 18)}
      </div>
      <div class="guide-map-popup-copy">
        <p class="guide-map-popup-name">${name}</p>
        ${stayLine}
      </div>
    </div>
  `.trim();
}

export type PropertyMarkerOptions = {
  label?: string;
  isActiveStay?: boolean;
};

/**
 * “Where you’re staying” pin — house silhouette, brand green, larger than category dots.
 */
export function createPropertyMarkerElement(opts: PropertyMarkerOptions = {}): HTMLDivElement {
  const label = opts.label?.trim() || "You're staying here";
  const el = document.createElement('div');
  el.className = `guide-map-property-marker${opts.isActiveStay ? ' is-active-stay' : ''}`;
  el.setAttribute('role', 'presentation');
  el.style.setProperty('--guide-marker-color', BRAND_GREEN);
  el.style.setProperty('--guide-marker-glow', colorWithAlpha(BRAND_GREEN, 0.32));

  el.innerHTML = `
    <div class="guide-map-marker-pop">
      <button type="button" class="guide-map-property-hit" aria-label="${escapeHtml(label)}">
        <span class="guide-map-property-pulse" aria-hidden="true"></span>
        <span class="guide-map-property-pin" aria-hidden="true">
          <span class="guide-map-property-house">
            ${renderLucideGlyph('Home', 18)}
          </span>
        </span>
        <span class="guide-map-marker-label guide-map-marker-label--property">${escapeHtml(label)}</span>
      </button>
    </div>
  `.trim();

  return el;
}
