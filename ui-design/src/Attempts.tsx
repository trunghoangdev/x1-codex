import { attempts } from "./data/attempts";
import { RelatedRecords, type NavigateRelated } from "./RelatedRecords";
import { CircleCheck, AlertTriangle, Clock3 } from "lucide-react";

import { sampleCandidate } from "./candidateData";

const labels = {
  produced: "Produced",
  failed: "Failed",
  open: "Open — completion not recorded",
};
const icons = { produced: CircleCheck, failed: AlertTriangle, open: Clock3 };
function timestamp(value: string) {
  return value.replace("T", " ").replace("Z", " UTC");
}
export function Attempts({
  assignmentId,
  onNavigate,
}: {
  assignmentId: string;
  onNavigate: NavigateRelated;
}) {
  const records = attempts.filter((a) => a.assignment_id === assignmentId);
  return (
    <div className="attempts-view">
      <div className="section-label">EXECUTION HISTORY · SAMPLE DATA</div>
      <h2>Every attempt keeps its own record.</h2>
      <p className="summary">
        An attempt describes execution. Producing a result does not approve the
        candidate or establish an external effect.
      </p>
      <p className="demo-note">
        Synthetic examples informed by SF record shapes. No production records
        or raw diagnostics are displayed. Open and launch-failure examples
        illustrate cases beyond the inspected development sample.
      </p>
      {records.length === 0 ? (
        <div className="empty-state">
          <Clock3 size={28} />
          <h3>No sample attempts for this assignment</h3>
          <p>
            Production history is not connected. This does not mean the
            assignment has never run.
          </p>
        </div>
      ) : (
        records.map((a) => {
          const Icon = icons[a.outcome];
          return (
            <article
              className={`attempt-card attempt-${a.outcome}`}
              key={a.attempt_id}
              aria-label={a.attempt_id}
            >
              <div className="attempt-heading">
                <strong>{a.attempt_id}</strong>
                <span className="attempt-status">
                  <Icon size={15} />
                  {labels[a.outcome]}
                </span>
              </div>
              <dl className="attempt-fields">
                <div>
                  <dt>Opened</dt>
                  <dd>
                    <time dateTime={a.opened_at}>{timestamp(a.opened_at)}</time>
                  </dd>
                </div>
                <div>
                  <dt>Settled</dt>
                  <dd>
                    {a.settled_at ? (
                      <time dateTime={a.settled_at}>
                        {timestamp(a.settled_at)}
                      </time>
                    ) : (
                      "Not recorded"
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Termination</dt>
                  <dd>{a.termination}</dd>
                </div>
                <div>
                  <dt>Exit code</dt>
                  <dd>
                    {a.exit_code === undefined ? "Not observed" : a.exit_code}
                  </dd>
                </div>
                <div>
                  <dt>Platform state</dt>
                  <dd>{a.state ?? "Not recorded"}</dd>
                </div>
                <div>
                  <dt>Ephemeral cleanup</dt>
                  <dd>
                    {a.ephemeral_cleanup === "destroyed"
                      ? "Destroyed · recorded by harness"
                      : "Not recorded"}
                  </dd>
                </div>
              </dl>
              {a.artifact_digest && (
                <div className="attempt-artifact">
                  <span>Artifact reference · synthetic, not verified</span>
                  <code>{a.artifact_digest}</code>
                </div>
              )}
              {!a.artifact_digest && (
                <p className="attempt-explanation">
                  No artifact reference recorded.
                </p>
              )}
              {a.attempt_id === sampleCandidate.attemptId &&
                a.artifact_digest === sampleCandidate.artifactDigest && (
                  <RelatedRecords
                    onNavigate={onNavigate}
                    links={[
                      { tab: "Candidate", label: "Inspect produced candidate" },
                    ]}
                  />
                )}
              {a.failure && <p className="attempt-explanation">{a.failure}</p>}
              {a.outcome === "open" && (
                <p className="attempt-explanation">
                  No final record is available. The process may have been
                  interrupted; live execution is not established.
                </p>
              )}
            </article>
          );
        })
      )}
    </div>
  );
}
