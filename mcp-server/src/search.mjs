// BM25-lite relevance scoring, ported from the validated spike
// (spike/mcp/server.mjs, read-only). Measured correct against the real site:
// 5/6 realistic questions ranked the right section first, versus 3/6 for raw
// term counting. Zero express/SDK imports — pure functions only, so the
// scoring can be unit-tested without a running server (see design.md).

export const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// Stopwords span EN and ES: natural-language questions arrive in either
// language, and both must be excluded from term weighting the same way.
export const STOP = new Set([
  'the','a','an','of','to','in','on','for','and','or','is','are','do','does','did','how','what',
  'which','when','where','why','can','i','my','it','its','with','from','by','as','that','this',
  'be','you','your','at','not',
  'el','la','los','las','un','una','unos','unas','de','del','y','o','que','en','con','por','para',
  'se','es','son','como','cual','cuales','cuando','donde','porque','hace','hacer','mi','tu','su',
  'lo','al','me','te','si','no','sobre'
]);

// The documented maximum snippet length (spec: "Search Results Are Bounded
// And Fully Described" — a fixed maximum, never exceeded). The returned
// string, including any leading/trailing ellipsis markers, never exceeds
// this bound.
const SNIPPET_WIDTH = 400;

/**
 * Wide enough that a preserved code block survives to the agent instead of
 * being cut mid-command - which would undo the whole point of keeping it.
 * Unlike the original spike, the total returned length (including ellipsis
 * markers) is guaranteed to never exceed `width`.
 */
export function snippet(text, needles, width = SNIPPET_WIDTH) {
  const hay = norm(text);
  let i = -1;
  for (const n of needles) {
    const at = hay.indexOf(n);
    if (at >= 0 && (i < 0 || at < i)) i = at;
  }

  if (i < 0) {
    if (text.length <= width) return text;
    return `${text.slice(0, width - 1).trimEnd()}…`;
  }

  const start = Math.max(0, i - Math.floor(width / 3));
  const leading = start > 0;
  const reserved = (leading ? 1 : 0) + 1; // trailing ellipsis always reserved
  const body = text.slice(start, start + width - reserved).trim();
  return `${leading ? '…' : ''}${body}…`;
}

/**
 * BM25-lite. Two things the naive version got wrong:
 *   - long sections won purely on volume, so tf is length-normalised
 *   - common words counted as much as rare ones, so each term is idf-weighted
 *
 * Pure function: takes the candidate `sections` explicitly instead of
 * closing over module-level state, so callers (and tests) control the pool.
 */
export function search({ sections, query, locale, limit = 5 }) {
  const phrase = norm(query);
  const all = phrase.split(/\s+/).filter(Boolean);
  const kept = all.filter((t) => !STOP.has(t));
  const terms = kept.length ? kept : all;

  const pool = locale ? sections.filter((s) => s.locale === locale) : sections;
  if (!pool.length || !terms.length) return [];

  const haystack = pool.map((s) => {
    const text = norm(s.text);
    const words = text.split(/\s+/).filter(Boolean);
    return { ...s, _t: norm(s.title), _x: text, _len: words.length || 1 };
  });

  const avgLen = haystack.reduce((n, s) => n + s._len, 0) / haystack.length;

  const idf = new Map(
    terms.map((t) => {
      const df = haystack.filter((s) => s._x.includes(t) || s._t.includes(t)).length;
      return [t, Math.log(1 + (haystack.length - df + 0.5) / (df + 0.5))];
    })
  );

  return haystack
    .map((s) => {
      let score = 0;
      let matched = 0;

      for (const t of terms) {
        const w = idf.get(t);
        const hits = s._x.split(t).length - 1;
        if (hits > 0) {
          matched += 1;
          score += w * (hits / (hits + 1.2 * (0.25 + (0.75 * s._len) / avgLen)));
        }
        if (s._t.includes(t)) {
          matched += 1;
          score += w * 3;
        }
      }

      if (!matched) return { s, score: 0 };
      if (s._t === phrase) score += 8;
      else if (s._x.includes(phrase)) score += 2;

      return { s, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ s }) => ({
      id: s.id,
      title: s.title,
      locale: s.locale,
      url: s.url,
      snippet: snippet(s.text, [phrase, ...terms])
    }));
}
