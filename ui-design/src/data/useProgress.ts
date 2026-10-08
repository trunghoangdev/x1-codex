import {
  applicabilityGuard,
  type ApplicabilityScope,
} from "./scopeApplicability";
import type { HumanContributionState } from "./humanContribution";
import {
  assessedUseSubject,
  continuationSource,
  type AuthorizedUse,
} from "./authorizedUse";
import type { CoordinationNeed } from "./actionableAttention";
export const useActors = {
  owner: "Demo organization owner",
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
              ? "execution"
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
  const scopeBlocked = ["authorization", "execution"].includes(stage)
    ? applicabilityGuard(
        { contribution, ...(state ? { use: state } : {}) },
        scope,
      )
    : undefined;
  const stale = !!state && state.subject !== subject;
  const actor: UseActor | undefined =
    stale ||
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
  const title =
    canContinue && !stale
      ? "Plan next bounded-use cycle"
      : scopeBlocked && !stale
        ? "Scope applicability decision needed"
        : stale
          ? "Exact source changed · continuation blocked"
          : !subject
            ? "Editorial suitability prerequisite missing"
            : {
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
  const detail =
    canContinue && !stale
      ? "Demo owner can explicitly create cycle 2 for the same assessed material. Fresh publication assessment and authorization are required; prior decisions and failed attempts remain historical."
      : scopeBlocked && !stale
        ? scopeBlocked
        : stale
          ? "Inspect the frozen source and restored contribution. No replacement mandate or follow-up is allocated."
          : !subject
            ? "Draft-02 needs exact delivery, receipt and a suitable Maya reassessment before bounded use."
            : stage === "blocked" || stage === "refused"
              ? "This cycle is stopped. Subsequent revision/retry and follow-up allocation are not represented."
              : stage === "complete"
                ? `Conclusion: ${state?.outcome?.conclusion}. Simulated evidence does not verify real organizational outcomes.`
                : `human-guide-example · draft-02 · ${state ? state.audience : "audience must be named in mandate"}. Separate ${stage} record pending.`;
  const destination =
    scopeBlocked && !stale
      ? "/organizations/knowledge/agreements/K-01?persona=maya"
      : "/organizations/knowledge/use/K-01";
  const need: CoordinationNeed | undefined =
    (subject || state) && (stale || canContinue || stage !== "complete")
      ? {
          id: "local-use-next",
          source: "session",
          category: actor
            ? stage === "outcome"
              ? "Outcome"
              : "Response"
            : "Responsibility",
          title,
          detail,
          owner: actor ? useActors[actor] : "Follow-up unallocated",
          responsibility: actor
            ? `${useActors[actor]} · local ${canContinue ? "continuation planning" : scopeBlocked ? "scope applicability review" : stage} responsibility; no production membership or authority implied.`
            : "No new responsible performer has been allocated.",
          nextStep: canContinue
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
