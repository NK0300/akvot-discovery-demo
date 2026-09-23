/**
 * Known-identity seeds + alias resolution (nicknames, unique surnames, Latin translits).
 * Sole SoT for celeb/public-figure QID seeds — lookup.js imports resolveKnownIdentityQid.
 * Never invent QIDs for COMMON_HE bare names (כהן/לוי/פרץ/…); those stay out of UNIQUE_SURNAME_ALIASES.
 */

/** Fold Latin for translit compare: Zehava Galon ≈ Zahava Gal-On. */
export function latinFold(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Structured seeds: HE full + nicknames + unique surnames (explicit) + Latin labels.
 * Unique single-token surnames MUST be listed here — never inferred from COMMON_HE.
 */
export const KNOWN_IDENTITY_SEEDS = [
  {
    qid: 'Q43723',
    labels: [
      'בנימין נתניהו', 'ביבי נתניהו', 'ביבי', 'נתניהו',
      'Benjamin Netanyahu', 'Bibi Netanyahu', 'Netanyahu',
    ],
  },
  {
    qid: 'Q1396120',
    labels: ['יאיר לפיד', 'לפיד', 'Yair Lapid', 'Lapid'],
  },
  {
    qid: 'Q966349',
    labels: ['גדעון סער', 'סער', 'Gideon Saar', 'Gideon Sa\'ar', 'Saar'],
  },
  {
    qid: 'Q130873',
    labels: ['מנחם בגין', 'בגין', 'Menachem Begin', 'Begin'],
  },
  {
    qid: 'Q2630062',
    labels: [
      'זהבה גלאון', 'גלאון',
      'Zehava Galon', 'Zahava Galon', 'Zehava Gal-On', 'Zahava Gal-On', 'Galon',
    ],
  },
  {
    qid: 'Q652581',
    labels: ['חיים רמון', 'Haim Ramon', 'Chaim Ramon'],
  },
  {
    qid: 'Q16131258',
    labels: ['בני גנץ', 'גנץ', 'Benny Gantz', 'Gantz'],
  },
  {
    qid: 'Q1969577',
    labels: ['נפתלי בנט', 'בנט', 'Naftali Bennett', 'Bennett'],
  },
  {
    qid: 'Q359400',
    labels: ['יצחק הרצוג', 'הרצוג', 'Isaac Herzog', 'Herzog'],
  },
  {
    qid: 'Q212490',
    labels: ['שמעון פרס', 'פרס', 'Shimon Peres', 'Peres'],
  },
  {
    qid: 'Q41950',
    labels: ['גולדה מאיר', 'Golda Meir'],
  },
  {
    qid: 'Q212047',
    labels: ['אריאל שרון', 'שרון', 'Ariel Sharon', 'Sharon'],
  },
  {
    qid: 'Q192949',
    labels: ['אהוד ברק', 'Ehud Barak'],
  },
  {
    qid: 'Q212050',
    labels: ['אהוד אולמרט', 'אולמרט', 'Ehud Olmert', 'Olmert'],
  },
  {
    qid: 'Q723506',
    labels: ['יואב גלנט', 'גלנט', 'Yoav Gallant', 'Gallant'],
  },
  {
    qid: 'Q20022746',
    labels: ['הרצל בוקר', 'Herzl Boker'],
  },
  {
    qid: 'Q3663054',
    labels: ['עופר שלח', 'עפר שלח', 'Ofer Shelah'],
  },
  {
    qid: 'Q466537',
    labels: ['אורלי לוי', 'אורלי לוי-אבקסיס', 'Orly Levy', 'Orly Levy-Abekasis'],
  },
  {
    qid: 'Q128949',
    labels: ['מירי רגב', 'Miri Regev'],
  },
  {
    qid: 'Q472117',
    labels: ['עמיר פרץ', 'Amir Peretz'],
  },
  {
    qid: 'Q298443',
    labels: ['רם עמנואל', 'Rahm Emanuel'],
  },
  {
    qid: 'Q2916662',
    labels: ['ניצן הורוביץ', 'Nitzan Horowitz'],
  },
  {
    qid: 'Q9433',
    labels: ['יצחק רבין', 'רבין', 'Yitzhak Rabin', 'Rabin'],
  },
  // Latin world figures (wikiExact / seed class)
  // M02 policy: 'Merkel' alone is UNIQUE_SURNAME seeded → dossier Q567 (documented keep).
  {
    qid: 'Q567',
    labels: ['אנגלה מרקל', 'Angela Merkel', 'Merkel'],
  },
  {
    qid: 'Q76',
    labels: ['ברק אובמה', 'Barack Obama', 'Obama'],
  },
  {
    qid: 'Q451791',
    labels: ['ג\'ורג\'ה מלוני', 'ג׳ורג׳ה מלוני', 'Giorgia Meloni', 'Meloni'],
  },
  // P2 class-level Latin mid-tier (unique full names only — never Assaf-only if / never bare common surnames)
  {
    qid: 'Q47507930',
    labels: [
      'אסף רפפורט', 'אסף רפופורט',
      'Assaf Rappaport', 'Asaf Rappaport', 'Assaf Rapaport', 'Asaf Rapaport',
    ],
  },
  {
    qid: 'Q18389499',
    labels: ['מתי פרידמן', 'Matti Friedman'],
  },
];

/**
 * Explicit unique-surname tokens (single-token aliases already in seeds).
 * Disjoint from COMMON_HE (כהן/לוי/פרץ/…) — those must never appear here alone.
 */
export const UNIQUE_SURNAME_ALIASES = new Set([
  'נתניהו', 'לפיד', 'סער', 'בגין', 'גלאון', 'גנץ', 'בנט', 'הרצוג', 'פרס',
  'שרון', 'אולמרט', 'גלנט', 'רבין',
  'netanyahu', 'lapid', 'saar', 'begin', 'galon', 'gantz', 'bennett', 'herzog',
  'peres', 'sharon', 'olmert', 'gallant', 'rabin',
  'merkel', 'obama', 'meloni',
]);

/** Build exact + latinFold lookup maps once. */
function buildAliasIndex() {
  const exact = new Map();
  const folded = new Map();
  for (const seed of KNOWN_IDENTITY_SEEDS) {
    const qid = seed.qid;
    for (const raw of seed.labels || []) {
      const label = String(raw || '').trim().replace(/\s+/g, ' ');
      if (!label) continue;
      if (!exact.has(label)) exact.set(label, qid);
      const low = label.toLowerCase();
      if (!exact.has(low)) exact.set(low, qid);
      const fold = latinFold(label);
      if (fold && !folded.has(fold)) folded.set(fold, qid);
    }
  }
  return { exact, folded };
}

const ALIAS_INDEX = buildAliasIndex();

function normalizeQuery(q) {
  let n = String(q || '').trim().replace(/\s+/g, ' ');
  if (!n) return '';
  // strip trailing parenthetical: "Name (politician)"
  n = n.replace(/\s*\([^)]*\)\s*$/u, '').trim();
  return n;
}

/**
 * Resolve query → known QID via exact HE, nickname, unique surname, or Latin fold.
 * Returns null when no seed/alias hit (caller must not invent QIDs for common HE).
 * @param {string} q
 * @returns {string|null}
 */
export function resolveKnownIdentityQid(q) {
  const n = normalizeQuery(q);
  if (!n) return null;

  // Exact (incl. case-insensitive for Latin mixed)
  if (ALIAS_INDEX.exact.has(n)) return ALIAS_INDEX.exact.get(n);
  const lower = n.toLowerCase();
  if (ALIAS_INDEX.exact.has(lower)) return ALIAS_INDEX.exact.get(lower);

  // Latin fold (Zehava Galon / Zahava Gal-On / Angela Merkel)
  const fold = latinFold(n);
  if (fold && ALIAS_INDEX.folded.has(fold)) return ALIAS_INDEX.folded.get(fold);

  // Single-token: only if explicitly a unique-surname alias (never כהן/לוי)
  const parts = n.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    const tok = parts[0];
    const tokFold = latinFold(tok) || tok;
    if (UNIQUE_SURNAME_ALIASES.has(tok) || UNIQUE_SURNAME_ALIASES.has(tokFold)) {
      if (ALIAS_INDEX.exact.has(tok)) return ALIAS_INDEX.exact.get(tok);
      if (ALIAS_INDEX.exact.has(tok.toLowerCase())) return ALIAS_INDEX.exact.get(tok.toLowerCase());
      if (tokFold && ALIAS_INDEX.folded.has(tokFold)) return ALIAS_INDEX.folded.get(tokFold);
    }
  }

  return null;
}

/**
 * Surnames that appear only inside multi-token seed labels (e.g. Rappaport in Assaf Rappaport)
 * and are NOT UNIQUE_SURNAME_ALIASES — "John Rappaport" must not wikiExact-bleed.
 */
function buildSeedAdjacentSurnames() {
  const set = new Set();
  for (const seed of KNOWN_IDENTITY_SEEDS) {
    for (const raw of seed.labels || []) {
      const label = String(raw || '').trim().replace(/\s+/g, ' ');
      const parts = label.split(/\s+/).filter(Boolean);
      if (parts.length < 2) continue;
      const last = parts[parts.length - 1];
      const fold = latinFold(last);
      const low = last.toLowerCase();
      // Skip if this token is an intentional unique-surname alias (Merkel/Obama/…)
      if (UNIQUE_SURNAME_ALIASES.has(low) || UNIQUE_SURNAME_ALIASES.has(fold) || UNIQUE_SURNAME_ALIASES.has(last)) {
        continue;
      }
      if (fold) set.add(fold);
      set.add(low);
    }
  }
  return set;
}

const SEED_ADJACENT_SURNAMES = buildSeedAdjacentSurnames();

/**
 * Latin multi-token query whose surname is seed-adjacent but full name is NOT a seed hit.
 * Class-level (Assaf Smith / John Rappaport) — no Assaf-only if.
 */
export function isSeedAdjacentLatinNearMiss(q) {
  if (resolveKnownIdentityQid(q)) return false;
  const n = normalizeQuery(q);
  if (!n) return false;
  const parts = n.split(/\s+/).filter(Boolean);
  if (parts.length < 2 || parts.length > 3) return false;
  // Latin-majority
  const letters = n.replace(/[^A-Za-z\u0590-\u05ff]/g, '');
  if (!letters) return false;
  const latin = (letters.match(/[A-Za-z]/g) || []).length;
  if (latin / letters.length < 0.7) return false;
  const lastFold = latinFold(parts[parts.length - 1]);
  const lastLow = parts[parts.length - 1].toLowerCase();
  return SEED_ADJACENT_SURNAMES.has(lastFold) || SEED_ADJACENT_SURNAMES.has(lastLow);
}
