import type { AuthorizedUse, UseCycle } from "./authorizedUse";
export const reviewRoles = {
  publicationReview: "Publication review",
  authorization: "Authorization and controls",
  outcomeReview: "Outcome review",
} as const;
export type ReviewRole = keyof typeof reviewRoles;
export const reviewPrincipals = {
  sam: "Sam",
  maya: "Maya",
  reviewDelegate: "Demo publication reviewer",
  authorityDelegate: "Demo authorization delegate",
  outcomeDelegate: "Demo outcome reviewer",
} as const;
export type ReviewPrincipal = keyof typeof reviewPrincipals;
export const roleCandidates: Record<ReviewRole, ReviewPrincipal[]> = {
  publicationReview: ["sam", "reviewDelegate"],
  authorization: ["sam", "authorityDelegate"],
  outcomeReview: ["maya", "outcomeDelegate"],
};
export const reviewRights = {
  publicationReview:
    "Assess publication scope only; no contribution editing, authorization, execution or outcome review.",
  authorization:
    "Decide bounded use and suspend/resume/revoke this exact cycle only; no content editing, publication assessment, execution or outcome review. No new grant is created by handoff.",
  outcomeReview:
    "Review retained outcome evidence only; no contribution editing, publication assessment, authorization or execution.",
};
export type ReviewHandoffEvent = {
  id: string;
  action: "Proposed" | "Accepted" | "Declined" | "Cancelled";
  role: ReviewRole;
  actor: ReviewPrincipal | "owner";
  from: ReviewPrincipal;
  to: ReviewPrincipal;
  at: string;
  rationale: string;
  package: string;
  afterRecordId: string;
  controlCount: number;
  proposalId?: string;
  acknowledged?: true;
};
export function reviewOwner(
  state: UseCycle,
  role: ReviewRole,
): ReviewPrincipal {
  return (
    state.reviewHandoffs
      ?.filter((e) => e.role === role && e.action === "Accepted")
      .at(-1)?.to ?? (role === "outcomeReview" ? "maya" : "sam")
  );
}
export function pendingReviewHandoff(state: UseCycle) {
  const last = state.reviewHandoffs?.at(-1);
  return last?.action === "Proposed" ? last : undefined;
}
export function reviewAnchor(state: UseCycle) {
  return (
    state.outcome ??
    state.readerEvidence ??
    state.execution ??
    state.authorization ??
    state.publicationAssessment ??
    state.mandate
  ).id;
}
export function reviewPackage(state: UseCycle, role: ReviewRole): string {
  return JSON.stringify({
    role,
    rights: reviewRights[role],
    remainingWork:
      role === "publicationReview"
        ? "Assess this exact material against publication scope."
        : role === "authorization"
          ? state.authorization
            ? "Control the existing grant; preserve its original decision and actor."
            : "Record a separate bounded-use authorization after publication assessment."
          : state.execution
            ? "Review the retained execution and reader evidence; missing evidence remains an explicit gap."
            : "Await execution and reader observations, then record a separate outcome review.",
    subject: state.subject,
    audience: state.audience,
    mandate: state.mandate,
    publicationAssessment: state.publicationAssessment,
    authorization: state.authorization,
    execution: state.execution,
    readerEvidence: state.readerEvidence,
    outcome: state.outcome,
    authorityHistory: state.authorityHistory,
  });
}
export function reviewRoleOpen(state: UseCycle, role: ReviewRole) {
  if (role === "publicationReview") return !state.publicationAssessment;
  if (
    state.publicationAssessment?.conclusion === "Revision needed" ||
    state.authorization?.decision === "Refused"
  )
    return false;
  const revoked = state.authorityHistory?.at(-1)?.action === "Revoke";
  return role === "outcomeReview"
    ? !state.outcome && (!!state.execution || !revoked)
    : !revoked;
}

function valid(state: UseCycle, rationale: string, at: string) {
  const records = [
    state.mandate,
    state.publicationAssessment,
    state.authorization,
    state.execution,
    state.readerEvidence,
    state.outcome,
    ...(state.authorityHistory ?? []),
    ...(state.reviewHandoffs ?? []),
  ].filter(Boolean);
  return (
    typeof rationale === "string" &&
    !!rationale.trim() &&
    rationale.length <= 3000 &&
    Number.isFinite(Date.parse(at)) &&
    records.every((r) => Date.parse(at) >= Date.parse(r!.at)) &&
    (state.reviewHandoffs?.length ?? 0) < 40
  );
}
export function proposeReviewHandoff(
  state: AuthorizedUse,
  subject: string | undefined,
  role: ReviewRole,
  to: ReviewPrincipal,
  rationale: string,
  at: string,
): AuthorizedUse {
  if (
    subject !== state.subject ||
    !roleCandidates[role]?.includes(to) ||
    reviewOwner(state, role) === to ||
    pendingReviewHandoff(state) ||
    !reviewRoleOpen(state, role) ||
    !valid(state, rationale, at) ||
    (state.reviewHandoffs?.length ?? 0) >= 39
  )
    return state;
  return {
    ...state,
    reviewHandoffs: [
      ...(state.reviewHandoffs ?? []),
      {
        id: `${state.mandate.id}-role-${(state.reviewHandoffs?.length ?? 0) + 1}`,
        action: "Proposed",
        role,
        actor: "owner",
        from: reviewOwner(state, role),
        to,
        at,
        rationale: rationale.trim(),
        package: reviewPackage(state, role),
        afterRecordId: reviewAnchor(state),
        controlCount: state.authorityHistory?.length ?? 0,
      },
    ],
  };
}
export function respondReviewHandoff(
  state: AuthorizedUse,
  subject: string | undefined,
  actor: ReviewPrincipal | "owner",
  action: "Accepted" | "Declined" | "Cancelled",
  rationale: string,
  at: string,
  acknowledged = false,
): AuthorizedUse {
  const p = pendingReviewHandoff(state);
  if (
    !p ||
    !valid(state, rationale, at) ||
    !["Accepted", "Declined", "Cancelled"].includes(action) ||
    actor !== (action === "Cancelled" ? "owner" : p.to) ||
    (action === "Accepted" &&
      (!acknowledged ||
        subject !== state.subject ||
        p.package !== reviewPackage(state, p.role) ||
        !reviewRoleOpen(state, p.role)))
  )
    return state;
  return {
    ...state,
    reviewHandoffs: [
      ...(state.reviewHandoffs ?? []),
      {
        id: `${state.mandate.id}-role-${(state.reviewHandoffs?.length ?? 0) + 1}`,
        action,
        role: p.role,
        actor,
        from: p.from,
        to: p.to,
        at,
        rationale: rationale.trim(),
        package: p.package,
        afterRecordId: reviewAnchor(state),
        controlCount: state.authorityHistory?.length ?? 0,
        proposalId: p.id,
        ...(action === "Accepted" ? { acknowledged: true as const } : {}),
      },
    ],
  };
}
export function decisionRole(action: string): ReviewRole | undefined {
  return ["Suitable", "Revision needed"].includes(action)
    ? "publicationReview"
    : ["Allowed", "Refused"].includes(action)
      ? "authorization"
      : [
            "Criterion met in simulation",
            "Insufficient evidence",
            "Criterion not met",
          ].includes(action)
        ? "outcomeReview"
        : undefined;
}
export function decisionActorId(
  actor: string,
): ReviewPrincipal | "leo" | undefined {
  if (
    actor === "Sam · demo publication reviewer" ||
    actor === "Sam · demo bounded-use authorizer"
  )
    return "sam";
  if (actor === "Maya · demo outcome reviewer") return "maya";
  if (
    actor === "Leo · demo execution observer" ||
    actor === "Leo · demo reader observer"
  )
    return "leo";
  return (Object.keys(reviewPrincipals) as ReviewPrincipal[]).find(
    (key) => reviewPrincipals[key] === actor && !["sam", "maya"].includes(key),
  );
}
