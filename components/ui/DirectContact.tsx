import { CONTACTS, DIRECT_CHANNELS, contactHref, opensInNewTab } from '@/content/contacts';
import type { Dictionary } from '@/content';

/**
 * The four ways to reach a human, under the form.
 *
 * A form is a promise to reply later; some visitors want to talk now, and on a
 * phone a `tel:` link is one tap against a form's four fields. The two sit
 * together rather than competing: the form is the default path and this is the
 * shortcut, which is why it is quieter and below.
 *
 * Every value comes from content/contacts.ts. Nothing here knows what the
 * number is, only which channels to print and in what order.
 *
 * Icons are inline SVG on a 24-unit grid, stroked with `currentColor` so they
 * take the link's own ink. No icon font: four glyphs do not justify a webfont
 * request, and a font that fails to load leaves four tofu boxes where the
 * contact details should be.
 */

const ICONS: Record<string, React.ReactNode> = {
  phone: (
    <path d="M6.5 3h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5L16 12l4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4 6.2 2 2 0 0 1 6 4z" />
  ),
  telegram: <path d="M21 4.5 2.8 11.4l4.9 1.6M21 4.5 17.8 20l-6.3-5.6M21 4.5 7.7 13l.4 5.4 3.4-3.9" />,
  whatsapp: (
    <>
      <path d="M3.5 20.5 5 16.4A8.5 8.5 0 1 1 8.1 19.4z" />
      <path d="M9 8.5c.4 2.6 2.5 4.9 5.2 5.6l1-1.4 2 .9v1.6c-2.9.6-6.9-2.2-8.3-5.3l1.2-.8z" />
    </>
  ),
  email: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  location: (
    <>
      <path d="M12 21.5c4.3-4.6 6.5-8.2 6.5-11a6.5 6.5 0 1 0-13 0c0 2.8 2.2 6.4 6.5 11z" />
      <circle cx="12" cy="10.2" r="2.4" />
    </>
  ),
};

function Icon({ id }: { id: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      {ICONS[id]}
    </svg>
  );
}

export function DirectContact({ dict, className = '' }: { dict: Dictionary; className?: string }) {
  const copy = dict.contact.direct;

  return (
    <div className={className}>
      <p className="kicker text-center">{copy.title}</p>

      {/*
        Wraps to one column on a narrow screen rather than shrinking. Each link
        is padded to a 44px tap target in its own right — a `tel:` link that
        needs aiming for is worse than no `tel:` link.
      */}
      <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        {DIRECT_CHANNELS.map((id) => {
          // The skip is the mechanism, not a guard: a channel whose value is
          // empty in content/contacts.ts is one the client has not given us
          // yet, and it disappears rather than rendering a dead link. Filling
          // the value in is all it takes to publish it.
          const href = contactHref(id);
          if (!href) return null;

          // Most channels show their own value: a number, an address. The ones
          // that have no printable value — a map URL is not something anyone
          // reads — fall back to the translated channel name.
          const label = CONTACTS[id].display || copy.names[id];
          const newTab = opensInNewTab(id);

          return (
            <li key={id}>
              <a
                href={href}
                {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                aria-label={id === 'location' ? copy.locationAria : undefined}
                className="flex min-h-11 items-center gap-2.5 px-3 text-sm text-indigo-700 transition-colors hover:text-red-500"
              >
                <Icon id={id} />
                {/* The visible label is usually the value - a number says
                    nothing about which app dials it - so the channel name is
                    announced first. Skipped where the label already *is* the
                    name, or a screen reader reads "WhatsApp: WhatsApp". */}
                {copy.names[id] === label ? null : (
                  <span className="sr-only">{copy.names[id]}: </span>
                )}
                {/* An e-mail broken across two lines stops being an address.
                    The row wraps between items, so keeping this whole pushes
                    it to its own line rather than overflowing. */}
                <span className="whitespace-nowrap">{label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
