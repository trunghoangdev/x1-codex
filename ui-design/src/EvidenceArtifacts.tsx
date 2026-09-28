import { ArrowUpRight, FileCode2 } from "lucide-react";
import { evidenceFor, type EvidenceArtifact } from "./data/evidence";
export function EvidenceArtifacts({
  assignmentId,
  onInspect,
}: {
  assignmentId: string;
  onInspect: (artifact: EvidenceArtifact) => void;
}) {
  const records = evidenceFor(assignmentId);
  if (!records.length)
    return (
      <div className="empty-state">
        <FileCode2 size={26} />
        <h3>No sample evidence for this assignment</h3>
        <p>
          Production records are not connected. This is not evidence of success
          or failure.
        </p>
      </div>
    );
  return (
    <>
      {records.map((record) => (
        <button
          className="artifact-link evidence-row"
          key={record.id}
          onClick={() => onInspect(record)}
        >
          <span className="file-icon">
            <FileCode2 size={22} />
          </span>
          <span>
            <strong>{record.title}</strong>
            <small>
              {record.id} · {record.assignmentId} · {record.detail}
            </small>
          </span>
          <ArrowUpRight size={17} />
        </button>
      ))}
    </>
  );
}
export function ArtifactContents({ artifact }: { artifact: EvidenceArtifact }) {
  return (
    <>
      <h3>{artifact.title}</h3>
      <dl className="artifact-properties">
        <dt>Record</dt>
        <dd>{artifact.id}</dd>
        <dt>Assignment</dt>
        <dd>{artifact.assignmentId}</dd>
        <dt>Produced by</dt>
        <dd>{artifact.producer}</dd>
        <dt>Reference</dt>
        <dd>
          {artifact.digest ? (
            <>
              <code>{artifact.digest}</code>
              <p>Synthetic identity · not verified</p>
            </>
          ) : (
            "No digest connected"
          )}
        </dd>
      </dl>
      <div className="code-preview">
        <div>Illustrative content · not production evidence</div>
        <pre>{artifact.content}</pre>
      </div>
      <p className="demo-note">
        Fictional data. Neither these bytes nor their provenance have been
        verified. Inspecting this record grants no authority.
      </p>
    </>
  );
}
