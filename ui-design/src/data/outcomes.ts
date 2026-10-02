export type OutcomeCriterion = {
  id: string;
  title: string;
  needed: string;
  available: string;
  evidenceIds: string[];
  gap: string;
};
export type OutcomeReview = {
  streamId: string;
  criteria: OutcomeCriterion[];
  boundary: string;
};
// Proposed goal-level evidence expectations, not automated check results.
export const outcomes: OutcomeReview[] = [
  {
    streamId: "WS-01",
    boundary:
      "A-1042 assesses a proposed candidate. Its assessment does not establish production behavior. A-1041 release and A-1035 staging have separate subjects and are not outcome proof for this stream.",
    criteria: [
      {
        id: "recovery",
        title: "Recovery from transient failures",
        needed:
          "An observation showing retries recover transient failures, linked to the delivered revision and environment.",
        available:
          "Source change and worker notes describe the proposed retry candidate.",
        evidenceIds: ["AR-771", "AR-776"],
        gap: "No delivered-revision identity or production recovery observation is attached.",
      },
      {
        id: "duplicates",
        title: "No duplicate processing",
        needed:
          "Evidence that repeated events do not create duplicate payments for the same delivered revision.",
        available:
          "A historical test-results fixture is attached; it is not a newly executed check.",
        evidenceIds: ["AR-775"],
        gap: "No verified execution or production observation establishes duplicate-processing behavior.",
      },
    ],
  },
  {
    streamId: "WS-02",
    boundary:
      "Criteria clarification is the current assignment. A-1032 onboarding accessibility has no established shared candidate or dependency with invitation behavior.",
    criteria: [
      {
        id: "expired",
        title: "Expired invitation behavior",
        needed:
          "Agreed expected behavior and an observation of an expired invitation against the implemented revision.",
        available:
          "A-1038 requests criteria clarification; no attached evidence records are available.",
        evidenceIds: [],
        gap: "Agreed criteria, an implementation identity and a behavior observation are missing.",
      },
      {
        id: "members",
        title: "Existing-member behavior",
        needed:
          "Agreed expected behavior and evidence for inviting an existing organization member.",
        available:
          "This case is part of the clarification request, not a demonstrated implementation result.",
        evidenceIds: [],
        gap: "No implementation or observed behavior is attached.",
      },
    ],
  },
];
