import { PageShell } from '@/components/PageShell';
import { Contact } from '@/components/sections/Contact';
import type { Dictionary } from '@/content';

/**
 * The enquiry form and the details.
 *
 * Back on the closing surface: deep indigo with the brand red returning
 * underneath, which is the last temperature in the arc.
 */
export function ContactPage({ dict }: { dict: Dictionary }) {
  return (
    <PageShell page="contact" dict={dict}>
      <Contact dict={dict} />
    </PageShell>
  );
}
