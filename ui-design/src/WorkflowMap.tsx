import type { OrganizationScenario } from "./data/organizationScenario";
import { workflowMap } from "./data/workflowMap";
import { CoordinationInputs } from "./CoordinationInputs";
import { DetailBackButton } from "./DetailPresentation";
export function WorkflowMap({
  completed = {},
  backLabel = "Back to scenario context",
  scenario,
  streamId,
  onBack,
  onAssignment,
  onWorker,
  onStream,
  onOutcome,
}: {
  completed?: Record<string, string>;
  backLabel?: string;
  scenario: OrganizationScenario;
  streamId: string;
  onBack: () => void;
  onAssignment: (id: string) => void;
  onWorker: (id: string) => void;
  onStream: () => void;
  onOutcome: () => void;
}) {
  const map = workflowMap(scenario, streamId);
  const scoped = {
    ...scenario,
    dependencies: map.dependencies,
    parallelWork: map.parallelWork,
  };
  if (!map.stream) return null;
  return (
    <div className="detail-page workflow-map">
      <DetailBackButton onClick={onBack}>{backLabel}</DetailBackButton>
      <div className="page-heading">
        <div>
          <div className="eyebrow">{streamId} · AUTHORED COLLABORATION</div>
          <h1 tabIndex={-1}>Workflow · {map.stream.name}</h1>
          <p>{map.stream.goal}</p>
        </div>
      </div>
      <section className="org-banner" aria-label="Workflow boundary">
        <div>
          <h2>Expected collaboration</h2>
          <p>{map.stream.coordination}</p>
          <p>
            Cards show responsibilities, not a step sequence. Only explicit
            input relationships connect provider and receiver. Assignment state
            is sample context; delivery, receipt and execution history are not
            established.
          </p>
        </div>
      </section>
      <section
        className="org-overview-section"
        aria-label="Workflow responsibilities"
      >
        <h2>Who contributes to this goal?</h2>
        <p>
          {map.assignments.length} represented assignments · {map.gaps.length}{" "}
          explicit responsibility gaps. Role bindings do not create tasks or
          grant decision authority.
        </p>
        <ul className="workflow-node-grid">
          {map.assignments.map((a) => {
            const worker = scenario.workers.find((w) => w.id === a.workerId);
            return (
              <li className="panel org-stream" key={a.id} aria-label={a.title}>
                <div className="eyebrow">
                  {a.id} · {a.role}
                </div>
                <h3>{a.title}</h3>
                <p>
                  <strong>{worker?.name ?? "Unassigned"}</strong>
                  {worker
                    ? ` · ${worker.type}`
                    : " · allocation not represented"}
                </p>
                <span className="badge neutral">
                  {completed[a.id]
                    ? "Local response recorded · flow has not advanced"
                    : a.state}
                </span>
                <details className="directory-record-details">
                  <summary>
                    Inspect responsibility expectations · {a.id}
                  </summary>
                  <p>
                    <strong>Input expectation:</strong>{" "}
                    {a.input ?? "Not represented"}
                  </p>
                  <p>
                    <strong>Expected response:</strong>{" "}
                    {a.expectedResponse ?? "Not represented"}
                  </p>
                </details>
                <div className="workstream-actions">
                  <button
                    className="text-link"
                    onClick={() => onAssignment(a.id)}
                  >
                    Inspect map {completed[a.id] ? "response" : "assignment"} ·{" "}
                    {a.id}
                  </button>
                  {worker && (
                    <button
                      className="text-link"
                      onClick={() => onWorker(worker.id)}
                    >
                      Inspect map worker · {worker.name}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
      <section
        className="panel org-stream org-overview-section"
        aria-label="Workflow responsibility gaps"
      >
        <h2>Responsibilities needing coordination</h2>
        {map.gaps.length ? (
          map.gaps.map((g) => (
            <article key={g.id} className="org-stream-assignment">
              <h3>{g.title}</h3>
              <p>
                {g.id} · {g.description}
              </p>
              <p>
                A responsibility gap is separate from an assignment. No extra
                task or worker is created here.
              </p>
              <button className="text-link" onClick={onStream}>
                Inspect gap source · {g.id}
              </button>
            </article>
          ))
        ) : (
          <p>No explicit gap represented. Coverage is not audited.</p>
        )}
      </section>
      <section
        className="org-overview-section"
        aria-label="Workflow relationships"
      >
        <h2>Input connections & parallel work</h2>
        <p>
          {map.dependencies.length} explicit input relationships ·{" "}
          {map.parallelWork.length} declared parallel groups. Shared projects
          and adjacent cards do not imply dependencies.
        </p>
        {map.dependencies.length + map.parallelWork.length ? (
          <CoordinationInputs
            scenario={scoped}
            streamId={streamId}
            completed={completed}
            onAssignment={onAssignment}
            onWorker={onWorker}
          />
        ) : (
          <p>
            No explicit input relationship or parallel group represented.
            Collaboration order remains unknown.
          </p>
        )}
        <p>
          Revision or clarification expectations are descriptive only. No
          confirmed revision connection, delivery event or receiving
          acknowledgment is represented.
        </p>
      </section>
      <section
        className="panel org-stream"
        aria-label="Workflow outcome boundary"
      >
        <h2>Outcome remains a separate review</h2>
        <p>{map.stream.outcome}</p>
        <p>
          Responding to an assignment does not establish that the goal was
          achieved.
        </p>
        <button className="button secondary" onClick={onOutcome}>
          Review workflow outcome evidence
        </button>
      </section>
    </div>
  );
}
