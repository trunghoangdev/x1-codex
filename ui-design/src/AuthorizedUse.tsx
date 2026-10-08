import { ReviewHandoffs } from "./ReviewHandoffs";
import {
  decisionRole,
  reviewOwner,
  reviewPrincipals,
  roleCandidates,
  type ReviewPrincipal,
} from "./data/reviewHandoffs";
import { AuthorityControls } from "./AuthorityControls";
import { MaterialUseStart } from "./MaterialUseStart";
import { UseContinuation } from "./UseContinuation";
import { applicabilityGuard } from "./data/scopeApplicability";
import type { ApplicabilityScope } from "./data/scopeApplicability";
import { useProgress } from "./data/useProgress";
import { useEffect, useRef, useState } from "react";
import {
  assessedUseSubject,
  useVersion,
  allocateUseMandate,
  recordUseStep,
  type AuthorizedUse as UseState,
  type UseAction,
} from "./data/authorizedUse";
import type { HumanContributionState } from "./data/humanContribution";
export function AuthorizedUse({
  scope,
  onScope,
  contribution,
  state,
  onChange,
}: {
  scope?: ApplicabilityScope;
  onScope?: () => void;
  contribution: HumanContributionState;
  state?: UseState;
  onChange: (state: UseState) => void;
}) {
  const [principal, setPrincipal] = useState<ReviewPrincipal>("sam");
  const subject = assessedUseSubject(contribution);
  const [audience, setAudience] = useState("");
  const [rationale, setRationale] = useState("");
  const [action, setAction] = useState<UseAction>("Suitable");
  const [reviewed, setReviewed] = useState<string>();
  const result = useRef<HTMLHeadingElement>(null);
  const confirmation = useRef<HTMLHeadingElement>(null);
  const { stale, stage, scopeBlocked } = useProgress(
    contribution,
    state,
    scope,
  );
  const role = decisionRole(action);
  const acting =
    role === "outcomeReview" && principal === "sam" ? "maya" : principal;
  const wrongPrincipal =
    !!state && !!role && acting !== reviewOwner(state, role);
  const identity = JSON.stringify({
    state,
    subject,
    scope,
    stage,
    audience,
    rationale,
    action,
    acting,
  });
  const confirm = reviewed === identity;
  const setConfirm = (value: boolean) =>
    setReviewed(value ? identity : undefined);
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
  }, [stage, subject, scopeBlocked]);
  useEffect(() => {
    if (confirm) confirmation.current?.focus();
  }, [confirm]);
  const current = contribution.contributions.at(-1);
  const currentVersion = current?.version ?? 2,
    retainedVersion = useVersion(state?.subject) ?? currentVersion;
  const actionable =
    !!subject &&
    !stale &&
    !scopeBlocked &&
    !["blocked", "refused", "complete", "authorityStopped"].includes(stage);
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
        are not authentication. Whole Knowledge workspace checkpoints can
        recover this chain after explicit restore. Contribution-only checkpoints
        and main snapshots exclude it.
      </p>
      {scopeBlocked && !stale && (
        <p role="alert">
          {scopeBlocked}{" "}
          <button className="text-link" onClick={onScope}>
            Inspect exact scope applicability
          </button>
        </p>
      )}
      <p role="status">
        {stale
          ? "Source changed or removed: continuation blocked. Existing records retain their original exact subject."
          : scopeBlocked
            ? "Scope applicability pending; authorization/execution controls are blocked."
            : !subject
              ? "Requires exact delivery, receipt and a suitable Maya reassessment for the current draft, with no pending revision request."
              : `Exact draft-0${currentVersion} assessment available · next stage: ${stage}.`}
      </p>
      <p>
        Applicability to adopted scope requires separate exact-record decisions.
        Publication responsibility is allocated for this exact exercise only;
        the authored organization-wide publication gap remains unresolved.
      </p>
      {!!subject && (
        <details>
          <summary>Inspect current assessed draft-0{currentVersion}</summary>
          <p>
            human-guide-example · {current?.delivery?.id} ·{" "}
            {current?.reassessment?.id}
          </p>
          <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
            {current?.delivery?.body}
          </p>
          <p>Scope note: {current?.delivery?.note}</p>
          <p>Editorial rationale: {current?.reassessment?.rationale}</p>
        </details>
      )}
      {state && (
        <MaterialUseStart
          contribution={contribution}
          state={state}
          onChange={onChange}
        />
      )}
      {state?.previousMaterials?.map((prior) => (
        <details key={prior.mandate.id}>
          <summary>
            Earlier material · draft-0{useVersion(prior.subject)} · preserved
            use records
          </summary>
          <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
            {JSON.stringify(prior, null, 2)}
          </pre>
        </details>
      ))}
      {state?.previousCycle && (
        <details>
          <summary>Original cycle 1 · preserved records</summary>
          <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
            {JSON.stringify(state.previousCycle, null, 2)}
          </pre>
        </details>
      )}
      {state && (
        <UseContinuation
          state={state}
          contribution={contribution}
          onChange={onChange}
        />
      )}
      {stage === "blocked" && (
        <p>
          Publication assessment requires revision. No authorization or
          execution was created. This exercise retains the decision; a new use
          cycle requires its own scoped mandate. Content revisions are prepared
          in Leo’s contribution workspace; use of changed material requires a
          new mandate after a fresh delivery, receipt and suitable assessment.
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
      {state && (
        <ReviewHandoffs state={state} subject={subject} onChange={onChange} />
      )}
      {state && (
        <AuthorityControls
          state={state}
          onChange={onChange}
          canResume={
            !stale && !applicabilityGuard({ contribution, use: state }, scope)
          }
        />
      )}
      {actionable && !confirm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setConfirm(true);
          }}
        >
          {state?.reviewHandoffs && role && (
            <label>
              Acting decision principal
              <select
                aria-label="Acting decision principal"
                value={acting}
                onChange={(e) =>
                  setPrincipal(e.target.value as ReviewPrincipal)
                }
              >
                {roleCandidates[role].map((p) => (
                  <option key={p} value={p}>
                    {reviewPrincipals[p]}
                  </option>
                ))}
              </select>
              <span>
                Current responsible person:{" "}
                {reviewPrincipals[reviewOwner(state, role)]}. Former holders
                cannot record this decision.
              </span>
            </label>
          )}
          <h3>
            {stage === "mandate"
              ? "Allocate scoped publication responsibility · demo organization owner"
              : stage === "assessment"
                ? `Publication scope assessment · ${state ? reviewPrincipals[reviewOwner(state, "publicationReview")] : "Sam"}`
                : stage === "authorization"
                  ? `Separate bounded-use decision · ${state ? reviewPrincipals[reviewOwner(state, "authorization")] : "Sam"}`
                  : stage === "execution"
                    ? "Execution observation · Leo"
                    : stage === "evidence"
                      ? "Reader observation · Leo"
                      : `Outcome evidence review · ${state ? reviewPrincipals[reviewOwner(state, "outcomeReview")] : "Maya"}`}
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
              wrongPrincipal ||
              !rationale.trim() ||
              (stage === "mandate" && !audience.trim())
            }
          >
            Prepare {stage} record
          </button>
        </form>
      )}
      {actionable && confirm && !wrongPrincipal && (
        <section aria-label="Confirm bounded-use record">
          <h3 ref={confirmation} tabIndex={-1}>
            Confirm {stage} record
          </h3>
          <p>
            Exact draft-0{currentVersion} · {state?.audience ?? audience} ·
            fictional internal preview only
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
                    role ? acting : "leo",
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
      {state && (
        <details className="use-record-history">
          <summary>Current cycle · evidence and decision history</summary>
          <h3>Cycle {state.cycle ?? 1} · frozen subject and audience</h3>
          <p>
            human-guide-example · draft-0{retainedVersion} · audience:{" "}
            {state.audience} · environment: fictional internal preview only
          </p>
          <details>
            <summary>Inspect original exact source snapshot</summary>
            <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
              {state.subject}
            </pre>
          </details>
          {[
            state.continuation,
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
                          : `Scoped mandate: Sam reviews and authorizes exact draft-0${retainedVersion} for this audience; Maya reviews outcome evidence.`}
                </p>
              </article>
            ))}
        </details>
      )}
    </section>
  );
}
