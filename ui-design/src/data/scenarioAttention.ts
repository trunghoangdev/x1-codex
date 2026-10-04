import type { OrganizationScenario } from "./organizationScenario";
import type { AttentionItem } from "./organizationAttention";
export function scenarioAttention(
  scenario: OrganizationScenario,
): AttentionItem[] {
  return [
    ...scenario.gaps.map((gap) => ({
      id: gap.id,
      category: "Responsibility" as const,
      title: gap.title,
      detail: gap.description,
      owner: "Unassigned in sample",
      target: { kind: "workstream" as const, id: gap.workstreamId },
    })),
    ...scenario.assignments
      .filter((a) =>
        [
          "Awaiting assessment",
          "Awaiting authorization",
          "Revision requested",
        ].includes(a.state),
      )
      .map((a) => ({
        id: a.id,
        category: "Response" as const,
        title: a.title,
        detail: a.state,
        owner:
          scenario.workers.find((w) => w.id === a.workerId)?.name ??
          "Unassigned",
        target: { kind: "assignment" as const, id: a.id },
      })),
    ...scenario.streams.map((s) => ({
      id: `${s.id}-outcome`,
      category: "Outcome" as const,
      title: `${s.name} · outcome`,
      detail: s.outcome,
      owner: "Outcome reviewer not represented",
      target: { kind: "workstream" as const, id: s.id },
    })),
  ];
}
