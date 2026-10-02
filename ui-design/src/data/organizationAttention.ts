import { assignments } from "./assignments";
import type { Readiness } from "./models";
import { organizationWork, releaseWait } from "./organization";
import { workstreams } from "./organizationOverview";
import { responsibilityGaps } from "./workerDetails";

export type AttentionCategory = "Responsibility" | "Response" | "Outcome";
export type AttentionItem = {
  id: string;
  category: AttentionCategory;
  title: string;
  detail: string;
  owner: string;
  target: { kind: "assignment" | "workstream"; id: string; tab?: string };
};
// Bounded sample signals. Counts describe issues, not workers or completed goals.
export function organizationAttention(
  completed: Record<string, string>,
  readiness: Readiness,
): AttentionItem[] {
  const items: AttentionItem[] = responsibilityGaps.map((gap) => ({
    id: gap.id,
    category: "Responsibility",
    title: gap.title,
    detail: gap.description,
    owner: "Coordination: Jamie Chen · Planner (sample)",
    target: { kind: "workstream", id: gap.workstreamId },
  }));
  for (const assignment of assignments) {
    const responded = Boolean(completed[assignment.id]);
    const effectUnverified =
      assignment.id === "A-1035" || assignment.id === "A-1041";
    if (responded && !effectUnverified) continue;
    items.push({
      id: assignment.id,
      category:
        responded || assignment.id === "A-1035" ? "Outcome" : "Response",
      title: assignment.title,
      owner: `${assignment.owner} · ${assignment.role}`,
      detail: responded
        ? "Local response recorded. Execution or deployment effect remains unverified; inspect the receipt before following up."
        : assignment.id === "A-1041"
          ? releaseWait[readiness]
          : (organizationWork[assignment.id]?.wait ??
            "Waiting details are not connected in this sample."),
      target: {
        kind: "assignment",
        id: assignment.id,
        tab: responded ? "Activity" : "Overview",
      },
    });
  }
  for (const stream of workstreams)
    items.push({
      id: `${stream.id}-outcome`,
      category: "Outcome",
      title: `${stream.name} · outcome`,
      detail: stream.outcome,
      owner: "Outcome reviewer not assigned in this sample",
      target: { kind: "workstream", id: stream.id },
    });
  return items;
}
