import { goalProgress } from "./goalLoop";
import {
  reviewOwner,
  reviewPrincipals,
  pendingReviewHandoff,
  reviewPackage,
} from "./reviewHandoffs";
import {
  applicabilityGuard,
  type ApplicabilityScope,
} from "./scopeApplicability";
import type { HumanContributionState } from "./humanContribution";
import {
  authorityStatus,
  assessedUseSubject,
  useVersion,
  continuationSource,
  type AuthorizedUse,
} from "./authorizedUse";
import type { CoordinationNeed } from "./actionableAttention";
export const useActors = {
  owner: "Demo organization owner",
  reviewDelegate: reviewPrincipals.reviewDelegate,
  authorityDelegate: reviewPrincipals.authorityDelegate,
  outcomeDelegate: reviewPrincipals.outcomeDelegate,
  sam: "Sam · local publication reviewer / authorizer",
  leo: "Leo · execution / reader observer",
  maya: "Maya · outcome reviewer",
};
export type UseActor = keyof typeof useActors;
export function useChainStage(state?: AuthorizedUse) {
  return !state
    ? "mandate"
    : !state.publicationAssessment
      ? "assessment"
      : state.publicationAssessment.conclusion === "Revision needed"
        ? "blocked"
        : !state.authorization
          ? "authorization"
          : state.authorization.decision === "Refused"
            ? "refused"
            : !state.execution
              ? authorityStatus(state) === "Active"
                ? "execution"
                : "authorityStopped"
              : state.execution.result === "Succeeded" && !state.readerEvidence
                ? "evidence"
                : !state.outcome
                  ? "outcome"
                  : "complete";
}
export function useProgress(
  contribution: HumanContributionState,
  state?: AuthorizedUse,
  scope?: ApplicabilityScope,
) {
  const subject = assessedUseSubject(contribution);
  const stage = useChainStage(state);
  const canContinue = !!state && !!continuationSource(state);
  const scopeBlocked = [
    "authorization",
    "execution",
    "authorityStopped",
  ].includes(stage)
    ? applicabilityGuard(
        { contribution, ...(state ? { use: state } : {}) },
        scope,
      )
    : undefined;
  const stale = !!state && state.subject !== subject;
  const newMaterial =
    !!state && !!subject && useVersion(subject)! > useVersion(state.subject)!;
  let actor: UseActor | undefined =
    stage === "authorityStopped" && !newMaterial
      ? "sam"
      : newMaterial
        ? "owner"
        : stale ||
            !subject ||
            (!canContinue && ["blocked", "refused", "complete"].includes(stage))
          ? undefined
          : canContinue
            ? "owner"
            : scopeBlocked
              ? scopeBlocked.startsWith("assessment ")
                ? "maya"
                : "sam"
              : stage === "mandate"
                ? "owner"
                : ["assessment", "authorization"].includes(stage)
                  ? "sam"
                  : ["execution", "evidence"].includes(stage)
                    ? "leo"
                    : "maya";
  const pending = state ? pendingReviewHandoff(state) : undefined;
  const pendingStale =
    !!pending &&
    (stale || pending.package !== reviewPackage(state!, pending.role));
  if (state && !stale && !newMaterial && !scopeBlocked) {
    if (pending) actor = pendingStale ? "owner" : pending.to;
    else if (stage === "assessment")
      actor = reviewOwner(state, "publicationReview");
    else if (stage === "authorization" || stage === "authorityStopped")
      actor = reviewOwner(state, "authorization");
    else if (stage === "outcome") actor = reviewOwner(state, "outcomeReview");
  }
  if (pending && !newMaterial) actor = pendingStale ? "owner" : pending.to;
  const goal =
    state && stage === "complete" && !pending && !stale && !newMaterial
      ? goalProgress(state)
      : undefined;
  if (goal) actor = goal.actor;
  const title = goal
    ? goal.title
    : pending && !newMaterial
      ? pendingStale
        ? "Cancel changed review handoff package"
        : "Respond to review responsibility handoff"
      : newMaterial
        ? "Plan mandate for new material version"
        : canContinue && !stale
          ? "Plan next bounded-use cycle"
          : scopeBlocked && !stale
            ? "Scope applicability decision needed"
            : stale
              ? "Exact source changed · continuation blocked"
              : !subject
                ? "Editorial suitability prerequisite missing"
                : {
                    authorityStopped: "Use authority suspended or revoked",
                    mandate: "Allocate bounded publication responsibility",
                    assessment: "Assess publication scope",
                    authorization: "Decide bounded use",
                    execution: "Record execution observation",
                    evidence: "Record reader evidence or its absence",
                    outcome: "Review outcome criterion",
                    blocked: "Publication revision needed",
                    refused: "Bounded use refused",
                    complete: "Outcome review recorded",
                  }[stage];
  const detail = goal
    ? goal.detail
    : pending && !newMaterial
      ? pendingStale
        ? "Owner must cancel the changed package; acceptance cannot reuse changed input or work."
        : `${reviewPrincipals[pending.to]} must accept exact input, remaining work and bounded rights before responsibility transfers. ${reviewPrincipals[pending.from]} remains responsible until acceptance.`
      : stage === "authorityStopped" && !newMaterial
        ? `Authority is ${authorityStatus(state!)}. Execution is blocked. Suspension requires the current authorizer’s explicit resume decision and evidence that conditions are met; revocation cannot be resumed. Changed material needs a fresh mandate.`
        : newMaterial
          ? `Draft-0${useVersion(subject)} needs a fresh material mandate. Earlier material records are preserved; no authorization transfers.`
          : canContinue && !stale
            ? "Demo owner can explicitly create cycle 2 for the same assessed material. Fresh publication assessment and authorization are required; prior decisions and failed attempts remain historical."
            : scopeBlocked && !stale
              ? scopeBlocked
              : stale
                ? "Inspect the frozen source and restored contribution. No replacement mandate or follow-up is allocated."
                : !subject
                  ? "The current draft needs exact delivery, receipt and a suitable Maya reassessment without a pending revision request before bounded use."
                  : stage === "blocked" || stage === "refused"
                    ? "This cycle is stopped. Subsequent revision/retry and follow-up allocation are not represented."
                    : stage === "complete"
                      ? `Conclusion: ${state?.outcome?.conclusion}. Simulated evidence does not verify real organizational outcomes.`
                      : `human-guide-example · draft-0${useVersion(subject) ?? useVersion(state?.subject) ?? contribution.contributions.at(-1)?.version} · ${state ? state.audience : "audience must be named in mandate"}. Separate ${stage} record pending.`;
  const destination =
    scopeBlocked && !stale && !pending
      ? "/organizations/knowledge/agreements/K-01?persona=maya"
      : "/organizations/knowledge/use/K-01";
  const need: CoordinationNeed | undefined =
    (subject || state) &&
    (stale || canContinue || !!pending || !!goal?.actor || stage !== "complete")
      ? {
          id: "local-use-next",
          source: "session",
          category: actor
            ? goal || stage === "outcome"
              ? "Outcome"
              : "Response"
            : "Responsibility",
          title,
          detail,
          owner: actor ? useActors[actor] : "Follow-up unallocated",
          responsibility: actor
            ? `${useActors[actor]} · local ${goal ? "goal follow-up" : canContinue ? "continuation planning" : scopeBlocked ? "scope applicability review" : stage} responsibility; no production membership or authority implied.`
            : "No new responsible performer has been allocated.",
          nextStep: goal
            ? "Inspect exact outcome and goal decision; accept, deliver or review the explicitly linked follow-up."
            : canContinue
              ? "Inspect prior result and explicitly plan cycle 2; no automatic retry."
              : scopeBlocked
                ? "Inspect adopted scope and record exact applicability before continuing use."
                : actor
                  ? `Inspect exact source and record the separate ${stage}.`
                  : "Inspect the stopping condition and preserved records.",
          target: { kind: "workstream", id: "K-01" },
          destination,
        }
      : undefined;
  return {
    scopeBlocked,
    stage,
    stale,
    actor,
    title,
    detail,
    destination,
    need,
    represented: !!subject || !!state,
  };
}
