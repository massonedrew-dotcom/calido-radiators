import type { Metadata } from 'next';

import { buildMetadata, buildViewport } from '@/app/_shared/root';
import { Installation } from '@/components/pages/Installation';
import { ru } from '@/content/ru';

export const metadata: Metadata = buildMetadata(ru, 'ru', 'installation');

export const viewport = buildViewport('installation');

export default function Page() {
  return (
    <>
      <Installation dict={ru} />
    </>
  );
}
