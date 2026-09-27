export type Readiness = "missing" | "ready" | "refused";
export const releaseSubject = {
  label: "Payments API v1.8.2",
  digest: `sha256:${"c".repeat(64)}`,
  target: "Production · Payments API",
};
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
        </select>
      </label>
      <p className="demo-note">
        Alternative fictional scenarios. Selecting one does not run a check or
        establish real authority.
      </p>
      <div className="check-gates">
        {[
          ["Technical assessment", "Satisfied · sample"],
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
        {readiness === "ready"
          ? "Ready for a demo decision. Execution remains separate."
          : "Approval unavailable: prerequisites are not satisfied. You can still record a refusal."}
      </p>
    </section>
  );
}
