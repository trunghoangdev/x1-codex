import { openGoalTask } from "./data/goalLoop";
import { useEffect, useRef, useState } from "react";
import {
  assessedUseSubject,
  startMaterialUse,
  useVersion,
  type AuthorizedUse,
} from "./data/authorizedUse";
import type { HumanContributionState } from "./data/humanContribution";
export function MaterialUseStart({
  contribution,
  state,
  onChange,
}: {
  contribution: HumanContributionState;
  state: AuthorizedUse;
  onChange: (s: AuthorizedUse) => void;
}) {
  const subject = assessedUseSubject(contribution),
    version = useVersion(subject),
    old = useVersion(state.subject);
  const [audience, setAudience] = useState(""),
    [reason, setReason] = useState(""),
    [reviewed, setReviewed] = useState<string>();
  const heading = useRef<HTMLHeadingElement>(null);
  const identity = JSON.stringify({ subject, state, audience, reason }),
    confirm = reviewed === identity;
  useEffect(() => {
    if (confirm) heading.current?.focus();
  }, [confirm]);
  if (!version || !old || version <= old) return null;
  const frozen = JSON.parse(subject!);
  if (openGoalTask(state))
    return (
      <p role="alert">
        Complete or explicitly cancel the open goal follow-up before starting a
        new material mandate.
      </p>
    );
  return (
    <section
      className="panel org-stream material-use-start"
      aria-label="New material use mandate"
    >
      <h3>New mandate for draft-0{version} · demo organization owner</h3>
      <p>
        Earlier draft-0{old} use records will be preserved. This starts a
        separate material chain with no copied publication assessment,
        authorization, execution, evidence, outcome or applicability decision.
      </p>
      <label>
        New material audience
        <input
          maxLength={500}
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
        />
      </label>
      <label>
        New material mandate rationale
        <textarea
          maxLength={3000}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </label>
      <button
        className="button primary"
        disabled={!audience.trim() || !reason.trim()}
        onClick={() => setReviewed(identity)}
      >
        Review new material mandate
      </button>
      {confirm && (
        <section aria-label="New material mandate preview">
          <h3 ref={heading} tabIndex={-1}>
            Confirm new material mandate · draft-0{version}
          </h3>
          <p>
            {frozen.delivery.id} → {frozen.receipt.id} → {frozen.assessment.id}
          </p>
          <pre className="human-contribution-text">{frozen.delivery.body}</pre>
          <p>
            Audience: {audience}. {reason}
          </p>
          <p>
            Scope: Sam reviews and authorizes this exact material for the named
            audience; Maya reviews outcome evidence.{" "}
            {1 + (state.previousMaterials?.length ?? 0)} earlier material chains
            remain historical.
          </p>
          <button
            className="button primary"
            onClick={() => {
              onChange(
                startMaterialUse(
                  state,
                  subject,
                  audience,
                  reason,
                  new Date().toISOString(),
                ),
              );
              setReviewed(undefined);
            }}
          >
            Record new material mandate locally
          </button>{" "}
          <button
            className="button secondary"
            onClick={() => setReviewed(undefined)}
          >
            Keep current material history
          </button>
        </section>
      )}
    </section>
  );
}
