import { sampleCandidate } from "./candidate";
// Authored independently of the candidate: requirements must not be inferred
// from whatever files a worker happens to produce. All values are fictional.
export const reviewRequirements = {
  assignmentId: "A-1042",
  repository: "Payments API · sample repository",
  baseRevision: sampleCandidate.baseRevision,
  outputScope: [
    "src/webhooks/retry.ts",
    "src/webhooks/retry.test.ts",
    "docs/webhook-retries.md",
  ],
  requiredEffectPaths: ["src/webhooks/retry.ts", "src/webhooks/retry.test.ts"],
  validator: "demo-retry-delay-validator",
  publicationCriterion: "demo-publication-check",
  criteria: [
    {
      id: "criterion-1",
      title: "Bound retry delay",
      detail:
        "Transient delivery failures use exponential backoff capped at 60 seconds.",
      evidence: "Declared validator observation for the exact candidate.",
    },
    {
      id: "criterion-2",
      title: "Prevent duplicate payment effects",
      detail:
        "Repeated delivery of the same event must not cause a second payment effect.",
      evidence:
        "Human assessment and candidate-specific duplicate-event evidence. The current illustrative snippets do not establish this.",
    },
    {
      id: "criterion-3",
      title: "Deliver the required changes",
      detail:
        "The candidate must contain the implementation and test paths named below, within the permitted scope.",
      evidence: "Candidate completeness and changed-file inspection.",
    },
    {
      id: "criterion-4",
      title: "Establish publication admissibility",
      detail:
        "Check the exact candidate against the stated publication criterion before final approval.",
      evidence:
        "Publication observation. No connected result is currently available.",
    },
  ],
};
