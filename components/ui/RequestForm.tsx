'use client';

import { useId, useState } from 'react';

import { WaveButton } from '@/components/ui/WaveButton';
import type { Dictionary } from '@/content';

/**
 * The enquiry form, in one place.
 *
 * It renders twice on the page — inline in the contact section and inside the
 * floating CTA's dialog — and two copies of a form is two chances for the
 * validation, the status handling and the eventual endpoint to drift apart.
 *
 * `tone` only switches the ink: the fields are the same fields either way.
 *
 * Submission is still inert. There is no destination yet, so it resolves
 * locally and shows the success state; wiring it up is a one-function change in
 * `onSubmit`.
 */

type Status = 'idle' | 'sending' | 'sent' | 'error';

function Field({
  id,
  label,
  placeholder,
  tone,
  type = 'text',
  autoComplete,
  inputMode,
  autoFocus,
  required,
  multiline,
}: {
  id: string;
  label: string;
  placeholder: string;
  tone: 'dark' | 'light';
  type?: string;
  /** Autofill hint. A contact form without these makes the visitor retype. */
  autoComplete?: string;
  inputMode?: 'text' | 'tel' | 'email' | 'numeric';
  autoFocus?: boolean;
  required?: boolean;
  multiline?: boolean;
}) {
  const dark = tone === 'dark';
  const shared = [
    // `focus-visible:outline-none`, not `focus:outline-none`: the underline below is
    // the pointer-focus affordance, but a keyboard user still needs the real
    // ring, and blanket `outline-none` removed it.
    'peer w-full border-0 border-b bg-transparent pt-6 pb-3 text-base',
    'focus-visible:outline-2 focus-visible:outline-offset-4',
    dark
      ? 'border-hairline text-white placeholder:text-indigo-100/40'
      : 'border-hairline text-fg-strong placeholder:text-slate/55',
  ].join(' ');

  return (
    <div className="group relative">
      <label
        htmlFor={id}
        className={[
          'absolute top-0 left-0 text-[0.6875rem] font-bold tracking-[0.18em] uppercase',
          dark ? 'text-indigo-100/75' : 'text-indigo-700',
        ].join(' ')}
      >
        {label}
      </label>

      {multiline ? (
        <textarea
          id={id}
          name={id}
          rows={3}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`${shared} resize-none`}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          autoFocus={autoFocus}
          // A phone number is not a word; spellcheck on it is noise.
          spellCheck={type === 'tel' ? false : undefined}
          className={shared}
        />
      )}

      {/* Focus underline draws left to right. */}
      <span
        aria-hidden
        className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-red-500 transition-transform duration-500 peer-focus:scale-x-100"
        style={{ transitionTimingFunction: 'var(--ease-out-expo)' }}
      />
    </div>
  );
}

export function RequestForm({
  dict,
  tone = 'dark',
  className = '',
  autoFocusFirstField,
  onSent,
}: {
  dict: Dictionary;
  tone?: 'dark' | 'light';
  className?: string;
  /** The dialog focuses its first field on open; the inline copy must not. */
  autoFocusFirstField?: boolean;
  onSent?: () => void;
}) {
  const uid = useId();
  const [status, setStatus] = useState<Status>('idle');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    // TODO: POST to the real endpoint once the client picks a destination.
    await new Promise((r) => setTimeout(r, 600));
    setStatus('sent');
    onSent?.();
  }

  return (
    <form onSubmit={onSubmit} className={`flex flex-col gap-8 ${className}`}>
      <Field
        id={`${uid}-name`}
        label={dict.contact.form.name.label}
        placeholder={dict.contact.form.name.placeholder}
        tone={tone}
        autoComplete="name"
        autoFocus={autoFocusFirstField}
        required
      />
      <Field
        id={`${uid}-phone`}
        label={dict.contact.form.phone.label}
        placeholder={dict.contact.form.phone.placeholder}
        tone={tone}
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        required
      />
      <Field
        id={`${uid}-message`}
        label={dict.contact.form.message.label}
        placeholder={dict.contact.form.message.placeholder}
        tone={tone}
        autoComplete="off"
        multiline
      />

      <div className="flex flex-wrap items-center gap-5">
        <WaveButton
          type="submit"
          disabled={status === 'sending'}
          className="px-8 py-4 text-[0.75rem] font-bold tracking-[0.1em] uppercase disabled:opacity-60"
        >
          {status === 'sending' ? dict.contact.form.sending : dict.contact.form.submit}
        </WaveButton>

        <p
          aria-live="polite"
          className={`text-sm ${tone === 'dark' ? 'text-indigo-100' : 'text-slate'}`}
        >
          {status === 'sent' ? dict.contact.form.success : null}
          {status === 'error' ? dict.contact.form.error : null}
        </p>
      </div>
    </form>
  );
}
