import type { OrganizationScenario } from "./organizationScenario";
export const exchangeKinds = [
  "response",
  "delivery",
  "acknowledgment",
  "assessment",
  "revision-request",
  "decision",
  "outcome-review",
] as const;
export type ExchangeKind = (typeof exchangeKinds)[number];
type Base = {
  id: string;
  scenarioId: OrganizationScenario["id"];
  streamId: string;
  actorId: string;
  assignmentId: string;
  at: string;
  title: string;
  detail: string;
  version: string;
  inputId: string;
};
export type ExchangeEvent = Base &
  (
    | { kind: "response" }
    | { kind: "delivery"; recipientId: string; receiverAssignmentId: string }
    | {
        kind: "acknowledgment";
        deliveryId: string;
        receiverAssignmentId: string;
      }
    | { kind: "assessment"; conclusion: string }
    | {
        kind: "revision-request";
        assessmentId: string;
        returnAssignmentId: string;
      }
    | { kind: "decision" | "outcome-review"; conclusion: string }
  );
const base = {
  scenarioId: "knowledge" as const,
  streamId: "K-02",
  version: "workshop-brief-v0",
  inputId: "workshop-brief-input",
};
export const authoredExchangeEvents: ExchangeEvent[] = [
  {
    ...base,
    id: "brief-response-v0",
    kind: "response",
    actorId: "leo",
    assignmentId: "K-02-C",
    at: "2026-09-28T13:00:00Z",
    title: "Coordinator response about draft brief",
    detail:
      "Illustrative response describing an early draft and outstanding audience questions. This response alone establishes neither delivery nor receipt.",
  },
  {
    ...base,
    id: "brief-delivery-v0",
    kind: "delivery",
    actorId: "leo",
    assignmentId: "K-02-C",
    recipientId: "maya",
    receiverAssignmentId: "K-02-E",
    at: "2026-09-28T13:05:00Z",
    title: "Draft brief v0 delivery example",
    detail:
      "Separately authored example of sending the identified draft to Maya’s outline-review responsibility. Sending alone does not establish receiver acknowledgment.",
  },
  {
    ...base,
    id: "brief-receipt-v0",
    kind: "acknowledgment",
    actorId: "maya",
    assignmentId: "K-02-E",
    receiverAssignmentId: "K-02-E",
    deliveryId: "brief-delivery-v0",
    at: "2026-09-28T13:12:00Z",
    title: "Maya acknowledges draft brief v0",
    detail:
      "Independent illustrative receipt for this draft version and receiver. It is not an acceptance, an approval or receipt of the current required brief.",
  },
  {
    ...base,
    id: "brief-assessment-v0",
    kind: "assessment",
    actorId: "maya",
    assignmentId: "K-02-E",
    conclusion: "Clarification needed",
    at: "2026-09-28T13:20:00Z",
    title: "Outline review identifies missing audience constraints",
    detail:
      "Illustrative assessment identifies audience constraints needed before the outline can be finalized. This is an authored event, not a recorded response in the active assignment sample.",
  },
  {
    ...base,
    id: "brief-revision-v0",
    kind: "revision-request",
    actorId: "maya",
    assignmentId: "K-02-E",
    assessmentId: "brief-assessment-v0",
    returnAssignmentId: "K-02-C",
    at: "2026-09-28T13:25:00Z",
    title: "Return audience questions to the coordinator",
    detail:
      "Revision expectation references the originating assessment and returning coordinator responsibility. No revised brief, follow-up task or later receipt is represented.",
  },
];
export function exchangeActivity(
  scenario: OrganizationScenario,
  records: ExchangeEvent[] = authoredExchangeEvents,
) {
  const scoped = records.filter((e) => e.scenarioId === scenario.id);
  const baseValid = (e: ExchangeEvent) =>
    scenario.streams.some(
      (s) => s.id === e.streamId && s.assignmentIds.includes(e.assignmentId),
    ) &&
    scenario.assignments.some(
      (a) =>
        a.id === e.assignmentId &&
        a.streamId === e.streamId &&
        a.workerId === e.actorId,
    ) &&
    scenario.dependencies.some(
      (d) => d.id === e.inputId && d.streamId === e.streamId,
    ) &&
    e.version.trim().length > 0 &&
    Number.isFinite(Date.parse(e.at));
  const deliveryValid = (e: ExchangeEvent) => {
    if (e.kind !== "delivery" || !baseValid(e)) return false;
    const dep = scenario.dependencies.find((d) => d.id === e.inputId)!;
    const provider = dep.provider;
    return (
      dep.receiverAssignmentId === e.receiverAssignmentId &&
      ("assignmentId" in provider
        ? provider.assignmentId === e.assignmentId
        : provider.workerId === e.actorId) &&
      scenario.assignments.some(
        (a) =>
          a.id === e.receiverAssignmentId &&
          a.streamId === e.streamId &&
          a.workerId === e.recipientId,
      )
    );
  };
  return scoped
    .filter((e) => {
      if (!baseValid(e)) return false;
      const dep = scenario.dependencies.find((d) => d.id === e.inputId)!;
      if (e.kind === "delivery") return deliveryValid(e);
      if (e.kind === "acknowledgment")
        return (
          dep.receiverAssignmentId === e.receiverAssignmentId &&
          e.assignmentId === e.receiverAssignmentId &&
          scoped.some(
            (d) =>
              d.id === e.deliveryId &&
              d.kind === "delivery" &&
              deliveryValid(d) &&
              d.version === e.version &&
              d.inputId === e.inputId &&
              d.recipientId === e.actorId &&
              d.receiverAssignmentId === e.receiverAssignmentId,
          )
        );
      if (e.kind === "revision-request")
        return (
          scoped.some(
            (a) =>
              a.id === e.assessmentId &&
              a.kind === "assessment" &&
              baseValid(a) &&
              a.version === e.version &&
              a.inputId === e.inputId &&
              a.assignmentId === e.assignmentId,
          ) &&
          scenario.assignments.some(
            (a) => a.id === e.returnAssignmentId && a.streamId === e.streamId,
          )
        );
      return true;
    })
    .sort(
      (a, b) => Date.parse(a.at) - Date.parse(b.at) || a.id.localeCompare(b.id),
    );
}
