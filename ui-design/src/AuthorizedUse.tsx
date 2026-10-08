import { useProgress } from "./data/useProgress";
import { useEffect, useRef, useState } from "react";
import {
  assessedUseSubject,
  allocateUseMandate,
  recordUseStep,
  type AuthorizedUse as UseState,
  type UseAction,
} from "./data/authorizedUse";
import type { HumanContributionState } from "./data/humanContribution";
export function AuthorizedUse({
  contribution,
  state,
  onChange,
}: {
  contribution: HumanContributionState;
  state?: UseState;
  onChange: (state: UseState) => void;
}) {
  const subject = assessedUseSubject(contribution);
  const [audience, setAudience] = useState("");
  const [rationale, setRationale] = useState("");
  const [action, setAction] = useState<UseAction>("Suitable");
  const [confirm, setConfirm] = useState(false);
  const result = useRef<HTMLHeadingElement>(null);
  const confirmation = useRef<HTMLHeadingElement>(null);
  const { stale, stage } = useProgress(contribution, state);
  const choices: UseAction[] =
    stage === "assessment"
      ? ["Suitable", "Revision needed"]
      : stage === "authorization"
        ? ["Allowed", "Refused"]
        : stage === "execution"
          ? ["Succeeded", "Failed"]
          : stage === "evidence"
            ? ["No reader evidence", "Simulated reader evidence"]
            : stage === "outcome"
              ? state?.readerEvidence?.kind === "Simulated reader evidence"
                ? [
                    "Insufficient evidence",
                    "Criterion not met",
                    "Criterion met in simulation",
                  ]
                : ["Insufficient evidence", "Criterion not met"]
              : [];
  useEffect(() => {
    setConfirm(false);
    setRationale("");
    setAction(
      stage === "authorization"
        ? "Allowed"
        : stage === "execution"
          ? "Succeeded"
          : stage === "evidence"
            ? "No reader evidence"
            : stage === "outcome"
              ? "Insufficient evidence"
              : "Suitable",
    );
  }, [stage, subject]);
  useEffect(() => {
    if (confirm) confirmation.current?.focus();
  }, [confirm]);
  const current = contribution.contributions.at(-1);
  const actionable =
    !!subject && !stale && !["blocked", "refused", "complete"].includes(stage);
  return (
    <section
      className="panel org-stream"
      aria-label="Assessed result to outcome"
    >
      <h2 ref={result} tabIndex={-1}>
        Assessed result → bounded use → outcome
      </h2>
      <p>
        Local simulation · no publishing or messages are sent. Each control acts
        as its named demo actor, independent of selected persona; these controls
        are not authentication. Whole Knowledge workspace checkpoints can recover this chain after explicit restore. Contribution-only checkpoints and main snapshots exclude it.
      </p>
      <p role="status">
        {stale
          ? "Source changed or removed: continuation blocked. Existing records retain their original exact subject."
          : !subject
            ? "Requires draft-02 delivery, exact receipt and Maya reassessment: Suitable for stated scope."
            : `Exact draft-02 assessment available · next stage: ${stage}.`}
      </p>
      <p>
        This bounded use does not establish applicability to an adopted
        workstream agreement. Publication responsibility is allocated for this
        exact exercise only; the authored organization-wide publication gap
        remains unresolved.
      </p>
      {!!subject && (
        <details>
          <summary>Inspect current assessed draft-02</summary>
          <p>human-guide-example · human-delivery-v2 · human-reassessment-v2</p>
          <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
            {current?.delivery?.body}
          </p>
          <p>Scope note: {current?.delivery?.note}</p>
          <p>Editorial rationale: {current?.reassessment?.rationale}</p>
        </details>
      )}
      {state && (
        <>
          <h3>Frozen subject and audience</h3>
          <p>
            human-guide-example · draft-02 · audience: {state.audience} ·
            environment: fictional internal preview only
          </p>
          <details>
            <summary>Inspect original exact source snapshot</summary>
            <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
              {state.subject}
            </pre>
          </details>
          {[
            state.mandate,
            state.publicationAssessment,
            state.authorization,
            state.execution,
            state.readerEvidence,
            state.outcome,
          ]
            .filter(Boolean)
            .map((record) => (
              <article className="org-stream-assignment" key={record!.id}>
                <h3>{record!.id}</h3>
                <p>
                  {record!.actor} · {record!.at} · source: {record!.sourceId}
                </p>
                <p>{record!.rationale}</p>
                <p>
                  {"conclusion" in record!
                    ? String(record.conclusion)
                    : "decision" in record!
                      ? String(record.decision)
                      : "result" in record!
                        ? String(record.result)
                        : "kind" in record!
                          ? String(record.kind)
                          : "Scoped mandate: Sam reviews and authorizes exact draft-02 for this audience; Maya reviews outcome evidence."}
                </p>
              </article>
            ))}
        </>
      )}
      {stage === "blocked" && (
        <p>
          Publication assessment requires revision. No authorization or
          execution was created. This exercise retains the decision; a new
          revision and mandate require a future cycle.
        </p>
      )}
      {stage === "refused" && (
        <p>
          Use refused. Execution remains blocked; no publication or outcome
          success is inferred.
        </p>
      )}
      {stage === "complete" && (
        <p>
          Outcome review recorded. All observations are simulated, not customer
          or reader evidence. No automatic organization-wide success is claimed.
        </p>
      )}
      {actionable && !confirm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setConfirm(true);
          }}
        >
          <h3>
            {stage === "mandate"
              ? "Allocate scoped publication responsibility · demo organization owner"
              : stage === "assessment"
                ? "Publication scope assessment · Sam"
                : stage === "authorization"
                  ? "Separate bounded-use decision · Sam"
                  : stage === "execution"
                    ? "Execution observation · Leo"
                    : stage === "evidence"
                      ? "Reader observation · Leo"
                      : "Outcome evidence review · Maya"}
          </h3>
          {stage === "mandate" && (
            <label>
              Bounded internal preview audience
              <input
                required
                maxLength={500}
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              />
            </label>
          )}
          {!!choices.length && (
            <label>
              Recorded conclusion
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as UseAction)}
              >
                {choices.map((choice) => (
                  <option key={choice}>{choice}</option>
                ))}
              </select>
            </label>
          )}
          {stage === "evidence" && (
            <p>
              Record simulated reader tasks, findings, coverage and limitations
              for this exact draft and audience, or explicitly record missing
              reader evidence. Execution success alone cannot establish
              usefulness.
            </p>
          )}
          {stage === "outcome" && (
            <p>
              Criterion K-01-goal: members can find reliable answers and
              identify next steps. Describe observed reader tasks, findings,
              coverage and limitations. A successful execution is not evidence
              of usefulness; insufficient evidence is a valid conclusion.
            </p>
          )}
          <label>
            {stage === "execution"
              ? "Simulation observation and limitations"
              : stage === "outcome"
                ? "Simulation evidence, rationale and remaining gaps"
                : "Decision rationale and scope limits"}
            <textarea
              required
              maxLength={3000}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
            />
          </label>
          <button
            className="button primary"
            disabled={
              !rationale.trim() || (stage === "mandate" && !audience.trim())
            }
          >
            Prepare {stage} record
          </button>
        </form>
      )}
      {actionable && confirm && (
        <section aria-label="Confirm bounded-use record">
          <h3 ref={confirmation} tabIndex={-1}>
            Confirm {stage} record
          </h3>
          <p>
            Exact draft-02 · {state?.audience ?? audience} · fictional internal
            preview only
          </p>
          <p>
            {stage === "mandate"
              ? "Allocate Sam's bounded publication review/authorization and Maya's outcome review mandate"
              : action}
          </p>
          <p>{rationale}</p>
          <button
            className="button primary"
            onClick={() => {
              const next = state
                ? recordUseStep(
                    state,
                    subject,
                    action,
                    rationale,
                    new Date().toISOString(),
                  )
                : allocateUseMandate(
                    subject,
                    audience,
                    rationale,
                    new Date().toISOString(),
                  );
              if (next) onChange(next);
              setConfirm(false);
              requestAnimationFrame(() => result.current?.focus());
            }}
          >
            Record {stage} locally
          </button>
          <button
            className="button secondary"
            onClick={() => {
              setConfirm(false);
              result.current?.focus();
            }}
          >
            Cancel record
          </button>
        </section>
      )}
    </section>
  );
}
