import { GitBranch, ListChecks } from "lucide-react";
import { reviewRequirements } from "./data/requirements";

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
