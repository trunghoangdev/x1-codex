import {
  guideInputStatus,
  currentGuideSubject,
  type GuideHandoff,
  type GuideBriefInput,
} from "./workstreamInputs";
import type { HumanContributionState } from "./humanContribution";
import type { OrganizationScenario } from "./organizationScenario";
export type BriefVersion = {
  version: number;
  body: string;
  deliveredAt: string;
  guideInput?: GuideBriefInput;
  receipt?: { id: string; at: string };
};
export type BriefHandoffState = {
  versions: BriefVersion[];
  guideHandoffs?: GuideHandoff[];
};
export const emptyBriefHandoff: BriefHandoffState = { versions: [] };
export function deliverBrief(
  state: BriefHandoffState,
  body: string,
  at: string,
  guideSubject?: string,
): BriefHandoffState {
  const guide = guideInputStatus(state.guideHandoffs ?? [], guideSubject);
  if (
    state.guideHandoffs?.length &&
    (!guide.ready ||
      Date.parse(at) <
        Date.parse(state.guideHandoffs.at(-1)!.applicability!.at(-1)!.at))
  )
    return state;
  if (!body.trim() || body.length > 6000 || !Number.isFinite(Date.parse(at)))
    return state;
  return {
    ...state,
    versions: [
      ...state.versions,
      {
        version: state.versions.length + 1,
        body: body.trim(),
        deliveredAt: at,
        ...(guide.input ? { guideInput: guide.input } : {}),
      },
    ],
  };
}
export function receiveBrief(
  state: BriefHandoffState,
  version: number,
  at: string,
): BriefHandoffState {
  const target = state.versions.find((v) => v.version === version);
  const latestReceived = receivedBrief(state);
  if (
    !target ||
    target.receipt ||
    (latestReceived && latestReceived.version > version) ||
    !Number.isFinite(Date.parse(at)) ||
    Date.parse(at) < Date.parse(target.deliveredAt)
  )
    return state;
  return {
    ...state,
    versions: state.versions.map((v) =>
      v === target
        ? { ...v, receipt: { id: `workshop-brief-receipt-v${version}`, at } }
        : v,
    ),
  };
}
export function receivedBrief(state: BriefHandoffState) {
  return state.versions.filter((v) => v.receipt).at(-1);
}
export function briefGuideIsCurrent(
  state: BriefHandoffState,
  brief: BriefVersion,
  contribution?: HumanContributionState,
) {
  if (!brief.guideInput || !contribution) return true;
  const view = guideInputStatus(
    state.guideHandoffs ?? [],
    currentGuideSubject(contribution),
  );
  return (
    view.ready &&
    view.input?.handoffId === brief.guideInput.handoffId &&
    view.input?.applicabilityId === brief.guideInput.applicabilityId &&
    view.input?.subject === brief.guideInput.subject
  );
}
export function briefInputSummary(
  state: BriefHandoffState,
  contribution?: HumanContributionState,
) {
  const received = receivedBrief(state),
    latest = state.versions.at(-1);
  if (
    received?.guideInput &&
    !briefGuideIsCurrent(state, received, contribution)
  )
    return `Received brief-v${received.version} retains a historical K-01 guide. Source or handoff decision changed; current handoff, applicability and a new brief are required before continuing the current workshop review. Earlier receipt remains historical.`;
  return received
    ? `Usable local input: brief-v${received.version}.${latest && latest.version > received.version ? ` Later brief-v${latest.version} has not been received; check review applicability before switching inputs.` : " Review remains a separate action."}`
    : latest
      ? `brief-v${latest.version} delivered locally; Maya's receipt is pending. Review input remains unavailable.`
      : "No brief delivered; review input is missing.";
}
export function briefHandoffScenario(
  base: OrganizationScenario,
  state: BriefHandoffState,
  contribution?: HumanContributionState,
): OrganizationScenario {
  if (
    base.id !== "knowledge" ||
    (!state.versions.length && !state.guideHandoffs?.length)
  )
    return base;
  const guide = guideInputStatus(
    state.guideHandoffs ?? [],
    contribution ? currentGuideSubject(contribution) : undefined,
  );
  const received = receivedBrief(state);
  const historicalGuide =
    !!received?.guideInput &&
    !briefGuideIsCurrent(state, received, contribution);
  return {
    ...base,
    dependencies: [
      ...(state.guideHandoffs?.length
        ? [
            {
              id: "guide-to-workshop-input",
              streamId: "K-02",
              input: "Assessed access guide from K-01",
              provider: { assignmentId: "K-01-E" },
              receiverAssignmentId: "K-02-C",
              availability: guide.ready
                ? ("represented" as const)
                : ("missing" as const),
              receipt: "unconfirmed" as const,
              description: guide.reason,
              localExchange: { summary: guide.reason, received: guide.ready },
              returnPath:
                "Return source/applicability gaps to Maya; receipt alone never completes the workshop.",
            },
          ]
        : []),
      ...base.dependencies.map((d) =>
        d.id === "workshop-brief-input"
          ? {
              ...d,
              availability:
                received && !historicalGuide
                  ? ("represented" as const)
                  : ("missing" as const),
              description: briefInputSummary(state, contribution),
              localExchange: {
                summary: briefInputSummary(state, contribution),
                received: !!received && !historicalGuide,
              },
            }
          : d,
      ),
    ],
    assignments: base.assignments.map((a) =>
      a.id === "K-02-C" && state.guideHandoffs?.length
        ? {
            ...a,
            state: guide.ready
              ? "Cross-workstream input ready · brief preparation pending"
              : "Cross-workstream input blocked",
            waitingForInput: !guide.ready,
            input: guide.reason,
          }
        : a.id === "K-02-E"
          ? {
              ...a,
              state: historicalGuide
                ? "Historical guide input · updated brief needed"
                : received
                  ? `Input received · brief-v${received.version} · review pending`
                  : state.versions.length
                    ? "Delivery recorded · receipt pending"
                    : "Workshop brief missing · preparation pending",
              waitingForInput: !received || historicalGuide,
              input: briefInputSummary(state, contribution),
            }
          : a,
    ),
  };
}
