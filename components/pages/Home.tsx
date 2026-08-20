import { PageShell } from '@/components/PageShell';
import { Hero } from '@/components/sections/Hero';
import { Benefits } from '@/components/sections/Benefits';
import { Overview } from '@/components/sections/Overview';
import { Start } from '@/components/sections/Start';
import type { Dictionary } from '@/content';

/**
 * The first impression, and the map.
 *
 * Hero, the four product claims, a route into each area of the site, and one
 * closing CTA. Everything else moved to the page it belongs to: a home page
 * that carries all fifteen sections is not a home page, it is the whole site
 * with a nav bolted on.
 */
export function Home({ dict }: { dict: Dictionary }) {
  return (
    <PageShell page="home" dict={dict}>
      <Hero dict={dict} />
      <Benefits dict={dict} />
      <Overview dict={dict} />
      <Start dict={dict} />
    </PageShell>
  );
}
