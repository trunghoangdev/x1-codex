import { roleBindings, workers } from "./organizationOverview";
import { workerAssignments } from "./workerDetails";

export type WorkerFilters = {
  query: string;
  type: "all" | "human" | "ai" | "deterministic";
  role: string;
  assignments: "all" | "linked" | "none";
};
export const defaultWorkerFilters: WorkerFilters = {
  query: "",
  type: "all",
  role: "All",
  assignments: "all",
};
export const directoryRoles = [
  ...new Set(roleBindings.map((binding) => binding.role)),
];
// Worker type labels are presentation text; classification is explicitly authored.
export const workerTypes: Record<string, WorkerFilters["type"]> = {
  alex: "human",
  jamie: "human",
  codex: "ai",
  runner: "deterministic",
};
export const workerDirectory = workers.map((worker) => ({
  worker,
  type: workerTypes[worker.id],
  bindings: roleBindings.filter((binding) => binding.workerId === worker.id),
  assignmentIds: [
    ...new Set(Object.values(workerAssignments[worker.id] ?? {}).flat()),
  ],
}));
