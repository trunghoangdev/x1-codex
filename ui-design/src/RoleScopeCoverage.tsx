import type { OrganizationScenario } from "./data/organizationScenario";
import { scopeRequirementRows } from "./data/roleScopes";
import { rolePageSize, type RoleFilters } from "./data/roleDirectory";
import { DetailEmptyState } from "./DetailPresentation";
export function RoleScopeCoverage({
  scenario,
  filters,
  onFilters,
  onWorker,
  onStream,
  onAssignment,
  completed,
}: {
  scenario: OrganizationScenario;
  filters: RoleFilters;
  onFilters: (f: RoleFilters) => void;
  onWorker: (id: string) => void;
  onStream: (id: string) => void;
  onAssignment: (id: string) => void;
  completed: Record<string, string>;
}) {
  const scopes = scenario.scopes.filter((s) => s.kind === "workstream");
  const rows = scopeRequirementRows(scenario);
  const scoped = rows.filter(
    (r) =>
      !filters.scope || filters.scope === "All" || r.scopeId === filters.scope,
  );
  const shown = scoped.filter(
    (r) =>
      `${r.role} ${r.scope.label} ${r.bindings.map((b) => scenario.workers.find((w) => w.id === b.workerId)?.name).join(" ")}`
        .toLowerCase()
        .includes(filters.query.trim().toLowerCase()) &&
      (filters.coverage === "all" ||
        (filters.coverage === "unbound"
          ? r.bindingState === "none"
          : filters.coverage === "no-assignments"
            ? r.bindingState === "declared" && !r.assignments.length
            : filters.coverage === "unknown"
              ? r.bindingState === "unknown"
              : r.gaps.length > 0)),
  );
  const pages = Math.max(1, Math.ceil(shown.length / rolePageSize));
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
    onFilters({
      view: "scope",
      scope: filters.scope,
      query: "",
      coverage: "all",
    });
    requestAnimationFrame(() =>
      document.querySelector<HTMLElement>('input[type="search"]')?.focus(),
    );
  };
  const name = (id: string) =>
    scenario.workers.find((w) => w.id === id)?.name ?? id;
  return (
    <>
      <p className="personal-queue-note">
        Declared scope relationships are sample records, not effective
        permission or an audit of required roles. Unknown or unmodeled
        relationships remain unknown.
      </p>
      <section
        className="panel stream-directory-filters"
        aria-label="Scope coverage filters"
      >
        <label>
          Coverage workstream
          <select
            value={filters.scope ?? "All"}
            onChange={(e) =>
              changeFilters({ ...filters, scope: e.target.value })
            }
          >
            <option value="All">All workstreams</option>
            {scopes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Search scoped roles
          <input
            type="search"
            value={filters.query}
            placeholder="Role, workstream or bound worker"
            onChange={(e) =>
              changeFilters({ ...filters, query: e.target.value })
            }
          />
        </label>
        <label>
          Scope records
          <select
            value={filters.coverage}
            onChange={(e) =>
              changeFilters({
                ...filters,
                coverage: e.target.value as RoleFilters["coverage"],
              })
            }
          >
            <option value="all">All declared requirements</option>
            <option value="unbound">No binding represented in scope</option>
            <option value="no-assignments">
              Binding without scoped assignment
            </option>
            <option value="gaps">Known scope gaps</option>
            <option value="unknown">Unknown scope relationship</option>
          </select>
        </label>
        <button className="button secondary" onClick={reset}>
          Clear scope filters
        </button>
      </section>
      <details className="organization-disclosure org-overview-section">
        <summary>Role × workstream overview</summary>
        <div
          className="scope-matrix-scroll"
          role="region"
          aria-label="Role scope matrix"
          tabIndex={0}
        >
          <table className="scope-matrix">
            <caption>
              Explicit role requirements by workstream. Not modeled does not
              mean a role is missing or unnecessary.
            </caption>
            <thead>
              <tr>
                <th scope="col">Role</th>
                {scopes.map((s) => (
                  <th scope="col" key={s.id}>
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scenario.roles.map((role) => (
                <tr key={role.name}>
                  <th scope="row">{role.name}</th>
                  {scopes.map((s) => {
                    const r = rows.find(
                      (r) => r.role === role.name && r.scopeId === s.id,
                    );
                    return (
                      <td key={s.id}>
                        {r ? (
                          <button
                            className="text-link"
                            onClick={() =>
                              onFilters({
                                view: "scope",
                                scope: s.id,
                                query: role.name,
                                coverage: "all",
                              })
                            }
                          >
                            Inspect {role.name} · {s.streamId}
                            <br />
                            {r.bindingState === "unknown"
                              ? "Scope relationship unknown"
                              : `${r.bindings.length} binding · ${r.assignments.length} assignment`}
                            <br />
                            {r.gaps.length} known gap
                          </button>
                        ) : (
                          <span>Not modeled · coverage unknown</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <p
        id="scope-role-results"
        tabIndex={-1}
        className="personal-queue-results"
        role="status"
      >
        {shown.length} of {scoped.length} scoped role requirements shown
        {shown.length > 0 &&
          ` · Showing ${start + 1}–${Math.min(start + rolePageSize, shown.length)} · Page ${page} of ${pages}`}
      </p>
      {shown.length === 0 ? (
        <DetailEmptyState>
          No matching declared scope records. Coverage is not established by an
          empty result.
          <button className="button secondary" onClick={reset}>
            Show scope records
          </button>
        </DetailEmptyState>
      ) : (
        <div className="org-stream-grid">
          {shown.slice(start, start + rolePageSize).map((r) => (
            <article
              className="panel org-stream"
              aria-label={`${r.role} · ${r.scope.label}`}
              key={r.id}
            >
              <div className="eyebrow">WORKSTREAM SCOPE · {r.scopeId}</div>
              <h2>{r.role}</h2>
              <h3>{r.scope.label}</h3>
              <p>
                <strong>
                  {r.bindingState === "declared"
                    ? "Binding relationship declared"
                    : r.bindingState === "none"
                      ? "No binding represented in this scope"
                      : "Binding scope relationship unknown"}
                </strong>
              </p>
              {r.note && <p>{r.note}</p>}
              <h3>Declared bindings · {r.bindings.length}</h3>
              {r.bindings.map((b) => (
                <div className="org-stream-assignment" key={b.id}>
                  <button
                    className="text-link"
                    onClick={() => onWorker(b.workerId)}
                  >
                    {name(b.workerId)} · {b.id}
                  </button>
                  <ul>
                    {b.scopeIds.map((id) => {
                      const s = scenario.scopes.find((s) => s.id === id)!;
                      return (
                        <li key={id}>
                          {s.kind} · {s.label}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
              {r.unresolvedBindings.map((b) => (
                <p key={b.id}>
                  Unresolved scope relationship:{" "}
                  <button
                    className="text-link"
                    onClick={() => onWorker(b.workerId)}
                  >
                    {name(b.workerId)} · {b.id}
                  </button>
                  . This binding is not counted as declared coverage.
                </p>
              ))}
              <h3>Scoped assignments · {r.assignments.length}</h3>
              {r.assignments.length ? (
                r.assignments.map(({ assignment: a, binding: b }) => (
                  <div className="org-stream-assignment" key={a.id}>
                    <button
                      className="text-link"
                      onClick={() => onAssignment(a.id)}
                    >
                      {a.id} · {a.title}
                    </button>
                    <p>
                      {a.workerId ? name(a.workerId) : "Unassigned"} ·{" "}
                      {completed[a.id]
                        ? "Local response recorded · outcome unverified"
                        : a.state}
                    </p>
                    <p>
                      {b && r.bindingIds.includes(b.id)
                        ? `Declared assignment link · ${b.id}`
                        : a.workerId
                          ? "Assignment-to-binding relationship unknown"
                          : "No worker allocation or binding link represented"}
                    </p>
                  </div>
                ))
              ) : (
                <p>
                  No scoped assignment represented. A binding alone does not
                  allocate work.
                </p>
              )}
              <h3>Known gaps · {r.gaps.length}</h3>
              {r.gaps.length ? (
                r.gaps.map((g) => (
                  <p key={g.id}>
                    <strong>{g.title}</strong>
                    <br />
                    {g.description}
                  </p>
                ))
              ) : (
                <p>
                  No explicit gap recorded; completeness is not established.
                </p>
              )}
              {r.scope.kind === "workstream" && (
                <button
                  className="button secondary"
                  onClick={() => {
                    if (r.scope.kind === "workstream")
                      onStream(r.scope.streamId);
                  }}
                >
                  Inspect scoped workstream · {r.scope.streamId}
                </button>
              )}
            </article>
          ))}
        </div>
      )}
      {pages > 1 && (
        <nav className="directory-pagination" aria-label="Scoped role pages">
          <button
            className="button secondary"
            disabled={page === 1}
            onClick={() => {
              onFilters({ ...filters, page: page - 1 });
              requestAnimationFrame(() =>
                document.getElementById("scope-role-results")?.focus(),
              );
            }}
          >
            Previous scoped roles
          </button>
          <span>
            Page {page} of {pages}
          </span>
          <button
            className="button secondary"
            disabled={page === pages}
            onClick={() => {
              onFilters({ ...filters, page: page + 1 });
              requestAnimationFrame(() =>
                document.getElementById("scope-role-results")?.focus(),
              );
            }}
          >
            Next scoped roles
          </button>
        </nav>
      )}
      <details className="organization-disclosure org-overview-section">
        <summary>Scopes outside the workstream view</summary>
        <p>
          Project, environment, subject and organization scopes are distinct.
          They do not automatically apply to a workstream.
        </p>
        {scenario.scopes
          .filter((s) => s.kind !== "workstream")
          .map((s) => (
            <article
              className="panel org-stream"
              key={s.id}
              aria-label={s.label}
            >
              <h3>
                {s.kind} · {s.label}
              </h3>
              <p>Scope ID · {s.id}</p>
              {scenario.bindings
                .filter((b) => b.scopeIds.includes(s.id))
                .map((b) => (
                  <p key={b.id}>
                    <button
                      className="text-link"
                      onClick={() => onWorker(b.workerId)}
                    >
                      {name(b.workerId)} · {b.role} · {b.id}
                    </button>
                  </p>
                ))}
              {scenario.assignmentScopes
                .filter((a) => a.scopeId === s.id)
                .map((a) => (
                  <p key={a.assignmentId}>
                    <button
                      className="text-link"
                      onClick={() => onAssignment(a.assignmentId)}
                    >
                      Inspect scoped assignment · {a.assignmentId}
                    </button>
                  </p>
                ))}
            </article>
          ))}
      </details>
    </>
  );
}
