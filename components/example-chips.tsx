"use client";

/**
 * Homepage example comparisons, turned into one-tap starting points.
 * Clicking a chip prefills the VS input (via a window CustomEvent that
 * VsInput listens for) and scrolls the user straight into the core action —
 * killing the "what do I even type?" cold start.
 */

export const PREFILL_EVENT = "optio:prefill";

export type PrefillDetail = { options: string[] };

export type HomeExample = { category: string; query: string; note: string };

function toOptions(query: string): string[] {
  return query
    .split(/\s*\bvs\b\s*|\s+대\s+/i)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function ExampleChips({
  examples,
  cta
}: {
  examples: readonly HomeExample[];
  cta: string;
}) {
  function prefill(query: string) {
    const options = toOptions(query);
    if (options.length < 2) return;
    window.dispatchEvent(new CustomEvent<PrefillDetail>(PREFILL_EVENT, { detail: { options } }));
  }

  return (
    <div className="example-grid">
      {examples.map((item) => (
        <button
          type="button"
          className="example-card"
          key={item.query}
          onClick={() => prefill(item.query)}
        >
          <span className="example-cat">{item.category}</span>
          <span className="example-query">{item.query}</span>
          <span className="example-note">{item.note}</span>
          <span className="example-go" aria-hidden>
            {cta}
          </span>
        </button>
      ))}
    </div>
  );
}
