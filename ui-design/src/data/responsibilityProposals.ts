export type ResponsibilityProposal = {
  id: string;
  gapId: string;
  workerId: string;
  role: string;
  scope: string;
  rationale: string;
  recordedAt: string;
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
