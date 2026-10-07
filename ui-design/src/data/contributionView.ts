import type { HumanContributionState } from "./humanContribution";
import { commandBlocksEditing } from "./contributionCommand";

// Presentation derived from the same session records, including restored/imported state.
export function contributionView(state: HumanContributionState) {
  const current = state.contributions.at(-1)!;
  const command = state.commands?.at(-1);
  const active = command?.version === current.version ? command : undefined;
  const locked = commandBlocksEditing(state);
  const attention = locked
    ? "command"
    : current.delivery && !current.receipt
      ? "receipt"
      : current.assessment
        ? "revision"
        : active?.status === "rejected" && !current.delivery
          ? "correction"
          : undefined;
  const stage = locked
    ? active?.status === "admitted"
      ? "Awaiting delivery projection"
      : active?.status === "pending"
        ? "Admission pending"
        : "Acknowledgement unknown"
    : current.assessment
      ? "Revision requested"
      : current.delivery
        ? current.receipt
          ? "Receipt recorded · assessment pending"
          : "Awaiting receiver receipt"
        : active?.status === "rejected"
          ? "Submission rejected"
          : current.version === 2
            ? "Preparing revision"
            : "Preparing contribution";
  const summary = current.delivery
    ? `draft-0${current.version}: delivered locally · ${current.receipt ? "receipt recorded" : "awaiting receiver receipt"} · ${current.assessment ? "revision requested" : "assessment not recorded"}`
    : locked
      ? `draft-0${current.version}: ${stage.toLowerCase()} · no delivery recorded`
      : active?.status === "rejected"
        ? `draft-0${current.version}: submission rejected · no delivery recorded`
        : `draft-0${current.version}: preparation · no delivery recorded`;
  const contributorNext = locked
    ? "Command unresolved. Inspect acknowledgement or delivery projection; do not submit again."
    : current.assessment
      ? "Maya requested a revision. Inspect the request below and prepare draft-02."
      : current.delivery
        ? current.receipt
          ? "Receipt recorded. Assessment remains separate; no further contributor action is established."
          : "Delivered locally. Waiting for Maya’s receipt; do not resend."
        : active?.status === "rejected"
          ? `Submission rejected (${active.rejection}). Inspect the reason and correct the draft before a new submission.`
          : current.version === 2
            ? `Prepare draft-02 in response to ${state.contributions[0].assessment?.id}; earlier delivery and review remain attached to draft-01.`
            : "Prepare your contribution using the supplied brief, then review the exact delivery.";
  const receiverNext = !current.delivery
    ? "Wait for Leo’s next delivered revision; no receipt action is available."
    : !current.receipt
      ? `Inspect draft-0${current.version} below, then record its sample receipt.`
      : current.assessment
        ? "Revision requested. Wait for Leo’s next delivery."
        : current.version === 1
          ? "Inspect the received text and the authored revision guidance before requesting a sample revision."
          : "Reassessment remains pending; no acceptance or publication action is available.";
  return {
    version: current.version,
    stage,
    summary,
    contributorNext,
    receiverNext,
    attention,
    locked,
  };
}
