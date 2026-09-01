import type { Dictionary } from '@/content';
import { Plate } from '@/components/ui/Plate';

/**
 * The strip above the header.
 *
 * This is the first plate on the page and it does the job the old molten hero
 * was doing badly: it says what the company is, in colour, in the top few
 * hundred pixels — without painting the entire first screen red and without a
 * shader.
 *
 * Desktop only, and that is a content decision rather than a layout one. On a
 * phone the visitor is one thumb-flick from the same three figures on the home
 * page, and a second fixed strip above an already-fixed header would eat a
 * sixth of the viewport to repeat them.
 *
 * It scrolls away with the page. The header below is what stays; a topbar that
 * sticks is a second permanent bar, and two of those is how a site ends up with
 * 140px of chrome before any content.
 */
export function TopBar({ dict }: { dict: Dictionary }) {
  return (
    <Plate tone="indigo" as="section" aria-label={dict.topbar.label} className="hidden lg:block">
      <div className="frame flex items-center justify-between gap-8 py-2.5">
        <p className="text-[0.6875rem] font-bold tracking-[0.22em] text-white/70 uppercase">
          {dict.brand.full}
        </p>

        <dl className="flex items-center gap-8">
          {dict.topbar.items.map((item) => (
            <div key={item.label} className="flex items-baseline gap-2.5">
              <dt className="text-[0.625rem] font-bold tracking-[0.16em] text-white/55 uppercase">
                {item.label}
              </dt>
              <dd className="text-[0.75rem] font-semibold tracking-[0.01em] text-white">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Plate>
  );
}
