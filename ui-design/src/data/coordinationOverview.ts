import type { OrganizationScenario } from "./organizationScenario";
export type CoordinationFilters = {
  query: string;
  signal: "all" | "responsibility" | "input" | "response" | "outcome";
  page?: number;
};
export const defaultCoordinationFilters: CoordinationFilters = {
  query: "",
  signal: "all",
};
export function coordinationRows(scenario: OrganizationScenario) {
  return scenario.streams.map((stream) => ({
    stream,
    gaps: scenario.gaps.filter((g) => g.workstreamId === stream.id),
    inputs: scenario.dependencies.filter(
      (d) => d.streamId === stream.id && d.availability === "missing",
    ),
    responses: scenario.assignments.filter(
      (a) => a.streamId === stream.id && a.responseNeeded === true,
    ),
    criteria:
      scenario.outcomes
        .find((o) => o.streamId === stream.id)
        ?.criteria.filter((c) => c.gap.trim().length > 0) ?? [],
  }));
}
export function filteredCoordinationRows(
  scenario: OrganizationScenario,
  filters: CoordinationFilters,
) {
  return coordinationRows(scenario).filter(
    (r) =>
      `${r.stream.id} ${r.stream.name} ${r.stream.project} ${r.stream.goal}`
        .toLowerCase()
        .includes(filters.query.trim().toLowerCase()) &&
      (filters.signal === "all" ||
        (filters.signal === "responsibility"
          ? r.gaps.length
          : filters.signal === "input"
            ? r.inputs.length
            : filters.signal === "response"
              ? r.responses.length
              : r.criteria.length) > 0),
  );
}
