import type { Metadata } from 'next';

import { buildMetadata, buildViewport } from '@/app/_shared/root';
import { ContactPage } from '@/components/pages/ContactPage';
import { en } from '@/content/en';

export const metadata: Metadata = buildMetadata(en, 'en', 'contact');

export const viewport = buildViewport('contact');

export default function Page() {
  return (
    <>
      <ContactPage dict={en} />
    </>
  );
}
