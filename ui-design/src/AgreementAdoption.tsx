import { useEffect, useRef, useState } from "react";
import {
  adoptAgreement,
  agreementImpact,
  type AgreementAdoption as Adoption,
} from "./data/agreementAdoption";
export function AgreementAdoption({
  history,
  versionId,
  persona,
  onChange,
  onSource,
}: {
  history: Adoption[];
  versionId: string;
  persona?: string;
  onChange: (h: Adoption[]) => void;
  onSource: (path: string) => void;
}) {
  const current = history.at(-1);
  const [audience, setAudience] = useState("");
  const [rationale, setRationale] = useState("");
  const [confirm, setConfirm] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const confirmation = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    setConfirm(false);
    setAudience("");
    setRationale("");
  }, [versionId]);
  useEffect(() => {
    if (confirm) confirmation.current?.focus();
  }, [confirm]);
  return (
    <section className="panel org-stream" aria-label="Local agreement adoption">
      <h2 ref={heading} tabIndex={-1}>
        Adopted workstream scope
      </h2>
      <p>
        Local session simulation · Leo acts as the demo workstream coordinator.
        This is not publication authority or a production authority check.
        Reload clears adoption; existing checkpoints do not save it.
      </p>
      <p role="status">
        {current
          ? `Adopted locally: ${current.versionId} · ${current.id}. Selected ${versionId} ${current.versionId === versionId ? "is the adopted version." : "is a separate proposal; it has not replaced adopted scope."}`
          : "No agreement adopted locally. Both authored versions remain proposals."}
      </p>
      {current && (
        <>
          <p>Audience boundary: {current.audience}</p>
          <p>
            {current.adopter} · {current.at}
          </p>
          <p>Rationale: {current.rationale}</p>
        </>
      )}
      {persona === "leo" && current?.versionId !== versionId && !confirm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setConfirm(true);
          }}
        >
          <label>
            Named cohort or internal team list
            <input
              required
              maxLength={500}
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            />
          </label>
          <label>
            Adoption rationale
            <textarea
              required
              maxLength={3000}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
            />
          </label>
          <button
            className="button primary"
            disabled={!audience.trim() || !rationale.trim()}
          >
            Prepare adoption of {versionId}
          </button>
        </form>
      )}
      {persona !== "leo" && (
        <p>Inspect as Leo to record a separate local adoption decision.</p>
      )}
      {confirm && persona === "leo" && (
        <section aria-label="Confirm agreement adoption">
          <h3 ref={confirmation} tabIndex={-1}>
            Confirm local adoption · {versionId}
          </h3>
          <p>{audience}</p>
          <p>{rationale}</p>
          <p>
            {current
              ? `Supersedes ${current.id}; prior records remain unchanged.`
              : "Creates the first adopted scope record."}{" "}
            This records workstream scope only; prerequisites and record
            applicability remain unverified.
          </p>
          <button
            className="button primary"
            onClick={() => {
              onChange(
                adoptAgreement(
                  history,
                  versionId,
                  audience,
                  rationale,
                  new Date().toISOString(),
                ),
              );
              setConfirm(false);
              requestAnimationFrame(() => heading.current?.focus());
            }}
          >
            Record local adoption
          </button>
          <button
            className="button secondary"
            onClick={() => {
              setConfirm(false);
              heading.current?.focus();
            }}
          >
            Cancel adoption
          </button>
        </section>
      )}
      <h3>Scope impact · inspect before reuse</h3>
      <p>
        {current && current.versionId !== versionId
          ? `Candidate change: ${current.versionId} → ${versionId}.`
          : `Check applicability against ${current?.versionId ?? versionId}.`}{" "}
        These are authored checks, not automatic invalidations or confirmed
        mappings. Changing audience details also requires these checks.
      </p>
      {agreementImpact.map((row) => (
        <article className="org-stream-assignment" key={row.id}>
          <h4>
            {row.title} · {row.id}
          </h4>
          <p>{row.effect}</p>
          <p>
            Applicability: unknown · responsible worker must inspect the exact
            record.
          </p>
          <button className="text-link" onClick={() => onSource(row.path)}>
            Inspect impact source · {row.id}
          </button>
        </article>
      ))}
      {!!history.length && (
        <details>
          <summary>Adoption history · {history.length} records</summary>
          {history.map((record) => (
            <article key={record.id}>
              <h3>
                {record.id} · {record.versionId}
              </h3>
              <p>
                {record.audience} · {record.at}
              </p>
              <p>{record.rationale}</p>
              <p>
                {record.adopter} ·{" "}
                {record.supersedes
                  ? `Supersedes ${record.supersedes}`
                  : "Initial adoption"}
              </p>
            </article>
          ))}
        </details>
      )}
    </section>
  );
}
