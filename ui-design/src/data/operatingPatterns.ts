import type { OrganizationScenario } from "./organizationScenario";

export interface OperatingPattern {
  id: string;
  version: string;
  title: string;
  mandates: { role: string; expectation: string }[];
  exchanges: string[];
  revision: string;
  policy: {
    state: "unknown";
    subject: string;
    decisionRole: string;
    escalation: string;
  };
}
const guidePattern: OperatingPattern = {
  id: "knowledge-guide",
  version: "pattern-v1",
  title: "Research and editorial preparation",
  mandates: [
    {
      role: "Researcher",
      expectation: "Prepare a cited draft and surface source questions.",
    },
    {
      role: "Editor",
      expectation:
        "Clarify acceptance criteria; assess a named draft only when allocated.",
    },
    {
      role: "Coordinator",
      expectation:
        "Clarify audience and channel; seek explicit publication decision responsibility.",
    },
  ],
  exchanges: [
    "Research and editorial-criteria preparation may proceed in parallel.",
    "Assess a named draft against declared criteria before seeking publication authorization.",
    "Distribute only after a separately authorized decision for the exact guide revision and audience.",
  ],
  revision:
    "Return specific assessment findings to the draft provider and identify the revised subject. Receipt, assessment and authorization remain separate records.",
  policy: {
    state: "unknown",
    subject:
      "Publication of a named guide revision to a declared audience/channel; exact identity still required.",
    decisionRole:
      "Publication authorization role and owner not supplied. The assessment-role gap does not allocate authorization.",
    escalation:
      "Escalation policy, trigger and recipient not supplied. Coordinator and Planner labels do not define an escalation chain.",
  },
};
const workshopPattern: OperatingPattern = {
  id: "knowledge-workshop",
  version: "pattern-v1",
  title: "Brief-led workshop preparation",
  mandates: [
    {
      role: "Coordinator",
      expectation:
        "Supply a versioned audience/schedule brief and identify unresolved inputs.",
    },
    {
      role: "Editor",
      expectation:
        "Acknowledge the exact brief independently of assessing session preparation.",
    },
    {
      role: "Facilitator",
      expectation:
        "Prepare and facilitate a session only after explicit responsibility allocation.",
    },
  ],
  exchanges: [
    "Deliver the current brief from the coordinator to the editor.",
    "Record receipt for that exact brief version independently of response submission.",
    "Clarify facilitator allocation and collect participant observations for outcome review.",
  ],
  revision:
    "Return incomplete audience/schedule questions to the brief provider. A historical acknowledgment cannot establish receipt of a revised current brief.",
  policy: {
    state: "unknown",
    subject:
      "Any workshop scheduling or delivery decision would need a declared session, audience and policy.",
    decisionRole:
      "Decision role and owner not supplied; facilitator responsibility is separate.",
    escalation:
      "Escalation policy, trigger and recipient not supplied. No contact is inferred from the coordinator binding.",
  },
};

// Explicit design associations, not adopted runtime templates or allocation changes.
export function operatingPattern(
  scenario: OrganizationScenario,
  streamId: string,
) {
  if (scenario.id !== "knowledge") return undefined;
  if (streamId === "K-01")
    return {
      pattern: guidePattern,
      parallelIds: ["guide-research-and-criteria"],
      dependencyIds: [] as string[],
    };
  if (streamId === "K-02")
    return {
      pattern: workshopPattern,
      parallelIds: [] as string[],
      dependencyIds: ["workshop-brief-input"],
    };
  return undefined;
}

// Versioned authored guidance; v1 remains unchanged for retained local associations.
export function patternVersions(streamId: string): OperatingPattern[] {
  const first =
    streamId === "K-01"
      ? guidePattern
      : streamId === "K-02"
        ? workshopPattern
        : undefined;
  if (!first) return [];
  return [
    first,
    {
      ...first,
      version: "pattern-v2",
      exchanges: [
        ...first.exchanges,
        streamId === "K-01"
          ? "Check exact-source applicability after scope changes; retain separate reader observations and goal-follow-up decisions."
          : "Accept facilitator allocation separately, submit a preparation plan and obtain independent readiness review before simulated execution.",
        streamId === "K-01"
          ? "A changed review handoff package requires cancellation and a fresh offer; no authority transfers with guidance."
          : "Record session result, observations and criterion review separately; a new cycle needs fresh acceptance and readiness.",
      ],
      revision:
        first.revision +
        " Changed inputs require explicit review of downstream effects; preserve completed records against their original source.",
    },
  ];
}
