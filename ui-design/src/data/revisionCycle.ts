export type RevisionRecord = {
  id: string;
  kind: string;
  title: string;
  actor: string;
  status: string;
  subject: string;
  digest?: string;
  detail: string;
  references: { id: string; relation: string }[];
};
// Standalone authored scenario. These are not live assignments or A-1042 history.
export const revisionCycle: RevisionRecord[] = [
  {
    id: "DEMO-C1",
    kind: "Contribution",
    title: "Initial retry implementation",
    actor: "Sample developer worker",
    status: "Submitted · sample",
    subject: "Revision 1",
    digest: `sha256:${"e".repeat(64)}`,
    detail:
      "The first contribution caps retry delay but does not supply candidate-specific duplicate-event coverage.",
    references: [],
  },
  {
    id: "DEMO-A1",
    kind: "Assessment",
    title: "Request duplicate-event coverage",
    actor: "Sample human reviewer",
    status: "Changes requested · sample",
    subject: "Revision 1",
    digest: `sha256:${"e".repeat(64)}`,
    detail:
      "The reviewer requests tests for repeated delivery. This assessment applies only to revision 1; it is not a verdict on any later contribution.",
    references: [{ id: "DEMO-C1", relation: "Assesses exact contribution" }],
  },
  {
    id: "DEMO-W2",
    kind: "Revision request",
    title: "Add duplicate-event tests",
    actor: "Sample planner",
    status: "Response supplied · sample",
    subject: "Follow-up scope",
    detail:
      "An explicit follow-up asks for duplicate-event tests and an explanation of effect protection. Its presence is authored in this scenario, not an automatic consequence of recording an assessment.",
    references: [
      { id: "DEMO-A1", relation: "Requested because of assessment" },
      { id: "DEMO-C1", relation: "Revises contribution" },
    ],
  },
  {
    id: "DEMO-C2",
    kind: "Contribution",
    title: "Revised contribution with claimed coverage",
    actor: "Sample developer worker",
    status: "Submitted · not yet assessed",
    subject: "Revision 2",
    digest: `sha256:${"f".repeat(64)}`,
    detail:
      "The worker claims to add duplicate-event coverage. No file body or verified test report is connected to this standalone scenario. Submission does not establish that the request was satisfied.",
    references: [
      { id: "DEMO-W2", relation: "Responds to revision request" },
      { id: "DEMO-C1", relation: "Revises; preserves original record" },
    ],
  },
  {
    id: "DEMO-A2",
    kind: "Reassessment",
    title: "Review the revised contribution",
    actor: "Sample human reviewer",
    status: "Awaiting review · no conclusion",
    subject: "Revision 2",
    digest: `sha256:${"f".repeat(64)}`,
    detail:
      "Inspect the new candidate and obtain candidate-specific evidence before recording a fresh assessment. The earlier changes-requested result remains attached to revision 1. No acceptance, release authority or deployment effect is established.",
    references: [
      { id: "DEMO-C2", relation: "New assessment subject" },
      { id: "DEMO-A1", relation: "Earlier assessment for context only" },
    ],
  },
];
