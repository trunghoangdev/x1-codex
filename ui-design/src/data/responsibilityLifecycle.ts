import {
  proposalRequirements,
  type ResponsibilityProposal,
} from "./responsibilityProposals";
export type ResponsibilityEvent = {
  id: string;
  kind:
    | "Accept responsibility"
    | "Request clarification"
    | "Decline responsibility"
    | "Propose transfer"
    | "Accept transfer"
    | "Decline transfer"
    | "Cancel transfer";
  actorId: string;
  rationale: string;
  at: string;
  targetWorkerId?: string;
  handoff?: string;
};
export function responsibilityState(p: ResponsibilityProposal) {
  let workerId = p.workerId,
    status = "Acceptance pending",
    pending: ResponsibilityEvent | undefined;
  for (const e of p.responsibilityHistory ?? []) {
    if (e.kind === "Propose transfer") pending = e;
    else if (e.kind === "Cancel transfer" || e.kind === "Decline transfer")
      pending = undefined;
    else if (e.kind === "Accept transfer") {
      workerId = e.actorId;
      status = "Accepted locally";
      pending = undefined;
    } else
      status =
        e.kind === "Accept responsibility"
          ? "Accepted locally"
          : e.kind === "Request clarification"
            ? "Clarification requested"
            : "Declined · coordination needed";
  }
  const bindingId =
    workerId === p.workerId
      ? p.allocation?.bindingId
      : p.gapId === "invitation-assessment" && workerId === "alex"
        ? "mb-reviewer"
        : `local-binding-${p.gapId}-${workerId}`;
  return { workerId, status, pending, bindingId };
}
export function recordResponsibilityEvent(
  proposals: Record<string, ResponsibilityProposal>,
  gapId: string,
  kind: ResponsibilityEvent["kind"],
  actorId: string,
  rationale: string,
  at: string,
  targetWorkerId?: string,
  handoff?: string,
) {
  const p = proposals[gapId],
    allowed = proposalRequirements[gapId]?.workerIds;
  if (
    !p?.allocation ||
    !allowed ||
    !rationale.trim() ||
    rationale.length > 3000 ||
    !Number.isFinite(Date.parse(at)) ||
    (p.responsibilityHistory?.length ?? 0) >= 100
  )
    return proposals;
  const current = responsibilityState(p);
  if (
    [
      "Accept responsibility",
      "Request clarification",
      "Decline responsibility",
    ].includes(kind)
  ) {
    if (actorId !== current.workerId) return proposals;
  } else if (kind === "Propose transfer") {
    if (
      actorId !== "jamie" ||
      current.pending ||
      !targetWorkerId ||
      targetWorkerId === current.workerId ||
      !allowed.includes(targetWorkerId) ||
      !handoff?.trim() ||
      handoff.length > 3000
    )
      return proposals;
  } else if (kind === "Accept transfer" || kind === "Decline transfer") {
    if (!current.pending || actorId !== current.pending.targetWorkerId)
      return proposals;
  } else if (kind === "Cancel transfer") {
    if (!current.pending || actorId !== "jamie") return proposals;
  } else return proposals;
  const previous = p.responsibilityHistory?.at(-1);
  if (
    previous?.kind === kind &&
    previous.actorId === actorId &&
    previous.rationale === rationale.trim()
  )
    return proposals;
  const event: ResponsibilityEvent = {
    id: `local-responsibility-${gapId}-${(p.responsibilityHistory?.length ?? 0) + 1}`,
    kind,
    actorId,
    rationale: rationale.trim(),
    at,
    ...(kind === "Propose transfer"
      ? { targetWorkerId, handoff: handoff!.trim() }
      : {}),
  };
  return {
    ...proposals,
    [gapId]: {
      ...p,
      responsibilityHistory: [...(p.responsibilityHistory ?? []), event],
    },
  };
}
