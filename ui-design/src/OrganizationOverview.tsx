import { WorkspaceGuide } from "./WorkspaceGuide";
import type { ResponsibilityProposal } from "./data/responsibilityProposals";
import { AttentionSummary } from "./AttentionSummary";
import type { AttentionCategory } from "./data/organizationAttention";
import { responsibilityGaps } from "./data/workerDetails";
import { assignments } from "./data/assignments";
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
  proposals,
  onPropose,
  onWorker,
  onWorkersDirectory,
  onDirectory,
  onActivity,
  onAttention,
}: {
  completed: Record<string, string>;
  readiness: Readiness;
  onOpen: (assignment: Assignment, tab?: string) => void;
  onMyWork: () => void;
  onWorkstream: (id: string) => void;
  proposals: Record<string, ResponsibilityProposal>;
  onPropose: (gapId: string) => void;
  onWorker: (id: string) => void;
  onWorkersDirectory: () => void;
  onDirectory: () => void;
  onActivity: () => void;
  onAttention: (category: AttentionCategory | "All") => void;
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
            {workstreams.length} workstreams · {workers.length} workers ·{" "}
            {roleBindings.length} scoped role bindings
          </p>
          <p>
            Authored design scenario. Workstream membership and role scopes
            illustrate a proposed organization model; they are not live SF
            records.
          </p>
        </div>
      </div>
      <AttentionSummary
        completed={completed}
        readiness={readiness}
        onOpen={onAttention}
      />
      <nav className="organization-sections" aria-label="Organization sections">
        {[
          ["org-goals", "Goals & workstreams"],
          ["org-attention", "Attention"],
          ["org-workers", "Roles & workers"],
        ].map(([id, label]) => (
          <button
            className="button secondary"
            key={id}
            onClick={() => {
              const heading = document.getElementById(id);
              heading?.focus({ preventScroll: true });
              heading?.scrollIntoView({ block: "start", behavior: "instant" });
            }}
          >
            {label}
          </button>
        ))}
      </nav>
      <p className="org-overview-section">
        <button className="button secondary" onClick={onActivity}>
          View organization activity
        </button>
      </p>
      <section
        aria-label="Organization workstreams"
        className="org-overview-section"
      >
        <h2 id="org-goals" tabIndex={-1}>
          Goals & workstreams
        </h2>
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
                {stream.assignmentIds.length} linked assignment · inspect
                details in the workstream
              </p>
              <p className="org-outcome">
                <strong>Outcome</strong>
                <br />
                {stream.outcome}
              </p>
            </article>
          ))}
        </div>
        <p>
          <button className="button secondary" onClick={onDirectory}>
            Browse workstreams
          </button>
        </p>
      </section>
      <details className="organization-disclosure org-overview-section">
        <summary>Other organization work · 3 assignments</summary>
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
      </details>
      <section
        className="org-overview-section"
        aria-label="Roles and worker bindings"
      >
        <h2 id="org-workers" tabIndex={-1}>
          Roles & worker bindings
        </h2>
        <p>
          A worker can hold several roles. Each binding has a scope;
          contribution, assessment and authorization remain distinct
          responsibilities.
        </p>
        <p>
          {workers.length} workers · {roleBindings.length} scoped bindings.
          Inspect roles, scopes and assignment links in Workers.
        </p>
        <div className="org-stream-grid overview-workers">
          {workers.map((worker) => (
            <article
              className="panel org-stream"
              key={worker.id}
              aria-label={worker.name}
            >
              <span className="section-label">{worker.type}</span>
              <h3>{worker.name}</h3>
              <p>
                {
                  roleBindings.filter(
                    (binding) => binding.workerId === worker.id,
                  ).length
                }{" "}
                scoped bindings
              </p>
              <button className="text-link" onClick={() => onWorker(worker.id)}>
                View worker · {worker.name}
              </button>
            </article>
          ))}
        </div>
        <p>
          <button className="button secondary" onClick={onWorkersDirectory}>
            Browse workers
          </button>
        </p>
      </section>
      <details className="organization-disclosure org-overview-section">
        <summary>Responsibility gaps · 2 known gaps</summary>
        <section
          className="panel org-stream org-overview-section"
          aria-label="Responsibility gaps"
        >
          <h2>Responsibility gaps</h2>
          <p>
            Known gaps in this authored scenario, not an audit of the whole
            organization.
          </p>
          {responsibilityGaps.map((gap) => (
            <article className="org-stream-assignment" key={gap.id}>
              <h3>{gap.title}</h3>
              <p>{gap.description}</p>
              <button
                className="text-link"
                onClick={() => onWorkstream(gap.workstreamId)}
              >
                Inspect workstream · {gap.title}
              </button>
              <p>
                <button
                  className="button secondary"
                  onClick={() => onPropose(gap.id)}
                >
                  {proposals[gap.id]
                    ? "View proposal"
                    : "Propose responsibility"}{" "}
                  · {gap.title}
                </button>
              </p>
            </article>
          ))}
        </section>
      </details>
      <WorkspaceGuide />
    </>
  );
}
