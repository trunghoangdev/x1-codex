import { sfAccountability } from "./data/sfAccountability";
import type { SfReadProjection } from "./data/sfReadProjection";
export function SfAccountability({
  projection,
  attemptId,
  onSource,
}: {
  projection: SfReadProjection;
  attemptId: string;
  onSource: (source: string) => void;
}) {
  const trace = sfAccountability(projection, attemptId);
  return (
    <>
      <section
        className="panel org-stream"
        aria-label="Installed organization context"
      >
        <h2>Organization context</h2>
        <p>
          Dataset:{" "}
          {projection.sourceKind === "retained-redacted"
            ? "Software Factory · real retained metadata"
            : "Software Factory · synthetic example"}
          . This dataset is separate from the sample organization and demo
          persona shown in the workspace navigation.
        </p>
        <dl className="sf-snapshot-fields">
          <div>
            <dt>Installed organization identity/version</dt>
            <dd>Unknown — not supplied by this snapshot</dd>
          </div>
          <div>
            <dt>Role/worker binding</dt>
            <dd>Unknown — no allocation record supplied</dd>
          </div>
          <div>
            <dt>Policy and effective authority</dt>
            <dd>Unknown — no policy version or permission decision supplied</dd>
          </div>
          <div>
            <dt>Node and execution placement</dt>
            <dd>Unknown — no placement record supplied</dd>
          </div>
          <div>
            <dt>Data freshness</dt>
            <dd>
              Historical capture · {projection.capturedAt}. Current runtime
              state is unknown.
            </dd>
          </div>
        </dl>
        <p>
          The assignment’s publication criterion is a named requirement, not
          proof that a publication decision was made. Neither the sample persona
          nor the dataset label identifies a real responsible actor.
        </p>
      </section>
      <section className="panel org-stream" aria-label="Accountability trace">
        <h2>Accountability trace</h2>
        <p>
          Source-linked inspection with explicit gaps, not a workflow or
          verified audit chain.
        </p>
        {!trace.selected && (
          <p>
            Select a retained attempt below to inspect its exact artifact
            relationships. Missing assessments/decisions/effects will remain
            visible.
          </p>
        )}
        <div className="sf-trace-list">
          {trace.entries.map((entry) => (
            <article key={entry.label}>
              <h3>
                {entry.label} <span className="badge">{entry.status}</span>
              </h3>
              {entry.reference && (
                <p className="sf-snapshot-bytes">{entry.reference}</p>
              )}
              <p>{entry.detail}</p>
              {entry.source && (
                <button
                  className="button secondary"
                  onClick={() => onSource(entry.source!)}
                >
                  Inspect source · {entry.label}
                </button>
              )}
            </article>
          ))}
        </div>
        <p>
          No missing link is supplied from local demo receipts, command
          simulations or the production ledger narrative.
        </p>
      </section>
    </>
  );
}
