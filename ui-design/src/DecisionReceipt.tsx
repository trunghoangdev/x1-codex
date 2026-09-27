import { FileCheck2 } from "lucide-react";
export type ResponseRecord = {
  id: string;
  assignmentId: string;
  decision: string;
  recordedAt: string;
  actor: string;
  role: string;
  permission: string;
  rationale: string;
  subject: { label: string; digest?: string; target?: string };
  prerequisites?: string;
};
export function DecisionReceipt({ record }: { record: ResponseRecord }) {
  return (
    <article className="decision-receipt" aria-label="Decision receipt">
      <div className="receipt-heading">
        <FileCheck2 size={20} />
        <h3>{record.decision} receipt</h3>
        <span className="badge neutral">LOCAL DEMO RECORD</span>
      </div>
      <p className="summary">
        Saved in this browser session. Not admitted by a server; refresh clears
        this record.
      </p>
      <dl className="attempt-fields">
        <div>
          <dt>Receipt ID · local</dt>
          <dd>{record.id}</dd>
        </div>
        <div>
          <dt>Assignment</dt>
          <dd>{record.assignmentId}</dd>
        </div>
        <div>
          <dt>Recorded at · browser clock</dt>
          <dd>
            <time dateTime={record.recordedAt}>
              {record.recordedAt.replace("T", " ").replace("Z", " UTC")}
            </time>
          </dd>
        </div>
        <div>
          <dt>Actor · demo identity</dt>
          <dd>{record.actor}</dd>
        </div>
        <div>
          <dt>Role</dt>
          <dd>{record.role}</dd>
        </div>
        <div>
          <dt>Permission · simulated</dt>
          <dd>
            <code>{record.permission}</code>
          </dd>
        </div>
      </dl>
      <div className="release-subject">
        <strong>Decision subject</strong>
        <p>{record.subject.label}</p>
        {record.subject.digest ? (
          <>
            <code>{record.subject.digest}</code>
            <small>Synthetic identity, not verified.</small>
          </>
        ) : (
          <small>
            No immutable digest is connected for this sample subject.
          </small>
        )}
        {record.subject.target && <p>{record.subject.target}</p>}
      </div>
      {record.prerequisites && (
        <p className="receipt-prerequisites">
          Snapshot of prerequisites: {record.prerequisites}
        </p>
      )}
      <h4>Recorded rationale</h4>
      <p className="receipt-rationale">{record.rationale}</p>
      <p className="demo-note">
        No external effect is established by this receipt. Actor, permission and
        subject have not been verified by an authority service.
      </p>
    </article>
  );
}
