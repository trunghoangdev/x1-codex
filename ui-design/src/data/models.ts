// Frontend view models for this prototype. These are NOT Forge/SF API contracts.
// Fields such as role, due and simulated permission are UI fixtures, not claims
// that the current SF backend supplies them.
export type Kind = "Assessment" | "Authority" | "Work" | "Reconciliation";
export type Assignment = {
  id: string;
  title: string;
  project: string;
  kind: Kind;
  role: string;
  authority: string;
  due: string;
  owner: string;
  initials: string;
  summary: string;
  artifact: string;
};
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
  assessment?: {
    conclusion:
      "Meets criteria" | "Changes requested" | "Insufficient evidence";
    evidence: { id: string; title: string; assignmentId: string }[];
  };
};
export type Readiness =
  "missing" | "ready" | "refused" | "load-error" | "stale" | "revoked";
export type Attempt = {
  attempt_id: string;
  assignment_id: string;
  opened_at: string;
  settled_at?: string;
  outcome: "open" | "produced" | "failed";
  termination: string;
  exit_code?: number;
  artifact_digest?: string;
  failure?: string;
  state?: string;
  ephemeral_cleanup?: string;
};

export type Scenario = "passed" | "refused" | "unavailable";
export type Observation = {
  executed: boolean;
  exit_code?: number;
  termination?: string;
  diagnostics: string;
};
