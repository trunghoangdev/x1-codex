import { useEffect, useState } from "react";
import {
  decodeExampleBytes,
  parseSfSnapshot,
  type SfSnapshot,
} from "./data/sfSnapshot";

function Fields({ record }: { record: Record<string, unknown> }) {
  return (
    <dl className="sf-snapshot-fields">
      {Object.entries(record).map(([key, value]) => (
        <div key={key}>
          <dt>{key}</dt>
          <dd>{Array.isArray(value) ? value.join(", ") : String(value)}</dd>
        </div>
      ))}
    </dl>
  );
}
export function SfSnapshotInspection({
  selected,
  onSelect,
  onBack,
}: {
  selected: string;
  onSelect: (id: string) => void;
  onBack: () => void;
}) {
  const [data, setData] = useState<SfSnapshot>();
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setData(undefined);
    setError(false);
    fetch("./snapshots/sf-example-v1.json", {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Snapshot unavailable");
        const value = parseSfSnapshot(await response.json());
        if (!controller.signal.aborted) setData(value);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, [retry]);
  const attempt = data?.attempts.find((a) => a.attempt_id === selected);
  const product = attempt?.artifact_digest
    ? data?.work_products.find(
        (p) => p.artifact_digest === attempt.artifact_digest,
      )
    : undefined;
  return (
    <>
      <button className="button secondary" onClick={onBack}>
        Back to Demos
      </button>
      <div className="page-heading">
        <div>
          <div className="eyebrow">READ-ONLY · SYNTHETIC SNAPSHOT</div>
          <h1 tabIndex={-1}>Software Factory inspection</h1>
          <p>
            One assignment, retained attempts and exact work-product references.
            This is a schema-shaped example, not live SF data.
          </p>
        </div>
      </div>
      {error ? (
        <section className="panel org-stream" role="alert">
          <h2>Snapshot unavailable</h2>
          <p>
            The projection could not load or validate. Assignment outcome is
            unknown; this is not an execution failure.
          </p>
          <button
            className="button secondary"
            onClick={() => setRetry((v) => v + 1)}
          >
            Retry snapshot load
          </button>
        </section>
      ) : !data ? (
        <p role="status">Loading inspection snapshot…</p>
      ) : (
        <>
          <section className="panel org-stream">
            <h2>Source and freshness</h2>
            <Fields record={data.source} />
            <p>
              Fixed example revision; current runtime state is unknown. No
              production records, diagnostic streams or credentials were copied.
            </p>
            <a href={"./snapshots/sf-example-v1.json"}>Inspect snapshot JSON</a>
          </section>
          <section className="panel org-stream">
            <h2>Assignment · {String(data.assignment.id)}</h2>
            <Fields record={data.assignment} />
            <p>
              Worker, actor, effective permission and execution node: unknown.
              No binding is inferred from the assignment.
            </p>
          </section>
          <section className="panel org-stream">
            <h2>Retained attempts</h2>
            <div className="sf-snapshot-links">
              {data.attempts.map((a) => (
                <button
                  className="button secondary"
                  key={String(a.attempt_id)}
                  aria-pressed={selected === a.attempt_id}
                  onClick={() => onSelect(String(a.attempt_id))}
                >
                  {String(a.attempt_id)} · {String(a.outcome)}
                </button>
              ))}
            </div>
            {attempt ? (
              <>
                <h3>Attempt · {selected}</h3>
                <Fields record={attempt} />
                <p>
                  Process exit:{" "}
                  {attempt.exit_code === undefined
                    ? "not recorded; never assumed zero"
                    : String(attempt.exit_code)}
                  . Diagnostics are not included.
                </p>
              </>
            ) : (
              <p>Select a retained attempt to inspect its own record.</p>
            )}
          </section>
          {attempt && (
            <section className="panel org-stream">
              <h2>Work product</h2>
              {product ? (
                <>
                  <Fields
                    record={Object.fromEntries(
                      Object.entries(product).filter(
                        ([key]) => key !== "bytes_base64url",
                      ),
                    )}
                  />
                  <h3>Example contribution · plain text</h3>
                  <pre className="sf-snapshot-bytes">
                    {decodeExampleBytes(String(product.bytes_base64url))}
                  </pre>
                  <details>
                    <summary>Inspect encoded example bytes</summary>
                    <pre className="sf-snapshot-bytes">
                      {String(product.bytes_base64url)}
                    </pre>
                  </details>
                  <p>
                    Linked by the exact artifact_digest reported in this
                    attempt. Identities are synthetic. This viewer performs
                    relationship validation, not cryptographic artifact
                    verification.
                  </p>
                </>
              ) : (
                <p>
                  {attempt.artifact_digest
                    ? "Work-product response unavailable for this artifact."
                    : "No artifact reference was reported by this attempt. No work product is inferred."}
                </p>
              )}
            </section>
          )}
          <section className="panel org-stream">
            <h2>Evidence and authority boundary</h2>
            <p>
              Verifier report, artifact origin/inputs/supersession, assessment,
              approval and external effect: unavailable in this snapshot.
              Produced work is not accepted work or an established effect.
            </p>
            <p>
              Source shapes: SF assignment fields and AttemptRecord schema v2;
              Forge work-product response, forge.typed-payload v1. The
              inspection envelope is prototype-owned, not a versioned
              application API.
            </p>
          </section>
        </>
      )}
    </>
  );
}
