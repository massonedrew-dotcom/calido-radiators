import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { buildMetadata, RootShell } from '@/app/_shared/root';
import { en } from '@/content/en';

export { viewport } from '@/app/_shared/root';

export const metadata: Metadata = buildMetadata(en, 'en');

export default function EnLayout({ children }: { children: ReactNode }) {
  return <RootShell dict={en}>{children}</RootShell>;
}
