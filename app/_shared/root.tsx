import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import type { ReactNode } from 'react';

import type { Dictionary, Locale } from '@/content';

import '../globals.css';

/**
 * Manrope stands in for Suisse Intl: same dense grotesque proportions, and it
 * is self-hosted by next/font, so there is no render-blocking third-party
 * request to pay for on first paint.
 */
const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
  preload: true,
});

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const viewport: Viewport = {
  themeColor: '#1E2A63',
  colorScheme: 'light',
};

export function buildMetadata(dict: Dictionary, locale: Locale): Metadata {
  const path = locale === 'ru' ? '/' : '/en';
  const title =
    locale === 'ru'
      ? 'Calido Radiators — алюминиевые и биметаллические радиаторы'
      : 'Calido Radiators — aluminium and bimetallic heating radiators';

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: '%s · Calido Radiators' },
    description: dict.hero.lead,
    applicationName: 'Calido Radiators',
    alternates: { canonical: path, languages: { 'ru-RU': '/', en: '/en' } },
    openGraph: {
      type: 'website',
      url: path,
      siteName: 'Calido Radiators',
      locale: locale === 'ru' ? 'ru_RU' : 'en_US',
      alternateLocale: locale === 'ru' ? ['en_US'] : ['ru_RU'],
      title: `Calido Radiators — ${dict.brand.tagline}`,
      description: dict.hero.lead,
    },
    twitter: { card: 'summary_large_image' },
    robots: { index: true, follow: true },
    // Declared explicitly rather than by file convention: with two root
    // layouts a conventional app/icon file only attaches to one of them.
    icons: { icon: [{ url: '/icon.svg', type: 'image/svg+xml' }] },
  };
}

/**
 * Shared <html>/<body> shell. Both locales get their own root layout so the
 * `lang` attribute is genuinely correct rather than patched on the client.
 */
export function RootShell({ dict, children }: { dict: Dictionary; children: ReactNode }) {
  return (
    <html lang={dict.htmlLang} className={manrope.variable}>
      <body>{children}</body>
    </html>
  );
}
