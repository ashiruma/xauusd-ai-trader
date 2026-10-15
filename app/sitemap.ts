// app/sitemap.ts
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://velarionmarkets.com';

  const staticPages = [
    '',
    '/why-gold',
    '/strategies',
    '/academy',
    '/tools/growth-calculator',
    '/onboarding',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const lessonPages = Array.from({ length: 30 }, (_, i) => ({
    url: `${baseUrl}/academy/lesson-${i + 1}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...lessonPages];
}
