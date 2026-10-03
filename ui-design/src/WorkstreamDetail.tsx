import { DetailBackButton, DetailEmptyState } from "./DetailPresentation";
import type { EvidenceArtifact } from "./data/evidence";
import { handoffs } from "./data/handoffs";
import type { Assignment } from "./data/models";
import type { Workstream } from "./data/organizationOverview";
import { assignments } from "./data/assignments";
import { evidenceFor } from "./data/evidence";
import { workstreamDetails } from "./data/workstreamDetails";

export function WorkstreamDetail({
  stream,
  completed,
  onOpen,
  onInspect,
  backLabel = "Back to Organization",
  onBack,
  onHandoff,
  onOutcome,
}: {
  stream: Workstream;
  completed: Record<string, string>;
  onOpen: (assignment: Assignment, tab?: string) => void;
  onInspect: (artifact: EvidenceArtifact) => void;
  backLabel?: string;
  onBack: () => void;
  onHandoff: (id: string) => void;
  onOutcome: () => void;
}) {
  const detail = workstreamDetails[stream.id];
  return (
    <div className="detail-page">
      <DetailBackButton onClick={onBack}>{backLabel}</DetailBackButton>
      <div className="page-heading workstream-heading">
        <div>
          <div className="eyebrow">
            {stream.id} · {stream.project} · SAMPLE WORKSTREAM
          </div>
          <h1 tabIndex={-1}>{stream.name}</h1>
          <p>{stream.goal}</p>
        </div>
      </div>
      <div className="org-banner">
        <div>
          <h2>Outcome remains unverified</h2>
          <p>{detail.outcomeEvidence}</p>
          <button className="button secondary" onClick={onOutcome}>
            Review outcome evidence
          </button>
        </div>
      </div>
      <section
        className="org-overview-section"
        aria-label="Coordination and handoffs"
      >
        <h2>Coordination & handoffs</h2>
        <p>
          Authored collaboration pattern, not execution history. Conditional
          steps do not advance when a local response is recorded.
        </p>
        <div className="handoff-grid">
          {detail.handoffs.map((handoff) => (
            <article className="panel org-stream" key={handoff.title}>
              <span className="badge neutral">{handoff.state}</span>
              <h3>{handoff.title}</h3>
              <p>
                <strong>{handoff.responsibility}</strong>
              </p>
              <p>{handoff.exchange}</p>
            </article>
          ))}
        </div>
      </section>
      <section
        className="panel org-stream org-overview-section"
        aria-label="Handoff details"
      >
        <h2>Inspect an exchange</h2>
        {handoffs
          .filter((h) => h.streamId === stream.id)
          .map((h) => (
            <button
              className="button secondary"
              key={h.id}
              onClick={() => onHandoff(h.id)}
            >
              Open handoff · {h.title}
            </button>
          ))}
      </section>
      <section
        className="panel org-stream org-overview-section"
        aria-label="Workstream assignments and evidence"
      >
        <h2>Assignments & evidence</h2>
        {stream.assignmentIds.map((id) => {
          const assignment = assignments.find((a) => a.id === id);
          if (!assignment)
            return (
              <p key={id}>{id} · Assignment unavailable in this sample.</p>
            );
          const evidence = evidenceFor(id);
          return (
            <article key={id} className="org-stream-assignment">
              <h3>
                {assignment.id} · {assignment.title}
              </h3>
              <p>
                {assignment.owner} · {assignment.role}
              </p>
              <p>
                {completed[id]
                  ? "Local response recorded · handoff and outcome not established"
                  : "Awaiting response"}
              </p>
              <div className="workstream-actions">
                <button
                  className="button secondary"
                  onClick={() => onOpen(assignment)}
                >
                  Open assignment · {id}
                </button>
                {completed[id] && (
                  <button
                    className="button secondary"
                    onClick={() => onOpen(assignment, "Activity")}
                  >
                    View response · {id}
                  </button>
                )}
              </div>
              {evidence.length ? (
                <>
                  <h4>Attached sample records</h4>
                  <ul>
                    {evidence.map((record) => (
                      <li key={record.id}>
                        <button
                          className="text-link"
                          onClick={() => onInspect(record)}
                        >
                          Inspect {record.id} · {record.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="text-link"
                    onClick={() => onOpen(assignment, "Evidence")}
                  >
                    Inspect evidence · {id}
                  </button>
                </>
              ) : (
                <DetailEmptyState>
                  No evidence records attached. A missing record is not a failed
                  check or a verified outcome.
                </DetailEmptyState>
              )}
            </article>
          );
        })}
      </section>
      <section className="panel org-stream" aria-label="Workstream boundaries">
        <h2>Scope & open dependencies</h2>
        <p>{detail.boundary}</p>
        <p>
          The two organization workstreams coexist. Their order on the overview
          does not establish a dependency.
        </p>
      </section>
    </div>
  );
}
