import type { ElementType, ReactNode } from 'react';

import type { PlateId } from '@/lib/plates';

/**
 * A plate: one opaque rectangle of brand colour on the white page.
 *
 * This is the only way colour is allowed to reach a background anywhere on the
 * site. The classes below are the whole system — a component that wants a
 * coloured surface asks for a plate rather than writing `bg-indigo-700` itself,
 * so the ink that goes with that fill cannot be forgotten.
 *
 * The dark tones carry `.on-dark`, which redeclares `--color-fg-strong` and
 * friends (styles/tokens.css). That is what lets a heading inside a plate be
 * written as plain `text-fg-strong` and still come out white — no
 * `text-white` at the call site, and therefore no way for a plate to be
 * recoloured later and leave white text on a light fill.
 *
 * Corners are square. The template this follows sets `rounded-0` on every
 * surface and reserves the pill radius for buttons alone; a plate with a 12px
 * radius stops reading as a plate and starts reading as a card.
 */
const TONE: Record<PlateId, string> = {
  indigo: 'on-dark bg-indigo-700',
  ink: 'on-dark bg-indigo-900',
  red: 'on-dark bg-red-500',
  paper: 'bg-paper',
  // Bounded rather than filled: on a white page a white plate is its hairline.
  white: 'bg-white border border-line',
};

export function Plate({
  tone = 'paper',
  as: Tag = 'div',
  className = '',
  children,
  ...rest
}: {
  tone?: PlateId;
  as?: ElementType;
  className?: string;
  children?: ReactNode;
} & Record<string, unknown>) {
  return (
    <Tag className={`${TONE[tone]} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * The square colour block that overhangs the top edge of a feature card.
 *
 * Lifted straight from the source template, where it is `btn-xxl-square
 * bg-primary mt-n4` — a solid square pulled up so it breaks the card's own
 * border. It is the single most recognisable move in that design language and
 * it is the reason the layout reads as plates rather than as cards: the colour
 * is demonstrably *on top of* the white, not inside it.
 */
export function PlateBadge({
  tone = 'indigo',
  className = '',
  children,
}: {
  tone?: PlateId;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      aria-hidden
      className={`${TONE[tone]} -mt-8 grid size-16 shrink-0 place-items-center ${className}`}
    >
      {children}
    </span>
  );
}
