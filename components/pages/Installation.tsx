import { PageShell } from '@/components/PageShell';
import { Systems } from '@/components/sections/Systems';
import { Connection } from '@/components/sections/Connection';
import type { Dictionary } from '@/content';

/**
 * Where it goes and how it is plumbed in.
 */
export function Installation({ dict }: { dict: Dictionary }) {
  return (
    <PageShell page="installation" dict={dict}>
      <Systems dict={dict} />
      <Connection dict={dict} />
    </PageShell>
  );
}
