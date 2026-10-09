import type { KnowledgeWorkspace } from "./knowledgeCheckpoint";
import { currentGuideSubject, guideInputStatus } from "./workstreamInputs";
import { briefGuideIsCurrent } from "./briefHandoff";
import { changeImpact } from "./changeImpact";

/** Only recorded guide exchanges create the optional cross-workstream relationship. */
export function workstreamRelations(state: KnowledgeWorkspace) {
  const history = state.brief.guideHandoffs ?? [];
  const handoff = history.at(-1);
  const guide = guideInputStatus(history, currentGuideSubject(state.contribution));
  const brief = state.brief.versions.at(-1);
  const linked = !!brief?.guideInput;
  return {
    recorded: !!handoff,
    status: !handoff ? "Optional exchange not started" : guide.ready ? "Guide received and applicable" : "Exchange needs follow-up",
    source: handoff?.subject ?? "No guide source transferred",
    handoff: handoff?.id,
    response: handoff?.response?.decision ?? "No receipt recorded",
    assessment: handoff?.applicability?.at(-1)?.conclusion ?? "No applicability decision recorded",
    next: handoff && !guide.ready ? guide.actor : undefined,
    reason: guide.reason,
    brief: !brief ? "No workshop brief delivered." : !linked ? `brief-v${brief.version} has no recorded guide link; do not infer a dependency on K-01.` : `brief-v${brief.version} cites ${brief.guideInput!.handoffId} / ${brief.guideInput!.applicabilityId}. ${briefGuideIsCurrent(state.brief, brief, state.contribution) ? "Linked input is current." : "Linked input is historical; coordinate a replacement before continuing dependent preparation."}`,
    impacts: changeImpact(state).filter(row => ["workshop-brief", "workshop-brief-case", "workshop-cycle"].includes(row.id)),
  };
}
