import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/app/_shared/root';
import { withBasePath } from '@/lib/basePath';

// Required by `output: 'export'`: emitted as a file at build time, because Pages
// has no route handler to generate it per request.
export const dynamic = 'force-static';


/** Two routes, each declaring the other as its language alternate. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const languages = {
    ru: new URL(withBasePath('/'), SITE_URL).toString(),
    en: new URL(withBasePath('/en'), SITE_URL).toString(),
  };

  return [
    {
      url: languages.ru,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1,
      alternates: { languages },
    },
    {
      url: languages.en,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: { languages },
    },
  ];
}
