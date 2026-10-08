import { useState } from "react";
import type { KnowledgeWorkspace } from "./data/knowledgeCheckpoint";
import { changeImpact, type ImpactStatus } from "./data/changeImpact";
export function ChangeImpactSummary({
  state,
  onOpen,
}: {
  state: KnowledgeWorkspace;
  onOpen: () => void;
}) {
  const rows = changeImpact(state),
    affected = rows.filter((r) => r.status !== "Current");
  return (
    <section className="panel" aria-label="Change impact summary">
      <h2>Source and scope impact</h2>
      <p>
        {affected.length
          ? `${affected.length} represented records need inspection: ${rows.filter((r) => r.status === "Blocked").length} blocked, ${rows.filter((r) => r.status === "Review needed").length} needing review, ${rows.filter((r) => r.status === "Historical").length} historical.`
          : "No source or scope concerns detected in the represented records."}
      </p>
      <p>
        Local Knowledge records only; this is not an organization health score
        or verification of missing work.
      </p>
      <button className="text-link" onClick={onOpen}>
        Inspect source and scope impact
      </button>
    </section>
  );
}
export function ChangeImpact({
  state,
  onSource,
}: {
  state: KnowledgeWorkspace;
  onSource: (path: string) => void;
}) {
  const [filter, setFilter] = useState<"all" | ImpactStatus>("all");
  const rows = changeImpact(state),
    visible = rows.filter((r) => filter === "all" || r.status === filter);
  return (
    <section aria-label="Source and scope impact report">
      <p>
        Inspect how retained decisions relate to the current exact source and
        adopted scope. Blocked means an existing source gate prevents
        continuation; Review needed may mean missing evidence without a change;
        Historical preserves an already executed or closed cycle. Current means
        no detected source concern, not work completion.
      </p>
      <p>
        Derived from the current local workspace, including restored records.
        This report changes no source, assignment, approval or authority. Fix an
        upstream input first, then inspect downstream rows again; no review or
        outcome transfers automatically.
      </p>
      <label>
        Impact status
        <select
          aria-label="Impact status"
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
        >
          {["all", "Blocked", "Review needed", "Historical", "Current"].map(
            (s) => (
              <option key={s} value={s}>
                {s === "all" ? "All represented records" : s}
              </option>
            ),
          )}
        </select>
      </label>
      <p role="status">
        {visible.length} of {rows.length} represented impact records
      </p>
      {!visible.length && (
        <p>
          {!rows.length
            ? "No local use, adopted-scope, guide handoff, brief, case or workshop records to assess. Missing records are not treated as healthy or complete."
            : "No records match this status. Other represented records remain available under All represented records."}
        </p>
      )}
      {visible.map((r) => (
        <article key={r.id} className="panel" aria-label={r.title}>
          <h2>{r.title}</h2>
          <p>
            {r.stream} · {r.status}
          </p>
          <p>{r.reason}</p>
          <p>
            <strong>Responsible:</strong> {r.owner}
          </p>
          <p>
            <strong>Next step:</strong> {r.next}
          </p>
          <button
            className="button secondary"
            onClick={() => onSource(r.destination)}
          >
            Inspect affected record · {r.title}
          </button>
          <details>
            <summary>Retained and current source context</summary>
            <h3>Retained record</h3>
            <pre>{JSON.stringify(r.retained, null, 2)}</pre>
            <h3>Current source and gate</h3>
            <pre>{JSON.stringify(r.current, null, 2)}</pre>
          </details>
        </article>
      ))}
    </section>
  );
}
