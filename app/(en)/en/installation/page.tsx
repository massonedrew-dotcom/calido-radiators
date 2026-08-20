import type { Metadata } from 'next';

import { buildMetadata, buildViewport } from '@/app/_shared/root';
import { Installation } from '@/components/pages/Installation';
import { en } from '@/content/en';

export const metadata: Metadata = buildMetadata(en, 'en', 'installation');

export const viewport = buildViewport('installation');

export default function Page() {
  return (
    <>
      <Installation dict={en} />
    </>
  );
}
