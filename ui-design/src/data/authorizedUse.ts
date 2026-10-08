import type { HumanContributionState } from "./humanContribution";
export type UseRecord = {
  id: string;
  at: string;
  actor: string;
  rationale: string;
  sourceId: string;
};
export type UseCycle = {
  subject: string;
  audience: string;
  mandate: UseRecord;
  publicationAssessment?: UseRecord & {
    conclusion: "Suitable" | "Revision needed";
  };
  authorization?: UseRecord & { decision: "Allowed" | "Refused" };
  execution?: UseRecord & { result: "Succeeded" | "Failed" };
  readerEvidence?: UseRecord & {
    kind: "Simulated reader evidence" | "No reader evidence";
  };
  outcome?: UseRecord & {
    conclusion:
      | "Criterion met in simulation"
      | "Insufficient evidence"
      | "Criterion not met";
    criterion: "K-01-goal";
  };
};
export type AuthorizedUse = UseCycle & {
  cycle?: 2;
  previousCycle?: UseCycle;
  continuation?: UseRecord;
};
export function continuationSource(
  state: AuthorizedUse,
): UseRecord | undefined {
  if (state.cycle || state.previousCycle) return;
  if (state.publicationAssessment?.conclusion === "Revision needed")
    return state.publicationAssessment;
  if (state.authorization?.decision === "Refused") return state.authorization;
  if (
    state.outcome &&
    state.outcome.conclusion !== "Criterion met in simulation"
  )
    return state.outcome;
}
export function continueUse(
  state: AuthorizedUse,
  subject: string | undefined,
  audience: string,
  rationale: string,
  at: string,
): AuthorizedUse {
  const source = continuationSource(state);
  const base = allocateUseMandate(subject, audience, rationale, at);
  if (
    !source ||
    subject !== state.subject ||
    !base ||
    Date.parse(at) < Date.parse(source.at)
  )
    return state;
  const continuation: UseRecord = {
    id: "local-use-continuation-2",
    sourceId: source.id,
    actor: "Demo organization owner",
    rationale: rationale.trim(),
    at,
  };
  return {
    ...base,
    cycle: 2,
    previousCycle: state,
    continuation,
    mandate: {
      ...base.mandate,
      id: "local-publication-mandate-cycle-2",
      sourceId: continuation.id,
    },
  };
}
export function assessedUseSubject(
  state: HumanContributionState,
): string | undefined {
  const c = state.contributions.at(-1);
  if (
    c?.version !== 2 ||
    !c.delivery ||
    !c.receipt ||
    c.reassessment?.conclusion !== "Suitable for stated scope" ||
    c.receipt.deliveryId !== c.delivery.id ||
    c.reassessment.deliveryId !== c.delivery.id ||
    c.reassessment.receiptId !== c.receipt.id
  )
    return;
  return JSON.stringify({
    subject: "human-guide-example",
    version: 2,
    delivery: c.delivery,
    receipt: c.receipt,
    assessment: c.reassessment,
  });
}
export function allocateUseMandate(
  subject: string | undefined,
  audience: string,
  rationale: string,
  at: string,
): AuthorizedUse | undefined {
  if (
    !subject ||
    !audience.trim() ||
    audience.length > 500 ||
    !valid(rationale, at)
  )
    return;
  return {
    subject,
    audience: audience.trim(),
    mandate: {
      id: "local-publication-mandate",
      at,
      actor: "Demo organization owner",
      rationale: rationale.trim(),
      sourceId: "human-reassessment-v2",
    },
  };
}
function valid(rationale: string, at: string) {
  return (
    !!rationale.trim() &&
    rationale.length <= 3000 &&
    Number.isFinite(Date.parse(at))
  );
}
export type UseAction =
  | "Suitable"
  | "Revision needed"
  | "Allowed"
  | "Refused"
  | "Succeeded"
  | "Failed"
  | "Simulated reader evidence"
  | "No reader evidence"
  | "Criterion met in simulation"
  | "Insufficient evidence"
  | "Criterion not met";
export function recordUseStep(
  state: AuthorizedUse,
  subject: string | undefined,
  action: UseAction,
  rationale: string,
  at: string,
): AuthorizedUse {
  if (subject !== state.subject || !valid(rationale, at)) return state;
  const record = (id: string, actor: string, sourceId: string): UseRecord => ({
    id: state.cycle === 2 ? `${id}-cycle-2` : id,
    actor,
    sourceId,
    rationale: rationale.trim(),
    at,
  });
  if (
    !state.publicationAssessment &&
    ["Suitable", "Revision needed"].includes(action)
  )
    return {
      ...state,
      publicationAssessment: {
        ...record(
          "local-publication-assessment",
          "Sam · demo publication reviewer",
          state.mandate.id,
        ),
        conclusion: action as "Suitable" | "Revision needed",
      },
    };
  if (
    state.publicationAssessment?.conclusion === "Suitable" &&
    !state.authorization &&
    ["Allowed", "Refused"].includes(action)
  )
    return {
      ...state,
      authorization: {
        ...record(
          "local-use-authorization",
          "Sam · demo bounded-use authorizer",
          state.publicationAssessment.id,
        ),
        decision: action as "Allowed" | "Refused",
      },
    };
  if (
    state.authorization?.decision === "Allowed" &&
    !state.execution &&
    ["Succeeded", "Failed"].includes(action)
  )
    return {
      ...state,
      execution: {
        ...record(
          "local-use-observation",
          "Leo · demo execution observer",
          state.authorization.id,
        ),
        result: action as "Succeeded" | "Failed",
      },
    };
  if (
    state.execution?.result === "Succeeded" &&
    !state.readerEvidence &&
    ["Simulated reader evidence", "No reader evidence"].includes(action)
  )
    return {
      ...state,
      readerEvidence: {
        ...record(
          "local-reader-observation",
          "Leo · demo reader observer",
          state.execution.id,
        ),
        kind: action as "Simulated reader evidence" | "No reader evidence",
      },
    };
  if (
    state.execution &&
    (state.execution.result === "Failed" || state.readerEvidence) &&
    !state.outcome &&
    [
      "Criterion met in simulation",
      "Insufficient evidence",
      "Criterion not met",
    ].includes(action) &&
    (action !== "Criterion met in simulation" ||
      (state.execution.result === "Succeeded" &&
        state.readerEvidence?.kind === "Simulated reader evidence"))
  )
    return {
      ...state,
      outcome: {
        ...record(
          "local-use-outcome-review",
          "Maya · demo outcome reviewer",
          state.readerEvidence?.id ?? state.execution.id,
        ),
        conclusion: action as NonNullable<
          AuthorizedUse["outcome"]
        >["conclusion"],
        criterion: "K-01-goal",
      },
    };
  return state;
}
