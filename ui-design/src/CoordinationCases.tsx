import { CaseLifecycle } from "./CaseLifecycle";
import {
  caseProgress,
  operationalCaseId,
  type CaseContext,
  type CaseEvent,
} from "./data/caseLifecycle";
import type { OrganizationScenario } from "./data/organizationScenario";
import {
  coordinationCases,
  filteredCases,
  defaultCaseFilters,
  type CaseFilters,
} from "./data/coordinationCases";
import { DetailBackButton } from "./DetailPresentation";
export function CoordinationCases({
  caseEvents,
  caseContext,
  onCaseEvents,
  scenario,
  caseId,
  filters,
  onFilters,
  onBack,
  onCase,
  onSource,
}: {
  caseEvents: CaseEvent[];
  caseContext: CaseContext;
  onCaseEvents: (events: CaseEvent[]) => void;
  scenario: OrganizationScenario;
  caseId?: string;
  filters: CaseFilters;
  onFilters: (f: CaseFilters) => void;
  onBack: () => void;
  onCase: (id: string) => void;
  onSource: (path: string) => void;
}) {
  const all = coordinationCases(scenario),
    selected = all.find((c) => c.id === caseId),
    rows = filteredCases(scenario, filters);
  const owner = (c: (typeof all)[number]) =>
    c.owner.state === "assigned"
      ? (scenario.workers.find(
          (w) => c.owner.state === "assigned" && w.id === c.owner.workerId,
        )?.name ?? "Worker not represented")
      : "Follow-up owner unknown";
  const reset = () => {
    onFilters(defaultCaseFilters);
    requestAnimationFrame(() =>
      document.getElementById("case-search")?.focus(),
    );
  };
  return (
    <div className="detail-page">
      <DetailBackButton onClick={onBack}>
        Back to scenario context
      </DetailBackButton>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            KNOWLEDGE OPERATIONS · AUTHORED COORDINATION
          </div>
          <h1 tabIndex={-1}>
            {selected ? selected.title : "Coordination cases"}
          </h1>
          <p>
            Ownership of follow-up, next action and evidence needed to resolve a
            coordination question.
          </p>
        </div>
      </div>
      <div className="org-banner">
        <div>
          <h2>Follow-up responsibility</h2>
          <p>
            A case owner coordinates this issue; that does not allocate tasks,
            grant decision authority or verify the workstream outcome. These are
            authored case definitions. The workshop-brief case also has a
            separate local lifecycle; policy clarification remains read-only.
          </p>
        </div>
      </div>
      {selected ? (
        <>
          {selected.id === operationalCaseId && (
            <CaseLifecycle
              events={caseEvents}
              context={caseContext}
              onChange={onCaseEvents}
            />
          )}
          <details
            open={!caseEvents.length || selected.id !== operationalCaseId}
          >
            <summary>Authored case requirements and source records</summary>
            <section
              className="panel org-stream org-overview-section"
              aria-label="Case follow-up"
            >
              <div className="eyebrow">
                {selected.id} · {selected.streamId}
              </div>
              <h2>{selected.status}</h2>
              <h3>Who is following up?</h3>
              <p>
                <strong>{owner(selected)}</strong>
              </p>
              <p>
                {selected.owner.state === "assigned"
                  ? selected.owner.mandate
                  : selected.owner.detail}
              </p>
              {selected.owner.state === "assigned" && (
                <button
                  className="text-link"
                  onClick={() =>
                    onSource(
                      `/workers/${selected.owner.state === "assigned" ? selected.owner.workerId : ""}`,
                    )
                  }
                >
                  Inspect follow-up owner
                </button>
              )}
              <h3>Next coordination action</h3>
              <p>{selected.nextAction}</p>
              <h3>Waiting for</h3>
              <p>{selected.waitingFor}</p>
              <p>Priority and due date not represented.</p>
            </section>
            <section
              className="panel org-stream org-overview-section"
              aria-label="Case closure requirements"
            >
              <h2>What would resolve this case?</h2>
              <ul>
                {selected.closure.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <p>
                <strong>Resolution: not recorded.</strong> Conditions are
                requirements, not passed checks.
              </p>
              <p>{selected.boundary}</p>
            </section>
            <section
              className="panel org-stream"
              aria-label="Case source records"
            >
              <h2>Inspect the source</h2>
              <p>{selected.provenance}</p>
              {selected.source.dependencyId && (
                <p>Dependency · {selected.source.dependencyId}</p>
              )}
              {selected.source.providerAssignmentId && (
                <p>
                  <button
                    className="text-link"
                    onClick={() =>
                      onSource(
                        `/assignments/${selected.source.providerAssignmentId}`,
                      )
                    }
                  >
                    Inspect supplying responsibility ·{" "}
                    {selected.source.providerAssignmentId}
                  </button>
                </p>
              )}
              {selected.source.receiverAssignmentId && (
                <p>
                  <button
                    className="text-link"
                    onClick={() =>
                      onSource(
                        `/assignments/${selected.source.receiverAssignmentId}`,
                      )
                    }
                  >
                    Inspect waiting responsibility ·{" "}
                    {selected.source.receiverAssignmentId}
                  </button>
                </p>
              )}
              {selected.source.gapId && (
                <p>
                  <button
                    className="text-link"
                    onClick={() =>
                      onSource(`/workstreams/${selected.streamId}`)
                    }
                  >
                    Inspect responsibility gap · {selected.source.gapId}
                  </button>
                </p>
              )}
              {selected.source.decisionId && (
                <p>
                  <button
                    className="text-link"
                    onClick={() => onSource("/decisions")}
                  >
                    Inspect decision requirement · {selected.source.decisionId}
                  </button>
                </p>
              )}
              <p>
                <button
                  className="text-link"
                  onClick={() => onSource(`/workflows/${selected.streamId}`)}
                >
                  Inspect related workflow · {selected.streamId}
                </button>
              </p>
            </section>
          </details>
        </>
      ) : (
        <>
          <div className="stream-directory-filters panel">
            <label>
              Search coordination cases
              <input
                id="case-search"
                type="search"
                value={filters.query}
                onChange={(e) =>
                  onFilters({ ...filters, query: e.target.value })
                }
              />
            </label>
            <label>
              Follow-up ownership
              <select
                value={filters.owner}
                onChange={(e) =>
                  onFilters({
                    ...filters,
                    owner: e.target.value as CaseFilters["owner"],
                  })
                }
              >
                <option value="all">All ownership</option>
                <option value="assigned">Assigned</option>
                <option value="unknown">Unknown</option>
              </select>
            </label>
            <label>
              Coordination question
              <select
                value={filters.need}
                onChange={(e) =>
                  onFilters({
                    ...filters,
                    need: e.target.value as CaseFilters["need"],
                  })
                }
              >
                <option value="all">All questions</option>
                <option value="input">Current input missing</option>
                <option value="policy">Decision policy unresolved</option>
              </select>
            </label>
            <button className="button secondary" onClick={reset}>
              Clear case filters
            </button>
          </div>
          <p role="status">
            {rows.length} of {all.length} authored cases. This is not a count of
            all organizational issues.
          </p>
          {rows.length ? (
            <div className="org-stream-grid">
              {rows.map((c) => (
                <article
                  className="panel org-stream"
                  key={c.id}
                  aria-label={c.title}
                >
                  <div className="eyebrow">
                    {c.id} · {c.streamId}
                  </div>
                  <h2>{c.title}</h2>
                  <span className="badge neutral">
                    {c.id === operationalCaseId && caseEvents.length
                      ? caseProgress(caseEvents, caseContext).status
                      : c.status}
                  </span>
                  <p>
                    <strong>Follow-up:</strong> {owner(c)}
                  </p>
                  <p>
                    <strong>Next action:</strong>{" "}
                    {c.id === operationalCaseId && caseEvents.length
                      ? caseProgress(caseEvents, caseContext).nextStep
                      : c.nextAction}
                  </p>
                  <button
                    className="button secondary"
                    onClick={() => onCase(c.id)}
                  >
                    Inspect coordination case · {c.id}
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <section className="panel org-stream">
              <h2>No matching coordination cases</h2>
              <p>
                An empty result does not establish that coordination is
                complete.
              </p>
              <button className="button secondary" onClick={reset}>
                Show all cases
              </button>
            </section>
          )}
        </>
      )}
    </div>
  );
}
