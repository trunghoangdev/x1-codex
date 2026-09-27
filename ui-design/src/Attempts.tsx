import { CircleCheck, AlertTriangle, Clock3 } from "lucide-react";

import { sampleCandidate } from "./candidateData";

type Attempt = {
  attempt_id: string;
  assignment_id: string;
  opened_at: string;
  settled_at?: string;
  outcome: "open" | "produced" | "failed";
  termination: string;
  exit_code?: number;
  artifact_digest?: string;
  failure?: string;
};

// Synthetic fixtures, not copied from production. Field names follow SF's
// AttemptRecord; absent observations remain absent rather than defaulting to zero.
const attempts: Attempt[] = [
  {
    attempt_id: sampleCandidate.attemptId,
    assignment_id: "A-1042",
    opened_at: "2026-09-22T09:10:00Z",
    settled_at: "2026-09-22T09:22:00Z",
    outcome: "produced",
    termination: "exit status 0",
    exit_code: 0,
    artifact_digest: sampleCandidate.artifactDigest,
  },
  {
    attempt_id: "demo-attempt-02",
    assignment_id: "A-1042",
    opened_at: "2026-09-22T08:45:00Z",
    settled_at: "2026-09-22T08:45:02Z",
    outcome: "failed",
    termination: "not observed: the process never started",
    failure:
      "The platform process could not be launched. No exit status was observed.",
  },
  {
    attempt_id: "demo-attempt-01",
    assignment_id: "A-1042",
    opened_at: "2026-09-22T08:00:00Z",
    outcome: "open",
    termination: "not yet observed",
  },
];
const labels = {
  produced: "Produced",
  failed: "Failed",
  open: "Open — completion not recorded",
};
const icons = { produced: CircleCheck, failed: AlertTriangle, open: Clock3 };
function timestamp(value: string) {
  return value.replace("T", " ").replace("Z", " UTC");
}
export function Attempts({ assignmentId }: { assignmentId: string }) {
  const records = attempts.filter((a) => a.assignment_id === assignmentId);
  return (
    <div className="attempts-view">
      <div className="section-label">EXECUTION HISTORY · SAMPLE DATA</div>
      <h2>Every attempt keeps its own record.</h2>
      <p className="summary">
        An attempt describes execution. Producing a result does not approve the
        candidate or establish an external effect.
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
              </dl>
              {a.artifact_digest && (
                <div className="attempt-artifact">
                  <span>Artifact reference · synthetic, not verified</span>
                  <code>{a.artifact_digest}</code>
                </div>
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
