import type { BriefHandoffState } from "./briefHandoff";
import type { HumanContributionState } from "./humanContribution";
import { currentGuideSubject, guideInputStatus } from "./workstreamInputs";
export const operationalCaseId = "current-workshop-brief";
export type CaseContext = {
  brief: BriefHandoffState;
  contribution: HumanContributionState;
};
export type CaseAction =
  | "Accept responsibility"
  | "Update follow-up"
  | "Propose resolution"
  | "Approve resolution"
  | "Request further work"
  | "Reopen case";
export type CaseEvent = {
  id: string;
  caseId: typeof operationalCaseId;
  actor: "leo" | "maya";
  action: CaseAction;
  rationale: string;
  at: string;
  context: CaseContext;
  proposalId?: string;
  evidence?: string;
};
export const caseActors = {
  leo: "Leo · follow-up owner",
  maya: "Maya · local case-resolution reviewer",
};
function stable(value: unknown): string {
  return JSON.stringify(value, (_key, item) =>
    item && typeof item === "object" && !Array.isArray(item)
      ? Object.fromEntries(
          Object.keys(item)
            .sort()
            .map((key) => [key, item[key]]),
        )
      : item,
  );
}
export function caseEvidence(context: CaseContext): string | undefined {
  const b = context.brief.versions.at(-1);
  if (!b?.receipt) return;
  if (b.guideInput) {
    const guide = guideInputStatus(
      context.brief.guideHandoffs ?? [],
      currentGuideSubject(context.contribution),
    );
    if (
      !guide.ready ||
      guide.input?.handoffId !== b.guideInput.handoffId ||
      guide.input?.applicabilityId !== b.guideInput.applicabilityId ||
      guide.input?.subject !== b.guideInput.subject
    )
      return;
  }
  return stable({
    dependencyId: "workshop-brief-input",
    providerAssignmentId: "K-02-C",
    receiverAssignmentId: "K-02-E",
    brief: b,
  });
}
export function caseProgress(events: CaseEvent[], context: CaseContext) {
  const last = events.at(-1);
  const proposed = [...events]
    .reverse()
    .find((e) => e.action === "Propose resolution");
  const pending = last?.action === "Propose resolution";
  const resolved = last?.action === "Approve resolution";
  const stale =
    !!(pending || resolved) && proposed?.evidence !== caseEvidence(context);
  const status = !last
    ? "Follow-up acceptance pending"
    : stale
      ? "Source changed · reopening required"
      : resolved
        ? "Resolved in local simulation"
        : pending
          ? "Resolution proposed · review pending"
          : last.action === "Reopen case"
            ? "Reopened · follow-up required"
            : "In progress · follow-up required";
  return {
    status,
    nextStep: !last
      ? "Leo must accept follow-up responsibility before recording work."
      : stale
        ? "Reopen the case and inspect changed input before proposing another resolution."
        : resolved
          ? "No pending case action. Reopen if new coordination work is needed."
          : pending
            ? "Maya must inspect the exact proposed brief, receipt and closure conditions."
            : "Leo follows up on the current brief and receipt, then proposes a separate resolution.",
    waitingFor: stale
      ? "A reopened case and current input before another resolution."
      : resolved
        ? "No pending case input. Workshop outcome remains separate."
        : pending
          ? "Maya's review of the exact proposed resolution."
          : "The latest suitable brief, exact receipt and follow-up owner's resolution proposal.",
    pending,
    resolved,
    stale,
    proposal: proposed,
    actor: stale
      ? ("leo" as const)
      : resolved
        ? undefined
        : pending
          ? ("maya" as const)
          : ("leo" as const),
  };
}
// A later snapshot may add versions/receipts, but cannot rewrite retained briefs.
export function retainsBriefs(
  before: BriefHandoffState,
  after: BriefHandoffState,
) {
  const versionsRetained = before.versions.every((v, i) => {
    const next = after.versions[i];
    if (!next) return false;
    const { receipt, ...delivery } = v;
    const { receipt: nextReceipt, ...nextDelivery } = next;
    return (
      stable(delivery) === stable(nextDelivery) &&
      (!receipt || stable(receipt) === stable(nextReceipt))
    );
  });
  const handoffsRetained = (before.guideHandoffs ?? []).every((h, i) => {
    const next = after.guideHandoffs?.[i];
    if (!next) return false;
    const { response, applicability, ...offer } = h;
    const {
      response: nextResponse,
      applicability: nextApplicability,
      ...nextOffer
    } = next;
    return (
      stable(offer) === stable(nextOffer) &&
      (!response || stable(response) === stable(nextResponse)) &&
      (applicability ?? []).every(
        (a, index) => stable(a) === stable(nextApplicability?.[index]),
      )
    );
  });
  return versionsRetained && handoffsRetained;
}
function latestContextTime(value: unknown): number {
  if (!value || typeof value !== "object") return 0;
  return Math.max(
    0,
    ...Object.entries(value).map(([key, entry]) =>
      (key === "at" || key === "deliveredAt") && typeof entry === "string"
        ? Date.parse(entry)
        : latestContextTime(entry),
    ),
  );
}
export function recordCaseEvent(
  events: CaseEvent[],
  context: CaseContext,
  actor: "leo" | "maya",
  action: CaseAction,
  rationale: string,
  at: string,
): CaseEvent[] {
  const progress = caseProgress(events, context);
  const last = events.at(-1);
  if (
    events.length >= 40 ||
    !["leo", "maya"].includes(actor) ||
    !rationale.trim() ||
    rationale.length > 3000 ||
    !Number.isFinite(Date.parse(at)) ||
    Date.parse(at) < latestContextTime(context) ||
    (last &&
      (Date.parse(at) < Date.parse(last.at) ||
        !retainsBriefs(last.context.brief, context.brief)))
  )
    return events;
  const evidence = caseEvidence(context);
  const allowed =
    action === "Accept responsibility"
      ? !events.length && actor === "leo"
      : action === "Update follow-up"
        ? !!last &&
          !progress.pending &&
          !progress.resolved &&
          !progress.stale &&
          actor === "leo"
        : action === "Propose resolution"
          ? !!last &&
            !progress.pending &&
            !progress.resolved &&
            !progress.stale &&
            actor === "leo" &&
            !!evidence
          : action === "Approve resolution" || action === "Request further work"
            ? progress.pending && !progress.stale && actor === "maya"
            : action === "Reopen case"
              ? progress.resolved || progress.stale
              : false;
  if (!allowed) return events;
  return [
    ...events,
    {
      id: `workshop-case-event-${events.length + 1}`,
      caseId: operationalCaseId,
      actor,
      action,
      rationale: rationale.trim(),
      at,
      context: structuredClone(context),
      ...(action === "Propose resolution" ? { evidence } : {}),
      ...([
        "Approve resolution",
        "Request further work",
        "Reopen case",
      ].includes(action) && progress.proposal
        ? { proposalId: progress.proposal.id }
        : {}),
    },
  ];
}
