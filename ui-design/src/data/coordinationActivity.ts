import type { ResponsibilityProposal } from "./responsibilityProposals";
import { responsibilityGaps } from "./workerDetails";
export type CoordinationRecord = {
  id: string;
  kind: "proposals" | "decisions";
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
              ? "Allocation pending · no binding, assignment or permission was created. Responsibility remains open."
              : "Plan rejected · no allocation creation is planned. Responsibility remains open.",
        });
      return records;
    })
    .sort(
      (a, b) =>
        b.recordedAt.localeCompare(a.recordedAt) || b.id.localeCompare(a.id),
    );
}
