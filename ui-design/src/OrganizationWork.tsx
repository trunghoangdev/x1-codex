import { useState } from "react";
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
  const [project, setProject] = useState("All");
  const [role, setRole] = useState("All");
  const [status, setStatus] = useState("all");
  const groups = [
    { id: "waiting", title: "Awaiting response" },
    { id: "blocked", title: "Blocked" },
    { id: "responded", title: "Responded" },
  ];
  const stateFor = (a: Assignment) =>
    completed[a.id]
      ? "responded"
      : a.id === "A-1041" && readiness !== "ready"
        ? "blocked"
        : "waiting";
  const matching = assignments.filter(
    (a) =>
      (project === "All" || a.project === project) &&
      (role === "All" || a.role === role),
  );
  const shown = matching.filter(
    (a) => status === "all" || stateFor(a) === status,
  );
  const reset = () => {
    setProject("All");
    setRole("All");
    setStatus("all");
  };
  const pending = assignments.filter((a) => !completed[a.id]);
  return (
    <section className="panel org-work" aria-labelledby="org-work-title">
      <h2 id="org-work-title">Needs your attention</h2>
      <p>
        {pending.length} open assignments assigned to Alex Morgan · personal
        sample scope.
      </p>
      <p>
        Roles below describe responsibility. These records show the next review
        step; they do not establish execution or deployment success.
      </p>
      <div className="org-filters">
        <label>
          Project
          <select
            aria-label="Queue project"
            value={project}
            onChange={(e) => setProject(e.target.value)}
          >
            <option value="All">All projects</option>
            {[...new Set(assignments.map((a) => a.project))].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Role
          <select
            aria-label="Queue role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="All">All roles</option>
            {[...new Set(assignments.map((a) => a.role))].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select
            aria-label="Queue status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </label>
        <button className="button secondary" onClick={reset}>
          Reset queue filters
        </button>
      </div>
      <p role="status">
        {shown.length} matching assignments. Group counts reflect these filters.
      </p>
      <p className="summary">
        Blocked means a response path is unavailable. Missing or refused release
        prerequisites block approval; refusal may still be available. An
        unconfirmed staging effect still awaits reconciliation.
      </p>
      {groups
        .filter((g) => status === "all" || g.id === status)
        .map((group) => {
          const rows = shown.filter((a) => stateFor(a) === group.id);
          return (
            <section
              key={group.id}
              aria-label={group.title}
              className="org-status-group"
            >
              <h3>
                {group.title} <span className="count-badge">{rows.length}</span>
              </h3>
              {rows.length === 0 && (
                <p>No matching assignments in this group.</p>
              )}
              <div className="org-work-grid">
                {rows.map((assignment) => {
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
                            : (record?.wait ??
                              "Waiting details are not connected for this assignment.")}
                      </p>
                      <p className="org-work-next">
                        <strong>Next step: </strong>
                        {response
                          ? "Inspect the local decision receipt."
                          : (record?.next ??
                            "Open the assignment to inspect the available context.")}
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
            </section>
          );
        })}
      {shown.length === 0 && (
        <div className="empty-state">
          <h3>No assignments match these filters</h3>
          <button className="button secondary" onClick={reset}>
            Show all personal work
          </button>
        </div>
      )}
      {pending.length === 0 && (
        <p role="status">
          All assignments in this sample scope have local responses. This does
          not confirm completion of downstream work.
        </p>
      )}
    </section>
  );
}
