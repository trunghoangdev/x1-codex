// Explicit sample relationships. Never infer assignment ownership from a role name.
export const workerAssignments: Record<string, Record<string, string[]>> = {
  alex: {
    Reviewer: ["A-1042", "A-1032"],
    "Product owner": ["A-1038"],
    "Release authority": ["A-1041"],
    Operator: ["A-1035"],
  },
};
export const responsibilityGaps = [
  {
    id: "invitation-implementation",
    workstreamId: "WS-02",
    title: "Invitation implementation",
    description:
      "No developer binding or implementation assignment is represented for Team invitation improvements. The payment developer binding does not cover this scope.",
  },
  {
    id: "invitation-assessment",
    workstreamId: "WS-02",
    title: "Invitation assessment assignment",
    description:
      "Alex has a Team Workspace reviewer binding, but no invitation assessment assignment or candidate is represented. A role binding alone does not allocate this future work.",
  },
];
