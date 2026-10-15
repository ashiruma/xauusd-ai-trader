import { MetadataRoute } from 'next';
import { getAllLessons } from '@/lib/curriculum';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xauusd-ai-trader.vercel.app';
  const lastModified = new Date();

  // Core Crawlable Landing Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'daily',
      priority: 1.0
    },
    {
      url: `${baseUrl}/why-gold`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9
    },
    {
      url: `${baseUrl}/strategies`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9
    },
    {
      url: `${baseUrl}/tools/growth-calculator`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.95
    },
    {
      url: `${baseUrl}/academy`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9
    }
  ];

  // Dynamic Routes for all 30 Forex School Lessons
  const lessons = getAllLessons();
  const lessonRoutes: MetadataRoute.Sitemap = lessons.map((lesson) => ({
    url: `${baseUrl}/academy/lesson-${lesson.globalNum}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.8
  }));

  return [...staticRoutes, ...lessonRoutes];
}
