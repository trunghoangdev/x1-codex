export type ResponsibilityProposal = {
  id: string;
  gapId: string;
  workerId: string;
  role: string;
  scope: string;
  rationale: string;
  proposer: string;
  recordedAt: string;
  allocation?: LocalAllocation;
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

export type LocalAllocation = {
  id: string;
  proposalId: string;
  assignmentId: string;
  bindingId: string;
  bindingMode: "created" | "reused";
  workerId: string;
  role: string;
  scope: string;
  gapId: string;
  streamId: "WS-02";
  recordedAt: string;
  allocator: "Jamie · demo planner";
};
export function allocationFor(
  proposal: ResponsibilityProposal,
  at: string,
): LocalAllocation {
  const reused =
    proposal.gapId === "invitation-assessment" && proposal.workerId === "alex";
  return {
    id: `local-allocation-${proposal.gapId}`,
    proposalId: proposal.id,
    assignmentId: `local-assignment-${proposal.gapId}`,
    bindingId: reused ? "mb-reviewer" : `local-binding-${proposal.gapId}`,
    bindingMode: reused ? "reused" : "created",
    workerId: proposal.workerId,
    role: proposal.role,
    scope: proposal.scope,
    gapId: proposal.gapId,
    streamId: "WS-02",
    recordedAt: at,
    allocator: "Jamie · demo planner",
  };
}
export function recordLocalAllocation(
  proposals: Record<string, ResponsibilityProposal>,
  gapId: string,
  at: string,
) {
  const p = proposals[gapId];
  const requirement = proposalRequirements[gapId];
  if (
    !p ||
    !requirement ||
    p.decision?.outcome !== "Accepted" ||
    p.allocation ||
    !requirement.workerIds.includes(p.workerId) ||
    p.role !== requirement.role ||
    p.scope !== requirement.scope
  )
    return proposals;
  return { ...proposals, [gapId]: { ...p, allocation: allocationFor(p, at) } };
}
