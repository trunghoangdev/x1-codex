import { assignments } from "./data/assignments";
import { evidenceFor } from "./data/evidence";
import {
  roleBindings,
  workers,
  workstreams,
} from "./data/organizationOverview";
import type { Assignment, Readiness } from "./data/models";
import { releaseWait } from "./data/organization";

export function OrganizationOverview({
  completed,
  readiness,
  onOpen,
  onMyWork,
  onWorkstream,
}: {
  completed: Record<string, string>;
  readiness: Readiness;
  onOpen: (assignment: Assignment, tab?: string) => void;
  onMyWork: () => void;
  onWorkstream: (id: string) => void;
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">ORGANIZATION OVERVIEW</div>
          <h1 tabIndex={-1}>One team. Clear responsibility.</h1>
          <p>
            Shared goals, parallel workstreams and the people and workers
            responsible.
          </p>
        </div>
        <button className="button secondary" onClick={onMyWork}>
          Open My Work · Alex
        </button>
      </div>
      <div className="org-banner">
        <div>
          <span className="section-label">
            SOFTWARE FACTORY · SAMPLE ORGANIZATION
          </span>
          <h2>Build software with accountable collaboration.</h2>
          <p>
            2 workstreams · {workers.length} workers · {roleBindings.length}{" "}
            scoped role bindings
          </p>
          <p>
            Authored design scenario. Workstream membership and role scopes
            illustrate a proposed organization model; they are not live SF
            records.
          </p>
        </div>
      </div>
      <section
        aria-label="Organization workstreams"
        className="org-overview-section"
      >
        <h2>Goals & workstreams</h2>
        <p>
          These streams run alongside each other. A recorded response does not
          establish that a goal has been achieved.
        </p>
        <div className="org-stream-grid">
          {workstreams.map((stream) => (
            <article
              className="panel org-stream"
              key={stream.id}
              aria-label={stream.name}
            >
              <span className="section-label">
                {stream.id} · {stream.project}
              </span>
              <h3>{stream.name}</h3>
              <button
                className="text-link"
                onClick={() => onWorkstream(stream.id)}
              >
                Explore workstream · {stream.id}
              </button>
              <p>
                <strong>Goal</strong>
                <br />
                {stream.goal}
              </p>
              <p>
                <strong>Coordination</strong>
                <br />
                {stream.coordination}
              </p>
              <h4>Current assignments</h4>
              {stream.assignmentIds.map((id) => {
                const assignment = assignments.find((a) => a.id === id);
                if (!assignment) return null;
                const evidenceCount = evidenceFor(id).length;
                return (
                  <div className="org-stream-assignment" key={id}>
                    <button
                      className="text-link"
                      onClick={() => onOpen(assignment)}
                    >
                      {id} · {assignment.title}
                    </button>
                    <p>
                      {assignment.owner} · {assignment.role} ·{" "}
                      {completed[id]
                        ? "Local response recorded"
                        : "Awaiting response"}
                    </p>
                    <button
                      className="text-link"
                      onClick={() => onOpen(assignment, "Evidence")}
                    >
                      {evidenceCount} attached evidence records · inspect
                    </button>
                  </div>
                );
              })}
              <p className="org-outcome">
                <strong>Outcome</strong>
                <br />
                {stream.outcome}
              </p>
            </article>
          ))}
        </div>
      </section>
      <section
        className="panel org-stream org-overview-section"
        aria-label="Other organization work"
      >
        <h2>Other work requiring coordination</h2>
        <p>
          These assignments are outside the two modeled streams. A shared
          project does not establish a dependency.
        </p>
        {["A-1041", "A-1035", "A-1032"].map((id) => {
          const assignment = assignments.find((a) => a.id === id);
          return (
            assignment && (
              <div className="org-stream-assignment" key={id}>
                <button
                  className="text-link"
                  onClick={() => onOpen(assignment)}
                >
                  {id} · {assignment.title}
                </button>
                <p>
                  {completed[id]
                    ? "Local response recorded; outcome remains unverified."
                    : id === "A-1041"
                      ? releaseWait[readiness]
                      : id === "A-1035"
                        ? "Staging effect unconfirmed. This is a different subject from the production release."
                        : "Accessibility assessment requested; no invitation-workstream dependency is established."}
                </p>
              </div>
            )
          );
        })}
      </section>
      <section
        className="org-overview-section"
        aria-label="Roles and worker bindings"
      >
        <h2>Roles & worker bindings</h2>
        <p>
          A worker can hold several roles. Each binding has a scope;
          contribution, assessment and authorization remain distinct
          responsibilities.
        </p>
        <div className="role-grid">
          {roleBindings.map((binding) => {
            const worker = workers.find((w) => w.id === binding.workerId)!;
            return (
              <article
                className="panel role-card"
                key={`${binding.workerId}-${binding.role}`}
              >
                <span className="badge neutral">{worker.type}</span>
                <h2>{binding.role}</h2>
                <strong>{worker.name}</strong>
                <p>Scope: {binding.scope}</p>
                <p>{binding.permission}</p>
                {binding.role === "Reviewer" && (
                  <span className="role-count">
                    {
                      assignments.filter(
                        (a) => a.kind === "Assessment" && !completed[a.id],
                      ).length
                    }{" "}
                    awaiting review · sample
                  </span>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
