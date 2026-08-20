import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/app/_shared/root';
import { withBasePath } from '@/lib/basePath';
import { PAGES, pagePath } from '@/lib/pages';

// Required by `output: 'export'`: emitted as a file at build time, because Pages
// has no route handler to generate it per request.
export const dynamic = 'force-static';

/**
 * Every page in both locales, each declaring the other locale as its alternate.
 *
 * Derived from the page registry rather than listed, so adding a page to
 * lib/pages.ts puts it in the sitemap without a second edit.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const abs = (p: string) => new URL(withBasePath(p), SITE_URL).toString();

  return PAGES.flatMap((page) => {
    const languages = {
      ru: abs(pagePath(page.id, 'ru')),
      en: abs(pagePath(page.id, 'en')),
    };

    return (['ru', 'en'] as const).map((locale) => ({
      url: abs(pagePath(page.id, locale)),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      // Home outranks the sections; Russian is the primary market.
      priority: (page.id === 'home' ? 1 : 0.7) * (locale === 'ru' ? 1 : 0.8),
      alternates: { languages },
    }));
  });
}
