import type { Dictionary } from './dictionary';

/**
 * English translation. The source assets are Russian-only, so this is new
 * writing that mirrors the Russian meaning one to one — no claims added.
 */
export const en: Dictionary = {
  locale: 'en',
  htmlLang: 'en',
  alternate: { href: '/', label: 'RU', title: 'Русский' },

  brand: {
    name: 'Calido',
    full: 'Calido Radiators',
    tagline: 'Heat you can trust',
  },

  nav: {
    label: 'Main navigation',
    skip: 'Skip to content',
    items: [
      { id: 'about', label: 'The plant' },
      { id: 'technology', label: 'Technology' },
      { id: 'range', label: 'Model range' },
      { id: 'warranty', label: 'Warranty' },
      { id: 'contact', label: 'Contact' },
    ],
    cta: 'Request a quote',
  },

  progress: { label: 'Reading progress', of: 'of' },

  hero: {
    index: '01',
    kicker: 'Uzbekistan · since 2015',
    title: 'Heat you can trust',
    lead: 'Modern heating radiators for houses, apartments and commercial buildings.',
    sub: 'We make heat that thousands of customers rely on.',
    cta: 'See the model range',
    scroll: 'Scroll down',
    imageAlt: 'Close-up of a Calido aluminium radiator section',
  },

  about: {
    index: '02',
    kicker: 'Who we are',
    title: 'Who we are',
    lead: 'Calido is a modern plant producing aluminium and bimetallic radiators.',
    sinceLabel: 'Operating since',
    since: 2015,
    sinceSuffix: '',
    imageAlt: 'Calido radiator in a steel finish, seen from above',
  },

  capacity: {
    index: '03',
    kicker: 'Production',
    title: 'Production capacity',
    more: 'Over',
    count: 5_000_000,
    unit: 'sections per year',
    standards: 'Production complies with the international EN and ISO standards.',
    factoryAlt: 'Line icon of a production building',
    imageAlt: 'Calido radiator in a green finish',
  },

  technology: {
    index: '04',
    kicker: 'Technology',
    title: 'Modern technology',
    lead: 'Manufacturing uses high-pressure die casting, which delivers strength, reliability and high heat output.',
    stages: [
      { id: 'mould', label: 'Mould', text: 'The steel die stands ready for the pour.' },
      { id: 'melt', label: 'Melt', text: 'Aluminium fills the die under high pressure.' },
      { id: 'cast', label: 'Section', text: 'The finished section — dense, with no voids.' },
    ],
    imageAlt: 'A Calido radiator section formed by high-pressure die casting',
  },

  // Wording taken from the English column of the printed catalogue spread,
  // so the site matches the client's own published terminology.
  anatomy: {
    index: '05',
    kicker: 'Construction',
    title: 'What are bimetallic radiators made of',
    left: [
      'Stainless steel manifolds',
      'Die casting',
      'Small volume of coolant guarantees high energy efficiency and low inertia',
    ],
    right: ['Persistent two-staged coating', 'Smart design', 'Any colour of your choice'],
    imageAlt: 'Construction of a Calido bimetallic radiator section',
  },

  quality: {
    index: '06',
    kicker: 'Quality',
    title: 'Quality control',
    lead: 'Every radiator goes through multi-stage quality control at each production step.',
    sub: 'Because reliability starts at the plant.',
    checks: [
      'Incoming alloy inspection',
      'Section geometry check',
      'Pressure leak test',
      'Coating acceptance',
    ],
    imageAlt: 'White Calido radiator, vertical view',
  },

  heat: {
    index: '07',
    kicker: 'Heat output',
    title: 'High heat output',
    lead: 'The modern design heats a room quickly and distributes warmth evenly.',
    peakLabel: 'Up to',
    peak: 198,
    peakUnit: 'W per section',
    imageAlt: 'Close-up of the fins on a Calido radiator',
  },

  benefits: {
    index: '08',
    kicker: 'Benefits',
    title: 'Benefits',
    items: [
      'High heat output',
      'Corrosion protection',
      'Reliable sealing',
      'Long service life',
    ],
    imageAlt: 'Calido radiator in a blue finish',
  },

  systems: {
    index: '09',
    kicker: 'Compatibility',
    title: 'For any heating system',
    lead: 'Suitable for apartments, private houses and commercial premises.',
    sub: 'Compatible with both central and standalone heating systems.',
    blocks: [
      { title: 'Spaces', items: ['Apartments', 'Private houses', 'Commercial buildings'] },
      { title: 'Systems', items: ['Central heating', 'Standalone heating'] },
    ],
    imageAlt: 'Calido radiator mounted on the wall of a bright room',
  },

  connection: {
    index: '10',
    kicker: 'Installation',
    title: 'Connection methods',
    items: [
      { id: 'side', num: '1', label: 'Side connection' },
      { id: 'bottom', num: '2', label: 'Bottom connection' },
      { id: 'diagonal', num: '3', label: 'Diagonal connection' },
    ],
    legend: { supply: 'Supply', return: 'Return' },
    body: 'The Calido Radiators sections are made of high-quality aluminium alloy by the die casting method. Radiators have an aesthetic appearance, are convenient to install on the surface of walls and blend harmoniously into any interior.',
    diagramAlt: 'Radiator connection diagram',
  },

  range: {
    index: '11',
    kicker: 'Model range',
    title: 'Model range',
    lead: 'Six models, from the compact CLASSIC 350 to the flagship INFINITY.',
    hint: 'Scroll to move through the range',
    specLabels: {
      centerDistance: 'Centre distance',
      sectionSize: 'Section size',
      sectionWeight: 'Section weight',
      heatOutput: 'Heat output',
      sectionVolume: 'Section volume',
      maxTemperature: 'Maximum temperature',
      workingPressure: 'Max working pressure',
      testPressure: 'Test pressure',
    },
    units: { mm: 'mm', kg: 'kg', w: 'W', l: 'l', c: '°C', atm: 'atm' },
    taglines: {
      infinity: 'Minimal. Reliable. Warm.',
      elegant: 'Style. Efficiency. Reliability.',
      'elegant-premium': 'Style. Efficiency. Reliability.',
      classic: 'Reliable. Practical. Comfortable.',
      bravo: 'Light, reliable and efficient.',
      'classic-350': 'Compact. Reliable. Comfortable.',
    },
    highlights: {
      infinity: ['High heat output', 'Modern design', 'Reliable for years'],
      elegant: ['High heat output', 'Modern design', '10-year warranty'],
      'elegant-premium': [
        'Highest output in the range — 230 W',
        'Modern design',
        '10-year warranty',
      ],
      classic: ['High heat output', 'Robust construction', '10-year warranty'],
      bravo: ['Light aluminium construction', 'Efficient heat output', '10-year warranty'],
      'classic-350': ['Compact size', 'High heat output', '10-year warranty'],
    },
    imageAlt: 'Calido radiator',
    lineupAlt: 'The Calido radiator range lined up by descending height',
    scaleKicker: 'Comparison',
    scaleTitle: 'True-scale sizes',
    scaleNote: 'All six models at one scale, using the section heights from the specifications.',
  },

  colors: {
    index: '12',
    kicker: 'Finish',
    title: 'A range of colours',
    lead: 'Calido radiators can be painted in any colour.',
    note: 'Five factory finishes are shown below. Other RAL colours are made to order.',
    swatchLabel: 'Choose a colour',
    names: {
      white: 'White',
      indigo: 'Indigo',
      green: 'Green',
      graphite: 'Graphite',
      terracotta: 'Terracotta',
    },
    imageAlt: 'Calido radiator section in colour',
  },

  warranty: {
    index: '13',
    kicker: 'Warranty',
    title: 'Warranty',
    lead: 'We stand behind the quality of what we make.',
    number: '10',
    years: 'years',
    sub: 'A 10-year warranty.',
    imageAlt: 'Calido radiator in a mustard finish',
  },

  contact: {
    index: '14',
    kicker: 'Get in touch',
    title: 'Request a quote',
    lead: 'Tell us about the project — we will pick the model and work out the section count.',
    form: {
      name: { label: 'Name', placeholder: 'What should we call you' },
      phone: { label: 'Phone', placeholder: '+998 __ ___ __ __' },
      message: { label: 'Message', placeholder: 'Site, section count, timeline' },
      submit: 'Send request',
      sending: 'Sending…',
      success: 'Request received. We will be in touch.',
      error: 'Could not send. Please try again.',
      required: 'Required field',
    },
    summary: [
      { label: 'Production', value: 'Uzbekistan, since 2015' },
      { label: 'Capacity', value: '5,000,000 sections a year' },
      { label: 'Standards', value: 'EN, ISO' },
      { label: 'Warranty', value: '10 years' },
    ],
    // TODO: swap in the real company details once the client supplies them.
    details: {
      title: 'Contacts',
      items: [
        { label: 'Phone', value: '—' },
        { label: 'E-mail', value: '—' },
        { label: 'Address', value: '—' },
      ],
    },
    social: { title: 'Social', items: [] },
    legal: '© {year} Calido Radiators®. All rights reserved.',
  },

  common: {
    logoAlt: 'Calido Radiators',
    close: 'Close',
  },
};
