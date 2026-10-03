import type { EvidenceArtifact } from "./data/evidence";
import { assignments } from "./data/assignments";
import { evidenceArtifacts } from "./data/evidence";
import { workstreams } from "./data/organizationOverview";
import type { Assignment, ResponseRecord } from "./data/models";

export function OrganizationActivity({
  receipts,
  onOpen,
  onInspect,
  onBack,
  filters,
  onFilters,
}: {
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
  const count =
    (type !== "evidence" ? responses.length : 0) +
    (type !== "responses" ? evidence.length : 0);
  function open(id: string) {
    const assignment = assignments.find((a) => a.id === id);
    if (assignment) onOpen(assignment, "Activity");
  }
  function context(id: string) {
    const stream = workstreams.find((s) => s.id === scopeFor(id));
    return `${id} · ${stream?.name ?? "Other organization work"}`;
  }
  return (
    <>
      <button className="button secondary" onClick={onBack}>
        Back to Organization
      </button>
      <div className="page-heading workstream-heading">
        <div>
          <div className="eyebrow">ORGANIZATION ACTIVITY</div>
          <h1 tabIndex={-1}>Records across the organization</h1>
          <p>
            Local responses and attached sample evidence, connected to their
            assignment and modeled workstream.
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
        {type !== "evidence" && (
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
            {responses.length === 0 && <p>No local responses in this scope.</p>}
          </section>
        )}
        {type !== "responses" && (
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
              <p>No attached evidence in this scope.</p>
            )}
          </section>
        )}
        {count === 0 && (
          <p>
            No matching records. The absence of records does not establish an
            outcome.
          </p>
        )}
      </section>
    </>
  );
}
