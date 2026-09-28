import { GitBranch, ListChecks } from "lucide-react";
import { sampleCandidate } from "./candidateData";

// Authored independently of the candidate: requirements must not be inferred
// from whatever files a worker happens to produce. All values are fictional.
const reviewRequirements = {
  assignmentId: "A-1042",
  repository: "Payments API · sample repository",
  baseRevision: sampleCandidate.baseRevision,
  outputScope: [
    "src/webhooks/retry.ts",
    "src/webhooks/retry.test.ts",
    "docs/webhook-retries.md",
  ],
  requiredEffectPaths: ["src/webhooks/retry.ts", "src/webhooks/retry.test.ts"],
  validator: "demo-retry-delay-validator",
  publicationCriterion: "demo-publication-check",
  criteria: [
    {
      title: "Bound retry delay",
      detail:
        "Transient delivery failures use exponential backoff capped at 60 seconds.",
      evidence: "Declared validator observation for the exact candidate.",
    },
    {
      title: "Prevent duplicate payment effects",
      detail:
        "Repeated delivery of the same event must not cause a second payment effect.",
      evidence:
        "Human assessment and candidate-specific duplicate-event evidence. The current illustrative snippets do not establish this.",
    },
    {
      title: "Deliver the required changes",
      detail:
        "The candidate must contain the implementation and test paths named below, within the permitted scope.",
      evidence: "Candidate completeness and changed-file inspection.",
    },
    {
      title: "Establish publication admissibility",
      detail:
        "Check the exact candidate against the stated publication criterion before final approval.",
      evidence:
        "Publication observation. No connected result is currently available.",
    },
  ],
};
export function AssignmentRequirements({
  assignmentId,
}: {
  assignmentId: string;
}) {
  if (assignmentId !== reviewRequirements.assignmentId)
    return (
      <section
        className="requirements-unavailable"
        aria-label="Work requirements"
      >
        <h3>Work requirements</h3>
        <p>
          Detailed source, scope and acceptance criteria are not connected for
          this sample assignment. Missing information does not mean unrestricted
          changes or no required checks.
        </p>
      </section>
    );
  const work = reviewRequirements;
  return (
    <section className="assignment-requirements" aria-label="Work requirements">
      <div className="section-rule" />
      <div className="section-label">
        <ListChecks size={15} />
        REVIEW BASIS · SAMPLE REQUIREMENTS
      </div>
      <h3>What the underlying software work must satisfy</h3>
      <p className="summary">
        These are requirements for the candidate under review. Your Reviewer
        role permits assessment; these paths do not grant you permission to
        modify the repository.
      </p>
      <dl className="candidate-identity">
        <div>
          <dt>Source repository</dt>
          <dd>{work.repository}</dd>
        </div>
        <div>
          <dt>
            <GitBranch size={13} />
            Frozen base revision · synthetic
          </dt>
          <dd>
            <code>{work.baseRevision}</code>
          </dd>
        </div>
        <div>
          <dt>Declared validator</dt>
          <dd>
            <code>{work.validator}</code>
          </dd>
        </div>
        <div>
          <dt>Publication criterion · sample identifier</dt>
          <dd>
            <code>{work.publicationCriterion}</code>
          </dd>
        </div>
      </dl>
      <div className="requirements-scopes">
        <section aria-label="Permitted output scope">
          <h3>Permitted output scope</h3>
          <p>
            Only these paths may change. Permission to change a file does not
            make it required.
          </p>
          <ul>
            {work.outputScope.map((path) => (
              <li key={path}>
                <code>{path}</code>
              </li>
            ))}
          </ul>
        </section>
        <section aria-label="Required effect paths">
          <h3>Required effect paths</h3>
          <p>
            The candidate must carry these paths. Files outside the candidate
            cannot satisfy this requirement.
          </p>
          <ul>
            {work.requiredEffectPaths.map((path) => (
              <li key={path}>
                <code>{path}</code>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <h3>Criteria to assess before acceptance</h3>
      <ol className="requirements-criteria">
        {work.criteria.map((criterion) => (
          <li key={criterion.title}>
            <strong>{criterion.title}</strong>
            <p>{criterion.detail}</p>
            <small>Evidence needed: {criterion.evidence}</small>
          </li>
        ))}
      </ol>
      <p className="demo-note">
        Requirements are not results. No criterion is marked satisfied here.
        These fictional requirements are authored independently of the sample
        candidate and do not reconstruct a production assignment.
      </p>
    </section>
  );
}
