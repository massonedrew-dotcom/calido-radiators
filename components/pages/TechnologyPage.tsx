import { PageShell } from '@/components/PageShell';
import { Technology } from '@/components/sections/Technology';
import { Anatomy } from '@/components/sections/Anatomy';
import { HeatOutput } from '@/components/sections/HeatOutput';
import type { Dictionary } from '@/content';

/**
 * How the section is made and what it is made of.
 *
 * Cinder into deep indigo: the metal has cooled and the subject is now the
 * object rather than the process.
 */
export function TechnologyPage({ dict }: { dict: Dictionary }) {
  return (
    <PageShell page="technology" dict={dict}>
      <Technology dict={dict} />
      <Anatomy dict={dict} />
      <HeatOutput dict={dict} />
    </PageShell>
  );
}
