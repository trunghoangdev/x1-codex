import { useEffect } from "react";
import type { OrganizationScenario } from "./data/organizationScenario";
import {
  exchangeActivity,
  exchangeKinds,
  type ExchangeKind,
} from "./data/exchangeActivity";
import { DetailBackButton } from "./DetailPresentation";
export type ExchangeFilters = {
  stream: string;
  kind: "all" | ExchangeKind;
  event?: string;
};
export function ExchangeActivity({
  scenario,
  filters,
  onFilters,
  onBack,
  onAssignment,
  onWorker,
}: {
  scenario: OrganizationScenario;
  filters: ExchangeFilters;
  onFilters: (f: ExchangeFilters) => void;
  onBack: () => void;
  onAssignment: (id: string) => void;
  onWorker: (id: string) => void;
}) {
  const all = exchangeActivity(scenario),
    rows = all.filter(
      (e) =>
        (filters.stream === "all" || e.streamId === filters.stream) &&
        (filters.kind === "all" || e.kind === filters.kind),
    );
  useEffect(() => {
    if (filters.event) {
      const el = document.getElementById(`exchange-${filters.event}`);
      el?.focus();
      el?.scrollIntoView({ block: "center" });
    }
  }, [filters.event]);
  const reference = (id: string) => {
    const e = all.find((e) => e.id === id);
    if (e) onFilters({ stream: e.streamId, kind: "all", event: id });
  };
  return (
    <div className="detail-page">
      <DetailBackButton onClick={onBack}>
        Back to scenario context
      </DetailBackButton>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            {scenario.domain} · AUTHORED EXCHANGE HISTORY
          </div>
          <h1 tabIndex={-1}>Coordination activity</h1>
          <p>
            Responses, delivery, acknowledgment and review are separate records.
          </p>
        </div>
      </div>
      <section className="org-banner" aria-label="Activity sample boundary">
        <div>
          <h2>Illustrative history, separate from current work</h2>
          <p>
            {all.length
              ? "These fixed sample timestamps describe a past draft version, not live events or the current assignment state."
              : "No dated exchange history is supplied for this organization. Assignment titles and states do not create events."}{" "}
            No record advances the workflow or changes input availability,
            receipt, permission or outcome.
          </p>
          {scenario.id === "knowledge" && (
            <p>
              Workshop brief v0 remains an example of an earlier, incomplete
              draft. The required current brief is still missing and its receipt
              unconfirmed. This history adds no current evidence artifact.
            </p>
          )}
        </div>
      </section>
      <div className="stream-directory-filters panel">
        <label>
          Activity workstream
          <select
            value={filters.stream}
            onChange={(e) =>
              onFilters({
                ...filters,
                stream: e.target.value,
                event: undefined,
              })
            }
          >
            <option value="all">All workstreams</option>
            {scenario.streams.map((s) => (
              <option value={s.id} key={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Exchange record type
          <select
            value={filters.kind}
            onChange={(e) =>
              onFilters({
                ...filters,
                kind: e.target.value as ExchangeFilters["kind"],
                event: undefined,
              })
            }
          >
            <option value="all">All record types</option>
            {exchangeKinds.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        <button
          className="button secondary"
          onClick={() => onFilters({ stream: "all", kind: "all" })}
        >
          Clear exchange filters
        </button>
      </div>
      <p role="status">
        {rows.length} of {all.length} scoped sample events · chronological order
        within this authored history only
      </p>
      <section aria-label="Coordination exchange records">
        {rows.length === 0 ? (
          <div className="panel org-stream">
            <h2>No exchange records in this view</h2>
            <p>
              {all.length
                ? "No sample events match these filters."
                : "No exchange history is represented for this scenario."}{" "}
              Missing history does not establish completion, inactivity or
              receipt.
            </p>
          </div>
        ) : (
          <ol className="exchange-record-list">
            {rows.map((e) => (
              <li
                className="panel org-stream org-overview-section"
                key={e.id}
                id={`exchange-${e.id}`}
                tabIndex={-1}
                aria-label={e.title}
              >
                <div className="eyebrow">
                  {e.id} · {e.kind}
                </div>
                <h2>{e.title}</h2>
                <p>
                  <time dateTime={e.at}>
                    {e.at.replace("T", " ").replace("Z", " UTC")}
                  </time>{" "}
                  · {scenario.workers.find((w) => w.id === e.actorId)?.name} ·{" "}
                  {e.streamId}
                </p>
                <p>
                  {e.version} · {e.inputId}
                </p>
                <details
                  className="directory-record-details"
                  open={filters.event === e.id ? true : undefined}
                >
                  <summary>Inspect exchange record · {e.id}</summary>
                  <p>{e.detail}</p>
                  {e.kind === "delivery" && (
                    <p>
                      Recipient:{" "}
                      {
                        scenario.workers.find((w) => w.id === e.recipientId)
                          ?.name
                      }{" "}
                      · {e.receiverAssignmentId}. Receiver acknowledgment is a
                      separate record.
                    </p>
                  )}
                  {e.kind === "acknowledgment" && (
                    <>
                      <p>
                        Receiver: {e.receiverAssignmentId} · exact draft{" "}
                        {e.version}
                      </p>
                      <button
                        className="text-link"
                        onClick={() => reference(e.deliveryId)}
                      >
                        Inspect originating delivery · {e.deliveryId}
                      </button>
                    </>
                  )}
                  {"conclusion" in e && (
                    <p>Authored conclusion: {e.conclusion}</p>
                  )}
                  {e.kind === "revision-request" && (
                    <>
                      <button
                        className="text-link"
                        onClick={() => reference(e.assessmentId)}
                      >
                        Inspect originating assessment · {e.assessmentId}
                      </button>
                      <p>
                        <button
                          className="text-link"
                          onClick={() => onAssignment(e.returnAssignmentId)}
                        >
                          Inspect returning responsibility ·{" "}
                          {e.returnAssignmentId}
                        </button>
                      </p>
                    </>
                  )}
                  <div className="workstream-actions">
                    <button
                      className="text-link"
                      onClick={() => onAssignment(e.assignmentId)}
                    >
                      Inspect event assignment · {e.assignmentId}
                    </button>
                    <button
                      className="text-link"
                      onClick={() => onWorker(e.actorId)}
                    >
                      Inspect event actor ·{" "}
                      {scenario.workers.find((w) => w.id === e.actorId)?.name}
                    </button>
                  </div>
                </details>
              </li>
            ))}
          </ol>
        )}
      </section>
      <p>
        Untimed assignment expectations, decision requirements and evidence stay
        in their own views. Other scenarios’ events and main session records do
        not appear here.
      </p>
    </div>
  );
}
