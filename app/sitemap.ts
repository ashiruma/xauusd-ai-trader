import type { MetadataRoute } from 'next';
import { PUBLIC_ROUTES, SITE_ORIGIN } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  // Do not invent lastModified dates or advertise sequential/gated lesson routes.
  return PUBLIC_ROUTES.map((route) => ({ url: `${SITE_ORIGIN}${route === '/' ? '' : route}` }));
}
