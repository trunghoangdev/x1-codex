import type { OrganizationScenario } from "./data/organizationScenario";
import { DetailBackButton } from "./DetailPresentation";
export function ScenarioMyWork({
  scenario,
  workerId,
  onAssignment,
  onStream,
  onOrganization,
}: {
  scenario: OrganizationScenario;
  workerId: string;
  onAssignment: (id: string) => void;
  onStream: (id: string) => void;
  onOrganization: () => void;
}) {
  const worker = scenario.workers.find((w) => w.id === workerId)!;
  const mine = scenario.assignments.filter((a) => a.workerId === workerId);
  return (
    <div className="detail-page">
      <DetailBackButton onClick={onOrganization}>
        Back to Organization
      </DetailBackButton>
      <div className="page-heading">
        <div>
          <div className="eyebrow">PERSONAL INBOX · READ-ONLY SAMPLE</div>
          <h1 tabIndex={-1}>My Work · {worker.name}</h1>
          <p>
            Only explicitly allocated assignments appear here. Organization
            retains the shared goals and gaps.
          </p>
        </div>
      </div>
      <p className="org-overview-section" role="status">
        {mine.length} assignments ·{" "}
        {mine.filter((a) => a.responseNeeded).length} awaiting your response ·{" "}
        {mine.filter((a) => a.waitingForInput).length} waiting for input
      </p>
      <div className="org-stream-grid">
        {mine.map((a) => (
          <article className="panel org-stream" aria-label={a.id} key={a.id}>
            <div className="eyebrow">
              {a.role} · {a.id}
            </div>
            <h2>{a.title}</h2>
            <p>
              <strong>{a.state}</strong>
            </p>
            <p>
              <strong>Input:</strong> {a.input}
            </p>
            <p>
              <strong>Expected response:</strong> {a.expectedResponse}
            </p>
            <button
              className="button secondary"
              onClick={() => onAssignment(a.id)}
            >
              Inspect my assignment · {a.id}
            </button>
            <p>
              <button
                className="text-link"
                onClick={() => onStream(a.streamId!)}
              >
                View shared goal · {a.streamId}
              </button>
            </p>
          </article>
        ))}
      </div>
      <p className="scenario-inbox-note">
        No response, publication, distribution or scheduling action is enabled.
        Authored requests do not establish input delivery or achieved outcomes.
      </p>
    </div>
  );
}
