/**
 * Every way to reach the company, in one object.
 *
 * THIS IS THE ONE PLACE TO EDIT CONTACT DETAILS. The direct-contact block under
 * the enquiry form, the footer's contact column and the hrefs behind both are
 * all derived from here — change a number once and it changes everywhere it is
 * printed or linked.
 *
 * Phone and e-mail are the client's real details. Telegram, WhatsApp and the
 * postal address are not known yet and are left as empty strings — which is not
 * a TODO but the mechanism: every surface skips a channel whose `value` is
 * empty, so filling one in here is the entire job of publishing it. Nothing has
 * to be uncommented and no markup has to be added back.
 *
 * Two fields per channel rather than one, and the split matters:
 *   · `value` is machine-readable and goes in the href. `tel:` and `wa.me` both
 *     want digits and nothing else — a space or a bracket in a `wa.me` path is
 *     a broken link, not a tolerated one.
 *   · `display` is what a human reads, grouped for legibility. Left empty where
 *     there is nothing worth printing (a map URL), and the surface falls back
 *     to the translated channel name.
 * Deriving one from the other automatically was considered and dropped: digit
 * grouping is per-country (+998 90 123 45 67, +7 495 123-45-67), so the
 * "clever" version would need a formatter per market to produce what one string
 * says outright.
 *
 * Locale-neutral on purpose, like content/models.ts: a phone number is the same
 * in Russian and English. Only the *labels* around it are translated, and those
 * stay in the dictionaries.
 */

export interface ContactChannel {
  /** Digits only, no punctuation. Goes in the href. */
  readonly value: string;
  /** What the visitor reads. */
  readonly display: string;
}

export const CONTACTS = {
  phone: {
    /** Leading + is kept: `tel:` accepts it and it is what makes the number international. */
    value: '+998770600404',
    display: '+998 77 060 04 04',
  },
  telegram: {
    /** Username without the @. The @ is presentation. */
    value: '',
    display: '',
  },
  whatsapp: {
    /** wa.me takes the number in full international form with no + and no separators. */
    value: '',
    display: 'WhatsApp',
  },
  email: {
    value: 'sales@calidoradiators.uz',
    display: 'sales@calidoradiators.uz',
  },
  /**
   * The map link, verbatim.
   *
   * Yandex's `whatshere[point]` and `si` parameters are percent-encoded and
   * order-sensitive; decoding the brackets or dropping what looks like a
   * tracking parameter produces a URL that still loads and no longer points at
   * the plant. It goes in the href exactly as supplied, which is also why this
   * is the one channel whose `value` is already a complete URL.
   */
  location: {
    value:
      'https://yandex.ru/maps?whatshere%5Bzoom%5D=15&whatshere%5Bpoint%5D=69.400598,41.345413&si=2yr1fph9277egartv8wmkqxck0',
    display: '',
  },
  /** Printed in the footer only; there is no href for a postal address. */
  address: {
    value: '',
    display: '',
  },
} as const satisfies Record<string, ContactChannel>;

export type ContactId = keyof typeof CONTACTS;

/**
 * The href for a channel, or null where the value is not linkable.
 *
 * Kept next to the data rather than in the components, so the two places that
 * render contacts cannot disagree about what a Telegram link looks like.
 */
export function contactHref(id: ContactId): string | null {
  const { value } = CONTACTS[id];
  if (!value) return null;
  switch (id) {
    case 'phone':
      return `tel:${value}`;
    case 'telegram':
      return `https://t.me/${value}`;
    case 'whatsapp':
      return `https://wa.me/${value}`;
    case 'email':
      return `mailto:${value}`;
    case 'location':
      // Already a full URL; anything else here would be rewriting it.
      return value;
    default:
      return null;
  }
}

/**
 * True where the href leaves the site and therefore wants a new tab.
 *
 * `tel:` and `mailto:` hand off to another application; opening them in a new
 * tab leaves the visitor with a blank one to close afterwards, which is why
 * they are excluded here rather than getting `target="_blank"` for symmetry.
 */
export function opensInNewTab(id: ContactId): boolean {
  return id === 'telegram' || id === 'whatsapp' || id === 'location';
}

/**
 * Which channels each surface prints, in order.
 *
 * Here rather than in the dictionaries because it is not translated content —
 * both locales list the same channels in the same order, and having ru and en
 * each carry their own copy of that order is how they end up disagreeing. The
 * dictionaries keep only the labels.
 */
export const DIRECT_CHANNELS = [
  'phone',
  'telegram',
  'whatsapp',
  'email',
  'location',
] as const;

/** The footer prints an address as well, and no WhatsApp: it is not a directory. */
export const FOOTER_CHANNELS = ['phone', 'email', 'location', 'address'] as const;
