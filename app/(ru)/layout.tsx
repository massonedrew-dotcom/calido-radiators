import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { buildMetadata, RootShell } from '@/app/_shared/root';
import { ru } from '@/content/ru';

export { viewport } from '@/app/_shared/root';

export const metadata: Metadata = buildMetadata(ru, 'ru');

export default function RuLayout({ children }: { children: ReactNode }) {
  return <RootShell dict={ru}>{children}</RootShell>;
}
