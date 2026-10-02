import type { Assignment } from "./data/models";
import { assignments } from "./data/assignments";
import { evidenceFor } from "./data/evidence";
import type { HandoffDetail as Handoff } from "./data/handoffs";

export function HandoffDetail({
  handoff,
  completed,
  onOpen,
  onBack,
}: {
  handoff: Handoff;
  completed: Record<string, string>;
  onOpen: (assignment: Assignment, tab?: string) => void;
  onBack: () => void;
}) {
  const assignment = assignments.find((a) => a.id === handoff.assignmentId);
  const records = evidenceFor(handoff.assignmentId);
  return (
    <>
      <button className="button secondary" onClick={onBack}>
        Back to workstream
      </button>
      <div className="page-heading workstream-heading">
        <div>
          <div className="eyebrow">{handoff.streamId} · SAMPLE HANDOFF</div>
          <h1 tabIndex={-1}>{handoff.title}</h1>
          <p>{handoff.status}</p>
        </div>
      </div>
      <section
        className="org-stream-grid org-overview-section"
        aria-label="Handoff participants"
      >
        <article className="panel org-stream">
          <h2>From</h2>
          <p>{handoff.from}</p>
        </article>
        <article className="panel org-stream">
          <h2>To</h2>
          <p>{handoff.to}</p>
        </article>
      </section>
      <section
        className="org-stream-grid org-overview-section"
        aria-label="Handoff expectations"
      >
        <article className="panel org-stream">
          <h2>Inputs to exchange</h2>
          <ul>
            {handoff.inputs.map((input) => (
              <li key={input}>{input}</li>
            ))}
          </ul>
        </article>
        <article className="panel org-stream">
          <h2>Conditions for receiving the work</h2>
          <ul>
            {handoff.acceptance.map((condition) => (
              <li key={condition}>{condition}</li>
            ))}
          </ul>
          <p>
            Proposed expectations; these conditions have not been verified
            automatically.
          </p>
        </article>
      </section>
      <section
        className="panel org-stream org-overview-section"
        aria-label="Handoff records"
      >
        <h2>Assignment & attached evidence</h2>
        {assignment && (
          <>
            <p>
              {assignment.id} · {assignment.title}
            </p>
            <p>
              {completed[assignment.id]
                ? "Local response recorded · handoff receipt remains unconfirmed"
                : "Awaiting assignment response · handoff receipt remains unconfirmed"}
            </p>
            <div className="workstream-actions">
              <button
                className="button secondary"
                onClick={() => onOpen(assignment, handoff.inputTab)}
              >
                Inspect input · {assignment.id}
              </button>
              {completed[assignment.id] && (
                <button
                  className="button secondary"
                  onClick={() => onOpen(assignment, "Activity")}
                >
                  View response · {assignment.id}
                </button>
              )}
            </div>
          </>
        )}
        {records.length ? (
          <>
            <ul>
              {records.map((record) => (
                <li key={record.id}>
                  {record.id} · {record.title}
                </li>
              ))}
            </ul>
            {assignment && (
              <button
                className="text-link"
                onClick={() => onOpen(assignment, "Evidence")}
              >
                Inspect evidence · {assignment.id}
              </button>
            )}
          </>
        ) : (
          <p>No evidence records attached to this assignment in the sample.</p>
        )}
      </section>
      <section className="panel org-stream" aria-label="Handoff return path">
        <h2>Return for clarification or revision</h2>
        <p>{handoff.returnPath}</p>
        <p>
          This page describes a proposed exchange. Assignment responses do not
          confirm delivery, acceptance of the handoff or achievement of the
          workstream goal.
        </p>
      </section>
    </>
  );
}
