// Authored organization scenario; these relationships are not backend facts.
export type Worker = { id: string; name: string; type: string };
export type RoleBinding = {
  workerId: string;
  role: string;
  scope: string;
  permission: string;
};
export type Workstream = {
  id: string;
  name: string;
  project: string;
  goal: string;
  assignmentIds: string[];
  coordination: string;
  outcome: string;
};
export const workers: Worker[] = [
  { id: "jamie", name: "Jamie Chen", type: "Human" },
  { id: "alex", name: "Alex Morgan", type: "Human · You" },
  { id: "codex", name: "Codex worker", type: "AI worker" },
  { id: "runner", name: "Release runner", type: "Deterministic worker" },
];
export const roleBindings: RoleBinding[] = [
  {
    workerId: "jamie",
    role: "Planner",
    scope: "Both workstreams",
    permission: "Propose assignments and clarify goals",
  },
  {
    workerId: "codex",
    role: "Developer",
    scope: "Payment webhook reliability",
    permission: "Submit source contributions",
  },
  {
    workerId: "alex",
    role: "Reviewer",
    scope: "Payments API and Team Workspace",
    permission: "Submit assessments",
  },
  {
    workerId: "alex",
    role: "Product owner",
    scope: "Team invitation improvements",
    permission: "Clarify acceptance criteria",
  },
  {
    workerId: "alex",
    role: "Release authority",
    scope: "Payments API · production v1.8.2",
    permission: "Approve or refuse the exact release subject",
  },
  {
    workerId: "alex",
    role: "Operator",
    scope: "Payments API · staging",
    permission: "Reconcile observed deployment effects",
  },
  {
    workerId: "runner",
    role: "Executor",
    scope: "Payments API · authorized releases",
    permission:
      "Execute within a granted authorization; runtime status unavailable",
  },
];
export const workstreams: Workstream[] = [
  {
    id: "WS-01",
    name: "Payment webhook reliability",
    project: "Payments API",
    goal: "Recover from transient webhook failures without duplicate processing.",
    assignmentIds: ["A-1042"],
    coordination:
      "Developer contribution → reviewer assessment → revision if requested. Release authorization is a separate decision about an exact subject.",
    outcome:
      "Not verified · no production reliability observation is attached.",
  },
  {
    id: "WS-02",
    name: "Team invitation improvements",
    project: "Team Workspace",
    goal: "Make invitation behavior clear for expired links and existing members.",
    assignmentIds: ["A-1038"],
    coordination:
      "Product owner clarifies criteria before implementation and assessment can be planned. Those later assignments are not yet represented.",
    outcome: "Not verified · acceptance criteria are still being clarified.",
  },
];
