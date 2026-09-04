import type { ReactNode } from 'react';

import { FloatingCta } from '@/components/layout/FloatingCta';
import { HashRouting } from '@/components/layout/HashRouting';
import { Header } from '@/components/layout/Header';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProgressRail } from '@/components/layout/ProgressRail';
import { ScrollTop } from '@/components/layout/ScrollTop';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SmoothScroll } from '@/components/layout/SmoothScroll';
import { TopBar } from '@/components/layout/TopBar';
import type { Dictionary } from '@/content';
import { type PageId } from '@/lib/pages';
import { PAGE_BASE } from '@/lib/plates';

/**
 * The frame every page renders inside.
 *
 * Reading down, it is the whole structure of the site: a colour strip, a white
 * bar, the page's own title plate, the content on white, and a dark footer
 * plate. Five bands, three of them coloured, and the two largest are white.
 *
 * What used to be here and is gone: `ThermalBackdrop`, a fixed six-layer
 * gradient stack that was the only background on the site and crossfaded
 * between them on scroll. `main` no longer needs to carry a stand-in base
 * colour for contrast tooling either — it is opaque white, which is the actual
 * colour a checker should be measuring against.
 */
export function PageShell({
  page,
  dict,
  children,
}: {
  page: PageId;
  dict: Dictionary;
  children: ReactNode;
}) {
  return (
    <>
      <SmoothScroll />
      <HashRouting page={page} />
      <TopBar dict={dict} />
      <Header dict={dict} page={page} />
      <ProgressRail page={page} label={dict.progress.label} of={dict.progress.of} />

      <main id="content" style={{ backgroundColor: PAGE_BASE }}>
        {/* The home page opens on its hero; every other page on its title plate. */}
        {page === 'home' ? null : <PageHeader page={page} dict={dict} />}
        {children}
      </main>

      <SiteFooter dict={dict} />
      <FloatingCta dict={dict} page={page} />
      <ScrollTop label={dict.common.toTop} />
    </>
  );
}
