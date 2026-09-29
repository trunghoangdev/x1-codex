import { useState } from "react";
import { DecisionReceipt } from "./DecisionReceipt";
import { evidenceFor, type EvidenceArtifact } from "./data/evidence";
import type { ResponseRecord } from "./data/models";
import type { NavigateRelated } from "./RelatedRecords";

export function AssignmentActivity({
  assignmentId,
  receipts,
  onNavigate,
  onInspect,
}: {
  assignmentId: string;
  receipts: ResponseRecord[];
  onNavigate: NavigateRelated;
  onInspect: (record: EvidenceArtifact) => void;
}) {
  const [filter, setFilter] = useState("all");
  const responses = receipts.filter((r) => r.assignmentId === assignmentId);
  const evidence = evidenceFor(assignmentId);
  const count =
    (filter !== "evidence" ? responses.length : 0) +
    (filter !== "responses" ? evidence.length : 0);
  return (
    <>
      <div className="section-label">ASSIGNMENT HISTORY</div>
      <h2>A traceable chain of responsibility</h2>
      <p className="summary">
        {assignmentId} only. Evidence entries describe available sample records,
        not verified publication events or a chronological server log.
      </p>
      <label className="record-filter">
        Activity type
        <select
          aria-label="Activity type"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All records</option>
          <option value="responses">Local responses</option>
          <option value="evidence">Sample evidence</option>
        </select>
      </label>
      <p className="summary">{count} records in this view</p>
      {filter !== "evidence" &&
        responses.map((record) => (
          <DecisionReceipt
            key={record.id}
            record={record}
            onNavigate={onNavigate}
          />
        ))}
      {filter !== "evidence" && !responses.length && (
        <p className="summary">No response recorded in this demo session.</p>
      )}
      {filter !== "responses" &&
        evidence.map((record) => (
          <div className="timeline-item" key={record.id}>
            <span className="timeline-dot" />
            <div>
              <strong>
                {record.title} · {record.id}
              </strong>
              <p>{record.detail}</p>
              <button
                className="button secondary"
                onClick={() => onInspect(record)}
              >
                Inspect {record.id}
              </button>
            </div>
          </div>
        ))}
      {count === 0 && (
        <div className="empty-state">
          <h3>No records in this activity view</h3>
          <p>
            No matching sample history is connected. This does not establish an
            outcome.
          </p>
          {filter !== "all" && (
            <button
              className="button secondary"
              onClick={() => setFilter("all")}
            >
              Show all activity
            </button>
          )}
        </div>
      )}
    </>
  );
}
