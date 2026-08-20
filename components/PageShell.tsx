import type { ReactNode } from 'react';

import { FloatingCta } from '@/components/layout/FloatingCta';
import { HashRouting } from '@/components/layout/HashRouting';
import { Header } from '@/components/layout/Header';
import { ProgressRail } from '@/components/layout/ProgressRail';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SmoothScroll } from '@/components/layout/SmoothScroll';
import { ThermalBackdrop } from '@/components/layout/ThermalBackdrop';
import type { Dictionary } from '@/content';
import { getPage, type PageId } from '@/lib/pages';
import { SURFACE_BASE } from '@/lib/thermal';

/**
 * The frame every page renders inside.
 *
 * This replaces the old `Site` component, which composed all fifteen sections
 * into one scroll. The chrome is identical on every page; only the backdrop
 * stack and the progress rail are page-aware, and both take the page id and
 * look the rest up in lib/pages.ts.
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
      <Header dict={dict} page={page} />
      <ProgressRail page={page} label={dict.progress.label} of={dict.progress.of} />

      {/*
        `main` carries the page's base colour and the thermal stack renders
        inside it. The stack is `position: fixed` at z-0 within main's stacking
        context, so it still covers the whole viewport and still sits behind the
        content - the visitor sees exactly the same thing. The difference is
        that an automated contrast checker walking up from a section now finds
        an opaque ancestor in the right colour family instead of falling through
        to the root. See SURFACE_BASE in lib/thermal.ts.
      */}
      <main style={{ backgroundColor: SURFACE_BASE[getPage(page).layers[0]!.surface] }}>
        <ThermalBackdrop page={page} />
        {children}
      </main>

      <SiteFooter dict={dict} />
      <FloatingCta dict={dict} page={page} />
    </>
  );
}
