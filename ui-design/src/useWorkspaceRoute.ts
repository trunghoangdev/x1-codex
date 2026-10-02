import { handoffs } from "./data/handoffs";
import { workers, workstreams } from "./data/organizationOverview";
import {
  readWorkFilters,
  writeWorkFilters,
  type WorkFilters,
} from "./workFilters";
import { useEffect, useState } from "react";
export type WorkspaceView = "My Work" | "Organization" | "Evidence";
export type WorkspaceRoute = {
  view: WorkspaceView;
  assignmentId?: string;
  workstreamId?: string;
  workerId?: string;
  handoffId?: string;
  organizationActivity?: boolean;
  tab: string;
  invalid?: boolean;
  work?: WorkFilters;
};
const viewPaths: Record<WorkspaceView, string> = {
  "My Work": "work",
  Organization: "organization",
  Evidence: "evidence",
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
