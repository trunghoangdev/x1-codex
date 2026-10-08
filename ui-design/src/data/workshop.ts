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
  leo: "Leo",
  maya: "Maya",
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
  "Propose facilitator handoff",
  "Accept facilitator handoff",
  "Decline facilitator handoff",
  "Cancel facilitator handoff",
] as const;
export type WorkshopAction = (typeof workshopActions)[number];
export type WorkshopAllocation = {
  facilitator: "leo" | "maya";
  reviewer: WorkshopActor;
};
export type WorkshopEvent = {
  id: string;
  cycle: number;
  actor: WorkshopActor;
  action: WorkshopAction;
  body: string;
  at: string;
  previousId?: string;
  allocation?: WorkshopAllocation;
  handoffId?: string;
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
  let facilitator: "leo" | "maya" = cycle[0]?.allocation?.facilitator ?? "leo";
  const reviewer = cycle[0]?.allocation?.reviewer ?? "maya";
  let accepted = false,
    stage: WorkshopAction = "Offer facilitation",
    pending: WorkshopEvent | undefined;
  let activeStart = 0;
  for (const [index, e] of cycle.entries()) {
    if (e.action === "Propose facilitator handoff") pending = e;
    else if (e.action === "Accept facilitator handoff") {
      facilitator = pending!.allocation!.facilitator;
      pending = undefined;
      stage = "Accept facilitation";
      activeStart = index;
    } else if (
      ["Decline facilitator handoff", "Cancel facilitator handoff"].includes(
        e.action,
      )
    )
      pending = undefined;
    else {
      stage = e.action;
      if (stage === "Accept facilitation") accepted = true;
    }
  }
  if (["Cancel workshop", "Decline facilitation"].includes(stage))
    accepted = false;
  const actor: WorkshopActor | undefined = closed
    ? undefined
    : !last || (stale && !execution)
      ? "owner"
      : pending
        ? pending.allocation!.facilitator
        : stage === "Offer facilitation"
          ? facilitator
          : [
                "Submit preparation",
                "Record observations",
                "Session failed",
              ].includes(stage)
            ? reviewer
            : facilitator;
  const status = !last
    ? "Facilitator allocation pending"
    : closed
      ? last.action
      : stale && !execution
        ? "Source changed · cancel and allocate again"
        : pending
          ? "Facilitation handoff pending"
          : stage;
  const nextStep = closed
    ? "No pending workshop action. The owner may explicitly offer a new cycle with fresh acceptance and preparation."
    : actor === "owner" && ((stale && !execution) || !last)
      ? !last
        ? "Select a facilitator and independent reviewer against the resolved current brief."
        : "Cancel this cycle; resolve the changed brief before a new allocation."
      : pending
        ? `${workshopActors[pending.allocation!.facilitator]} accepts or declines the exact handoff. ${workshopActors[facilitator]} retains responsibility until acceptance; operational steps pause.`
        : stage === "Offer facilitation"
          ? `${workshopActors[facilitator]} accepts or declines the exact allocation; an offer creates no binding.`
          : stage === "Submit preparation"
            ? `${workshopActors[reviewer]} independently reviews the exact plan, audience, exercise and criterion.`
            : stage === "Preparation ready"
              ? `${workshopActors[facilitator]} records the simulated session result; readiness does not establish execution.`
              : execution
                ? "Record observations separately, then independently assess the stated criterion with explicit limitations."
                : `${workshopActors[facilitator]} submits a fresh preparation plan. Accepted handoffs never inherit earlier readiness.`;
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
    facilitator,
    reviewer,
    pending,
    stage,
    activeRecords: cycle.slice(activeStart),
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
  const options: WorkshopAction[] =
    actor === "owner" ? ["Cancel workshop"] : [];
  if (p.stale && !p.execution) return options;
  if (p.pending) {
    if (actor === "owner") options.push("Cancel facilitator handoff");
    if (actor === p.pending.allocation!.facilitator)
      options.push("Accept facilitator handoff", "Decline facilitator handoff");
    return options;
  }
  if (
    actor === "owner" &&
    p.accepted &&
    !p.execution &&
    ["leo", "maya"].some((id) => id !== p.facilitator && id !== p.reviewer)
  )
    options.push("Propose facilitator handoff");
  const a = p.stage;
  if (actor === p.facilitator) {
    if (a === "Offer facilitation")
      options.push("Accept facilitation", "Decline facilitation");
    if (["Accept facilitation", "Preparation changes needed"].includes(a))
      options.push("Submit preparation");
    if (a === "Preparation ready")
      options.push("Session succeeded", "Session failed");
    if (a === "Session succeeded") options.push("Record observations");
  }
  if (actor === p.reviewer) {
    if (a === "Submit preparation")
      options.push("Preparation ready", "Preparation changes needed");
    if (a === "Session failed")
      options.push("Insufficient evidence", "Criterion not met");
    if (a === "Record observations") options.push(...outcomes);
  }
  return options.sort(
    (a, b) =>
      (a === "Cancel workshop"
        ? 3
        : a === "Propose facilitator handoff"
          ? 2
          : 0) -
      (b === "Cancel workshop"
        ? 3
        : b === "Propose facilitator handoff"
          ? 2
          : 0),
  );
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
  allocation?: WorkshopAllocation,
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
  const p = workshopProgress(events, context);
  if (
    allocation &&
    Object.keys(allocation).some(
      (key) => !["facilitator", "reviewer"].includes(key),
    )
  )
    return events;
  if (
    action === "Offer facilitation" ||
    action === "Propose facilitator handoff"
  ) {
    const choice =
      allocation ??
      (action === "Offer facilitation"
        ? { facilitator: "leo", reviewer: "maya" }
        : undefined);
    if (
      !choice ||
      !["leo", "maya"].includes(choice.facilitator) ||
      !["leo", "maya", "owner"].includes(choice.reviewer) ||
      choice.facilitator === choice.reviewer ||
      (action === "Propose facilitator handoff" &&
        (choice.facilitator === p.facilitator ||
          choice.reviewer !== p.reviewer))
    )
      return events;
    if (action === "Propose facilitator handoff") allocation = choice;
  } else if (allocation) return events;
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
      ...(allocation ? { allocation: structuredClone(allocation) } : {}),
      ...([
        "Accept facilitator handoff",
        "Decline facilitator handoff",
        "Cancel facilitator handoff",
      ].includes(action)
        ? { handoffId: p.pending!.id }
        : {}),
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
            workerId: p.accepted ? p.facilitator : undefined,
            state: `Local simulation · ${p.status}`,
            responseNeeded: !p.closed && p.actor === p.facilitator,
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
              workerId: p.facilitator,
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
                ? `Simulated execution: ${p.execution.body}. ${p.activeRecords.find((e) => e.action === "Record observations")?.body ?? "No separate observations."}`
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
