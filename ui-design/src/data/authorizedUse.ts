import { goalRecords, openGoalTask, type GoalReview } from "./goalLoop";
import {
  decisionRole,
  reviewOwner,
  reviewPrincipals,
  type ReviewPrincipal,
  type ReviewHandoffEvent,
} from "./reviewHandoffs";
import type { HumanContributionState } from "./humanContribution";
export type UseRecord = {
  id: string;
  at: string;
  actor: string;
  rationale: string;
  sourceId: string;
};
export type AuthorityAction = "Suspend" | "Resume" | "Revoke";
export type AuthorityRecord = UseRecord & {
  action: AuthorityAction;
  conditions: string;
  afterRecordId: string;
};
export type UseCycle = {
  goalReviews?: GoalReview[];
  reviewHandoffs?: ReviewHandoffEvent[];
  authorityHistory?: AuthorityRecord[];
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
export type MaterialUse = UseCycle & {
  cycle?: 2;
  previousCycle?: UseCycle;
  continuation?: UseRecord;
};
export type AuthorizedUse = MaterialUse & { previousMaterials?: MaterialUse[] };
export function useVersion(subject?: string): number | undefined {
  try {
    const v = JSON.parse(subject ?? "null")?.version;
    return Number.isInteger(v) && v >= 2 && v <= 9 ? v : undefined;
  } catch {
    return undefined;
  }
}
const recordId = (id: string, subject: string, cycle?: number) =>
  `${id}${useVersion(subject)! > 2 ? `-draft-${useVersion(subject)}` : ""}${cycle === 2 ? "-cycle-2" : ""}`;
export function latestUseTime(state: MaterialUse): number {
  const times = [
    state.mandate,
    state.publicationAssessment,
    state.authorization,
    state.execution,
    state.readerEvidence,
    state.outcome,
    state.continuation,
    ...(state.authorityHistory ?? []),
    ...(state.reviewHandoffs ?? []),
    ...goalRecords(state),
  ]
    .filter(Boolean)
    .map((r) => Date.parse(r!.at));
  if (state.previousCycle) times.push(latestUseTime(state.previousCycle));
  return Math.max(...times);
}
export function startMaterialUse(
  state: AuthorizedUse,
  subject: string | undefined,
  audience: string,
  rationale: string,
  at: string,
): AuthorizedUse {
  const base = allocateUseMandate(subject, audience, rationale, at);
  if (
    !base ||
    !!openGoalTask(state) ||
    !useVersion(state.subject) ||
    useVersion(subject)! <= useVersion(state.subject)! ||
    (state.previousMaterials?.length ?? 0) >= 7 ||
    Date.parse(at) < latestUseTime(state)
  )
    return state;
  const { previousMaterials, ...previous } = state;
  return {
    ...base,
    previousMaterials: [...(previousMaterials ?? []), previous],
  };
}
export function continuationSource(
  state: AuthorizedUse,
): UseRecord | undefined {
  if (authorityStatus(state) !== "Active" || state.cycle || state.previousCycle)
    return;
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
    !!openGoalTask(state) ||
    subject !== state.subject ||
    !base ||
    Date.parse(at) < latestUseTime(state)
  )
    return state;
  const { previousMaterials, ...previous } = state;
  const continuation: UseRecord = {
    id: recordId("local-use-continuation-2", subject!),
    sourceId: source.id,
    actor: "Demo organization owner",
    rationale: rationale.trim(),
    at,
  };
  return {
    ...base,
    cycle: 2,
    previousCycle: previousMaterials ? previous : state,
    ...(previousMaterials ? { previousMaterials } : {}),
    continuation,
    mandate: {
      ...base.mandate,
      id: recordId("local-publication-mandate", subject!, 2),
      sourceId: continuation.id,
    },
  };
}
export function assessedUseSubject(
  state: HumanContributionState,
): string | undefined {
  const c = state.contributions.at(-1);
  if (
    !c ||
    c.version < 2 ||
    c.version > 9 ||
    c.revisionRequest ||
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
    version: c.version,
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
    !useVersion(subject) ||
    !audience.trim() ||
    audience.length > 500 ||
    !valid(rationale, at)
  )
    return;
  let source: any;
  try {
    source = JSON.parse(subject);
  } catch {
    return;
  }
  const version = useVersion(subject);
  if (
    source.subject !== "human-guide-example" ||
    source.assessment?.conclusion !== "Suitable for stated scope" ||
    source.assessment.id !== `human-reassessment-v${version}` ||
    source.delivery?.id !== `human-delivery-v${version}` ||
    source.receipt?.id !== `human-receipt-v${version}` ||
    source.receipt.deliveryId !== source.delivery.id ||
    source.assessment.deliveryId !== source.delivery.id ||
    source.assessment.receiptId !== source.receipt.id ||
    Date.parse(at) < Date.parse(source.assessment.at)
  )
    return;
  return {
    subject,
    audience: audience.trim(),
    mandate: {
      id: recordId("local-publication-mandate", subject),
      at,
      actor: "Demo organization owner",
      rationale: rationale.trim(),
      sourceId: `human-reassessment-v${useVersion(subject)}`,
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
  principal?: ReviewPrincipal | "leo",
): AuthorizedUse {
  const role = decisionRole(action);
  const actor =
    principal ?? (role === "outcomeReview" ? "maya" : role ? "sam" : "leo");
  if (role ? actor !== reviewOwner(state, role) : actor !== "leo") return state;
  if (
    subject !== state.subject ||
    !valid(rationale, at) ||
    ((useVersion(subject)! > 2 ||
      state.authorityHistory ||
      state.reviewHandoffs) &&
      Date.parse(at) < latestUseTime(state))
  )
    return state;
  const record = (id: string, actor: string, sourceId: string): UseRecord => ({
    id: recordId(id, state.subject, state.cycle),
    actor: actor.startsWith("Demo ")
      ? actor
      : principal && !["sam", "maya", "leo"].includes(principal)
        ? reviewPrincipals[principal as ReviewPrincipal]
        : actor,
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
    authorityStatus(state) === "Active" &&
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

export function authorityStatus(
  state: UseCycle,
): "Active" | "Suspended" | "Revoked" {
  const last = state.authorityHistory?.at(-1)?.action;
  return last === "Revoke"
    ? "Revoked"
    : last === "Suspend"
      ? "Suspended"
      : "Active";
}
export function controlAuthority(
  state: AuthorizedUse,
  action: AuthorityAction,
  rationale: string,
  conditions: string,
  at: string,
  principal: ReviewPrincipal = "sam",
): AuthorizedUse {
  if (principal !== reviewOwner(state, "authorization")) return state;
  const status = authorityStatus(state);
  if (
    state.authorization?.decision !== "Allowed" ||
    !valid(rationale, at) ||
    !conditions.trim() ||
    conditions.length > 3000 ||
    Date.parse(at) < latestUseTime(state) ||
    (state.authorityHistory?.length ?? 0) >= 20 ||
    status === "Revoked" ||
    (action === "Resume"
      ? status !== "Suspended"
      : action === "Suspend"
        ? status !== "Active"
        : action !== "Revoke")
  )
    return state;
  const after =
    state.outcome ??
    state.readerEvidence ??
    state.execution ??
    state.authorization;
  return {
    ...state,
    authorityHistory: [
      ...(state.authorityHistory ?? []),
      {
        id: `${state.authorization.id}-control-${(state.authorityHistory?.length ?? 0) + 1}`,
        sourceId: state.authorityHistory?.at(-1)?.id ?? state.authorization.id,
        afterRecordId: after.id,
        actor:
          principal === "sam"
            ? "Sam · demo bounded-use authorizer"
            : reviewPrincipals[principal],
        at,
        action,
        rationale: rationale.trim(),
        conditions: conditions.trim(),
      },
    ],
  };
}
