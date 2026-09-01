// Pure HTML → sections extraction, ported from the validated spike
// (spike/mcp/build-index.mjs, read-only) with hard-fail structure guards added.
// Reads dist/ HTML that this repository's own .astro components generate — it
// is not third-party or user-authored, so the unpredictability an HTML parser
// guards against does not exist here (see design.md).

const ENTITIES = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
  '&nbsp;': ' ', '&hellip;': '…', '&mdash;': '—', '&ndash;': '–',
  '&ldquo;': '“', '&rdquo;': '”', '&lsquo;': '‘', '&rsquo;': '’'
};

function decode(s) {
  return s
    .replace(/&[a-z]+;|&#\d+;/gi, (m) => ENTITIES[m] ?? m)
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
}

// Line breaks inside a code block are meaning, not formatting: collapsing them
// forces the agent to guess where one command ends and the next begins. So the
// blocks are lifted out, the prose around them is collapsed, and they go back in.
// This slot token is collision-proof against ordinary prose because bare digits
// (used as a naive placeholder) would collide with real numbers already present
// in the text being processed.
const SLOT = (n) => `zqPREzq${n}zqENDzq`;

export function toText(html) {
  const blocks = [];

  let work = html
    // mermaid blocks are diagram source, not prose - same rule site.js uses
    .replace(/<pre[^>]*class="[^"]*mermaid[^"]*"[\s\S]*?<\/pre>/gi, ' ')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ');

  work = work.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, inner) => {
    blocks.push(
      decode(inner.replace(/<[^>]+>/g, ''))
        .replace(/[ \t]+$/gm, '')
        .replace(/^\n+|\n+$/g, '')
    );
    return ` ${SLOT(blocks.length - 1)} `;
  });

  // A bare anchor label drops the destination the docs are pointing at.
  work = work.replace(
    /<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi,
    (_, href, label) => `${label.replace(/<[^>]+>/g, '').trim()} (${href})`
  );

  const prose = decode(
    work.replace(/<\/(p|li|h[1-6]|tr|blockquote)>/gi, '\n').replace(/<[^>]+>/g, ' ')
  )
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();

  return prose
    .replace(/zqPREzq(\d+)zqENDzq/g, (_, i) => `\n${blocks[Number(i)]}\n`)
    .replace(/\n{2,}/g, '\n')
    .trim();
}

export function baseUrlOf(html) {
  const m = html.match(/<link rel="canonical" href="([^"]+)"/);
  if (!m) throw new Error('no canonical link found - cannot derive base URL');
  return new URL(m[1]).origin;
}

/**
 * Extracts one section per <h2>/<h3 id="..."> heading found inside <main>.
 * Hard-fails (throws) instead of returning a silently empty or partial result:
 * missing <main>, zero headings, or empty extracted text on a section that
 * isn't a container heading (see the empty-text guard below).
 */
export function extractSections(html, { locale, path, base }) {
  const main = html.match(/<main\b[^>]*>([\s\S]*)<\/main>/)?.[1];
  if (!main) throw new Error(`no <main> found (locale "${locale}")`);

  const headings = [...main.matchAll(/<h([23])\s+id="([^"]+)"\s*>([\s\S]*?)<\/h\1>/g)];
  if (!headings.length) throw new Error(`no headings found (locale "${locale}")`);

  return headings.map((h, i) => {
    const bodyStart = h.index + h[0].length;
    const bodyEnd = i + 1 < headings.length ? headings[i + 1].index : main.length;
    const body = main.slice(bodyStart, bodyEnd);
    const text = toText(body);

    // A container heading (immediately followed by a strictly deeper heading,
    // e.g. an <h2> right before an <h3>) legitimately owns no prose of its
    // own - its subheadings carry the real content. Empty text anywhere else
    // (same-or-shallower next heading, or the last heading in the document)
    // still signals a genuine extraction failure.
    const nextLevel = i + 1 < headings.length ? Number(headings[i + 1][1]) : null;
    const isContainerHeading = nextLevel !== null && nextLevel > Number(h[1]);

    if (!text && !isContainerHeading) {
      throw new Error(`section "${h[2]}" (locale "${locale}") extracted to empty text`);
    }

    return {
      id: h[2],
      locale,
      level: Number(h[1]),
      title: toText(h[3]),
      url: `${base}${path}#${h[2]}`,
      text
    };
  });
}
