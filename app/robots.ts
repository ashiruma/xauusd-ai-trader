import { MetadataRoute } from 'next';
import { SITE_ORIGIN } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  // Crawl preferences only; authentication and authorization remain server responsibilities.
  const baseUrl = SITE_ORIGIN;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/admin/*',
        '/admin-secure-x9f8k2',
        '/admin-secure-x9f8k2/*',
        '/terminal',
        '/terminal/*',
        '/api/*'
      ]
    },
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
