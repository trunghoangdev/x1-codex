import { RoleScopeCoverage } from "./RoleScopeCoverage";
import {
  mainOrganization,
  type OrganizationScenario,
} from "./data/organizationScenario";
import {
  defaultRoleFilters,
  scenarioRoleRows,
  type RoleFilters,
} from "./data/roleDirectory";
import { DetailBackButton, DetailEmptyState } from "./DetailPresentation";
export function RolesDirectory({
  scenario = mainOrganization,
  filters,
  onFilters,
  completed = {},
  onWorker,
  onStream,
  onAssignment,
  onBack,
}: {
  scenario?: OrganizationScenario;
  filters: RoleFilters;
  onFilters: (f: RoleFilters) => void;
  completed?: Record<string, string>;
  onWorker: (id: string) => void;
  onStream: (id: string) => void;
  onAssignment: (id: string) => void;
  onBack: () => void;
}) {
  const rows = scenarioRoleRows(scenario);
  const visible = rows.filter(
    (row) =>
      `${row.name} ${row.purpose} ${row.bindings.map((b) => `${scenario.workers.find((w) => w.id === b.workerId)?.name} ${b.scope}`).join(" ")} ${row.assignments.map((a) => `${a.id} ${a.title}`).join(" ")} ${row.gaps.map((g) => g.title).join(" ")}`
        .toLowerCase()
        .includes(filters.query.trim().toLowerCase()) &&
      (filters.coverage === "all" ||
        (filters.coverage === "unbound"
          ? row.bindings.length === 0
          : filters.coverage === "no-assignments"
            ? row.bindings.length > 0 && row.assignments.length === 0
            : row.gaps.length > 0)),
  );
  const reset = () => {
    onFilters(defaultRoleFilters);
    requestAnimationFrame(() =>
      document.querySelector<HTMLElement>('input[type="search"]')?.focus(),
    );
  };
  return (
    <div className="detail-page">
      <DetailBackButton onClick={onBack}>Back to Organization</DetailBackButton>
      <div className="page-heading">
        <div>
          <div className="eyebrow">ORGANIZATION RESPONSIBILITIES</div>
          <h1 tabIndex={-1}>Roles</h1>
          <p>Explore responsibilities across workers and workstreams.</p>
        </div>
      </div>
      <p>
        {scenario.name} · Authored role catalog. Bindings, assignments and known
        scope gaps are separate records. A binding does not establish authority,
        capacity or an assignment.
      </p>
      <nav className="organization-sections" aria-label="Role views">
        <button
          className="button secondary"
          aria-pressed={filters.view !== "scope"}
          onClick={() => onFilters(defaultRoleFilters)}
        >
          Role catalog
        </button>
        <button
          className="button secondary"
          aria-pressed={filters.view === "scope"}
          onClick={() =>
            onFilters({
              query: "",
              coverage: "all",
              view: "scope",
              scope:
                scenario.scopes.find((s) => s.kind === "workstream")?.id ??
                "All",
            })
          }
        >
          Coverage by workstream
        </button>
      </nav>
      {filters.view === "scope" ? (
        <RoleScopeCoverage
          scenario={scenario}
          filters={filters}
          onFilters={onFilters}
          onAssignment={onAssignment}
          onStream={onStream}
          onWorker={onWorker}
          completed={completed}
        />
      ) : (
        <>
          <section
            className="panel stream-directory-filters"
            aria-label="Role filters"
          >
            <label>
              Search roles
              <input
                type="search"
                value={filters.query}
                placeholder="Role, worker, scope or assignment"
                onChange={(e) =>
                  onFilters({ ...filters, query: e.target.value })
                }
              />
            </label>
            <label>
              Responsibility coverage
              <select
                value={filters.coverage}
                onChange={(e) =>
                  onFilters({
                    ...filters,
                    coverage: e.target.value as RoleFilters["coverage"],
                  })
                }
              >
                <option value="all">All roles</option>
                <option value="unbound">No bindings represented</option>
                <option value="no-assignments">
                  Bindings without role assignments
                </option>
                <option value="gaps">Known scope gaps</option>
              </select>
            </label>
            <button className="button secondary" onClick={reset}>
              Clear filters
            </button>
          </section>
          <p role="status">
            {visible.length} of {rows.length} roles
          </p>
          {visible.length === 0 ? (
            <DetailEmptyState>
              No matching roles. No result does not establish complete coverage.
              <button className="button secondary" onClick={reset}>
                Show all roles
              </button>
            </DetailEmptyState>
          ) : (
            <div className="org-stream-grid">
              {visible.map((row) => (
                <article
                  className="panel org-stream"
                  aria-label={row.name}
                  key={row.name}
                >
                  <h2>{row.name}</h2>
                  <p>{row.purpose}</p>
                  <h3>Scoped bindings · {row.bindings.length}</h3>
                  {row.bindings.length ? (
                    <ul>
                      {row.bindings.map((b) => (
                        <li key={`${b.workerId}:${b.scope}`}>
                          <button
                            className="text-link"
                            onClick={() => onWorker(b.workerId)}
                          >
                            {
                              scenario.workers.find((w) => w.id === b.workerId)
                                ?.name
                            }
                          </button>{" "}
                          · {b.scope}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No binding represented for this catalog role.</p>
                  )}
                  <h3>Role assignments · {row.assignments.length}</h3>
                  <p>
                    Explicit role membership; assignment-to-binding scope
                    matching is not verified here.
                  </p>
                  {row.assignments.length ? (
                    row.assignments.map((a) => (
                      <div className="org-stream-assignment" key={a.id}>
                        <button
                          className="text-link"
                          onClick={() => onAssignment(a.id)}
                        >
                          {a.id} · {a.title}
                        </button>
                        <p>
                          {scenario.workers.find((w) => w.id === a.workerId)
                            ?.name ?? "Unassigned"}{" "}
                          ·{" "}
                          {completed[a.id]
                            ? "Local response recorded · outcome unverified"
                            : a.state}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p>
                      No role assignments represented. This does not mean the
                      bound workers are idle.
                    </p>
                  )}
                  <h3>Known scope gaps · {row.gaps.length}</h3>
                  {row.gaps.length ? (
                    row.gaps.map((g) => (
                      <div className="org-stream-assignment" key={g.id}>
                        <strong>{g.title}</strong>
                        <p>{g.description}</p>
                        <button
                          className="text-link"
                          onClick={() => onStream(g.workstreamId)}
                        >
                          Inspect gap workstream · {g.title}
                        </button>
                      </div>
                    ))
                  ) : (
                    <p>
                      No explicit gap linked to this role; coverage is not
                      audited.
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
