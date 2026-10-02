export type HandoffDetail = {
  id: string;
  streamId: string;
  title: string;
  from: string;
  to: string;
  assignmentId: string;
  inputTab: "Candidate" | "Overview";
  inputs: string[];
  acceptance: string[];
  returnPath: string;
  status: string;
};
// Authored exchange expectations, not recorded transfers or automatic gates.
export const handoffs: HandoffDetail[] = [
  {
    id: "payment-review",
    streamId: "WS-01",
    title: "Candidate to reviewer",
    from: "Codex worker · Developer · Payment webhook reliability",
    to: "Alex Morgan · Reviewer · Payments API",
    assignmentId: "A-1042",
    inputTab: "Candidate",
    inputs: [
      "Exact candidate revision and changeset identity",
      "Requirements and permitted scope",
      "Checks tied to that candidate, with test evidence",
    ],
    acceptance: [
      "Reviewer can identify the subject and inspect its inputs",
      "Evidence coverage is assessed against the requirements",
      "Conclusion and rationale refer to the assessed revision",
    ],
    returnPath:
      "If evidence is insufficient or revision is requested, send explicit gaps to the developer. A revised candidate needs its own assessment. No follow-up assignment or confirmed transfer is represented.",
    status: "Sample candidate attached · receipt of handoff unconfirmed",
  },
  {
    id: "invitation-planning",
    streamId: "WS-02",
    title: "Criteria to planner",
    from: "Alex Morgan · Product owner · Team invitation improvements",
    to: "Jamie Chen · Planner · Both workstreams",
    assignmentId: "A-1038",
    inputTab: "Overview",
    inputs: [
      "Expected behavior for expired invitations",
      "Expected behavior for existing organization members",
      "Explicit unresolved questions and acceptance criteria",
    ],
    acceptance: [
      "Planner can propose bounded implementation and assessment assignments",
      "Each proposed assignment identifies a responsible worker and scope",
      "Ambiguous requirements return to the product owner for clarification",
    ],
    returnPath:
      "Open questions return to Alex for clarification. Developer allocation and an invitation assessment assignment are still missing; no planning assignment or confirmed handoff is represented.",
    status: "Criteria clarification requested · planning handoff proposed",
  },
];
