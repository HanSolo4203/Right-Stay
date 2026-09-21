import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/dev/'],
      },
    ],
    host: 'https://rightstayafrica.com',
    sitemap: 'https://rightstayafrica.com/sitemap.xml',
  };
}
