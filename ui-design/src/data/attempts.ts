import type { Attempt } from "./models";
import { sampleCandidate } from "./candidate";
// Synthetic fixtures, not copied from production. Field names follow SF's
// AttemptRecord; absent observations remain absent rather than defaulting to zero.
export const attempts: Attempt[] = [
  {
    attempt_id: sampleCandidate.attemptId,
    assignment_id: "A-1042",
    opened_at: "2026-09-22T09:10:00Z",
    settled_at: "2026-09-22T09:22:00Z",
    outcome: "produced",
    termination: "exit status 0",
    exit_code: 0,
    artifact_digest: sampleCandidate.artifactDigest,
    state: "admitted",
    ephemeral_cleanup: "destroyed",
  },
  {
    attempt_id: "demo-attempt-process-failure",
    assignment_id: "A-1042",
    opened_at: "2026-09-22T08:50:00Z",
    settled_at: "2026-09-22T08:52:00Z",
    outcome: "failed",
    termination: "exit status 1",
    exit_code: 1,
    ephemeral_cleanup: "destroyed",
    failure:
      "Sample: the process ran and returned a nonzero exit status. No platform state or artifact reference was recorded. This does not establish a platform refusal.",
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
