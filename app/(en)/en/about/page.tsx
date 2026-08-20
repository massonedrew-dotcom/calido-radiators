import type { Metadata } from 'next';

import { buildMetadata, buildViewport } from '@/app/_shared/root';
import { AboutPage } from '@/components/pages/AboutPage';
import { en } from '@/content/en';

export const metadata: Metadata = buildMetadata(en, 'en', 'about');

export const viewport = buildViewport('about');

export default function Page() {
  return (
    <>
      <AboutPage dict={en} />
    </>
  );
}
