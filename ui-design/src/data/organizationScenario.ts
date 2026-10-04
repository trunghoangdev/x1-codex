import {
  workers,
  roleBindings,
  workstreams,
  type Worker,
  type RoleBinding,
  type Workstream,
} from "./organizationOverview";
import { assignments } from "./assignments";
import { responsibilityGaps, workerAssignments } from "./workerDetails";
import { outcomes, type OutcomeReview } from "./outcomes";
import { workstreamDetails } from "./workstreamDetails";
import { evidenceArtifacts, type EvidenceArtifact } from "./evidence";
import {
  scenarioWorkers,
  scenarioStreams,
  scenarioBindings,
  scenarioAssignments,
} from "./largeOrganization";
export type OrganizationScenario = {
  id: "main" | "large";
  name: string;
  readOnly: boolean;
  workers: (Worker & { category: "human" | "ai" | "deterministic" })[];
  roles: { name: string; purpose: string }[];
  roleGaps: { role: string; gapId: string }[];
  bindings: RoleBinding[];
  streams: Workstream[];
  assignments: {
    id: string;
    streamId?: string;
    workerId?: string;
    role: string;
    title: string;
    state: string;
  }[];
  gaps: typeof responsibilityGaps;
  outcomes: OutcomeReview[];
  evidence: EvidenceArtifact[];
  flows: Record<
    string,
    {
      title: string;
      responsibility: string;
      state: string;
      exchange: string;
      assignmentId?: string;
    }[]
  >;
};
const categories: Record<string, "human" | "ai" | "deterministic"> = {
  alex: "human",
  jamie: "human",
  priya: "human",
  sam: "human",
  morgan: "human",
  noor: "human",
  codex: "ai",
  claude: "ai",
  runner: "deterministic",
};
export const mainOrganization: OrganizationScenario = {
  id: "main",
  name: "Main sample organization",
  readOnly: false,
  workers: workers.map((worker) => ({
    ...worker,
    category: categories[worker.id],
  })),
  roles: [
    {
      name: "Planner",
      purpose: "Coordinate work and clarify responsibilities.",
    },
    { name: "Developer", purpose: "Prepare contributions for assessment." },
    {
      name: "Reviewer",
      purpose: "Assess identified contributions against requirements.",
    },
    {
      name: "Product owner",
      purpose: "Clarify product requirements and acceptance criteria.",
    },
    {
      name: "Release authority",
      purpose: "Decide authorization for a specific release subject.",
    },
    {
      name: "Operator",
      purpose: "Inspect and reconcile effects in a named environment.",
    },
    {
      name: "Executor",
      purpose: "Execute authorized operations within their subject scope.",
    },
  ],
  roleGaps: [
    { role: "Developer", gapId: "invitation-implementation" },
    { role: "Reviewer", gapId: "invitation-assessment" },
  ],
  bindings: roleBindings,
  streams: workstreams,
  assignments: assignments.map((assignment) => ({
    id: assignment.id,
    title: assignment.title,
    role: assignment.role,
    state: "Awaiting response",
    streamId: workstreams.find((stream) =>
      stream.assignmentIds.includes(assignment.id),
    )?.id,
    workerId: workers.find((worker) =>
      Object.values(workerAssignments[worker.id] ?? {})
        .flat()
        .includes(assignment.id),
    )?.id,
  })),
  gaps: responsibilityGaps,
  outcomes,
  evidence: evidenceArtifacts,
  flows: Object.fromEntries(
    Object.entries(workstreamDetails).map(([id, detail]) => [
      id,
      detail.handoffs,
    ]),
  ),
};
export const largeOrganization: OrganizationScenario = {
  id: "large",
  name: "Larger sample organization",
  readOnly: true,
  workers: scenarioWorkers.map((worker) => ({
    ...worker,
    category: categories[worker.id],
  })),
  roles: [
    {
      name: "Planner",
      purpose: "Coordinate work and clarify responsibilities.",
    },
    { name: "Developer", purpose: "Prepare contributions for assessment." },
    {
      name: "Reviewer",
      purpose: "Assess identified contributions against requirements.",
    },
    { name: "Authority", purpose: "Decide subject-specific authorization." },
    {
      name: "Executor",
      purpose: "Execute authorized operations within their subject scope.",
    },
  ],
  roleGaps: [{ role: "Reviewer", gapId: "gap-L-02-R" }],
  bindings: scenarioBindings.map((binding) => ({
    workerId: binding.workerId,
    role: binding.role,
    scope:
      scenarioStreams.find((stream) => stream.id === binding.streamId)?.name ??
      binding.streamId,
    permission:
      "Authored responsibility only · effective permission not verified",
  })),
  streams: scenarioStreams.map((stream) => ({
    ...stream,
    assignmentIds: scenarioAssignments
      .filter((a) => a.streamId === stream.id)
      .map((a) => a.id),
    coordination:
      "Contribution → assessment → subject-specific authorization; revision may return to contribution. Authored pattern, not confirmed transfers.",
    outcome: "Not verified · no outcome observations represented",
  })),
  assignments: scenarioAssignments,
  gaps: scenarioAssignments
    .filter((a) => !a.workerId)
    .map((a) => ({
      id: `gap-${a.id}`,
      workstreamId: a.streamId,
      title: a.title,
      description:
        "Assessment assignment is unassigned. A role elsewhere does not allocate this work.",
    })),
  outcomes: scenarioStreams.map((stream) => ({
    streamId: stream.id,
    boundary:
      "No verified runtime observations are represented in this read-only scenario.",
    criteria: [
      {
        id: `${stream.id}-goal`,
        title: stream.goal,
        needed: "An observation tied to the delivered subject and environment.",
        available: "Authored assignments only",
        evidenceIds: [],
        gap: "No outcome observations represented.",
      },
    ],
  })),
  evidence: [],
  flows: Object.fromEntries(
    scenarioStreams.map((stream) => [
      stream.id,
      scenarioAssignments
        .filter((a) => a.streamId === stream.id)
        .map((a) => ({
          title: a.title,
          responsibility: `${a.role} · ${scenarioWorkers.find((w) => w.id === a.workerId)?.name ?? "Unassigned"}`,
          state: a.state,
          exchange:
            "Authored assignment state; no confirmed handoff, verified readiness or execution record.",
          assignmentId: a.id,
        })),
    ]),
  ),
};
export function scenarioWorkerRows(scenario: OrganizationScenario) {
  return scenario.workers.map((worker) => ({
    worker,
    type: worker.category,
    bindings: scenario.bindings.filter((b) => b.workerId === worker.id),
    assignmentIds: scenario.assignments
      .filter((a) => a.workerId === worker.id)
      .map((a) => a.id),
  }));
}
