import type { Readiness } from "./data/models";
import { releaseSubject } from "./data/release";
export const decisionBlocked = (state: Readiness) =>
  ["load-error", "stale", "revoked"].includes(state);
const blockedMessages: Partial<Record<Readiness, string>> = {
  "load-error":
    "Review data could not be loaded. Neither approval nor refusal can be recorded until the decision context is available.",
  stale:
    "The candidate changed. The displayed subject is an outdated snapshot; review the current candidate before deciding.",
  revoked:
    "Your release authority is no longer valid. Both approval and refusal are unavailable; an authorized reviewer must take over.",
};
export function DecisionProblem({
  state,
  onReset,
}: {
  state: Readiness;
  onReset: () => void;
}) {
  if (!decisionBlocked(state)) return null;
  return (
    <div className="decision-problem" role="alert">
      <strong>Decision unavailable</strong>
      <p>{blockedMessages[state]}</p>
      <button className="button secondary" onClick={onReset}>
        Reset demo review
      </button>
      <small>
        This resets the simulation to missing evidence. It does not reload
        server data, restore permissions, or verify a new candidate.
      </small>
    </div>
  );
}
export function ReleaseSubject() {
  return (
    <div className="release-subject">
      <strong>Exact decision subject · sample</strong>
      <p>{releaseSubject.label}</p>
      <code>{releaseSubject.digest}</code>
      <p>{releaseSubject.target}</p>
      <small>
        Synthetic digest, not verified. Separate from the A-1042 review
        candidate.
      </small>
    </div>
  );
}
export function ReleaseReview({
  readiness,
  onChange,
  locked,
}: {
  readiness: Readiness;
  onChange: (value: Readiness) => void;
  locked: boolean;
}) {
  return (
    <section className="release-review" aria-label="Release prerequisites">
      <ReleaseSubject />
      <label className="check-scenario">
        Preview release prerequisites
        <select
          value={readiness}
          disabled={locked}
          onChange={(e) => onChange(e.target.value as Readiness)}
        >
          <option value="missing">Evidence missing</option>
          <option value="ready">All prerequisites satisfied — demo</option>
          <option value="refused">Publication refused</option>
          <option value="load-error">Review data load failed</option>
          <option value="stale">Candidate changed</option>
          <option value="revoked">Authority revoked</option>
        </select>
      </label>
      <p className="demo-note">
        Alternative fictional scenarios. Selecting one does not run a check or
        establish real authority.
      </p>
      <DecisionProblem state={readiness} onReset={() => onChange("missing")} />
      <div className="check-gates">
        {[
          [
            "Technical assessment",
            decisionBlocked(readiness)
              ? "Current result unavailable"
              : "Satisfied · sample",
          ],
          [
            "Publication admissibility",
            readiness === "ready"
              ? "Satisfied · sample"
              : readiness === "refused"
                ? "Refused · sample"
                : "No observation",
          ],
          [
            "Applicability to exact target",
            readiness === "ready" ? "Satisfied · sample" : "No observation",
          ],
        ].map(([name, value]) => (
          <div className="check-gate" key={name}>
            <strong>{name}</strong>
            <span>{value}</span>
          </div>
        ))}
      </div>
      <p className="release-readiness" role="status">
        {decisionBlocked(readiness)
          ? "No decision can be recorded against this context."
          : readiness === "ready"
            ? "Ready for a demo decision. Execution remains separate."
            : "Approval unavailable: prerequisites are not satisfied. You can still record a refusal."}
      </p>
    </section>
  );
}
