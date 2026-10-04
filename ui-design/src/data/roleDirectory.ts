import type { OrganizationScenario } from "./organizationScenario";
export type RoleFilters = {
  query: string;
  coverage: "all" | "unbound" | "no-assignments" | "gaps";
};
export const defaultRoleFilters: RoleFilters = { query: "", coverage: "all" };
export const roleCoverage = ["all", "unbound", "no-assignments", "gaps"];
export function scenarioRoleRows(scenario: OrganizationScenario) {
  return scenario.roles.map((role) => ({
    ...role,
    bindings: scenario.bindings.filter((b) => b.role === role.name),
    assignments: scenario.assignments.filter((a) => a.role === role.name),
    gaps: scenario.roleGaps
      .filter((g) => g.role === role.name)
      .map((link) => scenario.gaps.find((g) => g.id === link.gapId)!),
  }));
}
