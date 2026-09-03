'use client';

import { useEffect, useId, useMemo, useState } from 'react';

import { WaveButton } from '@/components/ui/WaveButton';
import type { Dictionary } from '@/content';
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  countryOf,
  flagOf,
  phoneProblem,
  toE164,
} from '@/content/countries';

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
 * `onSubmit`. What the endpoint will receive is already assembled, though — see
 * the hidden `phone` input, which carries E.164 rather than whatever spacing
 * the visitor typed.
 */

type Status = 'idle' | 'sending' | 'sent' | 'error';

/** Shared across the plain fields and the phone row, so one underline serves both. */
function inputClasses(dark: boolean): string {
  return [
    // `focus-visible:outline-none`, not `focus:outline-none`: the underline below is
    // the pointer-focus affordance, but a keyboard user still needs the real
    // ring, and blanket `outline-none` removed it.
    'w-full border-0 bg-transparent text-base',
    'focus-visible:outline-2 focus-visible:outline-offset-4',
    dark ? 'text-white placeholder:text-indigo-100/40' : 'text-fg-strong placeholder:text-slate/55',
  ].join(' ');
}

function labelClasses(dark: boolean): string {
  return [
    'absolute top-0 left-0 text-[0.6875rem] font-bold tracking-[0.18em] uppercase',
    dark ? 'text-indigo-100/75' : 'text-indigo-700',
  ].join(' ');
}

/** The red rule that draws left to right while anything inside the row has focus. */
function Underline() {
  return (
    <span
      aria-hidden
      className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-red-500 transition-transform duration-500 group-focus-within:scale-x-100"
      style={{ transitionTimingFunction: 'var(--ease-out-expo)' }}
    />
  );
}

function Field({
  id,
  label,
  hint,
  placeholder,
  tone,
  type = 'text',
  autoComplete,
  inputMode,
  autoFocus,
  required,
  multiline,
  value,
  onChange,
}: {
  id: string;
  label: string;
  /** Rendered quietly beside the label. Used to mark a field optional. */
  hint?: string;
  placeholder: string;
  tone: 'dark' | 'light';
  type?: string;
  /** Autofill hint. A contact form without these makes the visitor retype. */
  autoComplete?: string;
  inputMode?: 'text' | 'tel' | 'email' | 'numeric';
  autoFocus?: boolean;
  required?: boolean;
  multiline?: boolean;
  value?: string;
  onChange?: (v: string) => void;
}) {
  const dark = tone === 'dark';
  const shared = `${inputClasses(dark)} border-b border-hairline pt-6 pb-3`;

  return (
    <div className="group relative">
      <label htmlFor={id} className={labelClasses(dark)}>
        {label}
        {hint ? (
          <span
            className={`ml-2 font-semibold tracking-[0.08em] normal-case ${
              dark ? 'text-indigo-100/45' : 'text-slate/70'
            }`}
          >
            {hint}
          </span>
        ) : null}
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
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          // A phone number is not a word; spellcheck on it is noise.
          spellCheck={type === 'tel' ? false : undefined}
          className={shared}
        />
      )}

      <Underline />
    </div>
  );
}

/**
 * Phone, as a country selector welded to a national-number field.
 *
 * A native `<select>` rather than a custom listbox, and that is the decision
 * that makes the whole control cheap: it is keyboard-navigable, type-to-search
 * works, and on a phone it opens the platform's own wheel picker — which is a
 * better country picker than anything that could be built here, and it is free.
 *
 * The options are only rendered after mount. `Intl.DisplayNames` is what
 * localises the country names, and Node's ICU and the browser's ICU can differ
 * by a name or two, which would be a hydration mismatch on a control that is
 * otherwise perfectly static. Server-rendering just the selected country and
 * filling the rest in on mount costs nothing visible: the select is sized by
 * the flag and dial code, which do not change.
 */
function PhoneField({
  id,
  dict,
  tone,
  iso,
  onIso,
  national,
  onNational,
  error,
}: {
  id: string;
  dict: Dictionary;
  tone: 'dark' | 'light';
  iso: string;
  onIso: (v: string) => void;
  national: string;
  onNational: (v: string) => void;
  error: string | null;
}) {
  const dark = tone === 'dark';
  const copy = dict.contact.form.phone;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const options = useMemo(() => {
    // Before mount, one option: the selected country. Same shape as the full
    // list so the render below has a single branch.
    if (!mounted) {
      return COUNTRIES.filter((c) => c.iso === iso).map((c) => ({ ...c, name: c.iso }));
    }
    let name: (code: string) => string;
    try {
      const dn = new Intl.DisplayNames([dict.locale], { type: 'region' });
      name = (code) => dn.of(code) ?? code;
    } catch {
      // Ancient browser, or a region code ICU does not know. The dial code and
      // the flag still identify the entry, so this degrades rather than breaks.
      name = (code) => code;
    }
    return [...COUNTRIES]
      .map((c) => ({ ...c, name: name(c.iso) }))
      .sort((a, b) => a.name.localeCompare(b.name, dict.locale));
  }, [mounted, iso, dict.locale]);

  const errorId = `${id}-error`;

  return (
    <div className="group relative">
      <label htmlFor={id} className={labelClasses(dark)}>
        {copy.label}
      </label>

      <div className="flex items-end gap-3 border-b border-hairline pt-6 pb-3">
        {/*
          The select is the control; the span is what you see.

          A `<select>` is as wide as its widest rendered option, and the options
          carry full country names — so left visible it sizes itself to
          "Соединённые Штаты Америки" and, at 375px, leaves the number field
          exactly zero pixels. Laying it transparently over a span that shows
          only the flag and the dial code keeps the native control intact
          (keyboard, type-to-search, the platform's own picker on a phone) at a
          width that is the same on every country.

          `peer` on the select is what carries focus to the visible half: an
          element at `opacity-0` has an outline nobody can see.
        */}
        <div className="relative shrink-0">
          {/* First in the DOM so `peer-*` can reach the span below it — the
              sibling combinator only looks forward — and absolute so the span
              is what gives the wrapper its width. */}
          <select
            aria-label={copy.countryLabel}
            value={iso}
            onChange={(e) => onIso(e.target.value)}
            className="peer absolute inset-x-0 -inset-y-3 w-full cursor-pointer appearance-none opacity-0"
          >
            {options.map((c) => (
              <option key={c.iso} value={c.iso} className="text-fg-strong">
                {flagOf(c.iso)} {c.name} +{c.dial}
              </option>
            ))}
          </select>

          <span
            aria-hidden
            className={`pointer-events-none flex items-center gap-1.5 whitespace-nowrap peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 ${
              dark ? 'text-white' : 'text-fg-strong'
            }`}
          >
            <span className="text-lg leading-none">{flagOf(iso)}</span>
            <span className="tnum text-base">+{countryOf(iso).dial}</span>
            <svg viewBox="0 0 10 6" width="9" height="6" aria-hidden className="opacity-50">
              <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </span>
        </div>

        <input
          id={id}
          type="tel"
          required
          placeholder={copy.placeholder}
          autoComplete="tel-national"
          inputMode="tel"
          spellCheck={false}
          value={national}
          onChange={(e) => onNational(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={inputClasses(dark)}
        />
      </div>

      <Underline />

      {/* Assembled here rather than in the submit handler, so whatever the
          endpoint turns out to be receives one canonical shape. */}
      <input type="hidden" name="phone" value={toE164(iso, national)} />

      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-sm text-red-500">
          {error}
        </p>
      ) : null}
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
  const [iso, setIso] = useState(DEFAULT_COUNTRY);
  const [national, setNational] = useState('');
  const [telegram, setTelegram] = useState('');
  const [showError, setShowError] = useState(false);

  const problem = phoneProblem(iso, national);
  // Held back until a submit is attempted: flagging a number as too short while
  // it is being typed is telling the visitor they are wrong for not having
  // finished.
  const phoneError = showError && problem ? dict.contact.form.phone[problem] : null;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (problem) {
      setShowError(true);
      return;
    }
    setShowError(false);
    setStatus('sending');
    // TODO: POST to the real endpoint once the client picks a destination.
    await new Promise((r) => setTimeout(r, 600));
    setStatus('sent');
    onSent?.();
  }

  return (
    <form onSubmit={onSubmit} noValidate className={`flex flex-col gap-8 ${className}`}>
      <Field
        id={`${uid}-name`}
        label={dict.contact.form.name.label}
        placeholder={dict.contact.form.name.placeholder}
        tone={tone}
        autoComplete="name"
        autoFocus={autoFocusFirstField}
        required
      />

      <PhoneField
        id={`${uid}-phone`}
        dict={dict}
        tone={tone}
        iso={iso}
        onIso={setIso}
        national={national}
        onNational={setNational}
        error={phoneError}
      />

      <Field
        id={`${uid}-telegram`}
        label={dict.contact.form.telegram.label}
        hint={dict.contact.form.telegram.hint}
        placeholder={dict.contact.form.telegram.placeholder}
        tone={tone}
        autoComplete="off"
        value={telegram}
        // Typed with or without the @, stored without: the leading @ is how the
        // handle is written, not part of it, and `t.me/@name` is not a link.
        onChange={(v) => setTelegram(v.replace(/^@+/, ''))}
      />

      <Field
        id={`${uid}-message`}
        label={dict.contact.form.message.label}
        placeholder={dict.contact.form.message.placeholder}
        tone={tone}
        autoComplete="off"
        multiline
      />

      <div className="flex flex-col gap-4">
        <WaveButton
          type="submit"
          disabled={status === 'sending'}
          className="w-full px-8 py-4 text-[0.75rem] font-bold tracking-[0.1em] uppercase disabled:opacity-60"
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

