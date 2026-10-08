import { useEffect, useRef, useState } from "react";
import {
  applicabilitySources,
  currentApplicability,
  recordApplicability,
  type ApplicabilityCheck,
  type ApplicabilityContext,
  type ApplicabilitySource,
} from "./data/scopeApplicability";
import type { AgreementAdoption } from "./data/agreementAdoption";
export function ScopeApplicability({
  adoptions,
  checks,
  context,
  onChange,
}: {
  adoptions: AgreementAdoption[];
  checks: ApplicabilityCheck[];
  context: ApplicabilityContext;
  onChange: (checks: ApplicabilityCheck[]) => void;
}) {
  const adoption = adoptions.at(-1),
    sources = applicabilitySources(context);
  const [kind, setKind] = useState<ApplicabilitySource["kind"]>("input");
  const [conclusion, setConclusion] = useState<
    ApplicabilityCheck["conclusion"]
  >("Insufficient information");
  const [rationale, setRationale] = useState("");
  const [confirm, setConfirm] = useState<string>();
  const heading = useRef<HTMLHeadingElement>(null),
    preview = useRef<HTMLHeadingElement>(null);
  const source = sources.find((s) => s.kind === kind);
  const identity = JSON.stringify({ adoption, source });
  useEffect(() => {
    setConfirm(undefined);
  }, [identity, rationale, conclusion]);
  useEffect(() => {
    if (confirm) preview.current?.focus();
  }, [confirm]);
  return (
    <section
      className="panel org-stream"
      aria-label="Exact scope applicability"
    >
      <h2 ref={heading} tabIndex={-1}>
        Record applicability to adopted scope
      </h2>
      <p>
        Local reviewer decisions only; no publication permission or real
        evidence is created. Inspect the exact source and adoption before reuse.
        Missing records cannot be assessed through this form.
      </p>
      <p>
        Current adoption:{" "}
        {adoption
          ? `${adoption.id} · ${adoption.versionId} · ${adoption.audience}`
          : "none · adopt scope before recording applicability"}
      </p>
      {sources.map((s) => (
        <article className="org-stream-assignment" key={s.kind}>
          <h3>
            {s.kind} · {s.id}
          </h3>
          <p>
            Current applicability:{" "}
            {currentApplicability(checks, adoption, s)?.conclusion ?? "Unknown"}
          </p>
          <p>Reviewer: {s.reviewer}</p>
          <details>
            <summary>Inspect exact {s.kind} source</summary>
            <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
              {s.snapshot}
            </pre>
          </details>
        </article>
      ))}
      <p>
        Assignment impact remains a checklist unless an exact input/result
        record is represented. Absent reader evidence stays absent; unrelated
        evidence is not invalidated.
      </p>
      {adoption && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setConfirm(identity);
          }}
        >
          <label>
            Exact source to assess
            <select
              value={kind}
              onChange={(e) =>
                setKind(e.target.value as ApplicabilitySource["kind"])
              }
            >
              {sources.map((s) => (
                <option key={s.kind} value={s.kind}>
                  {s.kind} · {s.id}
                </option>
              ))}
            </select>
          </label>
          <label>
            Applicability conclusion
            <select
              value={conclusion}
              onChange={(e) =>
                setConclusion(
                  e.target.value as ApplicabilityCheck["conclusion"],
                )
              }
            >
              {[
                "Applicable",
                "Needs reassessment",
                "Insufficient information",
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Applicability rationale
            <textarea
              required
              maxLength={3000}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
            />
          </label>
          <button
            className="button secondary"
            disabled={!source || !rationale.trim()}
          >
            Prepare applicability decision
          </button>
        </form>
      )}
      {confirm === identity && source && adoption && (
        <section aria-label="Confirm applicability decision">
          <h3 ref={preview} tabIndex={-1}>
            Confirm exact applicability
          </h3>
          <p>
            {source.reviewer} · {source.id} → {adoption.id} ·{" "}
            {adoption.audience}
          </p>
          <p>
            {conclusion} · {rationale}
          </p>
          <button
            className="button primary"
            onClick={() => {
              onChange(
                recordApplicability(
                  checks,
                  adoption,
                  context,
                  kind,
                  conclusion,
                  rationale,
                  new Date().toISOString(),
                ),
              );
              setConfirm(undefined);
              setRationale("");
              requestAnimationFrame(() => heading.current?.focus());
            }}
          >
            Record applicability locally
          </button>
          <button
            className="button secondary"
            onClick={() => {
              setConfirm(undefined);
              heading.current?.focus();
            }}
          >
            Cancel applicability
          </button>
        </section>
      )}
      {!!checks.length && (
        <details>
          <summary>Applicability history · {checks.length} decisions</summary>
          {checks.map((c) => (
            <article key={c.id}>
              <h3>
                {c.id} · {c.conclusion}
              </h3>
              <p>
                {c.source.id} → {c.adoptionId} · {c.agreementVersion} ·{" "}
                {c.audience}
              </p>
              <p>
                {c.reviewer} · {c.at} · {c.rationale}
              </p>
              <p>
                {c.adoptionId === adoption?.id &&
                c.source.snapshot ===
                  sources.find((s) => s.kind === c.source.kind)?.snapshot
                  ? "Matches current source and adoption; latest matching decision governs."
                  : "Historical scope/source · not reused for current applicability"}
              </p>
              <details>
                <summary>Inspect frozen source</summary>
                <pre
                  style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
                >
                  {c.source.snapshot}
                </pre>
              </details>
            </article>
          ))}
        </details>
      )}
    </section>
  );
}
