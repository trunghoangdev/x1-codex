import { DetailBackButton } from "./DetailPresentation";
import type { EvidenceArtifact } from "./data/evidence";
import { assignments } from "./data/assignments";
import { evidenceArtifacts } from "./data/evidence";
import type { Assignment } from "./data/models";
import type { Workstream } from "./data/organizationOverview";
import type { OutcomeReview as Outcome } from "./data/outcomes";

export function OutcomeReview({
  stream,
  outcome,
  completed,
  onOpen,
  onInspect,
  onBack,
}: {
  stream: Workstream;
  outcome: Outcome;
  completed: Record<string, string>;
  onOpen: (assignment: Assignment, tab?: string) => void;
  onInspect: (artifact: EvidenceArtifact) => void;
  onBack: () => void;
}) {
  return (
    <div className="detail-page">
      <DetailBackButton onClick={onBack}>Back to workstream</DetailBackButton>
      <div className="page-heading workstream-heading">
        <div>
          <div className="eyebrow">{stream.id} · SAMPLE OUTCOME REVIEW</div>
          <h1 tabIndex={-1}>Outcome · {stream.name}</h1>
          <p>{stream.goal}</p>
        </div>
      </div>
      <div className="org-banner">
        <div>
          <h2>Not verified</h2>
          <p>{stream.outcome}</p>
          <p>
            Outcome reviewer: not assigned in this sample. Worker role bindings
            do not allocate this goal-level review.
          </p>
        </div>
      </div>
      <section
        className="org-overview-section"
        aria-label="Outcome evidence requirements"
      >
        <h2>What would establish the outcome?</h2>
        <p>
          Proposed evidence expectations. Attached records provide context; the
          requirements below still need assessment.
        </p>
        <div className="org-stream-grid">
          {outcome.criteria.map((criterion) => (
            <article
              className="panel org-stream"
              key={criterion.id}
              aria-label={criterion.title}
            >
              <span className="badge neutral">Evidence gap</span>
              <h3>{criterion.title}</h3>
              <p>
                <strong>Needed</strong>
                <br />
                {criterion.needed}
              </p>
              <p>
                <strong>Available context</strong>
                <br />
                {criterion.available}
              </p>
              {criterion.evidenceIds.map((id) => {
                const record = evidenceArtifacts.find(
                  (e) =>
                    e.id === id &&
                    stream.assignmentIds.includes(e.assignmentId),
                );
                const assignment = assignments.find(
                  (a) => a.id === record?.assignmentId,
                );
                return record && assignment ? (
                  <p key={id}>
                    <button
                      className="text-link"
                      onClick={() => onInspect(record)}
                    >
                      Inspect supporting context · {id} · {record.title}
                    </button>
                  </p>
                ) : (
                  <p key={id}>{id} · Context unavailable</p>
                );
              })}
              <p className="org-outcome">
                <strong>Still missing</strong>
                <br />
                {criterion.gap}
              </p>
            </article>
          ))}
        </div>
      </section>
      <section
        className="panel org-stream org-overview-section"
        aria-label="Outcome assignment context"
      >
        <h2>Assignment context</h2>
        {stream.assignmentIds.map((id) => {
          const assignment = assignments.find((a) => a.id === id);
          return (
            assignment && (
              <article className="org-stream-assignment" key={id}>
                <p>
                  {id} · {assignment.title}
                </p>
                <p>
                  {completed[id]
                    ? "Local response recorded · goal remains unverified"
                    : "Awaiting assignment response"}
                </p>
                <button
                  className="text-link"
                  onClick={() =>
                    onOpen(assignment, completed[id] ? "Activity" : "Overview")
                  }
                >
                  Inspect {completed[id] ? "response" : "assignment"} · {id}
                </button>
              </article>
            )
          );
        })}
      </section>
      <section
        className="panel org-stream"
        aria-label="Outcome scope and responsibility"
      >
        <h2>Scope & responsibility</h2>
        <p>{outcome.boundary}</p>
        <p>
          Next coordination step: identify the outcome reviewer and gather
          evidence tied to the implemented subject and observed environment.
        </p>
        <p>
          This read-only sample review records no goal-level decision.
          Assignment responses and handoff descriptions do not verify these
          outcome requirements.
        </p>
      </section>
    </div>
  );
}
