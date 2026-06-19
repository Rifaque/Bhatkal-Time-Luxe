const VOWELS = new Set('AEIOU');

function _uniqueConsonants(str) {
  const seen = new Set();
  return str
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .split('')
    .filter((c) => {
      if (VOWELS.has(c)) return false;
      if (seen.has(c)) return false;
      seen.add(c);
      return true;
    });
}

function _singleWordPrimary(word) {
  const letters = word.toUpperCase().replace(/[^A-Z]/g, '');
  if (!letters) return 'XXX';
  const first = letters[0];
  const uc = _uniqueConsonants(letters.slice(1)); // unique consonants after first letter
  if (uc.length >= 2) return (first + uc[0] + uc[uc.length - 1]).slice(0, 3);
  if (uc.length === 1) return (first + uc[0] + letters[letters.length - 1]).slice(0, 3);
  return letters.slice(0, 3).padEnd(3, 'X');
}

function _singleWordAlternative(word) {
  const letters = word.toUpperCase().replace(/[^A-Z]/g, '');
  if (!letters) return 'XXX';
  const first = letters[0];
  const uc = _uniqueConsonants(letters.slice(1));
  if (uc.length >= 2) return (first + uc[0] + uc[1]).slice(0, 3);
  return _singleWordPrimary(word);
}

/**
 * Suggest two reference prefix candidates for a brand name.
 *
 * Strategy:
 *  - Single-word: first letter + first unique consonant + last unique consonant
 *    (Rolex→RLX, Hublot→HBT, Omega→OMG, Tissot→TST, Seiko→SKO)
 *  - Multi-word with different leading letters:
 *    first letter of word 1 + first letter of word 2 + first consonant of word 2
 *    (Audemars Piguet → A+P+G = APG)
 *  - Multi-word same leading letters, or word 2 starts with vowel:
 *    fall back to single-word strategy on first word
 *    (Patek Philippe → both start with P → PATEK→PTK)
 */
export function suggestReferencePrefixes(brandName) {
  const words = brandName.trim().split(/\s+/).filter((w) => /[a-zA-Z]/.test(w));
  if (words.length === 0) return { primary: 'XXX', alternative: 'XXX' };

  const pw = _singleWordPrimary(words[0]);
  const aw = _singleWordAlternative(words[0]);

  if (words.length === 1) {
    return {
      primary: pw,
      alternative: pw === aw ? pw.slice(0, 2) + 'A' : aw,
    };
  }

  // Multi-word
  const l1 = (words[0].replace(/[^a-zA-Z]/g, '')[0] || '').toUpperCase();
  const l2 = (words[1].replace(/[^a-zA-Z]/g, '')[0] || '').toUpperCase();
  const consonantsInWord2 = _uniqueConsonants(words[1].slice(1));

  let multi;
  if (l1 && l2 && l1 !== l2 && !VOWELS.has(l2) && consonantsInWord2.length > 0) {
    // Different, meaningful first letters — interleave
    multi = (l1 + l2 + consonantsInWord2[0]).slice(0, 3);
  } else {
    // Same first letter or less useful second word — use first word's consonant extraction
    multi = pw;
  }

  const alt = multi !== pw ? pw : (pw !== aw ? aw : multi.slice(0, 2) + 'X');

  return {
    primary: multi.toUpperCase(),
    alternative: alt.toUpperCase(),
  };
}

/**
 * Generate the next BTL reference for a brand using its referencePrefix.
 * Scans existing products for the highest sequence number and increments.
 * @param {string} prefix - Brand's referencePrefix field (e.g. 'RLX')
 * @param {import('mongoose').Model} ProductModel
 */
export async function generateReference(prefix, ProductModel) {
  const code = prefix.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
  const regex = new RegExp(`^BTL-${code}-\\d+$`);
  const existing = await ProductModel.find({ reference: regex }, { reference: 1 }).lean();

  let max = 0;
  for (const p of existing) {
    const parts = p.reference?.split('-');
    const num = parseInt(parts?.[2] || '0', 10);
    if (num > max) max = num;
  }

  return `BTL-${code}-${String(max + 1).padStart(3, '0')}`;
}

/**
 * Legacy brand-name → code fallback (used when a brand has no referencePrefix yet).
 * @deprecated Use brand.referencePrefix instead.
 */
export function brandCode(name) {
  return name
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 3)
    .toUpperCase()
    .padEnd(3, 'X');
}
