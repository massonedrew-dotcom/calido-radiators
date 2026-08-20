import { Section } from '@/components/layout/Section';
import { RequestForm } from '@/components/ui/RequestForm';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Dictionary } from '@/content';

/**
 * Contact and footer.
 *
 * The form lives in RequestForm, shared with the floating CTA's dialog, so
 * there is one implementation to point at a real endpoint later. The footer
 * that used to sit under it is now SiteFooter, on every page.
 */
export function Contact({ dict }: { dict: Dictionary }) {
  return (
    <Section id="contact" labelledBy="contact-title">
      <div className="frame section-pad">
        <div className="grid-frame gap-y-14">
          <div className="col-span-4 md:col-span-5">
            <SectionHeading
              id="contact-title"
              kicker={dict.contact.kicker}
              title={dict.contact.title}
              tone="red"
            />
            <p className="prose-lead mt-7">{dict.contact.lead}</p>

            <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-6">
              {dict.contact.summary.map((s) => (
                <div key={s.label}>
                  <dt className="kicker mb-2">{s.label}</dt>
                  <dd className="text-sm text-white">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <RequestForm
            dict={dict}
            tone="dark"
            className="col-span-4 md:col-span-6 md:col-start-7"
          />
        </div>

      </div>
    </Section>
  );
}
