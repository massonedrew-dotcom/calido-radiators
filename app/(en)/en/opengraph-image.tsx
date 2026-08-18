import { ImageResponse } from 'next/og';

import { en } from '@/content/en';

export const alt = 'Calido Radiators — heat you can trust';
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
          padding: 72,
          background: 'linear-gradient(135deg, #1E2A63 0%, #2B3A87 62%, #DA1F26 100%)',
          color: '#FFFFFF',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 22, background: '#FFFFFF' }} />
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 6,
              textTransform: 'uppercase',
            }}
          >
            Calido Radiators
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 92,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: -2,
              textTransform: 'uppercase',
            }}
          >
            {en.brand.tagline}
          </div>
          <div style={{ width: 96, height: 6, background: '#FFFFFF', marginTop: 36 }} />
          <div style={{ fontSize: 30, marginTop: 32, opacity: 0.86, maxWidth: 860 }}>
            {en.hero.lead}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 48, fontSize: 22, opacity: 0.78 }}>
          <span>{en.about.sinceLabel} 2015</span>
          <span>5,000,000 {en.capacity.unit}</span>
          <span>EN · ISO</span>
        </div>
      </div>
    ),
    size,
  );
}
