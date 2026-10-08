import {
  contributionPerformer,
  contributorNames,
  pendingKnowledgeHandoff,
  handoffIsCurrent,
} from "./knowledgeHandoff";
import { contributionView } from "./contributionView";
import { scenarioAttention } from "./scenarioAttention";
import type { OrganizationScenario } from "./organizationScenario";
import type { HumanContributionState } from "./humanContribution";
import type { AttentionItem } from "./organizationAttention";

export type CoordinationNeed = AttentionItem & {
  source: "authored" | "session";
  responsibility: string;
  nextStep: string;
  destination?: string;
};
export function actionableAttention(
  scenario: OrganizationScenario,
  contribution: HumanContributionState,
): CoordinationNeed[] {
  const authored = scenarioAttention(scenario).map((item) => ({
    ...item,
    source: "authored" as const,
    responsibility:
      item.category === "Response"
        ? `Assignment responsibility: ${item.owner}. Follow-up ownership is not separately recorded.`
        : item.category === "Input"
          ? `Waiting recipient: ${item.owner}. Follow-up ownership is not separately recorded.`
          : "Follow-up owner not recorded. Inspect scope before allocating responsibility.",
    nextStep:
      item.category === "Response"
        ? "Inspect the requested response and assignment context."
        : item.category === "Input"
          ? "Inspect the missing input and its provider relationship."
          : item.category === "Responsibility"
            ? "Inspect the scoped gap and existing bindings."
            : "Inspect outcome requirements and evidence gaps.",
  }));
  if (scenario.id !== "knowledge") return authored;
  const handoff = pendingKnowledgeHandoff(contribution);
  const transfer: CoordinationNeed[] = handoff
    ? [
        {
          id: "local-K-01-H-handoff",
          source: "session",
          category: "Responsibility",
          title: "Contribution input and authority handoff",
          owner: handoffIsCurrent(contribution, handoff)
            ? contributorNames[handoff.to]
            : "Demo organization owner",
          responsibility: `${contributorNames[handoff.from]} retains contribution responsibility until exact-package acceptance.`,
          detail: `${handoff.id} · input ${handoff.input.id} · draft-0${handoff.draft.version} · ${handoffIsCurrent(contribution, handoff) ? "recipient response pending" : "stale package; acceptance blocked"}`,
          nextStep: handoffIsCurrent(contribution, handoff)
            ? "Inspect input, remaining work and bounded authority before accepting or declining."
            : "Cancel the stale package and prepare a new handoff.",
          target: { kind: "assignment", id: "K-01-H" },
          destination:
            "/organizations/knowledge/work?persona=leo" +
            (!handoffIsCurrent(contribution, handoff)
              ? "&useActor=owner"
              : handoff.to === "delegate"
                ? "&contributionActor=delegate"
                : ""),
        },
      ]
    : [];
  const current = contribution.contributions.at(-1)!;
  const view = contributionView(contribution);
  if (view.attention === "allocation") {
    const pending = view.stage === "Acceptance pending";
    return [
      {
        id: "local-K-01-H-allocation",
        source: "session",
        category: "Responsibility",
        title: "Guide contribution · responsibility response",
        owner: pending ? "Leo · sample contributor" : "Demo organization owner",
        responsibility: pending
          ? "Leo must respond to the exact local offer."
          : "Owner must resolve clarification or decline before issuing a new offer.",
        detail: view.summary,
        nextStep: view.contributorNext,
        target: { kind: "assignment", id: "K-01-H" },
        destination: pending
          ? "/organizations/knowledge/work?persona=leo"
          : "/organizations/knowledge/work?persona=leo&useActor=owner",
      },
      ...authored,
    ];
  }
  const receiver = view.attention === "receipt";
  const revision = view.attention === "revision";
  const unsettled = view.attention === "command";
  const correction = view.attention === "correction";
  // Only represented transitions create signals. No delivery does not imply a missed deadline.
  if (!receiver && !revision && !unsettled && !correction)
    return [...transfer, ...authored];
  const local: CoordinationNeed = {
    id: "local-K-01-H",
    source: "session",
    category: "Response",
    title: "Access-guide contribution · K-01-H",
    owner: receiver
      ? "Maya · sample receiver"
      : `${contributorNames[contributionPerformer(contribution)]} · sample contributor`,
    responsibility: receiver
      ? "Receipt responsibility: Maya. No separate escalation owner is recorded."
      : `Contribution responsibility: ${contributorNames[contributionPerformer(contribution)]}. No separate escalation owner is recorded.`,
    detail: receiver
      ? `draft-0${current.version} delivered locally; receiver receipt is not recorded.`
      : revision
        ? current.reassessment
          ? view.summary
          : "draft-01 has a sample revision request; draft-02 preparation has not started."
        : correction
          ? view.summary
          : "Contribution command acknowledgement or delivery projection remains unresolved. Do not resend.",
    nextStep: receiver
      ? "Inspect the exact delivered revision and record a sample receipt."
      : revision
        ? current.reassessment
          ? view.contributorNext
          : "Inspect Maya’s request and prepare draft-02."
        : correction
          ? view.contributorNext
          : "Inspect command status before editing or submitting again.",
    target: { kind: "assignment", id: "K-01-H" },
    destination: receiver
      ? "/organizations/knowledge/work?persona=maya"
      : "/organizations/knowledge/contributions/K-01-H?persona=leo" +
        (contributionPerformer(contribution) === "delegate"
          ? "&contributionActor=delegate"
          : ""),
  };
  return [...transfer, local, ...authored];
}
