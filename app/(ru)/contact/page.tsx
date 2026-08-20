import type { Metadata } from 'next';

import { buildMetadata, buildViewport } from '@/app/_shared/root';
import { ContactPage } from '@/components/pages/ContactPage';
import { ru } from '@/content/ru';

export const metadata: Metadata = buildMetadata(ru, 'ru', 'contact');

export const viewport = buildViewport('contact');

export default function Page() {
  return (
    <>
      <ContactPage dict={ru} />
    </>
  );
}
