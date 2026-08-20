import type { Metadata } from 'next';

import { buildMetadata, buildViewport } from '@/app/_shared/root';
import { TechnologyPage } from '@/components/pages/TechnologyPage';
import { ru } from '@/content/ru';

export const metadata: Metadata = buildMetadata(ru, 'ru', 'technology');

export const viewport = buildViewport('technology');

export default function Page() {
  return (
    <>
      <TechnologyPage dict={ru} />
    </>
  );
}
