export type ResponsibilityProposal = {
  id: string;
  gapId: string;
  workerId: string;
  role: string;
  scope: string;
  rationale: string;
  proposer: string;
  recordedAt: string;
  decision?: {
    outcome: "Accepted" | "Rejected";
    rationale: string;
    recordedAt: string;
    reviewer: string;
  };
};
// Authored candidates illustrate proposals, not validated capacity or permission.
export const proposalRequirements: Record<
  string,
  { role: string; scope: string; workerIds: string[]; note: string }
> = {
  "invitation-implementation": {
    role: "Developer",
    scope: "Team invitation improvements",
    workerIds: ["codex", "jamie"],
    note: "This scope has no developer binding or implementation assignment. A proposal would need a scoped binding and assignment before work is allocated.",
  },
  "invitation-assessment": {
    role: "Reviewer",
    scope: "Team invitation improvements",
    workerIds: ["alex", "jamie"],
    note: "Alex has a Team Workspace reviewer binding, but this invitation review has no assignment or candidate. Naming a worker does not allocate the review.",
  },
};

export function allocationPreview(proposal: ResponsibilityProposal) {
  const implementation = proposal.gapId === "invitation-implementation";
  return {
    binding:
      !implementation && proposal.workerId === "alex"
        ? "Reuse Alex's existing Reviewer binding for Team Workspace; no new binding is proposed. Effective permission still needs validation."
        : `Create a ${proposal.role} binding for ${proposal.scope}; effective permissions still need validation.`,
    assignment: implementation
      ? "Implement expired-link and existing-member invitation behavior"
      : "Assess expired-link and existing-member invitation behavior",
    prerequisites: implementation
      ? "Await agreed criteria and a bounded implementation scope before starting."
      : "Await agreed criteria, an identifiable candidate and attached checks before starting.",
  };
}
