import {
  contributionResponsibility,
  type Contribution,
  type HumanContributionState,
} from "./humanContribution";
import { knowledgeResponsibilityStatus } from "./knowledgeResponsibility";
export type ContributorActor = "leo" | "delegate";
export const contributorNames = { leo: "Leo", delegate: "Demo delegate" };
export const contributionAuthority = {
  role: "Coordinator",
  allowed: ["Prepare and revise K-01-H", "Submit K-01-H to Maya"],
  excluded: [
    "Assess own contribution",
    "Authorize publication",
    "Inherit earlier use authorization",
  ],
} as const;
export type KnowledgeHandoff = {
  id: string;
  proposedBy: "owner";
  from: ContributorActor;
  to: ContributorActor;
  at: string;
  rationale: string;
  pendingWork: string;
  commandCount: number;
  input: { id: string; body: string };
  draft: Pick<Contribution, "version" | "body" | "note" | "citesInput">;
  requestId?: string;
  authority: typeof contributionAuthority;
  response?: {
    actor: "owner" | ContributorActor;
    decision: "Accepted" | "Declined" | "Cancelled";
    at: string;
    rationale: string;
    acknowledged?: true;
  };
};
export function contributionPerformer(
  state: HumanContributionState,
): ContributorActor {
  return (
    state.handoffs?.filter((h) => h.response?.decision === "Accepted").at(-1)
      ?.to ?? "leo"
  );
}
export function contributorCanAct(
  state: HumanContributionState,
  actor: ContributorActor,
  at?: string,
) {
  const accepted = state.handoffs
    ?.filter((h) => h.response?.decision === "Accepted")
    .at(-1);
  return (
    actor === contributionPerformer(state) &&
    (!accepted ||
      at === undefined ||
      (Number.isFinite(Date.parse(at)) &&
        Date.parse(at) >= Date.parse(accepted.response!.at)))
  );
}
export function pendingKnowledgeHandoff(state: HumanContributionState) {
  return state.handoffs?.find((h) => !h.response);
}
export function handoffDraft(state: HumanContributionState) {
  const c = state.contributions.at(-1)!;
  return {
    version: c.version,
    body: c.body,
    note: c.note,
    citesInput: c.citesInput,
  };
}
function requestId(state: HumanContributionState) {
  const c = state.contributions.at(-2);
  return c?.assessment?.id ?? c?.reassessment?.id;
}
function unresolved(state: HumanContributionState) {
  return state.commands?.some((c) => c.status !== "rejected" && !c.projected);
}
const stable = (a: unknown) =>
  JSON.stringify(a, (_k, v) =>
    v && typeof v === "object" && !Array.isArray(v)
      ? Object.fromEntries(
          Object.keys(v)
            .sort()
            .map((k) => [k, v[k]]),
        )
      : v,
  );
const same = (a: unknown, b: unknown) => stable(a) === stable(b);
const text = (s: unknown, max = 3000): s is string =>
  typeof s === "string" && !!s.trim() && s.length <= max;
const date = (s: unknown): s is string =>
  typeof s === "string" && s.length <= 100 && Number.isFinite(Date.parse(s));
export function handoffIsCurrent(
  state: HumanContributionState,
  h: KnowledgeHandoff,
) {
  return (
    h.commandCount === (state.commands?.length ?? 0) &&
    !state.contributions.at(-1)!.delivery &&
    !unresolved(state) &&
    same(h.draft, handoffDraft(state)) &&
    h.requestId === requestId(state) &&
    h.from === contributionPerformer(state)
  );
}
export function proposeKnowledgeHandoff(
  state: HumanContributionState,
  actor: string,
  to: ContributorActor,
  pendingWork: string,
  rationale: string,
  at: string,
): HumanContributionState {
  const from = contributionPerformer(state),
    last = state.handoffs?.at(-1);
  if (
    actor !== "owner" ||
    knowledgeResponsibilityStatus(state) !== "Accepted locally" ||
    pendingKnowledgeHandoff(state) ||
    unresolved(state) ||
    state.contributions.at(-1)!.delivery ||
    !["leo", "delegate"].includes(to) ||
    to === from ||
    !text(pendingWork) ||
    !text(rationale) ||
    !date(at) ||
    (state.handoffs?.length ?? 0) >= 20 ||
    Date.parse(at) <
      Date.parse(last?.response?.at ?? state.responsibility!.events.at(-1)!.at)
  )
    return state;
  const h: KnowledgeHandoff = {
    id: `knowledge-handoff-${(state.handoffs?.length ?? 0) + 1}`,
    proposedBy: "owner",
    from,
    to,
    at,
    rationale: rationale.trim(),
    pendingWork: pendingWork.trim(),
    commandCount: state.commands?.length ?? 0,
    input: {
      id: contributionResponsibility.input,
      body: contributionResponsibility.inputText,
    },
    draft: handoffDraft(state),
    ...(requestId(state) ? { requestId: requestId(state) } : {}),
    authority: contributionAuthority,
  };
  return { ...state, handoffs: [...(state.handoffs ?? []), h] };
}
export function respondKnowledgeHandoff(
  state: HumanContributionState,
  actor: string,
  decision: NonNullable<KnowledgeHandoff["response"]>["decision"],
  rationale: string,
  acknowledged: boolean,
  at: string,
): HumanContributionState {
  const h = pendingKnowledgeHandoff(state);
  if (
    !h ||
    !text(rationale) ||
    !date(at) ||
    Date.parse(at) < Date.parse(h.at) ||
    (decision === "Cancelled" ? actor !== "owner" : actor !== h.to) ||
    !["Accepted", "Declined", "Cancelled"].includes(decision) ||
    (decision === "Accepted" && (!acknowledged || !handoffIsCurrent(state, h)))
  )
    return state;
  const response: NonNullable<KnowledgeHandoff["response"]> = {
    actor: actor as "owner" | ContributorActor,
    decision,
    at,
    rationale: rationale.trim(),
    ...(decision === "Accepted" ? { acknowledged: true as const } : {}),
  };
  return {
    ...state,
    handoffs: state.handoffs!.map((x) => (x === h ? { ...x, response } : x)),
  };
}

// A checkpoint preserves historical preparation; only a pending package must still
// match current preparation to be accepted. Inputs and authority are exact constants.
export function validateKnowledgeHandoffs(state: HumanContributionState) {
  const fail = () => {
    throw Error("Invalid Knowledge handoff history");
  };
  const shape = (v: any, keys: string[]) =>
    v &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    Object.keys(v).every((k) => keys.includes(k));
  if (
    !Array.isArray(state.handoffs) ||
    !state.handoffs.length ||
    state.handoffs.length > 20 ||
    knowledgeResponsibilityStatus(state) !== "Accepted locally"
  )
    fail();
  let performer: ContributorActor = "leo",
    previousAt = state.responsibility!.events.at(-1)!.at;
  for (const [i, h] of state.handoffs!.entries()) {
    if (
      !shape(h, [
        "id",
        "proposedBy",
        "from",
        "to",
        "at",
        "rationale",
        "pendingWork",
        "commandCount",
        "input",
        "draft",
        "requestId",
        "authority",
        "response",
      ]) ||
      h.id !== `knowledge-handoff-${i + 1}` ||
      h.proposedBy !== "owner" ||
      h.from !== performer ||
      !["leo", "delegate"].includes(h.to) ||
      h.to === performer ||
      !date(h.at) ||
      Date.parse(h.at) < Date.parse(previousAt) ||
      !text(h.rationale) ||
      !text(h.pendingWork) ||
      !Number.isInteger(h.commandCount) ||
      h.commandCount < 0 ||
      h.commandCount > (state.commands?.length ?? 0) ||
      (i > 0 && h.commandCount < state.handoffs![i - 1].commandCount) ||
      !shape(h.input, ["id", "body"]) ||
      h.input.id !== contributionResponsibility.input ||
      h.input.body !== contributionResponsibility.inputText ||
      !shape(h.draft, ["version", "body", "note", "citesInput"]) ||
      !Number.isInteger(h.draft.version) ||
      h.draft.version < 1 ||
      h.draft.version > state.contributions.length ||
      typeof h.draft.body !== "string" ||
      h.draft.body.length > 12000 ||
      typeof h.draft.note !== "string" ||
      h.draft.note.length > 3000 ||
      typeof h.draft.citesInput !== "boolean" ||
      !same(h.authority, contributionAuthority)
    )
      fail();
    const prior = state.contributions[h.draft.version - 2];
    if (h.requestId !== (prior?.assessment?.id ?? prior?.reassessment?.id))
      fail();
    previousAt = h.at;
    if (h.response) {
      const r = h.response;
      if (
        !shape(r, ["actor", "decision", "at", "rationale", "acknowledged"]) ||
        !["Accepted", "Declined", "Cancelled"].includes(r.decision) ||
        !date(r.at) ||
        Date.parse(r.at) < Date.parse(h.at) ||
        !text(r.rationale) ||
        (r.decision === "Cancelled" ? r.actor !== "owner" : r.actor !== h.to) ||
        (r.decision === "Accepted"
          ? r.acknowledged !== true
          : r.acknowledged !== undefined)
      )
        fail();
      if (r.decision === "Accepted") performer = h.to;
      previousAt = r.at;
    } else if (i !== state.handoffs!.length - 1) fail();
  }
  for (const [index, c] of (state.commands ?? []).entries()) {
    const accepted = state.handoffs!.filter(
      (h) =>
        h.response?.decision === "Accepted" &&
        index >= h.commandCount &&
        h.draft.version <= c.version &&
        Date.parse(h.response.at) <= Date.parse(c.submittedAt),
    );
    const expected = accepted.at(-1)?.to ?? "leo";
    if ((c.performer ?? "leo") !== expected) fail();
    // Preparation handed over cannot already be submitted at the proposal time.
    if (
      state.handoffs!.some(
        (h) =>
          h.draft.version === c.version &&
          index < h.commandCount &&
          c.status !== "rejected",
      )
    )
      fail();
  }
}
