import { resolveScenario } from "./data/scenarioRegistry";
import { coordinationCases } from "./data/coordinationCases";
import { agreementVersions } from "./data/workstreamAgreements";
import { operatingPattern } from "./data/operatingPatterns";
import { walkthroughRecords } from "./data/collaborationWalkthrough";
import { exchangeActivity, exchangeKinds } from "./data/exchangeActivity";
import { validScenarioWorkFilters } from "./data/scenarioWork";
import { roleCoverage, roleRecordPages } from "./data/roleDirectory";
import { validDirectoryPage } from "./data/workerDirectory";
export function validScenarioPath(raw: string) {
  const scenario = resolveScenario(raw);
  if (!scenario) return false;
  const base = `/organizations/${scenario.id}`;
  const [path, query] = raw.split("?");
  const suffix = path.slice(base.length);
  const params = new URLSearchParams(query);
  if (
    ![
      "",
      "/workstreams",
      "/workers",
      "/roles",
      ...(scenario.personas ? ["/work"] : []),
      "/attention",
      "/activity",
      "/evidence",
      "/decisions",
      ...(scenario.id === "knowledge"
        ? [
            "/cases",
            "/walkthroughs/guide-cycle",
            "/agreements/K-01",
            "/outcome-reviews/guide-review-01",
            ...scenario.streams
              .filter((s) => operatingPattern(scenario, s.id))
              .map((s) => `/patterns/${s.id}`),
            ...coordinationCases(scenario).map((c) => `/cases/${c.id}`),
          ]
        : []),
      ...scenario.streams.map((s) => `/workstreams/${s.id}`),
      ...scenario.outcomes.map((o) => `/outcomes/${o.streamId}`),
      ...scenario.streams.map((s) => `/workflows/${s.id}`),
      ...scenario.workers.map((w) => `/workers/${w.id}`),
      ...scenario.assignments.map((a) => `/assignments/${a.id}`),
    ].includes(suffix)
  )
    return false;
  return (
    (!params.has("cycleRecord") ||
      (scenario.id === "knowledge" &&
        suffix === "/walkthroughs/guide-cycle" &&
        walkthroughRecords.some((r) => r.id === params.get("cycleRecord")))) &&
    (!["agreementVersion", "compare"].some((k) => params.has(k)) ||
      (scenario.id === "knowledge" &&
        suffix === "/agreements/K-01" &&
        agreementVersions.some(
          (v) => v.id === (params.get("agreementVersion") ?? "brief-v2"),
        ) &&
        ["yes", "no"].includes(params.get("compare") ?? "no"))) &&
    (!["caseQ", "caseOwner", "caseNeed"].some((k) => params.has(k)) ||
      (suffix === "/cases" &&
        ["all", "assigned", "unknown"].includes(
          params.get("caseOwner") ?? "all",
        ) &&
        ["all", "input", "policy"].includes(
          params.get("caseNeed") ?? "all",
        ))) &&
    (!["actStream", "actKind", "event"].some((k) => params.has(k)) ||
      (suffix === "/activity" &&
        ["all", ...scenario.streams.map((s) => s.id)].includes(
          params.get("actStream") ?? "all",
        ) &&
        ["all", ...exchangeKinds].includes(params.get("actKind") ?? "all") &&
        (!params.has("event") ||
          exchangeActivity(scenario).some(
            (e) => e.id === params.get("event"),
          )))) &&
    (suffix !== "/work" || validScenarioWorkFilters(scenario, params)) &&
    (!["coordQ", "coordSignal", "coordPage"].some((key) => params.has(key)) ||
      (scenario.readOnly &&
        suffix === "" &&
        ["all", "responsibility", "input", "response", "outcome"].includes(
          params.get("coordSignal") ?? "all",
        ) &&
        validDirectoryPage(params.get("coordPage")))) &&
    (!params.has("page") ||
      (["/workers", "/workstreams", "/roles"].includes(suffix) &&
        validDirectoryPage(params.get("page")))) &&
    (suffix !== "/roles" ||
      (roleRecordPages.every((key) => validDirectoryPage(params.get(key))) &&
        (!params.has("detail") ||
          scenario.roles.some((r) => r.name === params.get("detail"))))) &&
    (!params.has("persona") ||
      !!scenario.personas?.some((p) => p.workerId === params.get("persona"))) &&
    (!params.has("view") || params.get("view") === "scope") &&
    (!params.has("scope") ||
      [
        "All",
        ...scenario.scopes
          .filter((s) => s.kind === "workstream")
          .map((s) => s.id),
      ].includes(params.get("scope")!)) &&
    (!params.has("coverage") ||
      (roleCoverage.includes(params.get("coverage")!) &&
        (params.get("coverage") !== "unknown" ||
          params.get("view") === "scope"))) &&
    (!params.has("category") ||
      ["all", "responsibility", "response", "input", "outcome"].includes(
        params.get("category")!,
      )) &&
    (!params.has("project") ||
      ["All", ...scenario.streams.map((s) => s.project)].includes(
        params.get("project")!,
      )) &&
    (!params.has("signal") ||
      ["all", "responsibility", "outcome"].includes(params.get("signal")!)) &&
    (!params.has("type") ||
      ["all", "human", "ai", "deterministic"].includes(params.get("type")!)) &&
    (!params.has("role") ||
      [
        "All",
        ...(suffix === "/work"
          ? scenario.roles.map((r) => r.name)
          : scenario.bindings.map((b) => b.role)),
      ].includes(params.get("role")!)) &&
    (!params.has("links") ||
      ["all", "linked", "none"].includes(params.get("links")!))
  );
}
