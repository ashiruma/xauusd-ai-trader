import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://velarion-one.vercel.app';

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
