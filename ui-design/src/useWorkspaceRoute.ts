import { useEffect, useState } from "react";
export type WorkspaceView = "My Work" | "Organization" | "Evidence";
export type WorkspaceRoute = {
  view: WorkspaceView;
  assignmentId?: string;
  tab: string;
  invalid?: boolean;
};
const viewPaths: Record<WorkspaceView, string> = {
  "My Work": "work",
  Organization: "organization",
  Evidence: "evidence",
};
export function useWorkspaceRoute(ids: string[], tabs: string[]) {
  function read(): WorkspaceRoute {
    const fallback: WorkspaceRoute = { view: "My Work", tab: "Overview" };
    if (!location.hash || location.hash === "#") return fallback;
    const path = location.hash.slice(1).split("/");
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
  function navigate(next: WorkspaceRoute) {
    const hash = next.assignmentId
      ? `#/assignments/${next.assignmentId}/${next.tab.toLowerCase()}`
      : `#/${viewPaths[next.view]}`;
    if (location.hash !== hash) history.pushState(null, "", hash);
    setRoute(next);
  }
  return { route, navigate };
}
