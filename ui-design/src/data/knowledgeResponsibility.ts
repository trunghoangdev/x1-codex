import type { HumanContributionState } from "./humanContribution";

export type KnowledgeResponsibilityEvent = {
  id: string;
  action:
    | "Offer responsibility"
    | "Accept responsibility"
    | "Request clarification"
    | "Decline responsibility";
  actor: "owner" | "leo";
  rationale: string;
  at: string;
};
export type KnowledgeResponsibility = {
  assignment: "human-guide-preparation-example";
  subject: "human-guide-example";
  role: "Coordinator";
  performer: "leo";
  receiver: "maya";
  input: "input-access-brief-v1";
  events: KnowledgeResponsibilityEvent[];
};
export function knowledgeResponsibilityStatus(state: HumanContributionState) {
  const action = state.responsibility?.events.at(-1)?.action;
  return action === "Accept responsibility"
    ? "Accepted locally"
    : action === "Request clarification"
      ? "Clarification requested"
      : action === "Decline responsibility"
        ? "Declined · coordination needed"
        : action === "Offer responsibility"
          ? "Acceptance pending"
          : "Authored assignment · no local offer";
}
export function contributionAcceptanceBlocked(
  state: HumanContributionState,
  at?: string,
) {
  return (
    !!state.responsibility &&
    (knowledgeResponsibilityStatus(state) !== "Accepted locally" ||
      (at !== undefined &&
        (!Number.isFinite(Date.parse(at)) ||
          Date.parse(at) < Date.parse(state.responsibility.events.at(-1)!.at))))
  );
}
export function recordKnowledgeResponsibility(
  state: HumanContributionState,
  action: KnowledgeResponsibilityEvent["action"],
  actor: KnowledgeResponsibilityEvent["actor"],
  rationale: string,
  at: string,
): HumanContributionState {
  if (
    !rationale.trim() ||
    rationale.length > 3000 ||
    !Number.isFinite(Date.parse(at)) ||
    (state.responsibility?.events.length ?? 0) >= 100
  )
    return state;
  const last = state.responsibility?.events.at(-1);
  if (last && Date.parse(at) < Date.parse(last.at)) return state;
  const status = knowledgeResponsibilityStatus(state);
  if (action === "Offer responsibility") {
    // This slice allocates before submission, never retroactively over delivered work.
    if (
      actor !== "owner" ||
      state.commands?.length ||
      state.contributions.some((c) => c.delivery) ||
      (state.responsibility &&
        !["Clarification requested", "Declined · coordination needed"].includes(
          status,
        ))
    )
      return state;
  } else {
    if (
      actor !== "leo" ||
      !state.responsibility ||
      status !== "Acceptance pending" ||
      ![
        "Accept responsibility",
        "Request clarification",
        "Decline responsibility",
      ].includes(action)
    )
      return state;
  }
  const responsibility: KnowledgeResponsibility = state.responsibility ?? {
    assignment: "human-guide-preparation-example",
    subject: "human-guide-example",
    role: "Coordinator",
    performer: "leo",
    receiver: "maya",
    input: "input-access-brief-v1",
    events: [],
  };
  const event: KnowledgeResponsibilityEvent = {
    id: `knowledge-responsibility-${responsibility.events.length + 1}`,
    action,
    actor,
    rationale: rationale.trim(),
    at,
  };
  return {
    ...state,
    responsibility: {
      ...responsibility,
      events: [...responsibility.events, event],
    },
  };
}

// Replay exact event identities and actor/state transitions; unknown fields are rejected.
export function validateKnowledgeResponsibility(
  raw: unknown,
  state: HumanContributionState,
) {
  const r = raw as KnowledgeResponsibility;
  if (
    !r ||
    typeof r !== "object" ||
    Array.isArray(r) ||
    !Array.isArray(r.events) ||
    !r.events.length ||
    r.events.length > 100
  )
    throw Error("Invalid responsibility history");
  let replay: HumanContributionState = {
    contributions: [{ version: 1, body: "", note: "", citesInput: false }],
  };
  for (const event of r.events) {
    if (
      !event ||
      Object.keys(event).sort().join() !==
        ["id", "action", "actor", "rationale", "at"].sort().join() ||
      typeof event.rationale !== "string" ||
      typeof event.at !== "string"
    )
      throw Error("Invalid responsibility event");
    const next = recordKnowledgeResponsibility(
      replay,
      event.action,
      event.actor,
      event.rationale,
      event.at,
    );
    if (
      next === replay ||
      JSON.stringify(next.responsibility!.events.at(-1)) !==
        JSON.stringify({
          id: event.id,
          action: event.action,
          actor: event.actor,
          rationale: event.rationale,
          at: event.at,
        })
    )
      throw Error("Invalid responsibility transition");
    replay = next;
  }
  const expected = replay.responsibility!;
  if (
    Object.keys(r).sort().join() !== Object.keys(expected).sort().join() ||
    Object.keys(expected).some(
      (k) =>
        k !== "events" &&
        r[k as keyof KnowledgeResponsibility] !==
          expected[k as keyof KnowledgeResponsibility],
    )
  )
    throw Error("Invalid responsibility scope");
  if (
    contributionAcceptanceBlocked({ ...state, responsibility: r }) &&
    ((state.commands?.length ?? 0) > 0 ||
      state.contributions.some((c) => c.delivery))
  )
    throw Error("Unaccepted responsibility cannot submit work");
  const acceptance = r.events.at(-1)!;
  if (
    state.commands?.some(
      (c) => Date.parse(c.submittedAt) < Date.parse(acceptance.at),
    )
  )
    throw Error("Submission predates acceptance");
}
