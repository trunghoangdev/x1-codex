import type { OrganizationScenario } from "./data/organizationScenario";
import {
  walkthroughRecords as records,
  walkthroughSubject as subject,
} from "./data/collaborationWalkthrough";
import { DetailBackButton } from "./DetailPresentation";

export function CollaborationWalkthrough({
  scenario,
  recordId,
  onSelect,
  onBack,
  onSource,
}: {
  scenario: OrganizationScenario;
  recordId: string;
  onSelect: (id: string) => void;
  onBack: () => void;
  onSource: (path: string) => void;
}) {
  const index = records.findIndex((r) => r.id === recordId);
  const selected = records[index];
  const select = (id: string) => {
    onSelect(id);
    requestAnimationFrame(() =>
      document.getElementById("cycle-record-heading")?.focus(),
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
            KNOWLEDGE · FICTIONAL COLLABORATION CYCLE
          </div>
          <h1 tabIndex={-1}>From brief to outcome review</h1>
          <p>
            Follow one guide through preparation, independent exchanges and a
            scoped review.
          </p>
        </div>
      </div>
      <div className="org-banner">
        <div>
          <h2>Authored walkthrough · no live execution</h2>
          <p>
            These records form a separate example. Selecting a step inspects
            history; it does not send, acknowledge, approve or complete work.
            Current assignments, cases and evidence remain unchanged.
          </p>
        </div>
      </div>
      <section
        className="panel org-stream org-overview-section"
        aria-label="Cycle scope"
      >
        <h2>One subject, explicit revisions</h2>
        <p>{subject.id} · draft-01 → draft-02</p>
        <p>
          {subject.audience} Proposed agreement · {subject.agreement} · adoption
          not recorded
        </p>
        <p>
          Roles in this example: Researcher prepares/revises, Editor
          receives/assesses, Coordinator clarifies scope. Maya's outcome-review
          allocation is separately declared in the final record, not inferred
          from Editor responsibility.
        </p>
        <p>
          Editorial assessment and publication authority remain separate. No
          publication event or authorization policy is represented.
        </p>
      </section>
      <section
        className="panel stream-directory-filters org-overview-section"
        aria-label="Cycle record navigation"
      >
        <h2>Inspect the collaboration cycle</h2>
        <label htmlFor="cycle-record-select">
          Cycle record
          <select
            id="cycle-record-select"
            value={recordId}
            onChange={(e) => select(e.target.value)}
          >
            {records.map((r, i) => (
              <option key={r.id} value={r.id}>
                {i + 1}. {r.title} · {r.version}
              </option>
            ))}
          </select>
        </label>
        <p>
          <button
            className="button secondary"
            disabled={index === 0}
            onClick={() => select(records[index - 1].id)}
          >
            Previous record
          </button>{" "}
          <button
            className="button secondary"
            disabled={index === records.length - 1}
            onClick={() => select(records[index + 1].id)}
          >
            Next record
          </button>
        </p>
        <p role="status">
          Record {index + 1} of {records.length} · inspection only
        </p>
      </section>
      <section
        className="panel org-stream org-overview-section"
        aria-label="Selected cycle record"
      >
        <div className="eyebrow">
          {selected.kind} · {selected.id}
        </div>
        <h2 id="cycle-record-heading" tabIndex={-1}>
          {selected.title}
        </h2>
        <p>
          Subject · {subject.id} / {selected.version}
        </p>
        <p>
          Actor ·{" "}
          {scenario.workers.find((w) => w.id === selected.actorId)?.name}
        </p>
        <p>
          Authored timestamp · <time dateTime={selected.at}>{selected.at}</time>
        </p>
        <p>{selected.detail}</p>
        <h3>What this record establishes</h3>
        <p>{selected.proves}</p>
        <h3>Explicit source records</h3>
        {selected.refs.length ? (
          selected.refs.map((id) => {
            const r = records.find((r) => r.id === id)!;
            return (
              <p key={id}>
                <button className="text-link" onClick={() => select(id)}>
                  Inspect cycle source · {id}
                </button>{" "}
                · {r.kind} / {r.version}
              </p>
            );
          })
        ) : (
          <p>No earlier cycle record referenced.</p>
        )}
      </section>
      <section className="panel org-stream" aria-label="Cycle source context">
        <h2>Inspect the surrounding design</h2>
        <p>
          This cycle is independent of guide-review-01 and the workshop's
          brief-v0 history. These examples have different subject identities and
          cannot be merged as evidence.
        </p>
        <p>
          <button
            className="text-link"
            onClick={() =>
              onSource("/agreements/K-01?agreementVersion=brief-v1&compare=no")
            }
          >
            Inspect proposed cycle scope · brief-v1
          </button>
        </p>
        <p>
          <button
            className="text-link"
            onClick={() => onSource("/outcomes/K-01")}
          >
            Inspect goal criteria · {subject.criterionId}
          </button>
        </p>
        <button
          className="text-link"
          onClick={() => onSource("/patterns/K-01")}
        >
          Inspect collaboration guidance · K-01
        </button>
      </section>
    </div>
  );
}
