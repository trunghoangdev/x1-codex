// One explicitly synthetic subject shared by candidate and attempt views.
export const sampleCandidate = {
  assignmentId: "A-1042",
  attemptId: "demo-attempt-03",
  candidateDigest: `sha256:${"b".repeat(64)}`,
  artifactDigest: `sha256:${"a".repeat(64)}`,
  baseRevision: "184c72a81f995c8fa31f997269a4c5c91c0e403d2",
  label: "Retry handling · changeset c8e4a21",
  files: [
    {
      path: "src/webhooks/retry.ts",
      operation: "Modified",
      before: [
        "export function retryDelay(attempt: number) {",
        "  return 1000;",
        "}",
      ],
      after: [
        "export function retryDelay(attempt: number) {",
        "  return Math.min(1000 * 2 ** attempt, 60000);",
        "}",
      ],
    },
    {
      path: "src/webhooks/retry.test.ts",
      operation: "Added",
      before: [],
      after: [
        'import { expect, test } from "vitest";',
        'import { retryDelay } from "./retry";',
        "",
        'test("caps the retry interval", () => {',
        "  expect(retryDelay(8)).toBe(60000);",
        "});",
      ],
    },
    {
      path: "docs/webhook-retries.md",
      operation: "Added",
      before: [],
      after: [
        "# Webhook retry policy",
        "",
        "Transient failures use exponential backoff.",
        "The delay is capped at 60 seconds.",
        "Review duplicate-event handling separately.",
      ],
    },
  ],
};
