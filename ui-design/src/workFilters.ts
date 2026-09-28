import type { Kind } from "./data/models";
export type WorkFilters = {
  kind: Kind | "All";
  query: string;
  project: string;
  completed: boolean;
  draftsOnly: boolean;
  sort: "default" | "due";
};
export const defaultWorkFilters: WorkFilters = {
  kind: "All",
  query: "",
  project: "All",
  completed: false,
  draftsOnly: false,
  sort: "default",
};
export function readWorkFilters(value: string): WorkFilters {
  const p = new URLSearchParams(value),
    kind = p.get("kind");
  return {
    kind: ["Work", "Assessment", "Authority", "Reconciliation"].includes(
      kind ?? "",
    )
      ? (kind as Kind)
      : "All",
    query: p.get("q") ?? "",
    project: p.get("project") ?? "All",
    completed: p.get("status") === "completed",
    draftsOnly: p.get("drafts") === "1",
    sort: p.get("sort") === "due" ? "due" : "default",
  };
}
export function writeWorkFilters(f: WorkFilters) {
  const p = new URLSearchParams();
  if (f.kind !== "All") p.set("kind", f.kind);
  if (f.query) p.set("q", f.query);
  if (f.project !== "All") p.set("project", f.project);
  if (f.completed) p.set("status", "completed");
  if (f.draftsOnly) p.set("drafts", "1");
  if (f.sort === "due") p.set("sort", "due");
  return p.size ? `?${p.toString()}` : "";
}
