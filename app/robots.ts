import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/app/_shared/root';
import { withBasePath } from '@/lib/basePath';

// Required by `output: 'export'`: emitted as a file at build time, because Pages
// has no route handler to generate it per request.
export const dynamic = 'force-static';

/**
 * One rule per engine rather than a single `*`.
 *
 * Functionally the three blocks below say the same thing today, and that is the
 * point: the moment one engine needs a directive the others must not see - a
 * `Clean-param` for Yandex, a crawl exclusion for a Google-specific parameter -
 * there is a block to put it in, instead of a `*` rule that has to be split
 * under pressure. Yandex also stops reading at the first group that matches its
 * own name, so a site that ever needs to address it specifically needs the
 * named group to exist first.
 *
 * What is deliberately absent is `Host:`. Yandex retired it in 2018 in favour
 * of a 301 and `rel=canonical`, both of which this site already has, and every
 * other crawler has always ignored it - so it was a line that could only be
 * wrong, never right.
 */
export default function robots(): MetadataRoute.Robots {
  const allowAll = { allow: '/' };

  return {
    rules: [
      { userAgent: 'Yandex', ...allowAll },
      { userAgent: 'Googlebot', ...allowAll },
      { userAgent: '*', ...allowAll },
    ],
    sitemap: new URL(withBasePath('/sitemap.xml'), SITE_URL).toString(),
  };
}
