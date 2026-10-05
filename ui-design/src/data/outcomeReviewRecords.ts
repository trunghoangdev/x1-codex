import type { OrganizationScenario } from "./organizationScenario";

export interface OutcomeReviewRecord {
  id: string;
  streamId: string;
  agreementVersion: string;
  subject: { id: string; version: string; audience: string };
  allocation: { id: string; workerId: string; mandate: string };
  reviewedAt: string;
  conclusion: "insufficient-evidence" | "partially-supported" | "supported";
  rationale: string;
  criteria: {
    criterionId: string;
    observationIds: string[];
    missing: string;
  }[];
  boundary: string;
}

// Independent authored review example, not evidence added to the current Knowledge fixture.
export const readerObservations = [
  {
    id: "guide-reader-observation-01",
    subjectId: "cohort-guide-example",
    subjectVersion: "draft-01",
    audience: "One internal onboarding cohort; one volunteer reader.",
    observedAt: "2026-09-29T14:00:00Z",
    recordedBy: "maya",
    method:
      "Illustrative reader walkthrough, authored for the UI design. No real reader session occurred.",
    finding:
      "The reader located a cited answer but could not identify the next step for a team-specific access question.",
    limitations:
      "One authored observation; no representative cohort sample, task timing or other team coverage.",
  },
];

const guideReview: OutcomeReviewRecord = {
  id: "guide-review-01",
  streamId: "K-01",
  agreementVersion: "brief-v1",
  subject: {
    id: "cohort-guide-example",
    version: "draft-01",
    audience: "One internal onboarding cohort.",
  },
  allocation: {
    id: "example-review-allocation-01",
    workerId: "maya",
    mandate:
      "Explicitly authored allocation for this illustrative goal-level review only. This is not inferred from Maya's Editor binding and creates no assignment in the current fixture.",
  },
  reviewedAt: "2026-09-30T10:00:00Z",
  conclusion: "insufficient-evidence",
  rationale:
    "One reader finding suggests a reliable answer was discoverable, but next-step usefulness is unresolved. The sample is too narrow to establish the guide goal for the cohort.",
  criteria: [
    {
      criterionId: "K-01-goal",
      observationIds: ["guide-reader-observation-01"],
      missing:
        "Representative observations that new members can both find reliable answers and identify next steps; unresolved access guidance needs follow-up.",
    },
  ],
  boundary:
    "Review of draft-01 against the proposed brief-v1 cohort scope only. Brief adoption, publication and publication authority are not established. It does not assess the expanded brief-v2 audience. Later evidence or scope changes require a new review; they do not rewrite this record.",
};

export function outcomeReviewRecords(
  scenario: OrganizationScenario,
  streamId: string,
) {
  return scenario.id === "knowledge" && streamId === "K-01"
    ? [guideReview]
    : [];
}
