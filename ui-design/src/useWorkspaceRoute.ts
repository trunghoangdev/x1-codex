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
  assignmentId?: string;
  workstreamId?: string;
  workerId?: string;
  handoffId?: string;
  organizationActivity?: boolean;
  outcomeId?: string;
  attention?: AttentionCategory | "All";
  personalQueue?: boolean;
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
    const separator = raw.indexOf("?");
    fallback.work = readWorkFilters(
      separator < 0 ? "" : raw.slice(separator + 1),
    );
    const path = (separator < 0 ? raw : raw.slice(0, separator)).split("/");
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
        ["All", "Responsibility", "Response", "Outcome"] as const
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
    const path = next.assignmentId
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
                    : `#/${viewPaths[next.view]}`;
    const hash = path + (next.work ? writeWorkFilters(next.work) : "");
    if (location.hash !== hash) {
      if (replace) history.replaceState(null, "", hash);
      else history.pushState(null, "", hash);
    }
    setRoute(next);
  }
  return { route, navigate };
}
