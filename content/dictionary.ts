import type { ru } from './ru';

/**
 * Widens the `as const` literal types of the Russian source into plain
 * string/number shapes, so translations only have to match the *structure*
 * rather than repeat the Russian literals.
 */
type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly (infer U)[]
        ? readonly Widen<U>[]
        : T extends object
          ? { readonly [K in keyof T]: Widen<T[K]> }
          : T;

export type Dictionary = Widen<typeof ru>;

export type Locale = 'ru' | 'en';
