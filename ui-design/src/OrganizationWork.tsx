import { assignments } from "./data/assignments";
import type { Assignment, Readiness } from "./data/models";
import { organizationWork, releaseWait } from "./data/organization";

export function OrganizationWork({
  completed,
  readiness,
  onOpen,
}: {
  completed: Record<string, string>;
  readiness: Readiness;
  onOpen: (assignment: Assignment, tab?: string) => void;
}) {
  const pending = assignments.filter((a) => !completed[a.id]);
  return (
    <section className="panel org-work" aria-labelledby="org-work-title">
      <h2 id="org-work-title">Needs your attention</h2>
      <p>
        {pending.length} open assignments assigned to Alex Morgan · sample
        scope, not an organization-wide backlog.
      </p>
      <p>
        Roles below describe responsibility. These records show the next review
        step; they do not establish execution or deployment success.
      </p>
      <div className="org-work-grid">
        {assignments.map((assignment) => {
          const record = organizationWork[assignment.id];
          const response = completed[assignment.id];
          return (
            <article className="org-work-item" key={assignment.id}>
              <span className="assignment-meta">
                {assignment.id} · {assignment.project}
              </span>
              <h3>{assignment.title}</h3>
              <p>
                <strong>
                  {response
                    ? "Response recorded"
                    : `Waiting for ${assignment.owner}`}
                </strong>{" "}
                · {assignment.role}
              </p>
              <p>
                {response
                  ? `${response} recorded in this session. Downstream outcome is not established.`
                  : assignment.id === "A-1041"
                    ? releaseWait[readiness]
                    : record.wait}
              </p>
              <p className="org-work-next">
                <strong>Next step: </strong>
                {response ? "Inspect the local decision receipt." : record.next}
              </p>
              <button
                className="button secondary"
                onClick={() =>
                  onOpen(assignment, response ? "Activity" : "Overview")
                }
              >
                {response ? "View response" : "Open assignment"} ·{" "}
                {assignment.id}
              </button>
            </article>
          );
        })}
      </div>
      {pending.length === 0 && (
        <p role="status">
          All assignments in this sample scope have local responses. This does
          not confirm completion of downstream work.
        </p>
      )}
    </section>
  );
}
