import {
  mainScopes,
  mainBindingRefs,
  mainAssignmentScopes,
  mainScopeRequirements,
  type OrganizationScope,
  type ScopeRequirement,
  type AssignmentScopeLink,
} from "./roleScopes";
import {
  softwareDependencies,
  type InputDependency,
  type ParallelWork,
} from "./coordination";
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
  id: "main" | "large" | "knowledge";
  domain: string;
  purpose: string;
  personas?: { workerId: string; label: string }[];
  name: string;
  readOnly: boolean;
  workers: (Worker & { category: "human" | "ai" | "deterministic" })[];
  roles: { name: string; purpose: string }[];
  roleGaps: { role: string; gapId: string }[];
  bindings: (RoleBinding & { id: string; scopeIds: string[] })[];
  scopes: OrganizationScope[];
  scopeRequirements: ScopeRequirement[];
  assignmentScopes: AssignmentScopeLink[];
  streams: Workstream[];
  assignments: {
    id: string;
    streamId?: string;
    workerId?: string;
    role: string;
    title: string;
    state: string;
    responseNeeded?: boolean;
    waitingForInput?: boolean;
    input?: string;
    expectedResponse?: string;
  }[];
  dependencies: InputDependency[];
  parallelWork: ParallelWork[];
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
  domain: "Software Factory",
  purpose: "Build software with accountable collaboration.",
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
  bindings: roleBindings.map((b, i) => ({ ...b, ...mainBindingRefs[i] })),
  scopes: mainScopes,
  scopeRequirements: mainScopeRequirements,
  assignmentScopes: mainAssignmentScopes,
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
  dependencies: softwareDependencies,
  parallelWork: [],
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
  personas: [
    { workerId: "sam", label: "Sam · Reviewer" },
    { workerId: "jamie", label: "Jamie · Planner" },
  ],
  domain: "Software Factory",
  purpose: "Build software with accountable collaboration.",
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
    id: binding.id,
    scopeIds: [binding.scopeId],
    workerId: binding.workerId,
    role: binding.role,
    scope:
      scenarioStreams.find((stream) => stream.id === binding.streamId)?.name ??
      binding.streamId,
    permission:
      "Authored responsibility only · effective permission not verified",
  })),
  scopes: [
    ...scenarioStreams.map((s) => ({
      id: `scope-${s.id}`,
      kind: "workstream" as const,
      streamId: s.id,
      label: s.name,
    })),
    {
      id: "large-org",
      kind: "organization",
      label: "All larger-sample workstreams",
    },
    {
      id: "large-authorized",
      kind: "subject",
      subjectId: "authorized-subjects",
      label: "Authorized subjects only",
    },
  ],
  scopeRequirements: scenarioStreams.flatMap((stream) => [
    {
      id: `${stream.id}-planner-scope`,
      scopeId: `scope-${stream.id}`,
      role: "Planner",
      bindingState: "declared" as const,
      bindingIds: ["lb-planner"],
      gapIds: [],
    },
    ...scenarioAssignments
      .filter((a) => a.streamId === stream.id)
      .map((a) => ({
        id: `${a.id}-scope`,
        scopeId: `scope-${stream.id}`,
        role: a.role,
        bindingState: a.workerId ? ("declared" as const) : ("none" as const),
        bindingIds: a.workerId ? [`lb-${a.id}`] : [],
        gapIds: a.workerId ? [] : [`gap-${a.id}`],
      })),
  ]),
  assignmentScopes: scenarioAssignments.map((a) => ({
    assignmentId: a.id,
    scopeId: `scope-${a.streamId}`,
    bindingId: a.workerId ? `lb-${a.id}` : undefined,
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
  dependencies: [],
  parallelWork: [],
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
