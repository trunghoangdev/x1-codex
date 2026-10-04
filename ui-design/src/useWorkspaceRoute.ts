import { roleCoverage, type RoleFilters } from "./data/roleDirectory";
import { validScenarioPath } from "./ScenarioWorkspace";
import {
  defaultWorkerFilters,
  directoryRoles,
  type WorkerFilters,
} from "./data/workerDirectory";
import {
  defaultStreamFilters,
  type StreamFilters,
} from "./data/workstreamDirectory";
import type { AttentionCategory } from "./data/organizationAttention";
import { outcomes } from "./data/outcomes";
import { handoffs } from "./data/handoffs";
import { workers, workstreams } from "./data/organizationOverview";
import {
  readWorkFilters,
  writeWorkFilters,
  type WorkFilters,
} from "./workFilters";
import { useEffect, useState } from "react";
export type WorkspaceView = "My Work" | "Organization" | "Evidence" | "Demos";
export type WorkspaceRoute = {
  view: WorkspaceView;
  scenarioPath?: string;
  assignmentId?: string;
  workstreamId?: string;
  workerId?: string;
  handoffId?: string;
  organizationActivity?: boolean;
  streamDirectory?: StreamFilters;
  workerDirectory?: WorkerFilters;
  roleDirectory?: RoleFilters;
  outcomeId?: string;
  attention?: AttentionCategory | "All";
  personalQueue?: boolean;
  largeOrganization?: boolean;
  tab: string;
  invalid?: boolean;
  work?: WorkFilters;
};
const viewPaths: Record<WorkspaceView, string> = {
  "My Work": "work",
  Organization: "organization",
  Evidence: "evidence",
  Demos: "demos",
};
export function useWorkspaceRoute(ids: string[], tabs: string[]) {
  function read(): WorkspaceRoute {
    const fallback: WorkspaceRoute = { view: "My Work", tab: "Overview" };
    if (!location.hash || location.hash === "#")
      return { ...fallback, view: "Organization" };
    const raw = location.hash.slice(1);
    if (raw.startsWith("/organizations/"))
      return validScenarioPath(raw)
        ? {
            view: raw.split("?")[0].endsWith("/work")
              ? "My Work"
              : "Organization",
            tab: "Overview",
            scenarioPath: raw,
          }
        : { ...fallback, invalid: true };
    const separator = raw.indexOf("?");
    fallback.work = readWorkFilters(
      separator < 0 ? "" : raw.slice(separator + 1),
    );
    const path = (separator < 0 ? raw : raw.slice(0, separator)).split("/");
    if (path.join("/") === "/organization/roles") {
      const params = new URLSearchParams(
        separator < 0 ? "" : raw.slice(separator + 1),
      );
      const coverage = params.get("coverage") ?? "all";
      if (!roleCoverage.includes(coverage))
        return { ...fallback, invalid: true };
      return {
        view: "Organization",
        tab: "Overview",
        roleDirectory: {
          query: params.get("q") ?? "",
          coverage: coverage as RoleFilters["coverage"],
        },
      };
    }
    if (path.join("/") === "/organization/workers") {
      const params = new URLSearchParams(
        separator < 0 ? "" : raw.slice(separator + 1),
      );
      const type = params.get("type") ?? "all";
      const role = params.get("role") ?? "All";
      const links = params.get("links") ?? "all";
      if (
        !["all", "human", "ai", "deterministic"].includes(type) ||
        !["All", ...directoryRoles].includes(role) ||
        !["all", "linked", "none"].includes(links)
      )
        return { ...fallback, invalid: true };
      return {
        view: "Organization",
        tab: "Overview",
        workerDirectory: {
          ...defaultWorkerFilters,
          query: params.get("q") ?? "",
          type: type as WorkerFilters["type"],
          role,
          assignments: links as WorkerFilters["assignments"],
        },
      };
    }
    if (path.join("/") === "/organization/workstreams") {
      const params = new URLSearchParams(
        separator < 0 ? "" : raw.slice(separator + 1),
      );
      const project = params.get("project") ?? "All";
      const signal = params.get("signal") ?? "all";
      if (
        !["All", ...workstreams.map((s) => s.project)].includes(project) ||
        !["all", "responsibility", "outcome"].includes(signal)
      )
        return { ...fallback, invalid: true };
      return {
        view: "Organization",
        tab: "Overview",
        streamDirectory: {
          ...defaultStreamFilters,
          query: params.get("q") ?? "",
          project,
          signal: signal as StreamFilters["signal"],
        },
      };
    }
    if (
      path.length === 3 &&
      path[0] === "" &&
      path[1] === "workstreams" &&
      workstreams.some((stream) => stream.id === path[2])
    ) {
      return { ...fallback, view: "Organization", workstreamId: path[2] };
    }
    if (
      path.length === 3 &&
      path[0] === "" &&
      path[1] === "workers" &&
      workers.some((worker) => worker.id === path[2])
    ) {
      return { ...fallback, view: "Organization", workerId: path[2] };
    }
    if (
      path.length === 3 &&
      path[0] === "" &&
      path[1] === "handoffs" &&
      handoffs.some((h) => h.id === path[2])
    )
      return { ...fallback, view: "Organization", handoffId: path[2] };
    if (
      path.length === 3 &&
      path[0] === "" &&
      path[1] === "organization" &&
      path[2] === "activity"
    )
      return { ...fallback, view: "Organization", organizationActivity: true };
    if (
      path.length === 3 &&
      path[0] === "" &&
      path[1] === "outcomes" &&
      outcomes.some((o) => o.streamId === path[2])
    )
      return { ...fallback, view: "Organization", outcomeId: path[2] };
    if (
      path[0] === "" &&
      path[1] === "organization" &&
      path[2] === "attention" &&
      (path.length === 3 || path.length === 4)
    ) {
      const attention = (
        ["All", "Responsibility", "Response", "Input", "Outcome"] as const
      ).find((value) => value.toLowerCase() === (path[3] ?? "all"));
      if (attention) return { ...fallback, view: "Organization", attention };
    }
    if (
      path.length === 3 &&
      path[0] === "" &&
      path[1] === "work" &&
      path[2] === "attention"
    )
      return { ...fallback, personalQueue: true };
    if (
      path.length === 3 &&
      path[0] === "" &&
      path[1] === "demos" &&
      path[2] === "organization"
    )
      return { ...fallback, view: "Demos", largeOrganization: true };
    if (path.length === 2 && path[0] === "") {
      const view = (Object.keys(viewPaths) as WorkspaceView[]).find(
        (v) => viewPaths[v] === path[1],
      );
      if (view) return { ...fallback, view };
    }
    if (
      path.length === 4 &&
      path[0] === "" &&
      path[1] === "assignments" &&
      ids.includes(path[2])
    ) {
      const tab = tabs.find((t) => t.toLowerCase() === path[3]);
      if (tab) return { ...fallback, assignmentId: path[2], tab };
    }
    return { ...fallback, invalid: true };
  }
  const [route, setRoute] = useState<WorkspaceRoute>(read);
  useEffect(() => {
    const update = () => setRoute(read());
    window.addEventListener("popstate", update);
    window.addEventListener("hashchange", update);
    return () => {
      window.removeEventListener("popstate", update);
      window.removeEventListener("hashchange", update);
    };
  }, []);
  function navigate(next: WorkspaceRoute, replace = false) {
    const path = next.scenarioPath
      ? `#${next.scenarioPath}`
      : next.roleDirectory
        ? "#/organization/roles"
        : next.workerDirectory
          ? "#/organization/workers"
          : next.streamDirectory
            ? "#/organization/workstreams"
            : next.assignmentId
              ? `#/assignments/${next.assignmentId}/${next.tab.toLowerCase()}`
              : next.workstreamId
                ? `#/workstreams/${next.workstreamId}`
                : next.workerId
                  ? `#/workers/${next.workerId}`
                  : next.handoffId
                    ? `#/handoffs/${next.handoffId}`
                    : next.organizationActivity
                      ? "#/organization/activity"
                      : next.outcomeId
                        ? `#/outcomes/${next.outcomeId}`
                        : next.attention
                          ? `#/organization/attention/${next.attention.toLowerCase()}`
                          : next.personalQueue
                            ? "#/work/attention"
                            : next.largeOrganization
                              ? "#/demos/organization"
                              : `#/${viewPaths[next.view]}`;
    const params = new URLSearchParams();
    if (next.roleDirectory) {
      if (next.roleDirectory.query) params.set("q", next.roleDirectory.query);
      if (next.roleDirectory.coverage !== "all")
        params.set("coverage", next.roleDirectory.coverage);
    }
    if (next.streamDirectory) {
      if (next.streamDirectory.query)
        params.set("q", next.streamDirectory.query);
      if (next.streamDirectory.project !== "All")
        params.set("project", next.streamDirectory.project);
      if (next.streamDirectory.signal !== "all")
        params.set("signal", next.streamDirectory.signal);
    }
    if (next.workerDirectory) {
      if (next.workerDirectory.query)
        params.set("q", next.workerDirectory.query);
      if (next.workerDirectory.type !== "all")
        params.set("type", next.workerDirectory.type);
      if (next.workerDirectory.role !== "All")
        params.set("role", next.workerDirectory.role);
      if (next.workerDirectory.assignments !== "all")
        params.set("links", next.workerDirectory.assignments);
    }
    const hash =
      path +
      (next.roleDirectory || next.streamDirectory || next.workerDirectory
        ? params.size
          ? `?${params}`
          : ""
        : next.work
          ? writeWorkFilters(next.work)
          : "");
    if (location.hash !== hash) {
      if (replace) history.replaceState(null, "", hash);
      else history.pushState(null, "", hash);
    }
    setRoute(next);
  }
  return { route, navigate };
}
