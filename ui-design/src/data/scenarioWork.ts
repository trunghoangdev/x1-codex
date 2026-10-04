import type { OrganizationScenario } from "./organizationScenario";
export type ScenarioWorkFilters = {
  query: string;
  role: string;
  stream: string;
  status: "all" | "response" | "waiting" | "both";
};
export const defaultScenarioWorkFilters: ScenarioWorkFilters = {
  query: "",
  role: "All",
  stream: "All",
  status: "all",
};
export function readScenarioWorkFilters(
  params: URLSearchParams,
): ScenarioWorkFilters {
  return {
    query: params.get("q") ?? "",
    role: params.get("role") ?? "All",
    stream: params.get("stream") ?? "All",
    status: (params.get("status") ?? "all") as ScenarioWorkFilters["status"],
  };
}
export function validScenarioWorkFilters(
  scenario: OrganizationScenario,
  params: URLSearchParams,
) {
  const f = readScenarioWorkFilters(params);
  return (
    ["all", "response", "waiting", "both"].includes(f.status) &&
    ["All", ...scenario.roles.map((r) => r.name)].includes(f.role) &&
    ["All", ...scenario.streams.map((s) => s.id)].includes(f.stream)
  );
}
export function scenarioPersonalWork(
  scenario: OrganizationScenario,
  workerId: string,
  filters = defaultScenarioWorkFilters,
) {
  const allocated = scenario.assignments.filter((a) => a.workerId === workerId);
  const shown = allocated.filter((a) => {
    const stream = scenario.streams.find((s) => s.id === a.streamId);
    return (
      `${a.id} ${a.title} ${a.role} ${a.state} ${a.input ?? ""} ${a.expectedResponse ?? ""} ${stream?.name ?? ""} ${stream?.project ?? ""}`
        .toLowerCase()
        .includes(filters.query.trim().toLowerCase()) &&
      (filters.role === "All" || a.role === filters.role) &&
      (filters.stream === "All" || a.streamId === filters.stream) &&
      (filters.status === "all" ||
        (filters.status === "response"
          ? a.responseNeeded === true
          : filters.status === "waiting"
            ? a.waitingForInput === true
            : a.responseNeeded === true && a.waitingForInput === true))
    );
  });
  return {
    allocated,
    shown,
    response: allocated.filter((a) => a.responseNeeded === true).length,
    waiting: allocated.filter((a) => a.waitingForInput === true).length,
    both: allocated.filter(
      (a) => a.responseNeeded === true && a.waitingForInput === true,
    ).length,
  };
}
