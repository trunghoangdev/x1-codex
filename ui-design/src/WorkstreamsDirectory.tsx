import { DetailBackButton, DetailEmptyState } from "./DetailPresentation";
import {
  mainOrganization,
  type OrganizationScenario,
} from "./data/organizationScenario";

import {
  defaultStreamFilters,
  type StreamFilters,
} from "./data/workstreamDirectory";
export function WorkstreamsDirectory({
  scenario = mainOrganization,
  filters,
  onFilters,
  onOpen,
  onBack,
}: {
  scenario?: OrganizationScenario;
  filters: StreamFilters;
  onFilters: (filters: StreamFilters) => void;
  onOpen: (id: string) => void;
  onBack: () => void;
}) {
  const { streams: workstreams, gaps: responsibilityGaps, outcomes } = scenario;
  const rows = workstreams.map((stream) => ({
    stream,
    gaps: responsibilityGaps.filter((gap) => gap.workstreamId === stream.id),
    outcome: outcomes.find((outcome) => outcome.streamId === stream.id),
  }));
  const visible = rows.filter(
    ({ stream, gaps, outcome }) =>
      `${stream.id} ${stream.name} ${stream.goal} ${stream.project}`
        .toLowerCase()
        .includes(filters.query.trim().toLowerCase()) &&
      (filters.project === "All" || stream.project === filters.project) &&
      (filters.signal === "all" ||
        (filters.signal === "responsibility"
          ? gaps.length > 0
          : !!outcome?.criteria.some((criterion) => criterion.gap))),
  );
  return (
    <div className="detail-page">
      <DetailBackButton onClick={onBack}>Back to Organization</DetailBackButton>
      <div className="page-heading">
        <div>
          <div className="eyebrow">ORGANIZATION DIRECTORY</div>
          <h1 tabIndex={-1}>Workstreams</h1>
          <p>
            Find shared goals and the coordination or evidence still needed.
          </p>
        </div>
      </div>
      <p className="org-overview-section">
        {scenario.name} · {workstreams.length} workstreams. Responsibility
        signals come from explicit gaps; outcome signals come from unmet sample
        evidence requirements. Proposals and recorded responses do not resolve
        either signal. Counts describe the selected sample scenario.
      </p>
      <section
        className="panel stream-directory-filters"
        aria-label="Workstream filters"
      >
        <label>
          Search workstreams
          <input
            type="search"
            value={filters.query}
            onChange={(event) =>
              onFilters({ ...filters, query: event.target.value })
            }
            placeholder="Name, ID, goal or project"
          />
        </label>
        <label>
          Project
          <select
            value={filters.project}
            onChange={(event) =>
              onFilters({ ...filters, project: event.target.value })
            }
          >
            <option value="All">All projects</option>
            {[...new Set(workstreams.map((s) => s.project))].map((project) => (
              <option key={project}>{project}</option>
            ))}
          </select>
        </label>
        <label>
          Attention signal
          <select
            value={filters.signal}
            onChange={(event) =>
              onFilters({
                ...filters,
                signal: event.target.value as StreamFilters["signal"],
              })
            }
          >
            <option value="all">All signals</option>
            <option value="responsibility">Missing responsibility</option>
            <option value="outcome">Unverified outcome</option>
          </select>
        </label>
        <button
          className="button secondary"
          onClick={() => onFilters(defaultStreamFilters)}
        >
          Clear filters
        </button>
      </section>
      <p className="org-overview-section" role="status">
        {visible.length} of {rows.length} workstreams
      </p>
      {visible.length === 0 ? (
        <DetailEmptyState>
          No matching workstreams. Change your search or clear the filters to
          see the sample workstreams.
          <button
            className="button secondary"
            onClick={() => {
              onFilters(defaultStreamFilters);
              requestAnimationFrame(() =>
                document
                  .querySelector<HTMLElement>('input[type="search"]')
                  ?.focus(),
              );
            }}
          >
            Show all workstreams
          </button>
        </DetailEmptyState>
      ) : (
        <div className="org-stream-grid">
          {visible.map(({ stream, gaps, outcome }) => (
            <article
              className="panel org-stream"
              key={stream.id}
              aria-label={stream.name}
            >
              <div className="eyebrow">
                {stream.id} · {stream.project}
              </div>
              <h2>{stream.name}</h2>
              <p>{stream.goal}</p>
              <p>
                <strong>Responsibility:</strong>{" "}
                {gaps.length
                  ? `${gaps.length} explicit gaps`
                  : "No explicit gap recorded"}
              </p>
              {gaps.length > 0 && (
                <ul>
                  {gaps.map((gap) => (
                    <li key={gap.id}>{gap.title}</li>
                  ))}
                </ul>
              )}
              <p>
                <strong>Outcome:</strong>{" "}
                {outcome?.criteria.some((c) => c.gap)
                  ? "Unverified · evidence gaps remain"
                  : "No outcome signal represented"}
              </p>
              <p>{stream.outcome}</p>
              <p>
                {stream.assignmentIds.length} linked assignment
                {stream.assignmentIds.length === 1 ? "" : "s"} · authored
                membership
              </p>
              <button
                className="button secondary"
                onClick={() => onOpen(stream.id)}
              >
                Open workstream · {stream.id}
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
