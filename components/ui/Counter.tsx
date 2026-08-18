'use client';

import { useRef } from 'react';

import { gsap } from '@/lib/gsap';
import { useIdle, useIsomorphicLayoutEffect, useReducedMotion } from '@/lib/hooks';

/**
 * Number that counts up once on entry, then reveals its caption.
 *
 * The final value is rendered on the server as well, so the figure is in the
 * HTML for crawlers and for anyone with JS or motion turned off — the tween
 * only ever overwrites text that is already correct.
 *
 * Assistive tech reads a single static string instead of the ticking digits:
 * the animated node is hidden from the accessibility tree, and one screen-reader
 * span carries the finished value and its caption together.
 */
export function Counter({
  to,
  locale,
  caption,
  className = '',
  captionClassName = '',
  duration = 2.2,
  group = true,
}: {
  to: number;
  locale: string;
  caption?: string;
  className?: string;
  captionClassName?: string;
  duration?: number;
  /** Off for years: 2015 must not render as "2 015". */
  group?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const captionRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const idle = useIdle();

  const format = (n: number) => {
    const v = Math.round(n);
    return group ? v.toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-US') : String(v);
  };

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced || !idle) return;

    const ctx = gsap.context(() => {
      const state = { value: 0 };

      gsap.to(state, {
        value: to,
        duration,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = format(state.value);
        },
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });

      // Held back until the number lands, so the caption reads as a result.
      if (captionRef.current) {
        gsap.from(captionRef.current, {
          y: 14,
          autoAlpha: 0,
          duration: 0.7,
          delay: duration * 0.92,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      }
    }, el);

    return () => ctx.revert();
  }, [reduced, idle, to, duration, locale, group]);

  return (
    <>
      <span className="sr-only">{caption ? `${format(to)} ${caption}` : format(to)}</span>
      <span ref={ref} aria-hidden className={`tnum ${className}`}>
        {format(to)}
      </span>
      {caption ? (
        <span ref={captionRef} aria-hidden className={captionClassName}>
          {caption}
        </span>
      ) : null}
    </>
  );
}
