import type { OrganizationScenario } from "./organizationScenario";
export type RoleFilters = {
  page?: number;
  detail?: string;
  bindingsPage?: number;
  assignmentsPage?: number;
  gapsPage?: number;
  query: string;
  view?: "scope";
  scope?: string;
  coverage: "all" | "unbound" | "no-assignments" | "gaps" | "unknown";
};
export const defaultRoleFilters: RoleFilters = { query: "", coverage: "all" };
export const roleCoverage = [
  "all",
  "unbound",
  "no-assignments",
  "gaps",
  "unknown",
];
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

export const rolePageSize = 4;
export const roleRecordPages = [
  "page",
  "bindingsPage",
  "assignmentsPage",
  "gapsPage",
] as const;
export function readRolePages(params: URLSearchParams) {
  return Object.fromEntries(
    roleRecordPages.map((key) => [
      key,
      params.has(key) ? Number(params.get(key)) : undefined,
    ]),
  );
}
export function rolePageParams(filters: RoleFilters): Record<string, string> {
  return {
    detail: filters.detail ?? "",
    ...Object.fromEntries(
      roleRecordPages.map((key) => [
        key,
        (filters[key] ?? 1) > 1 ? String(filters[key]) : "",
      ]),
    ),
  };
}
