import type { OrganizationScenario } from "./organizationScenario";
import type { AttentionItem } from "./organizationAttention";
export type InputDependency = {
  id: string;
  streamId: string;
  input: string;
  provider: { assignmentId: string } | { workerId: string; role: string };
  receiverAssignmentId: string;
  availability: "missing" | "represented";
  receipt: "unconfirmed";
  localExchange?: { summary: string; received: boolean };
  description: string;
  returnPath?: string;
};
export type ParallelWork = {
  id: string;
  streamId: string;
  assignmentIds: string[];
  description: string;
};
export const softwareDependencies: InputDependency[] = [
  {
    id: "payment-candidate-input",
    streamId: "WS-01",
    input: "Exact payment candidate and its checks",
    provider: { workerId: "codex", role: "Developer" },
    receiverAssignmentId: "A-1042",
    availability: "represented",
    receipt: "unconfirmed",
    description:
      "Sample candidate and checks are attached to the review. No separate developer assignment or confirmed transfer is represented.",
    returnPath:
      "If revision is requested, return explicit gaps to the developer. A revised candidate requires a new assessment; no follow-up assignment is represented.",
  },
];
export function inputAttention(
  scenario: OrganizationScenario,
): AttentionItem[] {
  return scenario.dependencies
    .filter((d) => d.availability === "missing")
    .map((d) => {
      const receiver = scenario.assignments.find(
        (a) => a.id === d.receiverAssignmentId,
      )!;
      const provider = d.provider;
      const source =
        "assignmentId" in provider
          ? scenario.assignments.find((a) => a.id === provider.assignmentId)
          : undefined;
      const workerId =
        source?.workerId ??
        ("workerId" in d.provider ? d.provider.workerId : undefined);
      const name =
        scenario.workers.find((w) => w.id === workerId)?.name ??
        "Unassigned provider";
      return {
        id: d.id,
        category: "Input",
        title: `Waiting input · ${d.input}`,
        detail:
          d.localExchange?.summary ??
          `${receiver.id} waits for ${d.input} from ${name}. Input is not represented; delivery and receipt remain unconfirmed.`,
        owner:
          scenario.workers.find((w) => w.id === receiver.workerId)?.name ??
          "Unassigned receiver",
        target: { kind: "assignment", id: receiver.id },
      };
    });
}
