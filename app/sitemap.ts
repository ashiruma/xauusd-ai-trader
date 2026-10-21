import type { MetadataRoute } from 'next';
import { PUBLIC_ROUTES, SITE_ORIGIN } from '@/lib/site';
import { indexableLessons } from '@/lib/course-manifest';

export default function sitemap(): MetadataRoute.Sitemap {
  // No invented dates and no suspended/draft/gated lessons advertised.
  return [
    ...PUBLIC_ROUTES.map(route => ({ url: `${SITE_ORIGIN}${route === '/' ? '' : route}` })),
    ...indexableLessons().map(lesson => ({ url: `${SITE_ORIGIN}${lesson.route}` })),
  ];
}
