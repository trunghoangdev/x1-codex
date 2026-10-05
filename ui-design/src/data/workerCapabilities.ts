export type AvailabilityDeclaration =
  | { state: "unknown"; reason: string }
  | {
      state: "stale";
      asOf: string;
      validUntil: string;
      statement: string;
      source: string;
    };

export interface WorkerCapabilityProfile {
  workerId: string;
  category: "human" | "ai";
  capabilities: string[];
  source: string;
  constraints: string[];
  availability: AvailabilityDeclaration;
}

// Independently authored main-scenario planning examples; not inferred from bindings or queues.
const profiles: WorkerCapabilityProfile[] = [
  {
    workerId: "jamie",
    category: "human",
    capabilities: [
      "Clarify bounded implementation criteria and inspect invitation behavior.",
      "Review a proposed change against declared acceptance criteria.",
    ],
    source:
      "Authored planning profile · human-profile-jamie-01. Not a verified skills assessment.",
    constraints: [
      "Current schedule, competing commitments and available review time are not supplied.",
      "Confirm willingness and time before allocating this specific scope.",
    ],
    availability: {
      state: "unknown",
      reason:
        "No availability declaration is supplied. Assignment count and Reviewer bindings do not establish time available.",
    },
  },
  {
    workerId: "codex",
    category: "ai",
    capabilities: [
      "Prepare a bounded code change and run repository checks when tools and repository access are granted.",
    ],
    source:
      "Authored planning profile · ai-profile-codex-01. Not a live tool-access probe.",
    constraints: [
      "Repository access, permitted tools, execution environment and run budget must be confirmed for the assignment.",
      "Code preparation capability grants no review, publication or release authority.",
    ],
    availability: {
      state: "stale",
      asOf: "2026-09-28T09:00:00Z",
      validUntil: "2026-09-29T09:00:00Z",
      statement:
        "Illustrative historical declaration: one bounded implementation run could be scheduled after environment setup.",
      source:
        "Authored coordinator declaration · ai-availability-01; not a runtime heartbeat or current capacity report.",
    },
  },
];

export function workerCapabilityProfile(scenarioId: string, workerId: string) {
  return scenarioId === "main"
    ? profiles.find((p) => p.workerId === workerId)
    : undefined;
}
