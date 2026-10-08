import type { ContributionCommand } from "./contributionCommand";
export type Contribution = {
  version: number;
  body: string;
  note: string;
  citesInput: boolean;
  delivery?: {
    id: string;
    at: string;
    body: string;
    note: string;
    input: string;
    respondsTo?: string;
  };
  receipt?: { id: string; deliveryId: string; at: string };
  reassessment?: {
    id: string;
    receiptId: string;
    deliveryId: string;
    assessor: "Maya";
    at: string;
    conclusion: "Suitable for stated scope" | "Further revision needed";
    rationale: string;
  };
  assessment?: {
    id: string;
    receiptId: string;
    at: string;
    conclusion: "Revision requested";
    rationale: string;
  };
};
export type HumanContributionState = {
  contributions: Contribution[];
  commands?: ContributionCommand[];
};
export const emptyContribution = (): HumanContributionState => ({
  contributions: [{ version: 1, body: "", note: "", citesInput: false }],
});
export const contributionResponsibility = {
  assignment: "human-guide-preparation-example",
  subject: "human-guide-example",
  actor: "Leo · human contributor (demo)",
  receiver: "Maya · editor (demo)",
  input: "input-access-brief-v1",
  inputText:
    "For this fictional cohort, access questions go to the onboarding contact. The guide should explain who to contact and what context to include. This is an authored input, not an adopted policy.",
};
export const maxContributionVersions = 9;
export function revisionRequest(c: Contribution | undefined) {
  return (
    c?.assessment ??
    (c?.reassessment?.conclusion === "Further revision needed"
      ? c.reassessment
      : undefined)
  );
}
export function deliverContribution(
  state: HumanContributionState,
  at: string,
): HumanContributionState {
  const current = state.contributions.at(-1)!;
  if (
    current.delivery ||
    !current.body.trim() ||
    !current.note.trim() ||
    !current.citesInput
  )
    return state;
  const respondsTo = revisionRequest(state.contributions.at(-2))?.id;
  if (current.version > 1 && !respondsTo) return state;
  return {
    ...state,
    contributions: state.contributions.map((c) =>
      c === current
        ? {
            ...c,
            delivery: {
              id: `human-delivery-v${c.version}`,
              at,
              body: c.body,
              note: c.note,
              input: contributionResponsibility.input,
              ...(c.version > 1 ? { respondsTo } : {}),
            },
          }
        : c,
    ),
  };
}
export function receiveContribution(
  state: HumanContributionState,
  at: string,
): HumanContributionState {
  const current = state.contributions.at(-1)!;
  if (!current.delivery || current.receipt) return state;
  return {
    ...state,
    contributions: state.contributions.map((c) =>
      c === current
        ? {
            ...c,
            receipt: {
              id: `human-receipt-v${c.version}`,
              at,
              deliveryId: c.delivery!.id,
            },
          }
        : c,
    ),
  };
}
export function assessContribution(
  state: HumanContributionState,
  at: string,
): HumanContributionState {
  const current = state.contributions.at(-1)!;
  if (current.version !== 1 || !current.receipt || current.assessment)
    return state;
  return {
    ...state,
    contributions: state.contributions.map((c) =>
      c === current
        ? {
            ...c,
            assessment: {
              id: "human-assessment-v1",
              receiptId: c.receipt!.id,
              at,
              conclusion: "Revision requested",
              rationale:
                "Illustrative reviewer request: make the access next step explicit and explain what context the reader should include. This scenario response is not an evaluation of your text.",
            },
          }
        : c,
    ),
  };
}
export function reviseContribution(
  state: HumanContributionState,
): HumanContributionState {
  const current = state.contributions.at(-1)!;
  if (
    state.contributions.length >= maxContributionVersions ||
    !current.delivery ||
    !revisionRequest(current)
  )
    return state;
  return {
    ...state,
    contributions: [
      ...state.contributions,
      {
        version: current.version + 1,
        body: current.delivery.body,
        note: "",
        citesInput: false,
      },
    ],
  };
}

export function reassessContribution(
  state: HumanContributionState,
  conclusion: NonNullable<Contribution["reassessment"]>["conclusion"],
  rationale: string,
  at: string,
): HumanContributionState {
  const current = state.contributions.at(-1)!;
  if (
    current.version < 2 ||
    !current.delivery ||
    !current.receipt ||
    current.reassessment ||
    !rationale.trim() ||
    rationale.length > 3000 ||
    !["Suitable for stated scope", "Further revision needed"].includes(
      conclusion,
    )
  )
    return state;
  return {
    ...state,
    contributions: state.contributions.map((c) =>
      c === current
        ? {
            ...c,
            reassessment: {
              id: `human-reassessment-v${current.version}`,
              receiptId: current.receipt!.id,
              deliveryId: current.delivery!.id,
              assessor: "Maya",
              at,
              conclusion,
              rationale: rationale.trim(),
            },
          }
        : c,
    ),
  };
}
