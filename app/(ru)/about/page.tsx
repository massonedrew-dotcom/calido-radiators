import type { Metadata } from 'next';

import { buildMetadata, buildViewport } from '@/app/_shared/root';
import { AboutPage } from '@/components/pages/AboutPage';
import { ru } from '@/content/ru';

export const metadata: Metadata = buildMetadata(ru, 'ru', 'about');

export const viewport = buildViewport('about');

export default function Page() {
  return (
    <>
      <AboutPage dict={ru} />
    </>
  );
}
