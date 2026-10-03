import { workstreams } from "./data/organizationOverview";
import { assignments } from "./data/assignments";
import { evidenceArtifacts, type EvidenceArtifact } from "./data/evidence";
import type { Assignment } from "./data/models";
import { responsibilityGaps } from "./data/workerDetails";
import { workstreamDetails } from "./data/workstreamDetails";

export function WorkstreamFlow({
  streamId,
  completed,
  onOpen,
  onInspect,
  onHandoff,
  onGaps,
  onOutcome,
}: {
  streamId: string;
  completed: Record<string, string>;
  onOpen: (assignment: Assignment, tab?: string) => void;
  onInspect: (record: EvidenceArtifact) => void;
  onHandoff: (id: string) => void;
  onGaps: () => void;
  onOutcome: () => void;
}) {
  const detail = workstreamDetails[streamId];
  return (
    <section
      className="org-overview-section"
      aria-label="Coordination and handoffs"
    >
      <h2>Coordination & handoffs</h2>
      <p>
        Read the proposed flow from top to bottom. These are collaboration
        expectations, not execution history or automatically advancing gates. A
        local response does not confirm a handoff or complete later steps.
      </p>
      <ol className="workstream-flow" aria-label="Workstream flow steps">
        {detail.handoffs.map((step, index) => {
          const assignment = assignments.find(
            (a) => a.id === step.assignmentId,
          );
          const records = evidenceArtifacts.filter(
            (record) =>
              step.evidenceIds?.includes(record.id) &&
              workstreams
                .find((stream) => stream.id === streamId)
                ?.assignmentIds.includes(record.assignmentId),
          );
          const gaps = responsibilityGaps.filter((gap) =>
            step.gapIds?.includes(gap.id),
          );
          return (
            <li key={step.title} className="panel org-stream flow-step">
              <div className="flow-step-number" aria-hidden="true">
                {index + 1}
              </div>
              <div>
                <span className="badge neutral">{step.state}</span>
                <h3>{step.title}</h3>
                <p>
                  <strong>Responsibility:</strong> {step.responsibility}
                </p>
                <p>{step.exchange}</p>
                <p>
                  <strong>Assignment:</strong>{" "}
                  {assignment
                    ? `${assignment.id} · ${assignment.owner}`
                    : "No separate assignment represented"}
                </p>
                {assignment && (
                  <p>
                    {completed[assignment.id]
                      ? "Local response recorded · flow has not advanced"
                      : "Awaiting response"}
                  </p>
                )}
                {gaps.length > 0 && (
                  <ul>
                    {gaps.map((gap) => (
                      <li key={gap.id}>
                        {gap.title}: {gap.description}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="workstream-actions">
                  {assignment && (
                    <button
                      className="button secondary"
                      onClick={() => onOpen(assignment)}
                    >
                      Inspect step assignment · {assignment.id}
                    </button>
                  )}
                  {assignment && completed[assignment.id] && (
                    <button
                      className="button secondary"
                      onClick={() => onOpen(assignment, "Activity")}
                    >
                      Inspect step response · {assignment.id}
                    </button>
                  )}
                  {step.handoffId && (
                    <button
                      className="button secondary"
                      onClick={() => onHandoff(step.handoffId!)}
                    >
                      Inspect step exchange · {step.title}
                    </button>
                  )}
                  {gaps.length > 0 && (
                    <button className="button secondary" onClick={onGaps}>
                      Review step responsibility · {step.title}
                    </button>
                  )}
                </div>
                {records.length > 0 && (
                  <>
                    <h4>Attached sample context</h4>
                    <ul>
                      {records.map((record) => (
                        <li key={record.id}>
                          <button
                            className="text-link"
                            onClick={() => onInspect(record)}
                          >
                            Inspect flow record · {record.id}
                          </button>
                        </li>
                      ))}
                    </ul>
                    <p>
                      Records are sample context; they do not prove completion
                      of this step or confirm receipt by the next worker.
                    </p>
                  </>
                )}
              </div>
            </li>
          );
        })}
        <li className="panel org-stream flow-step">
          <div className="flow-step-number" aria-hidden="true">
            {detail.handoffs.length + 1}
          </div>
          <div>
            <span className="badge neutral">
              Outcome unverified · observations missing
            </span>
            <h3>Verify the workstream outcome</h3>
            <p>
              <strong>Responsibility:</strong> No goal verification assignment
              or worker is represented.
            </p>
            <p>{detail.outcomeEvidence}</p>
            <p>
              This is a separate evidence question. An assessment or release
              decision does not automatically answer it.
            </p>
            <button className="button secondary" onClick={onOutcome}>
              Inspect flow outcome evidence
            </button>
          </div>
        </li>
      </ol>
    </section>
  );
}
