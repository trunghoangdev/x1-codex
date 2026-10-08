import { workerCapabilityProfile } from "./workerCapabilities";
import type { OrganizationScenario } from "./organizationScenario";
export type WorkerProfile = {
  source: string;
  capabilities: { id: string; label: string; scope: string; basis: string }[];
  availability: {
    status: "Unknown" | "Limited" | "Stale";
    scope: string;
    note: string;
  };
  constraints: string[];
};
// Authored product examples, not extracted skills, worker self-reports or runtime telemetry.
const profiles: Record<string, WorkerProfile> = {
  leo: {
    source: "Authored Knowledge demo profile · readiness-v1",
    capabilities: [
      {
        id: "coordination",
        label: "Audience and input coordination",
        scope: "Knowledge workstreams",
        basis: "Declared sample capability; performance not verified.",
      },
      {
        id: "facilitation",
        label: "Practical learning facilitation",
        scope: "K-02 welcome-guide exercise",
        basis: "Declared sample capability; no observed facilitation evidence.",
      },
    ],
    availability: {
      status: "Unknown",
      scope: "K-02 preparation and session window",
      note: "No calendar, time budget or current workload confirmation is represented. Ask Leo to confirm the exact audience, session window and preparation effort.",
    },
    constraints: [
      "Preparation and session window require confirmation.",
      "Coordinator responsibility does not grant a Facilitator binding.",
    ],
  },
  maya: {
    source: "Authored Knowledge demo profile · readiness-v1",
    capabilities: [
      {
        id: "editorial",
        label: "Editorial and learning-outline review",
        scope: "Knowledge workstreams",
        basis:
          "Declared sample capability; review quality not independently verified.",
      },
    ],
    availability: {
      status: "Limited",
      scope: "Local workshop preparation review only",
      note: "Authored constraint example, not a live availability report: review support only; no facilitation time commitment is represented.",
    },
    constraints: [
      "Facilitation capability is not declared; absence is not proof of inability.",
      "Keep independent preparation and outcome review separate from execution.",
    ],
  },
  research: {
    source: "Authored Knowledge demo profile · readiness-v1",
    capabilities: [
      {
        id: "research",
        label: "Source-linked research drafting",
        scope: "K-01 guide preparation",
        basis:
          "Declared sample capability; no evaluated facilitation capability.",
      },
    ],
    availability: {
      status: "Unknown",
      scope: "AI runtime and dispatch capacity",
      note: "No connected runtime, quota or execution-slot data.",
    },
    constraints: [
      "The current K-02 demo requires a human facilitator.",
      "Research contributions do not establish permission to run a workshop.",
    ],
  },
  publisher: {
    source: "Authored Knowledge demo profile · readiness-v1",
    capabilities: [
      {
        id: "distribution",
        label: "Distribution of approved material",
        scope: "Named audience and approved subject",
        basis: "Declared deterministic task scope; no facilitation capability.",
      },
    ],
    availability: {
      status: "Unknown",
      scope: "Distribution runtime",
      note: "No connected queue, runtime health or dispatch capacity.",
    },
    constraints: [
      "Deterministic distribution is separate from human facilitation.",
      "Publication authorization is still required for distribution.",
    ],
  },
};
export function workerProfile(
  scenario: OrganizationScenario,
  workerId: string,
): WorkerProfile {
  const existing = workerCapabilityProfile(scenario.id, workerId);
  if (existing)
    return {
      source: existing.source,
      capabilities: existing.capabilities.map((label, i) => ({
        id: `declared-${i}`,
        label,
        scope: "Bounded task described in the authored profile",
        basis: "Authored declaration, not a verified skills assessment.",
      })),
      availability:
        existing.availability.state === "unknown"
          ? {
              status: "Unknown",
              scope: "Specific assignment and time window",
              note: existing.availability.reason,
            }
          : {
              status: "Stale",
              scope: `Historical window ${existing.availability.asOf} to ${existing.availability.validUntil}`,
              note: `${existing.availability.statement} ${existing.availability.source} Current availability is unknown.`,
            },
      constraints: existing.constraints,
    };
  return (
    (scenario.id === "knowledge" && profiles[workerId]) || {
      source: "No capability or availability profile supplied for this worker",
      capabilities: [],
      availability: {
        status: "Unknown",
        scope: "No confirmed scope or time window",
        note: "Assignment links and role bindings are not evidence of spare capacity or skill.",
      },
      constraints: [
        "Confirm capability, availability and scoped authority before allocation.",
      ],
    }
  );
}
export function facilitatorReadiness(
  scenario: OrganizationScenario,
  workerId: string,
) {
  const worker = scenario.workers.find((w) => w.id === workerId),
    profile = workerProfile(scenario, workerId);
  const declared = profile.capabilities.some(
    (c) => c.id === "facilitation" && c.scope === "K-02 welcome-guide exercise",
  );
  return {
    worker,
    profile,
    declared,
    links: scenario.assignments
      .filter((a) => a.workerId === workerId)
      .map((a) => a.id),
    status:
      worker?.category !== "human"
        ? "Outside current human facilitator requirement"
        : !declared
          ? "Facilitation capability not declared"
          : "Declared capability · availability confirmation needed",
  };
}
export function workerReadinessSearch(
  scenario: OrganizationScenario,
  id: string,
) {
  const p = workerProfile(scenario, id);
  return [
    ...p.capabilities.map((c) => `${c.label} ${c.scope}`),
    p.availability.status,
    p.availability.scope,
  ].join(" ");
}
