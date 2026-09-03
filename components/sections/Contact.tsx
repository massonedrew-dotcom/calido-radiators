import { Section } from '@/components/layout/Section';
import { DirectContact } from '@/components/ui/DirectContact';
import { RequestForm } from '@/components/ui/RequestForm';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Dictionary } from '@/content';

/**
 * The enquiry, as one centred column.
 *
 * It was two: heading and a four-item facts block on the left, form on the
 * right. Both halves of that were wrong. The facts — production, capacity,
 * standards, warranty — are already in the top utility bar on every page, so
 * the column was repeating the site's own chrome at the exact moment the
 * visitor had decided to write to us; and giving the form only half the width
 * meant the page's single conversion point was the *smaller* of two things on
 * screen, with the larger one carrying no action at all.
 *
 * One column fixes both. Nothing competes with the form, and centring is what
 * says this page has a single purpose — the same reason a checkout is centred
 * and a catalogue is not.
 *
 * The form lives in RequestForm, shared with the floating CTA's dialog, so
 * there is one implementation to point at a real endpoint later.
 */
export function Contact({ dict }: { dict: Dictionary }) {
  return (
    <Section id="contact" labelledBy="contact-title">
      <div className="frame section-pad">
        {/*
          Not the 12-column grid the other sections use: this is a measure, and
          a measure is a max-width and two auto margins. 36rem sits at the top
          of the 560-640px band — wide enough that the message textarea is not a
          slot, narrow enough that the underline fields still read as a single
          vertical run rather than as four long rules.
        */}
        <div className="mx-auto max-w-xl">
          {/* `items-center` on the heading's own flex column: the eyebrow, the
              title and the red rule each centre themselves, so the rule sits
              under the middle of the heading rather than under its first word. */}
          <SectionHeading
            id="contact-title"
            kicker={dict.contact.kicker}
            title={dict.contact.title}
            tone="red"
            className="items-center text-center"
          />
          <p className="prose-lead mx-auto mt-7 text-center">{dict.contact.lead}</p>

          {/* The page is white, so the form is the light variant. It was
              `dark` for as long as the contact page sat on the closing indigo
              surface; the floating CTA's copy of it is still dark, because that
              one renders inside an indigo dialog. */}
          <RequestForm dict={dict} tone="light" className="mt-14" />

          <DirectContact dict={dict} className="mt-16 border-t border-hairline pt-12" />
        </div>
      </div>
    </Section>
  );
}
