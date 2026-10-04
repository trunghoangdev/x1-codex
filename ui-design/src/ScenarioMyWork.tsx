import {
  defaultScenarioWorkFilters,
  scenarioPersonalWork,
  type ScenarioWorkFilters,
} from "./data/scenarioWork";
import { DetailEmptyState } from "./DetailPresentation";
import { CoordinationInputs } from "./CoordinationInputs";
import type { OrganizationScenario } from "./data/organizationScenario";
import { DetailBackButton } from "./DetailPresentation";
export function ScenarioMyWork({
  scenario,
  workerId,
  onAssignment,
  onStream,
  onOrganization,
  onWorker,
  filters,
  onFilters,
}: {
  scenario: OrganizationScenario;
  workerId: string;
  filters: ScenarioWorkFilters;
  onFilters: (filters: ScenarioWorkFilters) => void;
  onAssignment: (id: string) => void;
  onStream: (id: string) => void;
  onOrganization: () => void;
  onWorker: (id: string) => void;
}) {
  const worker = scenario.workers.find((w) => w.id === workerId)!;
  const {
    allocated: mine,
    shown,
    response,
    waiting,
    both,
  } = scenarioPersonalWork(scenario, workerId, filters);
  const roles = [...new Set(mine.map((a) => a.role))];
  if (filters.role !== "All" && !roles.includes(filters.role))
    roles.push(filters.role);
  const streamIds = [
    ...new Set(mine.map((a) => a.streamId).filter((id): id is string => !!id)),
  ];
  if (filters.stream !== "All" && !streamIds.includes(filters.stream))
    streamIds.push(filters.stream);
  const reset = () => {
    onFilters(defaultScenarioWorkFilters);
    requestAnimationFrame(() =>
      document.querySelector<HTMLElement>('input[type="search"]')?.focus(),
    );
  };
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
        {mine.length} assignments · {response} awaiting your response ·{" "}
        {waiting} waiting for input
      </p>
      <p className="personal-queue-note">
        Counts cover your full inbox. Response and waiting-input flags can
        overlap ({both} in both); they are not added together or inferred from
        role bindings. Input availability remains unverified unless explicitly
        represented.
      </p>
      <section
        className="panel stream-directory-filters"
        aria-label="Personal work filters"
      >
        <label>
          Search my work
          <input
            type="search"
            placeholder="Assignment, role, goal or input"
            value={filters.query}
            onChange={(e) => onFilters({ ...filters, query: e.target.value })}
          />
        </label>
        <label>
          Assignment role
          <select
            value={filters.role}
            onChange={(e) => onFilters({ ...filters, role: e.target.value })}
          >
            <option value="All">All roles</option>
            {roles.map((role) => (
              <option key={role}>{role}</option>
            ))}
          </select>
        </label>
        <label>
          Workstream
          <select
            value={filters.stream}
            onChange={(e) => onFilters({ ...filters, stream: e.target.value })}
          >
            <option value="All">All workstreams</option>
            {streamIds.map((id) => (
              <option key={id} value={id}>
                {scenario.streams.find((s) => s.id === id)?.name ?? id}
              </option>
            ))}
          </select>
        </label>
        <label>
          Work attention
          <select
            value={filters.status}
            onChange={(e) =>
              onFilters({
                ...filters,
                status: e.target.value as ScenarioWorkFilters["status"],
              })
            }
          >
            <option value="all">All assigned work</option>
            <option value="response">Awaiting my response</option>
            <option value="waiting">Waiting for input</option>
            <option value="both">Response needed and waiting for input</option>
          </select>
        </label>
        <button className="button secondary" onClick={reset}>
          Clear work filters
        </button>
      </section>
      <p className="personal-queue-results" role="status">
        {shown.length} of {mine.length} allocated assignments shown
      </p>
      {mine.length === 0 ? (
        <section className="panel org-stream" aria-label="No allocated work">
          <h2>No assignments allocated to you in this sample</h2>
          <p>
            Your role bindings describe responsibilities; they do not create
            tasks. No assignments here does not mean you are idle or available.
          </p>
          <button
            className="button secondary"
            onClick={() => onWorker(workerId)}
          >
            Inspect my responsibilities
          </button>
        </section>
      ) : shown.length === 0 ? (
        <DetailEmptyState>
          No matching personal work. Filters do not change your allocation.
          <button className="button secondary" onClick={reset}>
            Show all my work
          </button>
        </DetailEmptyState>
      ) : (
        <div className="org-stream-grid">
          {shown.map((a) => (
            <article className="panel org-stream" aria-label={a.id} key={a.id}>
              <div className="eyebrow">
                {a.role} · {a.id}
              </div>
              <h2>{a.title}</h2>
              <p>
                <strong>{a.state}</strong>
              </p>
              <p>
                <strong>Input:</strong>{" "}
                {a.input ?? "No input records represented for this assignment."}
              </p>
              <p>
                <strong>Expected response:</strong>{" "}
                {a.expectedResponse ??
                  "Expected-response details are not represented in this sample."}
              </p>
              <CoordinationInputs
                scenario={scenario}
                assignmentId={a.id}
                onAssignment={onAssignment}
                onWorker={onWorker}
              />
              <button
                className="button secondary"
                onClick={() => onAssignment(a.id)}
              >
                Inspect my assignment · {a.id}
              </button>
              {a.streamId && (
                <p>
                  <button
                    className="text-link"
                    onClick={() => onStream(a.streamId!)}
                  >
                    View shared goal · {a.streamId}
                  </button>
                </p>
              )}
            </article>
          ))}
        </div>
      )}
      <p className="scenario-inbox-note">
        No response, publication, distribution or scheduling action is enabled.
        Authored requests do not establish input delivery or achieved outcomes.
      </p>
    </div>
  );
}
