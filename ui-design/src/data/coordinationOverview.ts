import { mainOrganization } from "./organizationScenario";
import { organizationAttention } from "./organizationAttention";
import type { Readiness } from "./models";
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

// Main response signals come from the interactive projection, never state labels.
export function mainCoordinationScenario(
  completed: Record<string, string>,
  readiness: Readiness,
): OrganizationScenario {
  const pending = organizationAttention(completed, readiness).filter(
    (i) => i.category === "Response" && i.target.kind === "assignment",
  );
  return {
    ...mainOrganization,
    assignments: mainOrganization.assignments.map((a) => ({
      ...a,
      responseNeeded: Boolean(
        a.streamId && pending.some((i) => i.target.id === a.id),
      ),
      expectedResponse:
        pending.find((i) => i.target.id === a.id)?.detail ?? a.expectedResponse,
    })),
  };
}
