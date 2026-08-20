import { PageShell } from '@/components/PageShell';
import { ModelRange } from '@/components/sections/ModelRange';
import { Scale } from '@/components/sections/Scale';
import { Colors } from '@/components/sections/Colors';
import type { Dictionary } from '@/content';

/**
 * The range, compared and finished.
 *
 * The one light page pair in the site. The product is done, so the surface is
 * lit rather than molten.
 */
export function Models({ dict }: { dict: Dictionary }) {
  return (
    <PageShell page="models" dict={dict}>
      <ModelRange dict={dict} />
      <Scale dict={dict} />
      <Colors dict={dict} />
    </PageShell>
  );
}
