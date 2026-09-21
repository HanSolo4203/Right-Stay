import type { MetadataRoute } from 'next';

const BASE = 'https://rightstayafrica.com';

const ROUTES = [
  { path: '', priority: 1 },
  { path: '/stay-with-us', priority: 0.9 },
  { path: '/host-with-us', priority: 0.8 },
  { path: '/about', priority: 0.7 },
  { path: '/contact', priority: 0.7 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map(({ path, priority }) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority,
  }));
}
