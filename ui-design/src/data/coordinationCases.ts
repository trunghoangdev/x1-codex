import type { OrganizationScenario } from "./organizationScenario";
export type CoordinationCase = {
  id: string;
  scenarioId: OrganizationScenario["id"];
  streamId: string;
  title: string;
  owner:
    | { state: "assigned"; workerId: string; mandate: string }
    | { state: "unknown"; detail: string };
  need: "input" | "policy";
  status: string;
  nextAction: string;
  waitingFor: string;
  closure: string[];
  boundary: string;
  provenance: string;
  source: {
    dependencyId?: string;
    providerAssignmentId?: string;
    receiverAssignmentId?: string;
    gapId?: string;
    decisionId?: string;
  };
};
const cases: CoordinationCase[] = [
  {
    id: "current-workshop-brief",
    scenarioId: "knowledge",
    streamId: "K-02",
    title: "Obtain the current workshop brief",
    need: "input",
    status: "Open · waiting for current input",
    owner: {
      state: "assigned",
      workerId: "leo",
      mandate:
        "Follow up on the required current brief and clarify what Maya needs for outline review. This is explicitly authored case ownership, separate from assignment allocation.",
    },
    nextAction:
      "Clarify audience and schedule constraints, identify the current brief version, and coordinate its delivery and independent receiving acknowledgment.",
    waitingFor:
      "Current coordinator brief for Maya’s K-02-E outline review. Audience and schedule constraints remain unresolved.",
    closure: [
      "Identify a current brief version satisfying the agreed outline-review input requirements.",
      "Represent delivery and a separate acknowledgment by the receiving responsibility for that exact current version.",
      "Record an explicit case-resolution conclusion against these conditions. No resolution record is represented.",
    ],
    boundary:
      "The earlier workshop-brief-v0 acknowledgment does not satisfy the missing current brief. A coordinator response alone does not deliver input or close this case. Case closure would not verify workshop outcomes.",
    provenance:
      "New authored read-only coordination case. Leo is explicitly named to own follow-up in this sample; no new assignment, binding, permission or deadline is created.",
    source: {
      dependencyId: "workshop-brief-input",
      providerAssignmentId: "K-02-C",
      receiverAssignmentId: "K-02-E",
    },
  },
  {
    id: "guide-publication-policy",
    scenarioId: "knowledge",
    streamId: "K-01",
    title: "Clarify publication policy and decision ownership",
    need: "policy",
    status: "Open · ownership and policy unresolved",
    owner: {
      state: "unknown",
      detail:
        "No follow-up owner is allocated for this coordination case. Editor or Coordinator bindings do not name one.",
    },
    nextAction:
      "Identify who will coordinate policy clarification, then establish the authorization policy, exact guide subject and decision allocation.",
    waitingFor:
      "A declared publication authorization policy and allocated decision owner. The recipient of this policy-clarification request is not represented.",
    closure: [
      "Explicitly allocate follow-up ownership for this case.",
      "Declare publication authorization policy, exact guide version/audience and the decision responsibility under that policy.",
      "Record an explicit case-resolution conclusion with supporting references. No resolution record is represented.",
    ],
    boundary:
      "The missing Publication reviewer concerns assessment; authorization policy and ownership are independently unknown. Maya’s response does not approve publication. Distributor applicability or a role binding does not close this case.",
    provenance:
      "New authored read-only case linked to the existing publication responsibility gap and decision-clarification requirement. No escalation recipient, publication policy, permission or approval is invented.",
    source: {
      gapId: "knowledge-publication",
      decisionId: "guide-publication-responsibility",
    },
  },
];
export function coordinationCases(scenario: OrganizationScenario) {
  return cases.filter(
    (c) =>
      c.scenarioId === scenario.id &&
      scenario.streams.some((s) => s.id === c.streamId),
  );
}
export type CaseFilters = {
  query: string;
  owner: "all" | "assigned" | "unknown";
  need: "all" | "input" | "policy";
};
export const defaultCaseFilters: CaseFilters = {
  query: "",
  owner: "all",
  need: "all",
};
export function filteredCases(
  scenario: OrganizationScenario,
  filters: CaseFilters,
) {
  return coordinationCases(scenario).filter(
    (c) =>
      (filters.owner === "all" || c.owner.state === filters.owner) &&
      (filters.need === "all" || c.need === filters.need) &&
      `${c.id} ${c.title} ${c.nextAction} ${c.waitingFor}`
        .toLowerCase()
        .includes(filters.query.trim().toLowerCase()),
  );
}
