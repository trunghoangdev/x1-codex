import type { ResponsibilityProposal } from "./responsibilityProposals";
import { responsibilityGaps } from "./workerDetails";
export type CoordinationRecord = {
  id: string;
  kind: "proposals" | "decisions" | "allocations";
  gapId: string;
  streamId: string;
  title: string;
  workerId: string;
  role: string;
  scope: string;
  actor: string;
  rationale: string;
  recordedAt: string;
  boundary: string;
};
// Projection of current session proposals, not an immutable production audit log.
export function coordinationActivity(
  proposals: Record<string, ResponsibilityProposal>,
): CoordinationRecord[] {
  return Object.values(proposals)
    .flatMap((proposal) => {
      const gap = responsibilityGaps.find((gap) => gap.id === proposal.gapId);
      if (!gap) return [];
      const common = {
        gapId: gap.id,
        streamId: gap.workstreamId,
        workerId: proposal.workerId,
        role: proposal.role,
        scope: proposal.scope,
      };
      const records: CoordinationRecord[] = [
        {
          ...common,
          id: `${proposal.id}-proposal`,
          kind: "proposals",
          title: `Proposal recorded · ${gap.title}`,
          actor: proposal.proposer,
          rationale: proposal.rationale,
          recordedAt: proposal.recordedAt,
          boundary:
            "Proposal records intent; no binding or assignment was created.",
        },
      ];
      if (proposal.decision)
        records.push({
          ...common,
          id: `${proposal.id}-decision`,
          kind: "decisions",
          title: `${proposal.decision.outcome} allocation plan · ${gap.title}`,
          actor: proposal.decision.reviewer,
          rationale: proposal.decision.rationale,
          recordedAt: proposal.decision.recordedAt,
          boundary:
            proposal.decision.outcome === "Accepted"
              ? "Allocation pending at plan acceptance; the decision itself created no binding, assignment or permission."
              : "Plan rejected · no allocation creation is planned. Responsibility remains open.",
        });
      if (proposal.allocation)
        records.push({
          ...common,
          id: proposal.allocation.id,
          kind: "allocations",
          title: `Local allocation recorded · ${gap.title}`,
          actor: proposal.allocation.allocator,
          rationale: `${proposal.allocation.assignmentId} · binding ${proposal.allocation.bindingId} (${proposal.allocation.bindingMode}) · source ${proposal.id}`,
          recordedAt: proposal.allocation.recordedAt,
          boundary:
            "Local responsibility allocated; prerequisites, performer acceptance and effective permissions remain unverified. Original gap is retained with a local resolution reference.",
        });
      for (const e of proposal.responsibilityHistory ?? [])
        records.push({
          ...common,
          id: e.id,
          kind: "allocations",
          title: `${e.kind} · ${gap.title}`,
          actor: e.actorId,
          rationale: `${e.rationale}${e.handoff ? " · " + e.handoff : ""}`,
          recordedAt: e.at,
          boundary:
            "Local responsibility lifecycle only; input validity, permission and execution remain separate.",
        });
      return records;
    })
    .sort(
      (a, b) =>
        b.recordedAt.localeCompare(a.recordedAt) || b.id.localeCompare(a.id),
    );
}
