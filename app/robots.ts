import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/app/_shared/root';
import { withBasePath } from '@/lib/basePath';

// Required by `output: 'export'`: emitted as a file at build time, because Pages
// has no route handler to generate it per request.
export const dynamic = 'force-static';


export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: new URL(withBasePath('/sitemap.xml'), SITE_URL).toString(),
    host: SITE_URL,
  };
}
