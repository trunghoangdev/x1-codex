import { contributionView } from "./data/contributionView";
import { ContributionExchange } from "./ContributionExchange";
import type { HumanContributionState } from "./data/humanContribution";
import {
  defaultScenarioWorkFilters,
  scenarioPersonalWork,
  type ScenarioWorkFilters,
} from "./data/scenarioWork";
import { DetailEmptyState } from "./DetailPresentation";
import { CoordinationInputs } from "./CoordinationInputs";
import type { OrganizationScenario } from "./data/organizationScenario";
import { DetailBackButton } from "./DetailPresentation";
import { personalCaseFollowUp } from "./data/coordinationCases";
export function ScenarioMyWork({
  scenario,
  workerId,
  onAssignment,
  onStream,
  onOrganization,
  onWorker,
  filters,
  onFilters,
  onCase,
  onContribution,
  contribution,
  onContributionChange,
}: {
  onContribution: () => void;
  contribution: HumanContributionState;
  onContributionChange: (state: HumanContributionState) => void;
  scenario: OrganizationScenario;
  workerId: string;
  filters: ScenarioWorkFilters;
  onFilters: (filters: ScenarioWorkFilters) => void;
  onAssignment: (id: string) => void;
  onStream: (id: string) => void;
  onOrganization: () => void;
  onWorker: (id: string) => void;
  onCase: (id: string) => void;
}) {
  const contributionStatus = contributionView(contribution);
  const personalScenario = scenario.id === "knowledge" ? {...scenario, assignments: scenario.assignments.map(a => a.id === "K-01-H" ? {...a, state:contributionStatus.stage, responseNeeded: contributionStatus.stage === "Acceptance pending" || contributionStatus.attention === "revision" || contributionStatus.attention === "command" || contributionStatus.stage === "Submission rejected"} : a)} : scenario;
  const worker = scenario.workers.find((w) => w.id === workerId)!;
  const {
    allocated: mine,
    shown,
    response,
    waiting,
    both,
  } = scenarioPersonalWork(personalScenario, workerId, filters);
  const followUp = personalCaseFollowUp(scenario, workerId, filters);
  const roles = [...new Set(mine.map((a) => a.role))];
  if (filters.role !== "All" && !roles.includes(filters.role))
    roles.push(filters.role);
  const streamIds = [
    ...new Set([
      ...mine.map((a) => a.streamId).filter((id): id is string => !!id),
      ...followUp.owned.map((c) => c.streamId),
    ]),
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
          <div className="eyebrow">PERSONAL INBOX · AUTHORED SAMPLE</div>
          <h1 tabIndex={-1}>My Work · {worker.name}</h1>
          <p>
            Explicitly allocated assignments and case follow-up ownership.
            Organization retains the shared goals and gaps.
          </p>
        </div>
      </div>
      {scenario.id === "knowledge" && workerId === "maya" && <ContributionExchange state={contribution} receiver onChange={onContributionChange} />}
      <p className="org-overview-section" role="status">
        {mine.length} assignments · {response} awaiting your response ·{" "}
        {waiting} waiting for input
      </p>
      {scenario.id === "knowledge" && workerId === "leo" && <p>K-01-H status and response flags follow the local contribution records, including restored/imported work. Other assignment flags remain authored context. Receiver receipt is not a missing input.</p>}
      <details className="personal-queue-note directory-record-details">
        <summary>How assignment counts work</summary>
        <p>
          Assignment counts cover your full assignment inbox. Response and
          waiting-input flags can overlap ({both} in both); they are not added
          together or inferred from role bindings. Input availability remains
          unverified unless explicitly represented.
        </p>
      </details>
      <section
        className="panel stream-directory-filters"
        aria-label="Personal work filters"
      >
        <label>
          Search my work
          <input
            type="search"
            placeholder="Assignment, case, goal or input"
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
      {scenario.id === "knowledge" && (
        <section
          className="org-overview-section"
          aria-label="My coordination follow-up"
        >
          <h2>My coordination follow-up</h2>
          <p>
            Search and workstream filters apply to cases. Assignment role and
            work attention filters apply only to assignments.
          </p>
          <p role="status">
            {followUp.shown.length} of {followUp.owned.length} owned cases shown
          </p>
          {followUp.owned.length === 0 ? (
            <p>
              No case follow-up ownership is represented for you. Unknown owners
              and role bindings do not place cases in your inbox.
            </p>
          ) : followUp.shown.length === 0 ? (
            <p>
              No matching owned cases. Search and workstream filters do not
              change your ownership.
            </p>
          ) : (
            <div className="org-stream-grid">
              {followUp.shown.map((c) => (
                <article
                  className="panel org-stream"
                  aria-label={`My case · ${c.id}`}
                  key={c.id}
                >
                  <div className="eyebrow">CASE FOLLOW-UP · {c.streamId}</div>
                  <h3>{c.title}</h3>
                  <p>
                    <strong>{c.status}</strong>
                  </p>
                  <p>
                    <strong>Next action:</strong> {c.nextAction}
                  </p>
                  <p>
                    <strong>Waiting for:</strong> {c.waitingFor}
                  </p>
                  <p>
                    Resolution not recorded · follow-up responsibility only.
                  </p>
                  <button
                    className="button secondary"
                    onClick={() => onCase(c.id)}
                  >
                    Inspect my follow-up case · {c.id}
                  </button>
                  <p>
                    <button
                      className="text-link"
                      onClick={() => onStream(c.streamId)}
                    >
                      View case shared goal · {c.streamId}
                    </button>
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
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
          No matching assignments. Filters do not change your allocation.
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
                <strong>{a.id === "K-01-H" ? contributionStatus.stage : a.state}</strong>
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
              {a.id === "K-01-H" && <div>
                <p>Local exercise · reload starts empty. Use Save or restore Knowledge contribution to restore a saved browser checkpoint. Demos continuity remains separate.</p>
                <p role="status">{contributionStatus.summary}</p>
                <p>{contributionStatus.contributorNext}</p>
                {contribution.contributions.at(-1)?.assessment && <p role="status">Maya requested a revision · human-assessment-v1. Open contribution to prepare draft-02.</p>}
                <button className="button primary" onClick={onContribution}>Open contribution · K-01-H</button>
              </div>}
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
