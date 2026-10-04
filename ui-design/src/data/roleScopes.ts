import type { OrganizationScenario } from "./organizationScenario";
export type OrganizationScope = { id: string; label: string } & (
  | { kind: "workstream"; streamId: string }
  | { kind: "project"; projectId: string }
  | { kind: "environment"; projectId: string; environment: string }
  | { kind: "subject"; subjectId: string; projectId?: string }
  | { kind: "organization" }
);
export type ScopeRequirement = {
  id: string;
  scopeId: string;
  role: string;
  bindingState: "declared" | "none" | "unknown";
  bindingIds: string[];
  unresolvedBindingIds?: string[];
  gapIds: string[];
  note?: string;
};
export type AssignmentScopeLink = {
  assignmentId: string;
  scopeId: string;
  bindingId?: string;
};
export const mainScopes: OrganizationScope[] = [
  {
    id: "scope-WS-01",
    kind: "workstream",
    streamId: "WS-01",
    label: "Payment webhook reliability",
  },
  {
    id: "scope-WS-02",
    kind: "workstream",
    streamId: "WS-02",
    label: "Team invitation improvements",
  },
  {
    id: "payments-project",
    kind: "project",
    projectId: "payments",
    label: "Payments API",
  },
  {
    id: "workspace-project",
    kind: "project",
    projectId: "workspace",
    label: "Team Workspace",
  },
  {
    id: "release-v182",
    kind: "subject",
    projectId: "payments",
    subjectId: "production-v1.8.2",
    label: "Production release v1.8.2",
  },
  {
    id: "staging-environment",
    kind: "environment",
    projectId: "payments",
    environment: "staging",
    label: "Payments API · staging",
  },
  {
    id: "authorized-releases",
    kind: "subject",
    projectId: "payments",
    subjectId: "authorized-releases",
    label: "Authorized releases only",
  },
  {
    id: "onboarding-subject",
    kind: "subject",
    projectId: "workspace",
    subjectId: "onboarding-accessibility",
    label: "Onboarding accessibility candidate",
  },
];
export const mainBindingRefs = [
  { id: "mb-planner", scopeIds: ["scope-WS-01", "scope-WS-02"] },
  { id: "mb-developer", scopeIds: ["scope-WS-01"] },
  { id: "mb-reviewer", scopeIds: ["payments-project", "workspace-project"] },
  { id: "mb-product-owner", scopeIds: ["scope-WS-02"] },
  { id: "mb-release-authority", scopeIds: ["release-v182"] },
  { id: "mb-operator", scopeIds: ["staging-environment"] },
  { id: "mb-executor", scopeIds: ["authorized-releases"] },
];
export const mainAssignmentScopes: AssignmentScopeLink[] = [
  { assignmentId: "A-1042", scopeId: "scope-WS-01", bindingId: "mb-reviewer" },
  {
    assignmentId: "A-1038",
    scopeId: "scope-WS-02",
    bindingId: "mb-product-owner",
  },
  {
    assignmentId: "A-1041",
    scopeId: "release-v182",
    bindingId: "mb-release-authority",
  },
  {
    assignmentId: "A-1035",
    scopeId: "staging-environment",
    bindingId: "mb-operator",
  },
  {
    assignmentId: "A-1032",
    scopeId: "onboarding-subject",
    bindingId: "mb-reviewer",
  },
];
export const mainScopeRequirements: ScopeRequirement[] = [
  {
    id: "payment-planner",
    scopeId: "scope-WS-01",
    role: "Planner",
    bindingState: "declared",
    bindingIds: ["mb-planner"],
    gapIds: [],
  },
  {
    id: "payment-developer",
    scopeId: "scope-WS-01",
    role: "Developer",
    bindingState: "declared",
    bindingIds: ["mb-developer"],
    gapIds: [],
  },
  {
    id: "payment-reviewer",
    scopeId: "scope-WS-01",
    role: "Reviewer",
    bindingState: "declared",
    bindingIds: ["mb-reviewer"],
    gapIds: [],
    note: "Payments project binding is explicitly referenced for this authored workstream; scope containment is not inferred.",
  },
  {
    id: "invitation-planner",
    scopeId: "scope-WS-02",
    role: "Planner",
    bindingState: "declared",
    bindingIds: ["mb-planner"],
    gapIds: [],
  },
  {
    id: "invitation-owner",
    scopeId: "scope-WS-02",
    role: "Product owner",
    bindingState: "declared",
    bindingIds: ["mb-product-owner"],
    gapIds: [],
  },
  {
    id: "invitation-developer",
    scopeId: "scope-WS-02",
    role: "Developer",
    bindingState: "none",
    bindingIds: [],
    gapIds: ["invitation-implementation"],
  },
  {
    id: "invitation-reviewer",
    scopeId: "scope-WS-02",
    role: "Reviewer",
    bindingState: "declared",
    bindingIds: ["mb-reviewer"],
    gapIds: ["invitation-assessment"],
    note: "Broad Team Workspace binding is represented; no invitation assessment assignment is allocated.",
  },
];
export function scopeRequirementRows(scenario: OrganizationScenario) {
  return scenario.scopeRequirements.map((requirement) => ({
    ...requirement,
    scope: scenario.scopes.find((s) => s.id === requirement.scopeId)!,
    bindings: requirement.bindingIds.map((id) =>
      scenario.bindings.find((b) => b.id === id)!,
    ),
    unresolvedBindings: (requirement.unresolvedBindingIds ?? []).map((id) =>
      scenario.bindings.find((b) => b.id === id)!,
    ),
    assignments: scenario.assignmentScopes
      .filter(
        (link) =>
          link.scopeId === requirement.scopeId &&
          scenario.assignments.find((a) => a.id === link.assignmentId)?.role ===
            requirement.role,
      )
      .map((link) => ({
        assignment: scenario.assignments.find(
          (a) => a.id === link.assignmentId,
        )!,
        binding: scenario.bindings.find((b) => b.id === link.bindingId),
      })),
    gaps: requirement.gapIds.map((id) =>
      scenario.gaps.find((g) => g.id === id)!,
    ),
  }));
}
