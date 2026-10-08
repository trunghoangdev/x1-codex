import { contributionPerformer, contributorNames } from "./knowledgeHandoff";
import {
  contributionAcceptanceBlocked,
  knowledgeResponsibilityStatus,
} from "./knowledgeResponsibility";
import {
  maxContributionVersions,
  revisionRequest,
  type HumanContributionState,
} from "./humanContribution";
import { commandBlocksEditing } from "./contributionCommand";

// Presentation derived from the same session records, including restored/imported state.
function rawContributionView(state: HumanContributionState) {
  const current = state.contributions.at(-1)!;
  if (contributionAcceptanceBlocked(state)) {
    const status = knowledgeResponsibilityStatus(state);
    return {
      version: current.version,
      stage: status,
      summary: `K-01-H · Leo · ${status.toLowerCase()} · no delivery recorded`,
      contributorNext:
        status === "Acceptance pending"
          ? "Inspect the local responsibility offer in My Work. Accept, request clarification or decline before submission."
          : "The organization owner needs to resolve the response and issue a new offer before submission.",
      receiverNext:
        "Wait for accepted responsibility and a separately delivered contribution.",
      attention: "allocation",
      locked: false,
    };
  }
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
          : current.version > 1
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
          ? active.rejection === "permission-denied"
            ? "Permission denied. Your draft is retained. Check submission authority with the responsible administrator before trying again; editing text does not grant permission. This demo cannot change real permissions."
            : "Revision conflict. Your draft is retained. Compare the current assignment revision with your submitted version before preparing a new submission. This demo has no server revision to fetch or merge automatically."
          : current.version > 1
            ? `Prepare draft-0${current.version} in response to ${revisionRequest(state.contributions.at(-2))?.id}; earlier deliveries and reviews remain attached to their versions.`
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
  if (current.reassessment) {
    const needsRevision =
      current.reassessment.conclusion === "Further revision needed";
    return {
      version: current.version,
      stage: current.reassessment.conclusion,
      summary: `draft-0${current.version}: delivered locally · receipt recorded · ${current.reassessment.conclusion.toLowerCase()}`,
      contributorNext: needsRevision
        ? current.version < maxContributionVersions
          ? `Further revision needed. Inspect Maya’s reassessment and prepare draft-0${current.version + 1}.`
          : "Further revision needed. This local exercise supports up to draft-09; coordinate further work separately."
        : `Maya assessed draft-0${current.version} as suitable for the stated scope. Publication authority and outcome verification remain separate; no further contributor action is established.`,
      receiverNext: `Reassessment recorded for draft-0${current.version}. No publication or outcome decision was created.`,
      attention: needsRevision ? "revision" : undefined,
      locked,
    };
  }
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

export function contributionView(state: HumanContributionState) {
  const view = rawContributionView(state),
    name = contributorNames[contributionPerformer(state)];
  return {
    ...view,
    contributorNext: view.contributorNext.replaceAll("Leo", name),
    receiverNext: view.receiverNext.replaceAll("Leo", name),
  };
}
