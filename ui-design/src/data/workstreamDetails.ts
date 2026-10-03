export type Handoff = {
  title: string;
  responsibility: string;
  state: string;
  exchange: string;
  assignmentId?: string;
  evidenceIds?: string[];
  handoffId?: string;
  gapIds?: string[];
};
export type WorkstreamDetail = {
  handoffs: Handoff[];
  outcomeEvidence: string;
  boundary: string;
};
// Proposed coordination, not an execution history or a workflow engine.
export const workstreamDetails: Record<string, WorkstreamDetail> = {
  "WS-01": {
    handoffs: [
      {
        title: "Prepare a contribution",
        evidenceIds: ["AR-771", "AR-776"],
        handoffId: "payment-review",
        responsibility: "Developer · Codex worker",
        state: "Sample candidate available",
        exchange:
          "Pass the exact candidate and its checks to the reviewer. The current review links those records; no separate developer assignment is modeled.",
      },
      {
        title: "Assess the exact candidate",
        assignmentId: "A-1042",
        evidenceIds: ["AR-775"],
        responsibility: "Reviewer · Alex Morgan",
        state: "Current assignment · A-1042",
        exchange:
          "Inspect requirements, candidate and evidence. Record a conclusion with rationale; submission alone does not establish acceptance.",
      },
      {
        title: "Revise and reassess if requested",
        responsibility: "Developer ↔ Reviewer",
        state: "Conditional · no follow-up assignment",
        exchange:
          "A requested revision would return to the developer. A new candidate would need its own assessment; an earlier conclusion must not carry over automatically.",
      },
    ],
    outcomeEvidence:
      "A scoped observation demonstrating recovery from transient failures without duplicate processing, tied to the delivered revision. No such production observation is attached.",
    boundary:
      "A-1041 production release and A-1035 staging reconciliation have different subjects. Neither is established as a downstream dependency of this workstream.",
  },
  "WS-02": {
    handoffs: [
      {
        title: "Clarify acceptance criteria",
        assignmentId: "A-1038",
        handoffId: "invitation-planning",
        responsibility: "Product owner · Alex Morgan",
        state: "Current assignment · A-1038",
        exchange:
          "Describe expired-link and existing-member behavior so implementation and assessment can use explicit expectations.",
      },
      {
        title: "Plan implementation and assessment",
        responsibility: "Planner · Jamie Chen",
        state: "Proposed · no assignment",
        exchange:
          "Use the clarified criteria to propose scoped assignments and identify responsible workers. This prototype does not create those assignments.",
      },
      {
        title: "Implement invitation behavior",
        responsibility: "Developer · no scoped worker binding represented",
        state: "Missing responsibility · no assignment",
        gapIds: ["invitation-implementation"],
        exchange:
          "Needs agreed criteria and a scoped developer allocation. Produce an identifiable candidate and checks; no implementation candidate is represented.",
      },
      {
        title: "Assess invitation behavior",
        responsibility:
          "Reviewer · Alex has a Team Workspace binding; no invitation assignment",
        state: "Missing responsibility · no assignment",
        gapIds: ["invitation-assessment"],
        exchange:
          "Needs an implemented candidate, criteria and a separately allocated assessment. A reviewer binding does not create the assignment. Questions can return to the product owner; requested changes can return to the developer.",
      },
    ],
    outcomeEvidence:
      "Agreed invitation criteria and observations showing expired-link and existing-member behavior meets them. No implementation or outcome evidence is attached yet.",
    boundary:
      "A-1032 concerns onboarding accessibility. No dependency or shared candidate with this invitation workstream has been established.",
  },
};
