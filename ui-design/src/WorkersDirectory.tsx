import { WorkspaceContext } from "./WorkspaceContext";
import {
  mainOrganization,
  scenarioWorkerRows,
  type OrganizationScenario,
} from "./data/organizationScenario";
import { DetailBackButton, DetailEmptyState } from "./DetailPresentation";
import {
  defaultWorkerFilters,
  workerPageSize,
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
  const pages = Math.max(1, Math.ceil(visible.length / workerPageSize));
  const page = Math.min(filters.page ?? 1, pages);
  const start = (page - 1) * workerPageSize;
  const changeFilters = (next: WorkerFilters) =>
    onFilters({ ...next, page: undefined });
  const changePage = (next: number) => {
    onFilters({ ...filters, page: next });
    requestAnimationFrame(() =>
      document.getElementById("worker-results")?.focus(),
    );
  };
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
      <WorkspaceContext
        label="Worker workspace context"
        status={
          <p>
            {scenario.name} · {workerDirectory.length} workers in the authored
            directory.
          </p>
        }
        responsibility={
          <p>
            Bindings describe authored responsibilities; they do not establish
            live permissions or capacity. No linked assignments does not mean a
            worker is idle or available.
          </p>
        }
        next={
          <p>
            Inspect a worker's scope and assignment links, or review the
            organization's attention signals.
          </p>
        }
        action={
          <button className="button secondary" onClick={onAttention}>
            Inspect organization attention
          </button>
        }
      />
      <section
        className="panel stream-directory-filters"
        aria-label="Worker filters"
      >
        <label>
          Search workers
          <input
            type="search"
            value={filters.query}
            onChange={(e) =>
              changeFilters({ ...filters, query: e.target.value })
            }
            placeholder="Name, role or scope"
          />
        </label>
        <label>
          Worker type
          <select
            value={filters.type}
            onChange={(e) =>
              changeFilters({
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
            onChange={(e) =>
              changeFilters({ ...filters, role: e.target.value })
            }
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
              changeFilters({
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
      <p
        id="worker-results"
        tabIndex={-1}
        className="org-overview-section"
        role="status"
      >
        {visible.length} of {workerDirectory.length} workers
        {visible.length > 0 &&
          ` · Showing ${start + 1}–${Math.min(start + workerPageSize, visible.length)} · Page ${page} of ${pages}`}
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
          {visible
            .slice(start, start + workerPageSize)
            .map(({ worker, bindings, assignmentIds }) => (
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
                <p>
                  <strong>Explicit assignment links:</strong>{" "}
                  {assignmentIds.length}
                </p>
                <details className="worker-record-details">
                  <summary>Bindings and assignment IDs</summary>
                  <ul>
                    {bindings.map((binding) => (
                      <li key={binding.id}>
                        <strong>{binding.role}</strong> · {binding.scope}
                      </li>
                    ))}
                  </ul>

                  <p>
                    {assignmentIds.length
                      ? assignmentIds.join(" · ")
                      : "No linked assignments in this sample."}
                  </p>
                </details>
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
      {pages > 1 && (
        <nav className="directory-pagination" aria-label="Worker pages">
          <button
            className="button secondary"
            disabled={page === 1}
            onClick={() => changePage(page - 1)}
          >
            Previous workers
          </button>
          <span>
            Page {page} of {pages}
          </span>
          <button
            className="button secondary"
            disabled={page === pages}
            onClick={() => changePage(page + 1)}
          >
            Next workers
          </button>
        </nav>
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
