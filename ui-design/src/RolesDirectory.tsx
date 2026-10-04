import { BoundedRecords } from "./BoundedRecords";
import { RoleScopeCoverage } from "./RoleScopeCoverage";
import {
  mainOrganization,
  type OrganizationScenario,
} from "./data/organizationScenario";
import {
  defaultRoleFilters,
  rolePageSize,
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
  const pages = Math.max(1, Math.ceil(visible.length / rolePageSize));
  const page = Math.min(filters.page ?? 1, pages);
  const start = (page - 1) * rolePageSize;
  const changeFilters = (next: RoleFilters) =>
    onFilters({
      ...next,
      page: undefined,
      detail: undefined,
      bindingsPage: undefined,
      assignmentsPage: undefined,
      gapsPage: undefined,
    });
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
                  changeFilters({ ...filters, query: e.target.value })
                }
              />
            </label>
            <label>
              Responsibility coverage
              <select
                value={filters.coverage}
                onChange={(e) =>
                  changeFilters({
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
          <p className="personal-queue-note">
            Search selects matching roles across all their records. Inspect a
            role to browse its full binding, assignment and gap lists; matches
            may be on another record page.
          </p>
          <p id="role-results" tabIndex={-1} role="status">
            {visible.length} of {rows.length} roles
            {visible.length > 0 &&
              ` · Showing ${start + 1}–${Math.min(start + rolePageSize, visible.length)} · Page ${page} of ${pages}`}
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
              {visible.slice(start, start + rolePageSize).map((row) => (
                <article
                  className="panel org-stream"
                  aria-label={row.name}
                  key={row.name}
                >
                  <h2>{row.name}</h2>
                  <p>{row.purpose}</p>
                  <p>
                    Bindings: {row.bindings.length} · Assignments:{" "}
                    {row.assignments.length} · Known gaps: {row.gaps.length}
                  </p>
                  {row.bindings.length === 0 && (
                    <p>No binding represented for this catalog role.</p>
                  )}
                  <button
                    className="button secondary"
                    aria-expanded={filters.detail === row.name}
                    aria-controls={`role-detail-${row.name.replaceAll(" ", "-")}`}
                    onClick={() =>
                      onFilters({
                        ...filters,
                        detail:
                          filters.detail === row.name ? undefined : row.name,
                        bindingsPage: undefined,
                        assignmentsPage: undefined,
                        gapsPage: undefined,
                      })
                    }
                  >
                    Inspect role records · {row.name}
                  </button>
                  {filters.detail === row.name && (
                    <div id={`role-detail-${row.name.replaceAll(" ", "-")}`}>
                      <h3>Scoped bindings · {row.bindings.length}</h3>
                      {row.bindings.length ? (
                        <BoundedRecords
                          label="Bindings"
                          items={row.bindings}
                          page={filters.bindingsPage}
                          onPage={(bindingsPage) =>
                            onFilters({ ...filters, bindingsPage })
                          }
                          render={(b) => (
                            <p key={b.id}>
                              <button
                                className="text-link"
                                onClick={() => onWorker(b.workerId)}
                              >
                                {
                                  scenario.workers.find(
                                    (w) => w.id === b.workerId,
                                  )?.name
                                }
                              </button>{" "}
                              · {b.scope}
                            </p>
                          )}
                        />
                      ) : (
                        <p>No binding represented for this catalog role.</p>
                      )}
                      <h3>Role assignments · {row.assignments.length}</h3>
                      <p>
                        Explicit role membership; assignment-to-binding scope
                        matching is not verified here.
                      </p>
                      {row.assignments.length ? (
                        <BoundedRecords
                          label="Assignments"
                          items={row.assignments}
                          page={filters.assignmentsPage}
                          onPage={(assignmentsPage) =>
                            onFilters({ ...filters, assignmentsPage })
                          }
                          render={(a) => (
                            <div className="org-stream-assignment" key={a.id}>
                              <button
                                className="text-link"
                                onClick={() => onAssignment(a.id)}
                              >
                                {a.id} · {a.title}
                              </button>
                              <p>
                                {scenario.workers.find(
                                  (w) => w.id === a.workerId,
                                )?.name ?? "Unassigned"}{" "}
                                ·{" "}
                                {completed[a.id]
                                  ? "Local response recorded · outcome unverified"
                                  : a.state}
                              </p>
                            </div>
                          )}
                        />
                      ) : (
                        <p>
                          No role assignments represented. This does not mean
                          the bound workers are idle.
                        </p>
                      )}
                      <h3>Known scope gaps · {row.gaps.length}</h3>
                      {row.gaps.length ? (
                        <BoundedRecords
                          label="Gaps"
                          items={row.gaps}
                          page={filters.gapsPage}
                          onPage={(gapsPage) =>
                            onFilters({ ...filters, gapsPage })
                          }
                          render={(g) => (
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
                          )}
                        />
                      ) : (
                        <p>
                          No explicit gap linked to this role; coverage is not
                          audited.
                        </p>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
          {pages > 1 && (
            <nav className="directory-pagination" aria-label="Role pages">
              <button
                className="button secondary"
                disabled={page === 1}
                onClick={() => {
                  onFilters({
                    ...filters,
                    page: page - 1,
                    detail: undefined,
                    bindingsPage: undefined,
                    assignmentsPage: undefined,
                    gapsPage: undefined,
                  });
                  requestAnimationFrame(() =>
                    document.getElementById("role-results")?.focus(),
                  );
                }}
              >
                Previous roles
              </button>
              <span>
                Page {page} of {pages}
              </span>
              <button
                className="button secondary"
                disabled={page === pages}
                onClick={() => {
                  onFilters({
                    ...filters,
                    page: page + 1,
                    detail: undefined,
                    bindingsPage: undefined,
                    assignmentsPage: undefined,
                    gapsPage: undefined,
                  });
                  requestAnimationFrame(() =>
                    document.getElementById("role-results")?.focus(),
                  );
                }}
              >
                Next roles
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
