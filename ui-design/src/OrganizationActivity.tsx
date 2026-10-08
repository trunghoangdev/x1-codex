import { coordinationActivity } from "./data/coordinationActivity";
import type { ResponsibilityProposal } from "./data/responsibilityProposals";
import { workers } from "./data/organizationOverview";
import { DetailBackButton, DetailEmptyState } from "./DetailPresentation";
import type { EvidenceArtifact } from "./data/evidence";
import { assignments } from "./data/assignments";
import { evidenceArtifacts } from "./data/evidence";
import { workstreams } from "./data/organizationOverview";
import type { Assignment, ResponseRecord } from "./data/models";

export function OrganizationActivity({
  proposals,
  onProposal,
  receipts,
  onOpen,
  onInspect,
  onBack,
  filters,
  onFilters,
}: {
  proposals: Record<string, ResponsibilityProposal>;
  onProposal: (gapId: string) => void;
  receipts: ResponseRecord[];
  onOpen: (assignment: Assignment, tab?: string) => void;
  onInspect: (artifact: EvidenceArtifact) => void;
  onBack: () => void;
  filters: { scope: string; type: string };
  onFilters: (filters: { scope: string; type: string }) => void;
}) {
  const { scope, type } = filters;
  const setScope = (scope: string) => onFilters({ ...filters, scope });
  const setType = (type: string) => onFilters({ ...filters, type });
  const scopeFor = (id: string) =>
    workstreams.find((stream) => stream.assignmentIds.includes(id))?.id ??
    "other";
  const matches = (id: string) => scope === "all" || scopeFor(id) === scope;
  const responses = receipts
    .filter((record) => matches(record.assignmentId))
    .slice()
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
  const evidence = evidenceArtifacts.filter((record) =>
    matches(record.assignmentId),
  );
  const coordination = coordinationActivity(proposals).filter(
    (record) =>
      (scope === "all" || record.streamId === scope) &&
      (type === "all" || type === record.kind),
  );
  const count =
    (["all", "responses"].includes(type) ? responses.length : 0) +
    (["all", "evidence"].includes(type) ? evidence.length : 0) +
    coordination.length;
  function open(id: string) {
    const assignment = assignments.find((a) => a.id === id);
    if (assignment) onOpen(assignment, "Activity");
  }
  function context(id: string) {
    const stream = workstreams.find((s) => s.id === scopeFor(id));
    return `${id} · ${stream?.name ?? "Other organization work"}`;
  }
  return (
    <div className="detail-page">
      <DetailBackButton onClick={onBack}>Back to Organization</DetailBackButton>
      <div className="page-heading workstream-heading">
        <div>
          <div className="eyebrow">ORGANIZATION ACTIVITY</div>
          <h1 tabIndex={-1}>Records across the organization</h1>
          <p>
            Proposals, allocation-plan decisions, responses and sample evidence,
            connected to their subjects and modeled workstreams.
          </p>
        </div>
      </div>
      <section
        className="panel org-stream"
        aria-label="Organization activity records"
      >
        <div className="org-filters">
          <label>
            Scope
            <select
              aria-label="Activity scope"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
            >
              <option value="all">All organization work</option>
              {workstreams.map((stream) => (
                <option key={stream.id} value={stream.id}>
                  {stream.name}
                </option>
              ))}
              <option value="other">Other organization work</option>
            </select>
          </label>
          <label>
            Record type
            <select
              aria-label="Organization activity type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="all">All records</option>
              <option value="responses">Local responses</option>
              <option value="evidence">Sample evidence</option>
              <option value="proposals">Responsibility proposals</option>
              <option value="decisions">Allocation-plan decisions</option>
              <option value="allocations">Local allocations</option>
            </select>
          </label>
          <button
            className="button secondary"
            onClick={() => {
              onFilters({ scope: "all", type: "all" });
            }}
          >
            Reset activity filters
          </button>
        </div>
        <p role="status">{count} matching records</p>
        {["all", "proposals", "decisions", "allocations"].includes(type) && (
          <section aria-label="Organization coordination records">
            <h2>Local coordination · newest first</h2>
            <p>
              Local demo proposal, plan-decision and allocation records.
              Accepting a plan does not create an allocation. Unallocated
              proposals can be removed; allocated proposals are retained until
              an explicit continuity reset or replacement. Reload restores only
              the last explicitly saved snapshot. This is not a permanent audit
              log.
            </p>
            {coordination.map((record) => (
              <article
                className="org-stream-assignment"
                key={record.id}
                aria-label={record.title}
              >
                <span className="section-label">
                  {record.streamId} · {record.scope}
                </span>
                <h3>{record.title}</h3>
                <p>
                  {record.actor} ·{" "}
                  <time dateTime={record.recordedAt}>
                    {new Date(record.recordedAt).toLocaleString()}
                  </time>
                </p>
                <p>
                  Proposed worker:{" "}
                  {
                    workers.find((worker) => worker.id === record.workerId)
                      ?.name
                  }{" "}
                  · {record.role}
                </p>
                <p>{record.rationale}</p>
                <p>{record.boundary}</p>
                <button
                  className="text-link"
                  onClick={() => onProposal(record.gapId)}
                >
                  Inspect coordination receipt · {record.title}
                </button>
              </article>
            ))}
            {coordination.length === 0 && (
              <DetailEmptyState>
                No local coordination records in this scope and type.
              </DetailEmptyState>
            )}
            <p>
              Each dated section is ordered independently. Undated sample
              evidence is not part of this chronology.
            </p>
          </section>
        )}
        {["all", "responses"].includes(type) && (
          <section aria-label="Organization local responses">
            <h2>Local responses · newest first</h2>
            <p>
              Recorded in this browser session; refreshing clears these
              receipts. Responses do not confirm handoffs, execution or goal
              achievement.
            </p>
            {responses.map((record) => (
              <article className="org-stream-assignment" key={record.id}>
                <span className="section-label">
                  {context(record.assignmentId)}
                </span>
                <h3>
                  {record.decision}
                  {record.assessment
                    ? ` · ${record.assessment.conclusion}`
                    : ""}
                </h3>
                <p>
                  {record.actor} · {record.role} ·{" "}
                  <time dateTime={record.recordedAt}>
                    {new Date(record.recordedAt).toLocaleString()}
                  </time>
                </p>
                <p>Subject: {record.subject.label}</p>
                <p>{record.rationale}</p>
                <button
                  className="text-link"
                  onClick={() => open(record.assignmentId)}
                >
                  Inspect response · {record.assignmentId}
                </button>
              </article>
            ))}
            {responses.length === 0 && (
              <DetailEmptyState>
                No local responses in this scope.
              </DetailEmptyState>
            )}
          </section>
        )}
        {["all", "evidence"].includes(type) && (
          <section aria-label="Organization attached evidence">
            <h2>Attached sample evidence</h2>
            <p>
              Publication times are unavailable. These records are listed
              separately from dated responses; their order does not establish an
              event sequence.
            </p>
            {evidence.map((record) => (
              <article className="org-stream-assignment" key={record.id}>
                <span className="section-label">
                  {context(record.assignmentId)}
                </span>
                <h3>
                  {record.id} · {record.title}
                </h3>
                <p>{record.detail}</p>
                <p>Producer: {record.producer}</p>
                <button className="text-link" onClick={() => onInspect(record)}>
                  Inspect record · {record.id}
                </button>
                <p>
                  <button
                    className="text-link"
                    onClick={() => open(record.assignmentId)}
                  >
                    Assignment activity · {record.assignmentId}
                  </button>
                </p>
              </article>
            ))}
            {evidence.length === 0 && (
              <DetailEmptyState>
                No attached evidence in this scope.
              </DetailEmptyState>
            )}
          </section>
        )}
        {count === 0 && (
          <DetailEmptyState>
            No matching records. The absence of records does not establish an
            outcome.
          </DetailEmptyState>
        )}
      </section>
    </div>
  );
}
