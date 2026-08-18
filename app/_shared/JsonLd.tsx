import { SITE_URL } from '@/app/_shared/root';
import type { Dictionary, Locale } from '@/content';
import { ASSETS } from '@/content/assets.generated';
import { formatSpec, MODELS } from '@/content/models';

/**
 * Structured data for the page: one Organization, plus a Product per model.
 *
 * Every figure comes from the same `MODELS` table the visible spec sheets are
 * rendered from, so the markup can never drift from what is on screen — which
 * is the failure mode search engines penalise.
 */

const abs = (path: string) => new URL(path, SITE_URL).toString();

function organization(dict: Dictionary) {
  return {
    '@type': 'Organization',
    '@id': abs('/#organization'),
    name: 'Calido Radiators',
    legalName: 'Calido Radiators',
    url: SITE_URL,
    logo: abs(ASSETS['brand/logo'].src),
    slogan: dict.brand.tagline,
    description: dict.hero.lead,
    foundingDate: '2015',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'UZ',
    },
    makesOffer: MODELS.map((m) => ({
      '@type': 'Offer',
      itemOffered: { '@id': abs(`/#product-${m.slug}`) },
    })),
  };
}

function product(dict: Dictionary, locale: Locale, slug: string) {
  const model = MODELS.find((m) => m.slug === slug);
  if (!model) return null;

  type Slug = keyof Dictionary['range']['taglines'];
  const key = model.slug as Slug;

  return {
    '@type': 'Product',
    '@id': abs(`/#product-${model.slug}`),
    name: `Calido ${model.name}`,
    sku: model.slug,
    description: dict.range.taglines[key],
    image: abs(ASSETS[model.image].src),
    category: dict.hero.kicker,
    brand: { '@type': 'Brand', name: 'Calido Radiators' },
    manufacturer: { '@id': abs('/#organization') },
    material: 'Aluminium',
    // Spec rows differ per model — INFINITY publishes a maximum temperature
    // where the others publish section volume — so this mirrors whatever the
    // factory sheet actually lists.
    additionalProperty: model.specs.map((spec) => ({
      '@type': 'PropertyValue',
      name: dict.range.specLabels[spec.key],
      value: formatSpec(spec, locale === 'ru' ? 'ru' : 'en'),
      unitText: dict.range.units[spec.unit],
    })),
  };
}

export function JsonLd({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const graph = [
    organization(dict),
    {
      '@type': 'WebSite',
      '@id': abs('/#website'),
      url: SITE_URL,
      name: 'Calido Radiators',
      inLanguage: dict.htmlLang,
      publisher: { '@id': abs('/#organization') },
    },
    ...MODELS.map((m) => product(dict, locale, m.slug)).filter(Boolean),
  ];

  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
    // Prevents the payload from terminating the script element early.
    .replace(/</g, '\\u003c');

  return (
    <script
      type="application/ld+json"
      // Static, locally-built payload; no user input reaches this string.
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
