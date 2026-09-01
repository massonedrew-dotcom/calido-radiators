import { ImageResponse } from 'next/og';

import { en } from '@/content/en';

export const alt = 'Calido Radiators. Heat you can trust';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Required by `output: 'export'`: the card is drawn once at build time and
// written out as a file, since Pages has no route handler to render it on demand.
export const dynamic = 'force-static';

/** English share card. Same composition as the Russian one. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#FFFFFF',
          color: '#0D1020',
          fontFamily: 'sans-serif',
        }}
      >
        {/* The topbar strip, at card scale. */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            background: '#22337E',
            color: '#FFFFFF',
            padding: '26px 72px',
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 6,
            textTransform: 'uppercase',
          }}
        >
          Calido Radiators
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', padding: '0 72px' }}>
          <div
            style={{
              fontSize: 88,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: -2,
              textTransform: 'uppercase',
              color: '#0D1020',
            }}
          >
            {en.brand.tagline}
          </div>
          <div style={{ width: 96, height: 8, background: '#D91222', marginTop: 34 }} />
          <div style={{ fontSize: 30, marginTop: 30, color: '#4C5470', maxWidth: 860 }}>
            {en.hero.lead}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 48,
            fontSize: 22,
            background: '#EEF0F8',
            color: '#22337E',
            padding: '26px 72px',
          }}
        >
          <span>{en.about.sinceLabel} 2015</span>
          <span>5,000,000 {en.capacity.unit}</span>
          <span>EN · ISO</span>
        </div>
      </div>
    ),
    size,
  );
}
