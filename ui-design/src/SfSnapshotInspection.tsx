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
  retained = false,
  onSelect,
  onBack,
}: {
  selected: string;
  retained?: boolean;
  onSelect: (id: string) => void;
  onBack: () => void;
}) {
  const snapshotUrl = retained
    ? "./snapshots/sf-retained-v1.json"
    : "./snapshots/sf-example-v1.json";
  const [data, setData] = useState<SfSnapshot>();
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setData(undefined);
    setError(false);
    fetch(snapshotUrl, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Snapshot unavailable");
        const value = parseSfSnapshot(await response.json());
        if (value.source.kind !== (retained ? "retained-redacted" : "synthetic"))
          throw new Error("Snapshot source does not match this inspection.");
        if (!controller.signal.aborted) setData(value);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, [retry, snapshotUrl]);
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
          <div className="eyebrow">
            {retained
              ? "READ-ONLY · REAL RETAINED METADATA · REDACTED"
              : "READ-ONLY · SYNTHETIC SNAPSHOT"}
          </div>
          <h1 tabIndex={-1}>Software Factory inspection</h1>
          <p>
            One assignment, retained attempts and exact work-product references.
            {retained
              ? "Historical SF records exported read-only with explicit omissions; not live data."
              : "This is a schema-shaped example, not live SF data."}
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
              {retained
                ? "Original record identities and recorded states are preserved. Snapshot observation time is the export time, not the execution time. Current runtime state is unknown."
                : "Fixed example revision; current runtime state is unknown. No production records, diagnostic streams or credentials were copied."}
            </p>
            <a href={snapshotUrl}>Inspect snapshot JSON</a>
          </section>
          {data.redactions && (
            <section className="panel org-stream">
              <h2>Omitted source material</h2>
              <Fields record={data.redactions} />
              <p>
                Omitted fields are redacted, not absent from the original
                records. No host paths, raw diagnostics, objective text or
                payload bytes are included. This is a partial inspection export,
                not a replayable SF assignment.
              </p>
            </section>
          )}
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
                  {product.bytes_base64url !== undefined ? (
                    <>
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
                    </>
                  ) : (
                    <p>
                      Payload bytes and referenced file bodies are omitted from
                      this export. Original digests are retained; no replacement
                      content is supplied.
                    </p>
                  )}
                  <p>
                    Linked by the exact artifact_digest reported in this
                    attempt.{" "}
                    {retained
                      ? "Identities are copied from the retained source records. They are not regenerated after redaction."
                      : "Identities are synthetic."}{" "}
                    This viewer performs relationship validation, not
                    cryptographic artifact verification.
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
          {data.integrity_checks && (
            <section className="panel org-stream">
              <h2>Export integrity observations</h2>
              <Fields record={data.integrity_checks} />
              <p>
                The export script checked blob bytes and the rebuilt
                typed-payload body on the source host before omitting bytes.
                These are exporter observations, not a verifier report; the
                browser cannot independently repeat the blob check from this
                partial export.
              </p>
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
