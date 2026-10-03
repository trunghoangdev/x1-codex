// Independent authored scenario. Not SF records, live workloads or inbox assignments.
export const scenarioWorkers = [
  { id: "alex", name: "Alex Morgan", type: "Human" },
  { id: "jamie", name: "Jamie Chen", type: "Human" },
  { id: "priya", name: "Priya Shah", type: "Human" },
  { id: "sam", name: "Sam Rivera", type: "Human" },
  { id: "morgan", name: "Morgan Lee", type: "Human" },
  { id: "noor", name: "Noor Ali", type: "Human" },
  { id: "codex", name: "Codex worker", type: "AI worker" },
  { id: "claude", name: "Claude worker", type: "AI worker" },
  { id: "runner", name: "Release runner", type: "Deterministic worker" },
];
export const scenarioStreams = [
  {
    id: "L-01",
    name: "Payment retry resilience",
    project: "Payments",
    goal: "Recover transient failures without duplicate payment effects.",
  },
  {
    id: "L-02",
    name: "Invitation clarity",
    project: "Workspace",
    goal: "Make expired invitations and existing-member behavior understandable.",
  },
  {
    id: "L-03",
    name: "Accessible onboarding",
    project: "Workspace",
    goal: "Support keyboard navigation and announced form errors.",
  },
  {
    id: "L-04",
    name: "Audit export",
    project: "Operations",
    goal: "Provide traceable exports with explicit access scope.",
  },
  {
    id: "L-05",
    name: "Billing reconciliation",
    project: "Payments",
    goal: "Explain mismatches using identified ledger observations.",
  },
  {
    id: "L-06",
    name: "Service recovery",
    project: "Operations",
    goal: "Demonstrate recovery with observed service behavior.",
  },
];
export type ScenarioAssignment = {
  id: string;
  streamId: string;
  title: string;
  role: string;
  workerId?: string;
  state:
    | "In progress"
    | "Awaiting assessment"
    | "Revision requested"
    | "Unassigned"
    | "Awaiting authorization";
};
export const scenarioAssignments: ScenarioAssignment[] =
  scenarioStreams.flatMap((stream, index) => [
    {
      id: `${stream.id}-W`,
      streamId: stream.id,
      title: `Prepare contribution · ${stream.name}`,
      role: "Developer",
      workerId: index % 2 ? "claude" : "codex",
      state: index === 2 ? "Revision requested" : "In progress",
    },
    {
      id: `${stream.id}-R`,
      streamId: stream.id,
      title: `Assess contribution · ${stream.name}`,
      role: "Reviewer",
      workerId: index === 1 ? undefined : ["alex", "priya", "sam"][index % 3],
      state: index === 1 ? "Unassigned" : "Awaiting assessment",
    },
    {
      id: `${stream.id}-A`,
      streamId: stream.id,
      title: `Decide authorization · ${stream.name}`,
      role: "Authority",
      workerId: index % 2 ? "morgan" : "noor",
      state: "Awaiting authorization",
    },
  ]);
export const scenarioBindings = [
  ...scenarioAssignments
    .filter((a) => a.workerId)
    .map((a) => ({
      workerId: a.workerId!,
      role: a.role,
      streamId: a.streamId,
    })),
  { workerId: "jamie", role: "Planner", streamId: "All streams" },
  {
    workerId: "runner",
    role: "Executor",
    streamId: "Authorized subjects only",
  },
];
