import {
  caseEvidence,
  caseProgress,
  retainsBriefs,
  type CaseContext,
  type CaseEvent,
} from "./caseLifecycle";
import type { OrganizationScenario } from "./organizationScenario";
export type WorkshopContext = CaseContext & { caseEvents: CaseEvent[] };
export const workshopActors = {
  owner: "Demo organization owner",
  leo: "Leo · facilitator",
  maya: "Maya · workshop reviewer",
};
export type WorkshopActor = keyof typeof workshopActors;
export const workshopActions = [
  "Offer facilitation",
  "Accept facilitation",
  "Decline facilitation",
  "Submit preparation",
  "Preparation ready",
  "Preparation changes needed",
  "Session succeeded",
  "Session failed",
  "Record observations",
  "Criterion met in simulation",
  "Insufficient evidence",
  "Criterion not met",
  "Cancel workshop",
] as const;
export type WorkshopAction = (typeof workshopActions)[number];
export type WorkshopEvent = {
  id: string;
  cycle: number;
  actor: WorkshopActor;
  action: WorkshopAction;
  body: string;
  at: string;
  previousId?: string;
  source: string;
  context: WorkshopContext;
};
const outcomes: WorkshopAction[] = [
  "Criterion met in simulation",
  "Insufficient evidence",
  "Criterion not met",
];
const terminal = (a: WorkshopAction) =>
  [...outcomes, "Decline facilitation", "Cancel workshop"].includes(a);
export function workshopSource(context: WorkshopContext) {
  const p = caseProgress(context.caseEvents, context);
  return p.resolved && !p.stale
    ? JSON.stringify({
        brief: caseEvidence(context),
        resolutionId: context.caseEvents.at(-1)!.id,
      })
    : undefined;
}
export function workshopProgress(
  events: WorkshopEvent[],
  context: WorkshopContext,
) {
  const last = events.at(-1);
  const cycle = events.filter((e) => e.cycle === last?.cycle);
  const execution = cycle.find((e) =>
    ["Session succeeded", "Session failed"].includes(e.action),
  );
  const closed = !!last && terminal(last.action);
  const stale = !!last && last.source !== workshopSource(context);
  const accepted =
    cycle.some((e) => e.action === "Accept facilitation") &&
    !["Cancel workshop", "Decline facilitation"].includes(last?.action ?? "");
  const actor: WorkshopActor | undefined = closed
    ? undefined
    : !last
      ? "owner"
      : stale && !execution
        ? "owner"
        : last.action === "Offer facilitation"
          ? "leo"
          : last.action === "Submit preparation" ||
              last.action === "Record observations" ||
              last.action === "Session failed"
            ? "maya"
            : "leo";
  const status = !last
    ? "Facilitator allocation pending"
    : closed
      ? last.action
      : stale && !execution
        ? "Source changed · cancel and allocate again"
        : last.action;
  const nextStep = closed
    ? "No pending workshop action. The owner may explicitly offer a new cycle with fresh acceptance and preparation."
    : actor === "owner"
      ? !last || closed
        ? "Offer Leo a new scoped facilitator responsibility against the resolved current brief."
        : "Cancel this cycle; resolve the changed brief before a new allocation."
      : last?.action === "Offer facilitation"
        ? "Leo accepts or declines the exact allocation; an offer creates no binding."
        : last?.action === "Submit preparation"
          ? "Maya reviews the exact plan, audience, practical exercise and success criterion."
          : last?.action === "Preparation ready"
            ? "Leo records the simulated session result; readiness does not establish execution."
            : execution
              ? "Record observations separately, then assess the stated criterion with explicit limitations."
              : "Leo submits a preparation plan with audience, exercise, criterion and constraints.";
  return {
    last,
    cycle,
    execution,
    closed,
    stale,
    accepted,
    actor,
    status,
    nextStep,
  };
}
export function availableWorkshopActions(
  events: WorkshopEvent[],
  context: WorkshopContext,
  actor: WorkshopActor,
): WorkshopAction[] {
  const p = workshopProgress(events, context);
  if (!p.last || p.closed)
    return actor === "owner" && workshopSource(context)
      ? ["Offer facilitation"]
      : [];
  if (actor === "owner") return ["Cancel workshop"];
  if (p.stale && !p.execution) return [];
  const a = p.last.action;
  if (actor === "leo") {
    if (a === "Offer facilitation")
      return ["Accept facilitation", "Decline facilitation"];
    if (["Accept facilitation", "Preparation changes needed"].includes(a))
      return ["Submit preparation"];
    if (a === "Preparation ready")
      return ["Session succeeded", "Session failed"];
    if (a === "Session succeeded") return ["Record observations"];
  }
  if (actor === "maya") {
    if (a === "Submit preparation")
      return ["Preparation ready", "Preparation changes needed"];
    if (a === "Session failed")
      return ["Insufficient evidence", "Criterion not met"];
    if (a === "Record observations") return [...outcomes];
  }
  return [];
}
function latestTime(value: unknown): number {
  if (!value || typeof value !== "object") return 0;
  return Math.max(
    0,
    ...Object.entries(value).map(([k, v]) =>
      ["at", "deliveredAt"].includes(k) && typeof v === "string"
        ? Date.parse(v)
        : latestTime(v),
    ),
  );
}
export function recordWorkshopEvent(
  events: WorkshopEvent[],
  context: WorkshopContext,
  actor: WorkshopActor,
  action: WorkshopAction,
  body: string,
  at: string,
): WorkshopEvent[] {
  const last = events.at(-1);
  if (
    events.length >= 40 ||
    !body.trim() ||
    body.length > 3000 ||
    !Number.isFinite(Date.parse(at)) ||
    Date.parse(at) < latestTime(context) ||
    (last &&
      (Date.parse(at) < Date.parse(last.at) ||
        !retainsBriefs(last.context.brief, context.brief) ||
        JSON.stringify(
          context.caseEvents.slice(0, last.context.caseEvents.length),
        ) !== JSON.stringify(last.context.caseEvents))) ||
    !availableWorkshopActions(events, context, actor).includes(action)
  )
    return events;
  const cycle =
    action === "Offer facilitation" ? (last?.cycle ?? 0) + 1 : last!.cycle;
  return [
    ...events,
    {
      id: `workshop-event-${events.length + 1}`,
      cycle,
      actor,
      action,
      body: body.trim(),
      at,
      ...(last ? { previousId: last.id } : {}),
      source:
        action === "Offer facilitation"
          ? workshopSource(context)!
          : last!.source,
      context: structuredClone(context),
    },
  ];
}
export function workshopScenario(
  scenario: OrganizationScenario,
  events: WorkshopEvent[],
  context: WorkshopContext,
): OrganizationScenario {
  if (scenario.id !== "knowledge" || !events.length) return scenario;
  const p = workshopProgress(events, context);
  const bindingId = `local-workshop-facilitator-${p.last!.cycle}`;
  return {
    ...scenario,
    flows: {
      ...scenario.flows,
      "K-02": scenario.flows["K-02"].map((step) =>
        step.assignmentId === "K-02-F"
          ? {
              ...step,
              state: `Local simulation · ${p.status}`,
              exchange: p.nextStep,
            }
          : step,
      ),
    },
    assignments: scenario.assignments.map((a) =>
      a.id === "K-02-F"
        ? {
            ...a,
            workerId: p.accepted ? "leo" : undefined,
            state: `Local simulation · ${p.status}`,
            responseNeeded: !p.closed && p.actor === "leo",
            input: `Exact allocation source: ${p.cycle[0].id}. ${p.stale ? "Historical source; no transfer to the current brief." : "Current resolved brief."}`,
            expectedResponse: p.nextStep,
          }
        : a,
    ),
    ...(p.accepted
      ? {
          bindings: [
            ...scenario.bindings,
            {
              id: bindingId,
              scopeIds: ["scope-K-02"],
              workerId: "leo",
              role: "Facilitator",
              scope: `K-02 · local cycle ${p.last!.cycle}`,
              permission:
                "Local workshop simulation only; availability and production authority unknown.",
            },
          ],
          assignmentScopes: scenario.assignmentScopes.map((s) =>
            s.assignmentId === "K-02-F" ? { ...s, bindingId } : s,
          ),
          gaps: scenario.gaps.filter((g) => g.id !== "knowledge-facilitation"),
          roleGaps: scenario.roleGaps.filter(
            (g) => g.gapId !== "knowledge-facilitation",
          ),
          scopeRequirements: scenario.scopeRequirements.map((r) =>
            r.id === "workshop-facilitator"
              ? {
                  ...r,
                  bindingState: "declared",
                  bindingIds: [bindingId],
                  gapIds: [],
                  note: "Accepted local allocation only; original authored gap retained in the sample source.",
                }
              : r,
          ),
        }
      : {}),
    streams: scenario.streams.map((s) =>
      s.id === "K-02"
        ? {
            ...s,
            outcome: `Local simulation · ${p.closed && outcomes.includes(p.last!.action) ? p.last!.action : "outcome not assessed"}. No real participant result established.`,
          }
        : s,
    ),
    outcomes: scenario.outcomes.map((o) =>
      o.streamId === "K-02"
        ? {
            ...o,
            boundary: `${o.boundary} Local cycle ${p.last!.cycle}: ${p.status}. Historical source retained; no real workshop is scheduled or run.`,
            criteria: o.criteria.map((c) => ({
              ...c,
              available: p.execution
                ? `Simulated execution: ${p.execution.body}. ${p.cycle.find((e) => e.action === "Record observations")?.body ?? "No separate observations."}`
                : c.available,
              gap:
                p.closed && outcomes.includes(p.last!.action)
                  ? `${p.last!.action}: ${p.last!.body}. Real participant evidence remains absent.`
                  : c.gap,
            })),
          }
        : o,
    ),
  };
}
