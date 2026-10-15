import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xauusd-ai-trader.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/*', '/terminal', '/terminal/*', '/api/*']
    },
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
