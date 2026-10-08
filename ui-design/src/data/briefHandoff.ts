import type { OrganizationScenario } from "./organizationScenario";
export type BriefVersion = {
  version: number;
  body: string;
  deliveredAt: string;
  receipt?: { id: string; at: string };
};
export type BriefHandoffState = { versions: BriefVersion[] };
export const emptyBriefHandoff: BriefHandoffState = { versions: [] };
export function deliverBrief(
  state: BriefHandoffState,
  body: string,
  at: string,
): BriefHandoffState {
  if (!body.trim() || body.length > 6000 || !Number.isFinite(Date.parse(at)))
    return state;
  return {
    versions: [
      ...state.versions,
      {
        version: state.versions.length + 1,
        body: body.trim(),
        deliveredAt: at,
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
export function briefInputSummary(state: BriefHandoffState) {
  const received = receivedBrief(state),
    latest = state.versions.at(-1);
  return received
    ? `Usable local input: brief-v${received.version}.${latest && latest.version > received.version ? ` Later brief-v${latest.version} has not been received; check review applicability before switching inputs.` : " Review remains a separate action."}`
    : latest
      ? `brief-v${latest.version} delivered locally; Maya's receipt is pending. Review input remains unavailable.`
      : "No brief delivered; review input is missing.";
}
export function briefHandoffScenario(
  base: OrganizationScenario,
  state: BriefHandoffState,
): OrganizationScenario {
  if (base.id !== "knowledge" || !state.versions.length) return base;
  const received = receivedBrief(state);
  return {
    ...base,
    dependencies: base.dependencies.map((d) =>
      d.id === "workshop-brief-input"
        ? {
            ...d,
            availability: received ? "represented" : "missing",
            description: briefInputSummary(state),
            localExchange: {
              summary: briefInputSummary(state),
              received: !!received,
            },
          }
        : d,
    ),
    assignments: base.assignments.map((a) =>
      a.id === "K-02-E"
        ? {
            ...a,
            state: received
              ? `Input received · brief-v${received.version} · review pending`
              : "Delivery recorded · receipt pending",
            waitingForInput: !received,
            input: briefInputSummary(state),
          }
        : a,
    ),
  };
}
