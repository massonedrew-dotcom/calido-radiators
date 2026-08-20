import type { Metadata } from 'next';

import { buildMetadata, buildViewport } from '@/app/_shared/root';
import { Models } from '@/components/pages/Models';
import { en } from '@/content/en';

export const metadata: Metadata = buildMetadata(en, 'en', 'models');

export const viewport = buildViewport('models');

export default function Page() {
  return (
    <>
      <Models dict={en} />
    </>
  );
}
