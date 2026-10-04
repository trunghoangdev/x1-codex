import { CoordinationInputs } from "./CoordinationInputs";
import { mainOrganization } from "./data/organizationScenario";
import { WorkstreamFlow } from "./WorkstreamFlow";
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
  onGaps,
  onOutcome,
  onWorker,
}: {
  stream: Workstream;
  completed: Record<string, string>;
  onOpen: (assignment: Assignment, tab?: string) => void;
  onInspect: (artifact: EvidenceArtifact) => void;
  backLabel?: string;
  onBack: () => void;
  onHandoff: (id: string) => void;
  onGaps: () => void;
  onOutcome: () => void;
  onWorker: (id: string) => void;
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
        className="panel org-stream"
        aria-label="Workstream coordination sources"
      >
        <h2>Responsibility and outcome requirements</h2>
        {mainOrganization.gaps
          .filter((g) => g.workstreamId === stream.id)
          .map((g) => (
            <p key={g.id}>
              <strong>{g.title}</strong>
              <br />
              {g.id} · {g.description}
            </p>
          ))}
        {mainOrganization.outcomes
          .find((o) => o.streamId === stream.id)
          ?.criteria.map((c) => (
            <p key={c.id}>
              <strong>{c.title}</strong>
              <br />
              Criterion · {c.id}
              <br />
              {c.gap}
            </p>
          ))}
      </section>
      <WorkstreamFlow
        streamId={stream.id}
        completed={completed}
        onOpen={onOpen}
        onInspect={onInspect}
        onHandoff={onHandoff}
        onGaps={onGaps}
        onOutcome={onOutcome}
      />
      <CoordinationInputs
        scenario={mainOrganization}
        streamId={stream.id}
        completed={completed}
        onAssignment={(id) => {
          const a = assignments.find((a) => a.id === id);
          if (a) onOpen(a);
        }}
        onWorker={onWorker}
      />
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
