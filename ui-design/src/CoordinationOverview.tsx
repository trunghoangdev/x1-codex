import type { OrganizationScenario } from "./data/organizationScenario";
import {
  coordinationRows,
  defaultCoordinationFilters,
  filteredCoordinationRows,
  type CoordinationFilters,
} from "./data/coordinationOverview";
import { DetailEmptyState } from "./DetailPresentation";
export function CoordinationOverview({
  scenario,
  filters,
  onFilters,
  onAssignment,
  onStream,
  onOutcome,
  onDirectory,
}: {
  scenario: OrganizationScenario;
  filters: CoordinationFilters;
  onFilters: (f: CoordinationFilters) => void;
  onAssignment: (id: string) => void;
  onStream: (id: string) => void;
  onOutcome?: (id: string) => void;
  onDirectory: () => void;
}) {
  const all = coordinationRows(scenario);
  const rows = filteredCoordinationRows(scenario, filters);
  const pages = Math.max(1, Math.ceil(rows.length / 4));
  const page = Math.min(filters.page ?? 1, pages);
  const start = (page - 1) * 4;
  const reset = () => {
    onFilters(defaultCoordinationFilters);
    requestAnimationFrame(() =>
      document.getElementById("coordination-search")?.focus(),
    );
  };
  const move = (page: number) => {
    onFilters({ ...filters, page });
    requestAnimationFrame(() =>
      document.getElementById("coordination-results")?.focus(),
    );
  };
  const person = (id?: string) =>
    scenario.workers.find((w) => w.id === id)?.name ?? "Unassigned";
  return (
    <section
      className="org-overview-section"
      aria-label="Organization workstreams"
    >
      <h2 id="org-goals" tabIndex={-1}>
        Coordination by workstream
      </h2>
      <p>
        Inspect the responsibility, input, response and outcome evidence records
        that need coordination. Categories can overlap; counts are not a
        progress or urgency score.
      </p>
      <div
        className="stream-directory-filters panel"
        aria-label="Coordination filters"
      >
        <label>
          Search coordination
          <input
            id="coordination-search"
            type="search"
            value={filters.query}
            placeholder="Workstream, goal or project"
            onChange={(e) =>
              onFilters({ ...filters, query: e.target.value, page: undefined })
            }
          />
        </label>
        <label>
          Coordination need
          <select
            value={filters.signal}
            onChange={(e) =>
              onFilters({
                ...filters,
                signal: e.target.value as CoordinationFilters["signal"],
                page: undefined,
              })
            }
          >
            <option value="all">All workstreams</option>
            <option value="responsibility">Responsibility gaps</option>
            <option value="input">Missing inputs</option>
            <option value="response">Pending responses</option>
            <option value="outcome">Outcome evidence needs</option>
          </select>
        </label>
        <button className="button secondary" onClick={reset}>
          Clear coordination filters
        </button>
      </div>
      <p id="coordination-results" tabIndex={-1} role="status">
        {rows.length} of {all.length} workstreams
        {rows.length > 0 &&
          ` · Showing ${start + 1}–${Math.min(start + 4, rows.length)} · Page ${page} of ${pages}`}
      </p>
      {rows.length === 0 ? (
        <DetailEmptyState>
          No matching workstreams. Empty results do not establish that
          coordination is complete.
          <button className="button secondary" onClick={reset}>
            Show all coordination
          </button>
        </DetailEmptyState>
      ) : (
        <div className="org-stream-grid">
          {rows.slice(start, start + 4).map((r) => (
            <article
              key={r.stream.id}
              aria-label={r.stream.name}
              className="panel org-stream coordination-card"
            >
              <div className="eyebrow">
                {r.stream.id} · {r.stream.project}
              </div>
              <h3>{r.stream.name}</h3>
              <p>{r.stream.goal}</p>
              <dl className="coordination-counts">
                <div>
                  <dt>Responsibility gaps</dt>
                  <dd>{r.gaps.length}</dd>
                </div>
                <div>
                  <dt>Missing inputs</dt>
                  <dd>{r.inputs.length}</dd>
                </div>
                <div>
                  <dt>Pending responses</dt>
                  <dd>{r.responses.length}</dd>
                </div>
                <div>
                  <dt>Outcome evidence needs</dt>
                  <dd>{r.criteria.length}</dd>
                </div>
              </dl>
              {r.inputs.map((d) => {
                const providerRef = d.provider;
                const provider =
                  "assignmentId" in providerRef
                    ? scenario.assignments.find(
                        (a) => a.id === providerRef.assignmentId,
                      )
                    : undefined;
                const receiver = scenario.assignments.find(
                  (a) => a.id === d.receiverAssignmentId,
                )!;
                return (
                  <div key={d.id} className="coordination-input-summary">
                    <p>
                      <strong>
                        {person(receiver.workerId)} waits for {d.input}
                      </strong>
                      {provider
                        ? ` from ${person(provider.workerId)}.`
                        : ". Provider assignment is not represented."}
                    </p>
                    {provider && (
                      <button
                        className="text-link"
                        onClick={() => onAssignment(provider.id)}
                      >
                        Inspect input provider · {provider.id}
                      </button>
                    )}
                    <button
                      className="text-link"
                      onClick={() => onAssignment(receiver.id)}
                    >
                      Inspect waiting assignment · {receiver.id}
                    </button>
                    <p>Input missing · delivery/receipt unconfirmed</p>
                  </div>
                );
              })}
              <details className="directory-record-details">
                <summary>Inspect coordination records · {r.stream.id}</summary>
                <h4>Responsibility gaps</h4>
                {r.gaps.length ? (
                  r.gaps.map((g) => (
                    <p key={g.id}>
                      <strong>{g.title}</strong>
                      <br />
                      {g.description}
                      <br />
                      <button
                        className="text-link"
                        onClick={() => onStream(g.workstreamId)}
                      >
                        Inspect responsibility source · {g.id}
                      </button>
                    </p>
                  ))
                ) : (
                  <p>
                    No explicit responsibility gap represented. Coverage is not
                    audited.
                  </p>
                )}
                <h4>Pending responses</h4>
                {r.responses.length ? (
                  r.responses.map((a) => (
                    <p key={a.id}>
                      <button
                        className="text-link"
                        onClick={() => onAssignment(a.id)}
                      >
                        {a.id} · {a.title}
                      </button>
                      <br />
                      {person(a.workerId)} · {a.role}
                      <br />
                      {a.expectedResponse ??
                        "Expected response not represented"}
                    </p>
                  ))
                ) : (
                  <p>
                    No pending response signal represented. This does not
                    establish completion.
                  </p>
                )}
                <h4>Outcome evidence needs</h4>
                {r.criteria.length ? (
                  r.criteria.map((c) => (
                    <p key={c.id}>
                      <strong>{c.title}</strong>
                      <br />
                      {c.gap}
                      <br />
                      <button
                        className="text-link"
                        onClick={() => (onOutcome ?? onStream)(r.stream.id)}
                      >
                        Inspect outcome requirement · {c.id}
                      </button>
                    </p>
                  ))
                ) : (
                  <p>
                    No missing-evidence criterion represented. Outcome
                    verification is not established.
                  </p>
                )}
              </details>
              <button
                className="button secondary"
                onClick={() => onStream(r.stream.id)}
              >
                Explore workstream · {r.stream.id}
              </button>
            </article>
          ))}
        </div>
      )}
      {pages > 1 && (
        <nav aria-label="Coordination pages" className="directory-pagination">
          <button
            className="button secondary"
            disabled={page === 1}
            onClick={() => move(page - 1)}
          >
            Previous coordination
          </button>
          <span>
            Page {page} of {pages}
          </span>
          <button
            className="button secondary"
            disabled={page === pages}
            onClick={() => move(page + 1)}
          >
            Next coordination
          </button>
        </nav>
      )}
      <p>
        <button className="button secondary" onClick={onDirectory}>
          Browse workstreams
        </button>
      </p>
    </section>
  );
}
