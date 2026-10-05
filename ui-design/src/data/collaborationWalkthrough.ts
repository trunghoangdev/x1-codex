export type WalkthroughRecord = {
  id: string;
  kind:
    | "brief"
    | "draft"
    | "delivery"
    | "receipt"
    | "assessment"
    | "revision"
    | "observation"
    | "outcome-review";
  title: string;
  actorId: string;
  at: string;
  version: "draft-01" | "draft-02";
  detail: string;
  proves: string;
  refs: string[];
};
export const walkthroughSubject = {
  id: "guide-cycle-example",
  streamId: "K-01",
  agreement: "brief-v1",
  audience: "One illustrative internal onboarding cohort.",
  criterionId: "K-01-goal",
};
// One independently authored fictional cycle. It does not extend the current fixture or earlier examples.
export const walkthroughRecords: WalkthroughRecord[] = [
  {
    id: "cycle-brief",
    kind: "brief",
    title: "Clarify the brief",
    actorId: "leo",
    at: "2026-09-21T09:00:00Z",
    version: "draft-01",
    detail:
      "Use the proposed single-cohort brief-v1 scope. Prepare cited answers and clear next steps; publication is outside this preparation cycle. Adoption remains unrecorded.",
    proves:
      "A declared example scope, not an approved agreement or a completed guide.",
    refs: [],
  },
  {
    id: "cycle-draft-01",
    kind: "draft",
    title: "Prepare the first draft",
    actorId: "research",
    at: "2026-09-21T11:00:00Z",
    version: "draft-01",
    detail:
      "The researcher prepares cited answers. Team access guidance has no clear next step.",
    proves:
      "A draft exists in this fictional cycle; no delivery or acceptance follows from preparation alone.",
    refs: ["cycle-brief"],
  },
  {
    id: "cycle-delivery-01",
    kind: "delivery",
    title: "Deliver draft-01 to the editor",
    actorId: "research",
    at: "2026-09-21T12:00:00Z",
    version: "draft-01",
    detail:
      "Delivery names guide-cycle-example / draft-01 and Maya as the intended receiver.",
    proves: "A delivery record, not receiver acknowledgment or assessment.",
    refs: ["cycle-draft-01"],
  },
  {
    id: "cycle-receipt-01",
    kind: "receipt",
    title: "Acknowledge draft-01",
    actorId: "maya",
    at: "2026-09-21T13:00:00Z",
    version: "draft-01",
    detail:
      "Maya acknowledges the exact draft-01 delivery independently of the researcher's response.",
    proves:
      "Receipt of draft-01 only; it does not accept the content or acknowledge draft-02.",
    refs: ["cycle-delivery-01"],
  },
  {
    id: "cycle-assessment-01",
    kind: "assessment",
    title: "Request clearer next steps",
    actorId: "maya",
    at: "2026-09-22T09:00:00Z",
    version: "draft-01",
    detail:
      "The example editor assessment finds useful citations but unresolved access guidance. Conclusion: revision requested.",
    proves:
      "A bounded content assessment; no publication authorization or goal-level review.",
    refs: ["cycle-receipt-01"],
  },
  {
    id: "cycle-revision-02",
    kind: "revision",
    title: "Revise the guide to draft-02",
    actorId: "research",
    at: "2026-09-22T11:00:00Z",
    version: "draft-02",
    detail:
      "Add a named next step for the access question. This new revision explicitly responds to the draft-01 assessment; the earlier receipt/assessment remains attached to draft-01.",
    proves: "A revised subject, not automatic transfer of earlier acceptance.",
    refs: ["cycle-assessment-01", "cycle-draft-01"],
  },
  {
    id: "cycle-delivery-02",
    kind: "delivery",
    title: "Deliver draft-02",
    actorId: "research",
    at: "2026-09-22T12:00:00Z",
    version: "draft-02",
    detail:
      "Send the revised draft-02 to Maya with the assessment question it addresses.",
    proves: "A separate delivery for the revised subject.",
    refs: ["cycle-revision-02"],
  },
  {
    id: "cycle-receipt-02",
    kind: "receipt",
    title: "Acknowledge the revised draft",
    actorId: "maya",
    at: "2026-09-22T13:00:00Z",
    version: "draft-02",
    detail: "Maya independently acknowledges the draft-02 delivery.",
    proves: "Receipt for draft-02; draft-01 receipt was not reused.",
    refs: ["cycle-delivery-02"],
  },
  {
    id: "cycle-assessment-02",
    kind: "assessment",
    title: "Assess the revised guidance",
    actorId: "maya",
    at: "2026-09-23T09:00:00Z",
    version: "draft-02",
    detail:
      "The example editor finds the requested next-step explanation present. Conclusion: the bounded editorial question is addressed.",
    proves:
      "A content assessment of draft-02, not publication authority or proof that new members benefit.",
    refs: ["cycle-receipt-02", "cycle-assessment-01"],
  },
  {
    id: "cycle-observation-02",
    kind: "observation",
    title: "Observe one reader walkthrough",
    actorId: "maya",
    at: "2026-09-23T11:00:00Z",
    version: "draft-02",
    detail:
      "Fictional method: one volunteer reader tries the revised guide in a private walkthrough, not a publication. The reader finds the answer and names a next step. No timing, representative cohort sample or other-team observations exist.",
    proves:
      "One authored positive finding for draft-02; broader reader usefulness remains unestablished.",
    refs: ["cycle-assessment-02"],
  },
  {
    id: "cycle-outcome-review",
    kind: "outcome-review",
    title: "Review the intended outcome",
    actorId: "maya",
    at: "2026-09-24T09:00:00Z",
    version: "draft-02",
    detail:
      "Explicit example allocation cycle-outcome-allocation names Maya to evaluate K-01-goal for draft-02 under proposed brief-v1. Conclusion: insufficient evidence. One favorable reader finding is too narrow to establish the goal for the cohort; gather representative observations in a subsequent review.",
    proves:
      "An explicit scoped conclusion with rationale; no publication, adopted agreement or verified current workstream. Expanded brief-v2 scope is not reviewed.",
    refs: ["cycle-observation-02"],
  },
];
