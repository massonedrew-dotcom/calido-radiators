'use client';

import { useRef, type ElementType } from 'react';

import { gsap, SplitText } from '@/lib/gsap';
import { useIsDesktop, useIsomorphicLayoutEffect, useReducedMotion } from '@/lib/hooks';

/**
 * Headline that assembles character by character.
 *
 * The blur is the one place the project animates something other than transform
 * and opacity, because the brief asks for it by name. It is confined to
 * headings, runs once, and `will-change` is dropped the moment it finishes —
 * leaving a filter live on a large element is what makes this pattern expensive.
 *
 * SplitText rewrites the element's innerHTML, so the original text is restored
 * on cleanup and screen readers read the intact string via `aria-label`.
 */
export function SplitHeading({
  as: Tag = 'h2',
  text,
  className = '',
  id,
  delay = 0,
  start = 'top 80%',
}: {
  as?: ElementType;
  text: string;
  className?: string;
  id?: string;
  delay?: number;
  start?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const desktop = useIsDesktop();

  // Not deferred to idle like the other primitives: the hero heading is on
  // screen at load, so splitting late would show the finished line, hide it,
  // and then assemble it. There are only two of these on the page.
  //
  // Mobile gets a plain fade instead. Splitting a headline into per-character
  // spans and animating a filter across all of them is the single heaviest
  // text effect here, and the brief asks phones to come down to simple reveals.
  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced || desktop === null) return;

    let split: SplitText | undefined;

    const ctx = gsap.context(() => {
      if (!desktop) {
        gsap.from(el, {
          y: 24,
          autoAlpha: 0,
          duration: 0.8,
          delay,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start, once: true },
        });
        return;
      }

      split = SplitText.create(el, { type: 'chars', charsClass: 'split-char' });

      gsap.set(split.chars, { willChange: 'transform, opacity, filter' });

      gsap.from(split.chars, {
        y: 40,
        autoAlpha: 0,
        filter: 'blur(8px)',
        duration: 0.9,
        delay,
        ease: 'power3.out',
        stagger: 0.03,
        scrollTrigger: { trigger: el, start, once: true },
        onComplete: () => {
          gsap.set(split!.chars, { clearProps: 'willChange,filter' });
        },
      });
    }, el);

    return () => {
      ctx.revert();
      split?.revert();
    };
  }, [reduced, desktop, delay, start, text]);

  return (
    <Tag ref={ref} id={id} className={className} aria-label={text}>
      <span aria-hidden>{text}</span>
    </Tag>
  );
}
