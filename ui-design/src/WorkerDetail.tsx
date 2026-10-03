import { DetailBackButton, DetailEmptyState } from "./DetailPresentation";
import type { Assignment } from "./data/models";
import { assignments } from "./data/assignments";
import { roleBindings, type Worker } from "./data/organizationOverview";
import { workerAssignments } from "./data/workerDetails";

export function WorkerDetail({
  worker,
  completed,
  onOpen,
  onBack,
}: {
  worker: Worker;
  completed: Record<string, string>;
  onOpen: (assignment: Assignment, tab?: string) => void;
  onBack: () => void;
}) {
  const bindings = roleBindings.filter(
    (binding) => binding.workerId === worker.id,
  );
  return (
    <div className="detail-page">
      <DetailBackButton onClick={onBack}>Back to Organization</DetailBackButton>
      <div className="page-heading workstream-heading">
        <div>
          <div className="eyebrow">WORKER DETAIL · {worker.type}</div>
          <h1 tabIndex={-1}>{worker.name}</h1>
          <p>{bindings.length} scoped role bindings · authored sample</p>
        </div>
      </div>
      <div className="org-banner">
        <div>
          <h2>Responsibility within a defined scope</h2>
          <p>
            These sample bindings describe responsibility. They do not establish
            live permissions, availability, runtime health or capacity.
          </p>
        </div>
      </div>
      <section
        aria-label="Worker role bindings"
        className="org-overview-section"
      >
        <h2>Roles, scope & related assignments</h2>
        <p>
          Assignments are explicitly linked to each binding. A worker with no
          linked assignments may still have responsibilities outside this
          sample.
        </p>
        <div className="org-stream-grid">
          {bindings.map((binding) => {
            const ids = workerAssignments[worker.id]?.[binding.role] ?? [];
            return (
              <article
                className="panel org-stream"
                key={binding.role}
                aria-label={binding.role}
              >
                <h3>{binding.role}</h3>
                <p>
                  <strong>Scope</strong>
                  <br />
                  {binding.scope}
                </p>
                <p>
                  <strong>Permission described by this binding</strong>
                  <br />
                  {binding.permission}
                </p>
                <h4>Related assignments · {ids.length}</h4>
                {ids.length === 0 && (
                  <DetailEmptyState>
                    No linked assignments in this sample. This does not mean the
                    worker is idle or available.
                  </DetailEmptyState>
                )}
                {ids.map((id) => {
                  const assignment = assignments.find((a) => a.id === id);
                  if (!assignment)
                    return <p key={id}>{id} · Assignment unavailable</p>;
                  return (
                    <div className="org-stream-assignment" key={id}>
                      <button
                        className="text-link"
                        onClick={() => onOpen(assignment)}
                      >
                        {id} · {assignment.title}
                      </button>
                      <p>
                        {assignment.project} ·{" "}
                        {completed[id]
                          ? "Local response recorded · outcome not established"
                          : "Awaiting response"}
                      </p>
                      {completed[id] && (
                        <button
                          className="text-link"
                          onClick={() => onOpen(assignment, "Activity")}
                        >
                          View response · {id}
                        </button>
                      )}
                    </div>
                  );
                })}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
