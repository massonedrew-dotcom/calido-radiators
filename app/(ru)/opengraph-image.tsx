import { ImageResponse } from 'next/og';

import { ru } from '@/content/ru';

export const alt = 'Calido Radiators — тепло, которому доверяют';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Required by `output: 'export'`: the card is drawn once at build time and
// written out as a file, since Pages has no route handler to render it on demand.
export const dynamic = 'force-static';

/**
 * Share card, drawn from the palette rather than from a photograph: the
 * product shots are all portrait, and letterboxing one into 1200x630 looked
 * worse than the brand's own indigo-to-red temperature ramp.
 *
 * No custom font is fetched — a share card is rendered at build time and a
 * missing font request would fail the whole route.
 */
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
            {ru.brand.tagline}
          </div>
          <div style={{ width: 96, height: 6, background: '#FFFFFF', marginTop: 36 }} />
          <div style={{ fontSize: 30, marginTop: 32, opacity: 0.86, maxWidth: 860 }}>
            {ru.hero.lead}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 48, fontSize: 22, opacity: 0.78 }}>
          <span>{ru.about.sinceLabel} 2015</span>
          <span>5 000 000 {ru.capacity.unit}</span>
          <span>EN · ISO</span>
        </div>
      </div>
    ),
    size,
  );
}
