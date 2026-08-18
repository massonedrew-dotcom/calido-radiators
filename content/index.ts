import type { Dictionary, Locale } from './dictionary';
import { en } from './en';
import { ru } from './ru';

export type { Dictionary, Locale };

export const dictionaries: Record<Locale, Dictionary> = { ru, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** Ordered ids of every scroll section, used by the progress rail. */
export const SECTION_IDS = [
  'hero',
  'about',
  'capacity',
  'technology',
  'anatomy',
  'quality',
  'heat',
  'benefits',
  'systems',
  'connection',
  'range',
  'colors',
  'warranty',
  'contact',
] as const;

export type SectionId = (typeof SECTION_IDS)[number];
