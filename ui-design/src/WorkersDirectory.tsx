import {
  mainOrganization,
  scenarioWorkerRows,
  type OrganizationScenario,
} from "./data/organizationScenario";
import { DetailBackButton, DetailEmptyState } from "./DetailPresentation";
import {
  defaultWorkerFilters,
  type WorkerFilters,
} from "./data/workerDirectory";

export function WorkersDirectory({
  scenario = mainOrganization,
  filters,
  onFilters,
  onOpen,
  onBack,
  onAttention,
}: {
  scenario?: OrganizationScenario;
  filters: WorkerFilters;
  onFilters: (filters: WorkerFilters) => void;
  onOpen: (id: string) => void;
  onBack: () => void;
  onAttention: () => void;
}) {
  const workerDirectory = scenarioWorkerRows(scenario);
  const directoryRoles = [
    ...new Set(scenario.bindings.map((binding) => binding.role)),
  ];
  const responsibilityGaps = scenario.gaps;
  const visible = workerDirectory.filter(
    ({ worker, type, bindings, assignmentIds }) =>
      `${worker.id} ${worker.name} ${worker.type} ${bindings.map((b) => `${b.role} ${b.scope}`).join(" ")} ${assignmentIds.join(" ")}`
        .toLowerCase()
        .includes(filters.query.trim().toLowerCase()) &&
      (filters.type === "all" || type === filters.type) &&
      (filters.role === "All" ||
        bindings.some((b) => b.role === filters.role)) &&
      (filters.assignments === "all" ||
        (filters.assignments === "linked"
          ? assignmentIds.length > 0
          : assignmentIds.length === 0)),
  );
  return (
    <div className="detail-page">
      <DetailBackButton onClick={onBack}>Back to Organization</DetailBackButton>
      <div className="page-heading">
        <div>
          <div className="eyebrow">ORGANIZATION DIRECTORY</div>
          <h1 tabIndex={-1}>Workers</h1>
          <p>
            Explore scoped responsibilities across human, AI and deterministic
            workers.
          </p>
        </div>
      </div>
      <p className="org-overview-section">
        {scenario.name} · {workerDirectory.length} workers. Bindings describe
        authored responsibilities; they do not establish live permissions or
        capacity. No linked assignments does not mean a worker is idle or
        available.
      </p>
      <section
        className="panel stream-directory-filters"
        aria-label="Worker filters"
      >
        <label>
          Search workers
          <input
            type="search"
            value={filters.query}
            onChange={(e) => onFilters({ ...filters, query: e.target.value })}
            placeholder="Name, role or scope"
          />
        </label>
        <label>
          Worker type
          <select
            value={filters.type}
            onChange={(e) =>
              onFilters({
                ...filters,
                type: e.target.value as WorkerFilters["type"],
              })
            }
          >
            <option value="all">All types</option>
            <option value="human">Human</option>
            <option value="ai">AI</option>
            <option value="deterministic">Deterministic</option>
          </select>
        </label>
        <label>
          Role
          <select
            value={filters.role}
            onChange={(e) => onFilters({ ...filters, role: e.target.value })}
          >
            <option value="All">All roles</option>
            {directoryRoles.map((role) => (
              <option key={role}>{role}</option>
            ))}
          </select>
        </label>
        <label>
          Assignment links
          <select
            value={filters.assignments}
            onChange={(e) =>
              onFilters({
                ...filters,
                assignments: e.target.value as WorkerFilters["assignments"],
              })
            }
          >
            <option value="all">All workers</option>
            <option value="linked">Has linked assignments</option>
            <option value="none">No linked assignments</option>
          </select>
        </label>
        <button
          className="button secondary"
          onClick={() => onFilters(defaultWorkerFilters)}
        >
          Clear filters
        </button>
      </section>
      <p className="org-overview-section" role="status">
        {visible.length} of {workerDirectory.length} workers
      </p>
      {visible.length === 0 ? (
        <DetailEmptyState>
          No matching workers. Change your search or clear the filters.
          <button
            className="button secondary"
            onClick={() => {
              onFilters(defaultWorkerFilters);
              requestAnimationFrame(() =>
                document
                  .querySelector<HTMLElement>('input[type="search"]')
                  ?.focus(),
              );
            }}
          >
            Show all workers
          </button>
        </DetailEmptyState>
      ) : (
        <div className="org-stream-grid">
          {visible.map(({ worker, bindings, assignmentIds }) => (
            <article
              className="panel org-stream"
              key={worker.id}
              aria-label={worker.name}
            >
              <div className="eyebrow">{worker.type}</div>
              <h2>{worker.name}</h2>
              <p>
                {bindings.length} scoped role binding
                {bindings.length === 1 ? "" : "s"}
              </p>
              <ul>
                {bindings.map((binding) => (
                  <li key={`${binding.role}:${binding.scope}`}>
                    <strong>{binding.role}</strong> · {binding.scope}
                  </li>
                ))}
              </ul>
              <p>
                <strong>Explicit assignment links:</strong>{" "}
                {assignmentIds.length}
              </p>
              <p>
                {assignmentIds.length
                  ? assignmentIds.join(" · ")
                  : "No linked assignments in this sample."}
              </p>
              <button
                className="button secondary"
                onClick={() => onOpen(worker.id)}
              >
                Open worker · {worker.name}
              </button>
            </article>
          ))}
        </div>
      )}
      <section
        className="panel org-stream worker-directory-gaps"
        aria-label="Organization responsibility gaps"
      >
        <h2>Responsibility gaps · organization</h2>
        <p>
          {responsibilityGaps.length} explicit gaps remain in this scenario.
          These belong to the workstream; they are not missing duties attributed
          to an individual worker. Worker filters do not change this
          organization context.
        </p>
        <ul>
          {responsibilityGaps.map((gap) => (
            <li key={gap.id}>{gap.title}</li>
          ))}
        </ul>
        <button className="button secondary" onClick={onAttention}>
          Review responsibility gaps
        </button>
      </section>
    </div>
  );
}
