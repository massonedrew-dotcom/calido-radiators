import type { Metadata } from 'next';

import { JsonLd } from '@/app/_shared/JsonLd';
import { buildMetadata, buildViewport } from '@/app/_shared/root';
import { Home } from '@/components/pages/Home';
import { ru } from '@/content/ru';

export const metadata: Metadata = buildMetadata(ru, 'ru', 'home');

export const viewport = buildViewport('home');

export default function Page() {
  return (
    <>
      <JsonLd dict={ru} locale="ru" />
      <Home dict={ru} />
    </>
  );
}
