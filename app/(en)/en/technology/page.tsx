import type { Metadata } from 'next';

import { buildMetadata, buildViewport } from '@/app/_shared/root';
import { TechnologyPage } from '@/components/pages/TechnologyPage';
import { en } from '@/content/en';

export const metadata: Metadata = buildMetadata(en, 'en', 'technology');

export const viewport = buildViewport('technology');

export default function Page() {
  return (
    <>
      <TechnologyPage dict={en} />
    </>
  );
}
