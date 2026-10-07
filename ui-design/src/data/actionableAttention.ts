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
  const current = contribution.contributions.at(-1)!;
  const command = contribution.commands?.at(-1);
  const receiver = !!current.delivery && !current.receipt;
  const revision = !!current.assessment;
  const unsettled =
    (command && ["pending", "unknown"].includes(command.status)) ||
    (command?.status === "admitted" && !command.projected);
  // Only represented transitions create signals. No delivery does not imply a missed deadline.
  if (!receiver && !revision && !unsettled) return authored;
  const local: CoordinationNeed = {
    id: "local-K-01-H",
    source: "session",
    category: "Response",
    title: "Access-guide contribution · K-01-H",
    owner: receiver ? "Maya · sample receiver" : "Leo · sample contributor",
    responsibility: receiver
      ? "Receipt responsibility: Maya. No separate escalation owner is recorded."
      : "Contribution responsibility: Leo. No separate escalation owner is recorded.",
    detail: receiver
      ? `draft-0${current.version} delivered locally; receiver receipt is not recorded.`
      : revision
        ? "draft-01 has a sample revision request; draft-02 preparation has not started."
        : "Contribution command acknowledgement or delivery projection remains unresolved. Do not resend.",
    nextStep: receiver
      ? "Inspect the exact delivered revision and record a sample receipt."
      : revision
        ? "Inspect Maya’s request and prepare draft-02."
        : "Inspect command status before editing or submitting again.",
    target: { kind: "assignment", id: "K-01-H" },
    destination: receiver
      ? "/organizations/knowledge/work?persona=maya"
      : "/organizations/knowledge/contributions/K-01-H?persona=leo",
  };
  return [local, ...authored];
}
