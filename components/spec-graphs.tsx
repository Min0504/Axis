"use client";

import { useMemo, useState } from "react";

export type SpecGraph = {
  key: string;
  better: "higher" | "lower" | "none";
  values: { label: string; raw: string; num: number }[];
};

type Labels = {
  title: string;
  select: string;
};

type Props = {
  graphs: SpecGraph[];
  labels: Labels;
};

function barPct(values: number[], num: number): number {
  const maxAbs = Math.max(...values.map((n) => Math.abs(n)), 1);
  return Math.max(8, Math.round((Math.abs(num) / maxAbs) * 100));
}

function SpecBarChart({ graph }: { graph: SpecGraph }) {
  const nums = graph.values.map((v) => v.num);
  const best =
    graph.better === "lower" ? Math.min(...nums) : Math.max(...nums);

  return (
    <div className="spec-bar-card">
      <div className="spec-graph-label-row">
        <h3 className="spec-graph-label">{graph.key}</h3>
      </div>
      <div
        className="spec-bar-compare"
        role="img"
        aria-label={`${graph.key}: ${graph.values.map((v) => `${v.label} ${v.raw}`).join(", ")}`}
      >
        {graph.values.map((v, i) => {
          const pct = barPct(nums, v.num);
          const isBest = graph.better !== "none" && v.num === best;
          return (
            <div key={`${graph.key}-${i}`} className="spec-bar-col">
              <div className="spec-bar-value">{v.raw}</div>
              <div className="spec-bar-track" aria-hidden>
                <div
                  className={`spec-bar-fill${isBest ? " is-best" : ""}`}
                  style={{ height: `${pct}%` }}
                />
              </div>
              <div className="spec-bar-name" title={v.label}>
                {v.label.length > 18 ? `${v.label.slice(0, 17)}…` : v.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SpecGraphs({ graphs, labels }: Props) {
  const initialKey = useMemo(() => graphs[0]?.key ?? "", [graphs]);
  const [activeKey, setActiveKey] = useState(initialKey);

  if (graphs.length === 0) return null;

  const active = graphs.find((g) => g.key === activeKey) ?? graphs[0];
  const showSelector = graphs.length > 1;

  return (
    <section className="detail-card spec-graph-section" aria-label={labels.title}>
      <div className="spec-header">
        <h2>{labels.title}</h2>
      </div>

      {showSelector && (
        <div className="spec-graph-selector" role="radiogroup" aria-label={labels.select}>
          <span className="spec-graph-selector-label">{labels.select}</span>
          <div className="spec-graph-chips">
            {graphs.map((g) => {
              const on = g.key === active.key;
              return (
                <button
                  key={g.key}
                  type="button"
                  role="radio"
                  className={`spec-graph-chip${on ? " is-on" : ""}`}
                  aria-checked={on}
                  onClick={() => setActiveKey(g.key)}
                >
                  {g.key}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="spec-graph-list">
        <SpecBarChart key={active.key} graph={active} />
      </div>
    </section>
  );
}
