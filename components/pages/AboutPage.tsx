import { PageShell } from '@/components/PageShell';
import { About } from '@/components/sections/About';
import { Capacity } from '@/components/sections/Capacity';
import { Quality } from '@/components/sections/Quality';
import { Warranty } from '@/components/sections/Warranty';
import type { Dictionary } from '@/content';

/**
 * The plant: who, how much, how checked, how long guaranteed.
 *
 * Sits on the cooling-into-cinder surface. This is the hot end of the site's
 * temperature arc, which is where a foundry belongs.
 */
export function AboutPage({ dict }: { dict: Dictionary }) {
  return (
    <PageShell page="about" dict={dict}>
      <About dict={dict} />
      <Capacity dict={dict} />
      <Quality dict={dict} />
      <Warranty dict={dict} />
    </PageShell>
  );
}
