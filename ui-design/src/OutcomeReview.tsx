import { WorkspaceContext } from "./WorkspaceContext";
import { DetailBackButton } from "./DetailPresentation";
import type { EvidenceArtifact } from "./data/evidence";
import {
  mainOrganization,
  type OrganizationScenario,
} from "./data/organizationScenario";
import { outcomeContextEvidence } from "./data/outcomeContext";
import type { Workstream } from "./data/organizationOverview";
import type { OutcomeReview as Outcome } from "./data/outcomes";

export function OutcomeReview({
  scenario = mainOrganization,
  backLabel = "Back to workstream",
  stream,
  outcome,
  completed,
  onOpen,
  onInspect,
  onBack,
  onStream,
  onReviewRecord,
}: {
  scenario?: OrganizationScenario;
  backLabel?: string;
  stream: Workstream;
  outcome: Outcome;
  completed: Record<string, string>;
  onOpen: (id: string, tab?: string) => void;
  onInspect?: (artifact: EvidenceArtifact) => void;
  onBack: () => void;
  onStream: () => void;
  onReviewRecord?: () => void;
}) {
  return (
    <div className="detail-page">
      <DetailBackButton onClick={onBack}>{backLabel}</DetailBackButton>
      <div className="page-heading workstream-heading">
        <div>
          <div className="eyebrow">{stream.id} · SAMPLE OUTCOME REVIEW</div>
          <h1 tabIndex={-1}>Outcome · {stream.name}</h1>
          <p>{stream.goal}</p>
        </div>
      </div>
      <WorkspaceContext
        label="Outcome workspace context"
        status={
          <>
            <h3>Not verified</h3>
            <p>Goal-level review result: not represented.</p>
            <p>{stream.outcome}</p>
          </>
        }
        responsibility={
          <p>
            Outcome reviewer: not assigned in this sample. Worker role bindings
            do not allocate this goal-level review.
          </p>
        }
        next={
          <p>
            Inspect the evidence requirements below and the workstream's
            responsibility gaps before allocating a goal-level review.
          </p>
        }
        action={
          <button className="button secondary" onClick={onStream}>
            Inspect workstream context
          </button>
        }
      />
      {onReviewRecord && (
        <section
          className="panel org-stream org-overview-section"
          aria-label="Independent review example"
        >
          <h2>Inspect an authored review example</h2>
          <p>
            An independent reader observation and insufficient-evidence
            conclusion demonstrate version-bound review. The current workstream
            remains unverified and has no allocated reviewer.
          </p>
          <button className="button secondary" onClick={onReviewRecord}>
            Inspect outcome review record · guide-review-01
          </button>
        </section>
      )}
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
              <span className="badge neutral">
                {criterion.gap.trim()
                  ? "Evidence gap"
                  : "Review not represented"}
              </span>
              <h3>{criterion.title}</h3>
              <p>Criterion · {criterion.id}</p>
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
              {criterion.evidenceIds.length === 0 && (
                <p>No linked evidence records represented.</p>
              )}
              {criterion.evidenceIds.map((id) => {
                const record = outcomeContextEvidence(scenario, stream, id);
                return record ? (
                  onInspect ? (
                    <p key={id}>
                      <button
                        className="text-link"
                        onClick={() => onInspect(record)}
                      >
                        Inspect supporting context · {id} · {record.title}
                      </button>
                    </p>
                  ) : (
                    <details key={id} className="directory-record-details">
                      <summary>
                        Inspect supporting context · {id} · {record.title}
                      </summary>
                      <p>
                        {record.detail} · {record.producer} · Assignment{" "}
                        {record.assignmentId}
                      </p>
                      <pre className="outcome-evidence-content">
                        {record.content}
                      </pre>
                    </details>
                  )
                ) : (
                  <p key={id}>{id} · Context unavailable</p>
                );
              })}
              <p className="org-outcome">
                <strong>Still missing</strong>
                <br />
                {criterion.gap ||
                  "No gap stated; verification remains unestablished."}
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
          const assignment = scenario.assignments.find((a) => a.id === id);
          return (
            assignment && (
              <article className="org-stream-assignment" key={id}>
                <p>
                  {id} · {assignment.title}
                </p>
                <p>
                  {completed[id]
                    ? "Local response recorded · goal remains unverified"
                    : scenario.readOnly
                      ? `Authored assignment state · ${assignment.state}`
                      : "Awaiting assignment response"}
                </p>
                <button
                  className="text-link"
                  onClick={() =>
                    onOpen(
                      assignment.id,
                      completed[id] ? "Activity" : "Overview",
                    )
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
          Next coordination step: identify the outcome reviewer and gather the
          observations required above within this goal’s stated scope.
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
