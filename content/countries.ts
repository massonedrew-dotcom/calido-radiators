/**
 * Dialling codes and national number lengths, for the phone field.
 *
 * Why this file exists rather than a dependency: the two obvious libraries are
 * both a bad trade here. `intl-tel-input` needs a stylesheet, a flag sprite and
 * a ~200 KB `utils.js` before it can validate anything, and it would be the
 * only third-party runtime on a site that currently has none. `libphonenumber`
 * is heavier still. What this form actually needs is a dial code, a flag and a
 * plausible length — about 4 KB of data, below.
 *
 * The table is a compact string on purpose. As an array of objects the same
 * data is six times the bytes and six times the diff when a code changes, and
 * every entry repeats the same four keys.
 *
 * Format, space-separated:  `ISO2:dial:min[-max]`
 *   · ISO2 is the region code. The flag is derived from it, so there is no
 *     image, no sprite and no icon font — see `flagOf`.
 *   · `dial` is the country calling code, no plus.
 *   · `min`/`max` bound the *national significant number*, i.e. what the
 *     visitor types after the code. One number means fixed length.
 *
 * Accuracy, stated plainly: the lengths for the markets this factory actually
 * sells into — Uzbekistan and its neighbours, Russia, Turkey, the Gulf — are
 * exact. Elsewhere they are the correct range where it is well known and a
 * permissive 4-14 where it is not. That is the honest ceiling for a table this
 * size, and it is the right one for a contact form: the cost of rejecting a
 * real customer's number is far higher than the cost of accepting a typo that
 * a human will notice when they call back.
 */

const TABLE = `
UZ:998:9 RU:7:10 KZ:7:10 KG:996:9 TJ:992:9 TM:993:8 AZ:994:9 GE:995:9 AM:374:8
BY:375:9 UA:380:9 MD:373:8 TR:90:10 AE:971:8-9 SA:966:9 QA:974:8 KW:965:8
BH:973:8 OM:968:8 IL:972:8-9 IR:98:10 IQ:964:10 JO:962:8-9 LB:961:7-8 SY:963:9
AF:93:9 PK:92:10 IN:91:10 BD:880:10 LK:94:9 NP:977:10 CN:86:11 HK:852:8
MO:853:8 TW:886:9 JP:81:9-10 KR:82:9-10 MN:976:8 VN:84:9 TH:66:9 MY:60:9-10
SG:65:8 ID:62:9-12 PH:63:10 KH:855:8-9 LA:856:9-10 MM:95:8-10 BN:673:7
US:1:10 CA:1:10 MX:52:10 GT:502:8 SV:503:8 HN:504:8 NI:505:8 CR:506:8 PA:507:8
CU:53:8 DO:1:10 HT:509:8 JM:1:10 TT:1:10 BB:1:10 BS:1:10 PR:1:10
BR:55:10-11 AR:54:10 CL:56:9 CO:57:10 PE:51:9 VE:58:10 EC:593:9 BO:591:8
PY:595:9 UY:598:8 GY:592:7 SR:597:6-7
GB:44:10 IE:353:9 FR:33:9 DE:49:10-11 IT:39:9-10 ES:34:9 PT:351:9 NL:31:9
BE:32:8-9 LU:352:9 CH:41:9 AT:43:10-11 SE:46:7-9 NO:47:8 DK:45:8 FI:358:9
IS:354:7 PL:48:9 CZ:420:9 SK:421:9 HU:36:9 RO:40:9 BG:359:8-9 GR:30:10
HR:385:8-9 SI:386:8 RS:381:8-9 BA:387:8 ME:382:8 MK:389:8 AL:355:9 XK:383:8
EE:372:7-8 LV:371:8 LT:370:8 CY:357:8 MT:356:8 LI:423:7 MC:377:8 AD:376:6
SM:378:8-10 VA:379:8
EG:20:10 LY:218:9 TN:216:8 DZ:213:9 MA:212:9 SD:249:9 ET:251:9 KE:254:9
TZ:255:9 UG:256:9 RW:250:9 NG:234:10 GH:233:9 CI:225:10 SN:221:9 CM:237:9
ZA:27:9 ZW:263:9 ZM:260:9 MZ:258:9 AO:244:9 NA:264:9 BW:267:7-8 MU:230:8
MG:261:9 CD:243:9 CG:242:9 GA:241:8 ML:223:8 BF:226:8 NE:227:8 TD:235:8
GN:224:9 BJ:229:8 TG:228:8 SL:232:8 LR:231:7-8 MR:222:8 GM:220:7 SO:252:7-8
DJ:253:8 ER:291:7 SS:211:9 CF:236:8 BI:257:8 MW:265:7-9 LS:266:8 SZ:268:8
AU:61:9 NZ:64:8-10 FJ:679:7 PG:675:8 NC:687:6 PF:689:8
`;

export interface Country {
  readonly iso: string;
  readonly dial: string;
  readonly min: number;
  readonly max: number;
}

/** Fallback bounds where a country's own range is not worth asserting. */
const LOOSE_MIN = 4;
const LOOSE_MAX = 14;

export const COUNTRIES: readonly Country[] = TABLE.trim()
  .split(/\s+/)
  .map((entry) => {
    const [iso, dial, len] = entry.split(':');
    const [lo, hi] = (len ?? '').split('-');
    const min = Number(lo) || LOOSE_MIN;
    return { iso: iso!, dial: dial!, min, max: Number(hi) || min || LOOSE_MAX };
  });

export const DEFAULT_COUNTRY = 'UZ';

const byIso = new Map(COUNTRIES.map((c) => [c.iso, c]));

export function countryOf(iso: string): Country {
  return byIso.get(iso) ?? byIso.get(DEFAULT_COUNTRY)!;
}

/**
 * The flag, as the two regional-indicator codepoints for the ISO code.
 *
 * No sprite and no icon font: 'UZ' becomes U+1F1FA U+1F1FF, which the platform
 * draws with its own emoji font. Worth knowing before relying on it — Windows
 * ships no flag glyphs at all, so Chrome and Edge on Windows render the pair as
 * the letters "UZ". That degrades to something still correct and still
 * identifying, which is why the dial code sits next to it rather than behind a
 * tooltip.
 */
export function flagOf(iso: string): string {
  return String.fromCodePoint(...[...iso].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

/** Digits only. What the length check counts and what the href needs. */
export function digitsOf(input: string): string {
  return input.replace(/\D+/g, '');
}

/**
 * `null` when the national number is acceptable for `iso`, otherwise the
 * dictionary key naming what is wrong with it.
 */
export function phoneProblem(iso: string, national: string): 'empty' | 'length' | null {
  const digits = digitsOf(national);
  if (!digits) return 'empty';
  const { min, max } = countryOf(iso);
  return digits.length < min || digits.length > max ? 'length' : null;
}

/** Full E.164 for submission: +998901234567. */
export function toE164(iso: string, national: string): string {
  return `+${countryOf(iso).dial}${digitsOf(national)}`;
}
