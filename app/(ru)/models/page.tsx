import type { Metadata } from 'next';

import { buildMetadata, buildViewport } from '@/app/_shared/root';
import { Models } from '@/components/pages/Models';
import { ru } from '@/content/ru';

export const metadata: Metadata = buildMetadata(ru, 'ru', 'models');

export const viewport = buildViewport('models');

export default function Page() {
  return (
    <>
      <Models dict={ru} />
    </>
  );
}
