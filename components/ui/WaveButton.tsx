'use client';

import { useRef, type ReactNode } from 'react';

/**
 * CTA whose fill spreads as a wave from wherever the pointer entered.
 *
 * Deliberately *not* a magnetic button: nothing here tracks the cursor while it
 * moves. The pointer position is sampled once on enter to seed the wave origin,
 * and the animation runs on its own from there — one scale transform on a
 * single circle, so it composites for free.
 */
export function WaveButton({
  children,
  type = 'button',
  disabled,
  autoFocus,
  className = '',
}: {
  children: ReactNode;
  type?: 'button' | 'submit';
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}) {
  const waveRef = useRef<HTMLSpanElement>(null);

  const seed = (event: React.PointerEvent<HTMLButtonElement>) => {
    const wave = waveRef.current;
    if (!wave) return;
    const rect = event.currentTarget.getBoundingClientRect();
    wave.style.left = `${event.clientX - rect.left}px`;
    wave.style.top = `${event.clientY - rect.top}px`;
  };

  return (
    <button
      type={type}
      disabled={disabled}
      autoFocus={autoFocus}
      onPointerEnter={seed}
      className={`group relative isolate overflow-hidden rounded-full bg-red-500 text-white ${className}`}
    >
      <span
        ref={waveRef}
        aria-hidden
        className="pointer-events-none absolute -z-10 block size-[280%] -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-red-700 transition-transform duration-600 ease-out group-hover:scale-100 group-focus-visible:scale-100"
        style={{ transitionTimingFunction: 'var(--ease-out-expo)' }}
      />
      {children}
    </button>
  );
}
