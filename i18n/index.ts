import { en } from './en';
import { ar } from './ar';
import { az } from './az';
import { bg } from './bg';
import { bs } from './bs';
import { cnr } from './cnr';
import { cs } from './cs';
import { da } from './da';
import { de } from './de';
import { el } from './el';
import { es } from './es';
import { et } from './et';
import { fa } from './fa';
import { fi } from './fi';
import { fr } from './fr';
import { ha } from './ha';
import { hi } from './hi';
import { hr } from './hr';
import { hu } from './hu';
import { it } from './it';
import { kk } from './kk';
import { lv } from './lv';
import { mk } from './mk';
import { ms } from './ms';
import { nl } from './nl';
import { no } from './no';
import { pl } from './pl';
import { pt } from './pt';
import { ro } from './ro';
import { rom } from './rom';
import { ru } from './ru';
import { sk } from './sk';
import { sl } from './sl';
import { sr } from './sr';
import { sv } from './sv';
import { sw } from './sw';
import { tk } from './tk';
import { tr } from './tr';
import { ur } from './ur';
import { uz } from './uz';
import { zh } from './zh';

export const languages = {
  en,
  ar,
  az,
  bg,
  bs,
  cnr,
  cs,
  da,
  de,
  el,
  es,
  et,
  fa,
  fi,
  fr,
  ha,
  hi,
  hr,
  hu,
  it,
  kk,
  lv,
  mk,
  ms,
  nl,
  no,
  pl,
  pt,
  ro,
  rom,
  ru,
  sk,
  sl,
  sr,
  sv,
  sw,
  tk,
  tr,
  ur,
  uz,
  zh,
};

export type LanguageCode = keyof typeof languages;
export type Translations = Partial<typeof languages.en>;