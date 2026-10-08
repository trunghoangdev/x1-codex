import type { WorkshopContext, WorkshopEvent } from "./workshop";
import { workshopProgress, workshopSource, workshopActors } from "./workshop";
import { briefGuideIsCurrent } from "./briefHandoff";
export type ExceptionContext = WorkshopContext & {
  workshopEvents: WorkshopEvent[];
};
export type ExceptionSource = {
  id: string;
  kind: "Missing brief" | "Declined allocation" | "Failed session";
  title: string;
  snapshot: string;
  destination: string;
};
export function exceptionSources(context: ExceptionContext): ExceptionSource[] {
  const sources: ExceptionSource[] = [],
    b = context.brief.versions.at(-1),
    p = workshopProgress(context.workshopEvents, context);
  if (
    !b?.receipt ||
    !briefGuideIsCurrent(context.brief, b, context.contribution)
  )
    sources.push({
      id: "workshop-brief-input",
      kind: "Missing brief",
      title:
        "Latest workshop brief is missing, unreceived or linked to historical guide input",
      snapshot: JSON.stringify({
        brief: b ?? null,
        guideHandoffs: context.brief.guideHandoffs ?? [],
        guideContribution: b?.guideInput ? context.contribution : null,
      }),
      destination: "/workstreams/K-02",
    });
  const decline = p.cycle.find((e) => e.action === "Decline facilitation");
  if (decline)
    sources.push({
      id: decline.id,
      kind: "Declined allocation",
      title: `Facilitator allocation declined in cycle ${decline.cycle}`,
      snapshot: JSON.stringify(decline),
      destination: "/workshop/K-02",
    });
  if (p.execution?.action === "Session failed")
    sources.push({
      id: p.execution.id,
      kind: "Failed session",
      title: `Simulated session failed in cycle ${p.execution.cycle}`,
      snapshot: JSON.stringify(p.execution),
      destination: "/workshop/K-02",
    });
  return sources;
}
export function exceptionResolution(
  source: ExceptionSource,
  context: ExceptionContext,
): string | undefined {
  if (source.kind === "Missing brief") {
    const b = context.brief.versions.at(-1);
    if (
      b?.receipt &&
      briefGuideIsCurrent(context.brief, b, context.contribution)
    )
      return JSON.stringify({ brief: b, source: source.id });
    return;
  }
  const incident = JSON.parse(source.snapshot) as WorkshopEvent,
    p = workshopProgress(context.workshopEvents, context);
  if (!p.last || p.last.cycle <= incident.cycle || p.stale) return;
  if (source.kind === "Declined allocation" && p.accepted)
    return JSON.stringify({
      source: workshopSource(context),
      cycle: p.last.cycle,
      facilitator: p.facilitator,
      acceptance: p.cycle
        .filter((e) =>
          ["Accept facilitation", "Accept facilitator handoff"].includes(
            e.action,
          ),
        )
        .at(-1),
    });
  if (
    source.kind === "Failed session" &&
    p.execution?.action === "Session succeeded"
  )
    return JSON.stringify({
      source: workshopSource(context),
      execution: p.execution,
    });
}
export type ExceptionAction =
  | "Open exception"
  | "Offer handling"
  | "Accept handling"
  | "Decline handling"
  | "Submit resolution"
  | "Request more work"
  | "Close exception"
  | "Reopen exception"
  | "Cancel exception";
export type ExceptionEvent = {
  id: string;
  ticketId: string;
  actor: keyof typeof workshopActors;
  action: ExceptionAction;
  body: string;
  at: string;
  context: ExceptionContext;
  source?: ExceptionSource;
  assignee?: "leo" | "maya";
  previousId?: string;
  proposalId?: string;
  resolution?: string;
};
export function exceptionTickets(events: ExceptionEvent[]) {
  return events
    .filter((e) => e.action === "Open exception")
    .map((e) => e.ticketId);
}
export function exceptionProgress(
  events: ExceptionEvent[],
  ticketId: string,
  context: ExceptionContext,
) {
  const history = events.filter((e) => e.ticketId === ticketId),
    first = history[0],
    last = history.at(-1),
    source = first?.source;
  const offer = [...history]
      .reverse()
      .find((e) => e.action === "Offer handling"),
    proposal = [...history]
      .reverse()
      .find((e) => e.action === "Submit resolution");
  const closed =
    last?.action === "Close exception" || last?.action === "Cancel exception";
  const pending = last?.action === "Submit resolution";
  const accepted =
    !!last &&
    ["Accept handling", "Request more work", "Submit resolution"].includes(
      last.action,
    );
  const currentResolution = source
    ? exceptionResolution(source, context)
    : undefined;
  const stale = pending && proposal?.resolution !== currentResolution;
  const actor: ExceptionEvent["actor"] | undefined = closed
    ? undefined
    : !last ||
        [
          "Open exception",
          "Decline handling",
          "Submit resolution",
          "Reopen exception",
        ].includes(last.action)
      ? "owner"
      : offer?.assignee;
  const status = !last
    ? "No exception selected"
    : stale
      ? "Resolution source changed · review blocked"
      : last.action;
  const next = closed
    ? "No pending exception response. Reopen a closed exception explicitly if further investigation is needed."
    : last?.action === "Offer handling"
      ? "Named recipient accepts or declines this exact handling responsibility; offer alone is not acceptance."
      : last?.action === "Accept handling" ||
          last?.action === "Request more work"
        ? currentResolution
          ? "Handler records a separate resolution response citing the represented remedy. Owner must review it independently."
          : "Resolve the underlying input, allocation or session through its own operational flow before submitting a resolution response."
        : pending
          ? stale
            ? "Owner requests more work; inspect changed remedy and submit a fresh response before closing."
            : "Owner independently reviews the exact response and current remedy, then closes or requests more work."
          : "Owner offers handling to Leo or Maya. Closure and operational success remain separate.";
  return {
    history,
    first,
    last,
    source,
    offer,
    proposal,
    closed,
    pending,
    accepted,
    currentResolution,
    stale,
    actor,
    status,
    next,
  };
}
export function exceptionActions(
  events: ExceptionEvent[],
  ticketId: string,
  context: ExceptionContext,
  actor: ExceptionEvent["actor"],
): ExceptionAction[] {
  const p = exceptionProgress(events, ticketId, context);
  if (!p.first) return [];
  if (p.closed)
    return actor === "owner" && p.last?.action === "Close exception"
      ? ["Reopen exception"]
      : [];
  const options: ExceptionAction[] =
    actor === "owner" ? ["Cancel exception"] : [];
  if (actor === "owner") {
    if (
      ["Open exception", "Decline handling", "Reopen exception"].includes(
        p.last!.action,
      )
    )
      options.unshift("Offer handling");
    if (p.pending) {
      options.unshift("Request more work");
      if (!p.stale && p.currentResolution) options.unshift("Close exception");
    }
  }
  if (actor === p.offer?.assignee) {
    if (p.last?.action === "Offer handling")
      options.unshift("Accept handling", "Decline handling");
    if (
      ["Accept handling", "Request more work"].includes(p.last!.action) &&
      p.currentResolution
    )
      options.unshift("Submit resolution");
  }
  return options;
}
function latestTime(x: unknown): number {
  if (!x || typeof x !== "object") return 0;
  return Math.max(
    0,
    ...Object.entries(x).map(([k, v]) =>
      ["at", "deliveredAt"].includes(k) && typeof v === "string"
        ? Date.parse(v)
        : latestTime(v),
    ),
  );
}
export function recordException(
  events: ExceptionEvent[],
  context: ExceptionContext,
  actor: ExceptionEvent["actor"],
  action: ExceptionAction,
  ticketId: string,
  body: string,
  at: string,
  sourceId = "",
  assignee?: "leo" | "maya",
): ExceptionEvent[] {
  if (
    events.length >= 40 ||
    !["owner", "leo", "maya"].includes(actor) ||
    !body.trim() ||
    body.length > 3000 ||
    !Number.isFinite(Date.parse(at)) ||
    Date.parse(at) < latestTime(context) ||
    (events.at(-1) && Date.parse(at) < Date.parse(events.at(-1)!.at))
  )
    return events;
  let source: ExceptionSource | undefined;
  if (action === "Open exception") {
    source = exceptionSources(context).find((s) => s.id === sourceId);
    if (
      actor !== "owner" ||
      !source ||
      exceptionTickets(events).some((id) => {
        const p = exceptionProgress(events, id, context);
        return (
          !p.closed &&
          p.source?.id === source!.id &&
          p.source.snapshot === source!.snapshot
        );
      })
    )
      return events;
    ticketId = `exception-${exceptionTickets(events).length + 1}`;
  } else if (
    !exceptionActions(events, ticketId, context, actor).includes(action)
  )
    return events;
  if (
    action === "Offer handling"
      ? !assignee || !["leo", "maya"].includes(assignee)
      : assignee !== undefined
  )
    return events;
  const p = exceptionProgress(events, ticketId, context);
  return [
    ...events,
    {
      id: `exception-event-${events.length + 1}`,
      ticketId,
      actor,
      action,
      body: body.trim(),
      at,
      context: structuredClone(context),
      ...(source ? { source } : {}),
      ...(assignee ? { assignee } : {}),
      ...(events.at(-1) ? { previousId: events.at(-1)!.id } : {}),
      ...(action === "Submit resolution"
        ? { resolution: p.currentResolution }
        : {}),
      ...(["Close exception", "Request more work"].includes(action)
        ? { proposalId: p.proposal!.id }
        : {}),
    },
  ];
}
