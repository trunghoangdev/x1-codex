import { useEffect, useRef, useState } from "react";
import {
  assessedUseSubject,
  continueUse,
  continuationSource,
  type AuthorizedUse,
} from "./data/authorizedUse";
import type { HumanContributionState } from "./data/humanContribution";
export function UseContinuation({
  state,
  contribution,
  onChange,
}: {
  state: AuthorizedUse;
  contribution: HumanContributionState;
  onChange: (s: AuthorizedUse) => void;
}) {
  const source = continuationSource(state),
    subject = assessedUseSubject(contribution);
  const [audience, setAudience] = useState(state.audience),
    [rationale, setRationale] = useState(""),
    [confirm, setConfirm] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null),
    preview = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    setConfirm(false);
  }, [state, subject]);
  useEffect(() => {
    if (confirm) preview.current?.focus();
  }, [confirm]);
  if (state.cycle === 2)
    return (
      <p>
        Cycle 2 is the final supported cycle in this exercise. Original cycle
        remains in history. Further use cycles and use of changed content are
        not implemented; content revisions are available in Leo’s contribution
        workspace.
      </p>
    );
  if (!source)
    return (
      <p>
        Continuation requires a publication revision/refusal, or a non-positive
        outcome review. Failed execution must receive its own outcome review
        first. No follow-up cycle is created automatically.
      </p>
    );
  return (
    <section className="panel" aria-label="Use cycle continuation">
      <h3 ref={heading} tabIndex={-1}>
        Plan next bounded-use cycle · demo organization owner
      </h3>
      <p>
        Follow-up source: {source.id}. Creates cycle 2 for the same exact
        assessed material. Revise publication conditions/audience or attempt
        conditions in the rationale; material edits require a separately
        assessed future draft and are outside this exercise.
      </p>
      <p>
        New mandate, publication assessment and authorization are required.
        Execution and reader evidence are not copied. Prior records remain
        unchanged; no real dispatch occurs.
      </p>
      {subject !== state.subject ? (
        <p role="alert">
          Exact assessed source changed. Restore the original source to
          continue; a new guide cannot inherit this cycle.
        </p>
      ) : (
        <>
          {!confirm && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setConfirm(true);
              }}
            >
              <label>
                Cycle 2 bounded audience
                <input
                  required
                  maxLength={500}
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                />
              </label>
              <label>
                Continuation rationale and changed conditions
                <textarea
                  required
                  maxLength={3000}
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                />
              </label>
              <button
                className="button secondary"
                disabled={!audience.trim() || !rationale.trim()}
              >
                Prepare cycle 2 mandate
              </button>
            </form>
          )}
          {confirm && (
            <section aria-label="Confirm next use cycle">
              <h4 ref={preview} tabIndex={-1}>
                Confirm cycle 2 · new scoped mandate
              </h4>
              <p>
                {audience} · {rationale}
              </p>
              <p>
                Links to {source.id}. Earlier authorization will not authorize
                this new attempt.
              </p>
              <button
                className="button primary"
                onClick={() => {
                  onChange(
                    continueUse(
                      state,
                      subject,
                      audience,
                      rationale,
                      new Date().toISOString(),
                    ),
                  );
                  setConfirm(false);
                  requestAnimationFrame(() =>
                    document
                      .querySelector<HTMLElement>(
                        'section[aria-label="Assessed result to outcome"] h2',
                      )
                      ?.focus(),
                  );
                }}
              >
                Record cycle 2 mandate
              </button>
              <button
                className="button secondary"
                onClick={() => {
                  setConfirm(false);
                  heading.current?.focus();
                }}
              >
                Cancel next cycle
              </button>
            </section>
          )}
        </>
      )}
    </section>
  );
}
