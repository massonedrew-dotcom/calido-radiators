'use client';

import { useId, useState } from 'react';

import { Section } from '@/components/layout/Section';
import { Img } from '@/components/ui/Img';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { WaveButton } from '@/components/ui/WaveButton';
import type { Dictionary } from '@/content';

/**
 * 12 — Contact and footer.
 *
 * The form is inert on purpose: there is no destination yet, so submit resolves
 * locally and shows the success state. Wiring it to a real endpoint is a
 * one-function change in `onSubmit`.
 */

type Status = 'idle' | 'sending' | 'sent' | 'error';

function Field({
  id,
  label,
  placeholder,
  type = 'text',
  required,
  multiline,
}: {
  id: string;
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  multiline?: boolean;
}) {
  const shared =
    'peer w-full border-0 border-b border-line-dark bg-transparent pt-6 pb-3 text-base text-white placeholder:text-indigo-100/35 focus:outline-none';

  return (
    <div className="group relative">
      <label
        htmlFor={id}
        className="absolute top-0 left-0 text-[0.6875rem] font-bold tracking-[0.18em] text-indigo-100/70 uppercase"
      >
        {label}
      </label>

      {multiline ? (
        <textarea id={id} name={id} rows={3} required={required} placeholder={placeholder} className={`${shared} resize-none`} />
      ) : (
        <input id={id} name={id} type={type} required={required} placeholder={placeholder} className={shared} />
      )}

      {/* Focus underline draws left to right. */}
      <span
        aria-hidden
        className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-red-600 transition-transform duration-500 peer-focus:scale-x-100"
        style={{ transitionTimingFunction: 'var(--ease-out-expo)' }}
      />
    </div>
  );
}

export function Contact({ dict }: { dict: Dictionary }) {
  const uid = useId();
  const [status, setStatus] = useState<Status>('idle');
  const year = new Date().getFullYear();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    // TODO: POST to the real endpoint once the client picks a destination.
    await new Promise((r) => setTimeout(r, 600));
    setStatus('sent');
  }

  return (
    <Section id="contact" index={dict.contact.index} tone="dark" labelledBy="contact-title">
      <div className="frame py-28 md:py-40">
        <div className="grid-frame gap-y-16">
          <div className="col-span-4 md:col-span-5">
            <SectionHeading
              id="contact-title"
              kicker={dict.contact.kicker}
              title={dict.contact.title}
              tone="red"
            />
            <p className="prose-lead mt-8">{dict.contact.lead}</p>

            <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-7">
              {dict.contact.summary.map((s) => (
                <div key={s.label}>
                  <dt className="kicker mb-2">{s.label}</dt>
                  <dd className="text-sm text-white">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <form onSubmit={onSubmit} className="col-span-4 flex flex-col gap-9 md:col-span-6 md:col-start-7">
            <Field id={`${uid}-name`} label={dict.contact.form.name.label} placeholder={dict.contact.form.name.placeholder} required />
            <Field id={`${uid}-phone`} label={dict.contact.form.phone.label} placeholder={dict.contact.form.phone.placeholder} type="tel" required />
            <Field id={`${uid}-message`} label={dict.contact.form.message.label} placeholder={dict.contact.form.message.placeholder} multiline />

            <div className="flex flex-wrap items-center gap-5">
              <WaveButton
                type="submit"
                disabled={status === 'sending'}
                className="px-8 py-4 text-[0.75rem] font-bold tracking-[0.1em] uppercase disabled:opacity-60"
              >
                {status === 'sending' ? dict.contact.form.sending : dict.contact.form.submit}
              </WaveButton>

              <p aria-live="polite" className="text-sm text-indigo-100/80">
                {status === 'sent' ? dict.contact.form.success : null}
                {status === 'error' ? dict.contact.form.error : null}
              </p>
            </div>
          </form>
        </div>

        <footer className="mt-28 border-t border-line-dark pt-12">
          <div className="grid-frame gap-y-10">
            <div className="col-span-4 md:col-span-4">
              <Img id="brand/logo-white" alt={dict.common.logoAlt} sizes="150px" className="h-8 w-auto" />
              <p className="mt-5 max-w-[32ch] text-sm text-indigo-100/70">{dict.brand.tagline}</p>
            </div>

            <div className="col-span-4 md:col-span-4">
              <p className="kicker mb-4">{dict.contact.details.title}</p>
              <ul className="flex flex-col gap-2">
                {dict.contact.details.items.map((item) => (
                  <li key={item.label} className="flex gap-3 text-sm text-indigo-100/80">
                    <span className="w-20 shrink-0 text-indigo-100/75">{item.label}</span>
                    <span>{item.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            {dict.contact.social.items.length > 0 ? (
              <div className="col-span-4 md:col-span-4">
                <p className="kicker mb-4">{dict.contact.social.title}</p>
                <ul className="flex flex-col gap-2">
                  {dict.contact.social.items.map((s) => (
                    <li key={s.href}>
                      <a href={s.href} className="text-sm text-indigo-100/80 hover:text-white">
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <p className="mt-14 text-xs text-indigo-100/75">
            {dict.contact.legal.replace('{year}', String(year))}
          </p>
        </footer>
      </div>
    </Section>
  );
}
