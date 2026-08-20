import type { ReactNode } from 'react';

type Tone = 'indigo' | 'red' | 'light';

const RULE_TONE: Record<Tone, string> = {
  indigo: 'bg-mark',
  // Thermal sections only: the rule is the heat cue, not decoration.
  red: 'bg-red-500',
  light: 'bg-indigo-100',
};

/** The 56x4 brand rule that sits under every section heading. */
export function Rule({ tone = 'indigo', className = '' }: { tone?: Tone; className?: string }) {
  return <span aria-hidden className={`block h-1 w-14 ${RULE_TONE[tone]} ${className}`} />;
}

export function SectionHeading({
  kicker,
  title,
  tone = 'indigo',
  size = 'display-sm',
  id,
  children,
}: {
  kicker?: string;
  title: ReactNode;
  tone?: Tone;
  size?: 'display' | 'display-sm';
  id?: string;
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-col">
      {kicker ? <p className="kicker mb-5">{kicker}</p> : null}
      <h2 id={id} className={size} data-reveal="heading">
        {title}
      </h2>
      <Rule tone={tone} className="mt-7" />
      {children ? <div className="mt-8">{children}</div> : null}
    </header>
  );
}
