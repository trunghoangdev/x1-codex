import {
  contributionResponsibility,
  deliverContribution,
  revisionRequest,
  type HumanContributionState,
} from "./humanContribution";
export type CommandPreview =
  | "projected"
  | "pending"
  | "unknown"
  | "rejected"
  | "conflict"
  | "admitted-lag";
export type ContributionCommand = {
  id: string;
  idempotencyKey: string;
  contract: "human.contribution-submit.draft.v1";
  expectedRevision: string;
  assignment: string;
  subject: string;
  version: number;
  body: string;
  note: string;
  input: string;
  respondsTo?: string;
  submittedAt: string;
  status: "pending" | "unknown" | "rejected" | "admitted";
  rejection?: "permission-denied" | "revision-conflict";
  admittedAt?: string;
  projected: boolean;
};
export function commandBlocksEditing(state: HumanContributionState) {
  const command = state.commands?.at(-1);
  return (
    !!command &&
    command.version === state.contributions.at(-1)?.version &&
    command.status !== "rejected" &&
    !command.projected
  );
}
export function submitContributionCommand(
  state: HumanContributionState,
  preview: CommandPreview,
  at: string,
): HumanContributionState {
  const current = state.contributions.at(-1)!;
  if (
    current.delivery ||
    commandBlocksEditing(state) ||
    !current.body.trim() ||
    !current.note.trim() ||
    !current.citesInput ||
    (current.version > 1 && !revisionRequest(state.contributions.at(-2)))
  )
    return state;
  const id = `demo-command-${(state.commands?.length ?? 0) + 1}`;
  const status =
    preview === "pending"
      ? "pending"
      : preview === "unknown"
        ? "unknown"
        : ["rejected", "conflict"].includes(preview)
          ? "rejected"
          : "admitted";
  const command: ContributionCommand = {
    id,
    idempotencyKey: `${id}-key`,
    contract: "human.contribution-submit.draft.v1",
    expectedRevision: `demo-assignment-revision-${current.version}`,
    assignment: contributionResponsibility.assignment,
    subject: contributionResponsibility.subject,
    version: current.version,
    body: current.body,
    note: current.note,
    input: contributionResponsibility.input,
    ...(current.version > 1
      ? { respondsTo: revisionRequest(state.contributions.at(-2))!.id }
      : {}),
    submittedAt: at,
    status,
    projected: false,
    ...(status === "admitted" ? { admittedAt: at } : {}),
    ...(preview === "rejected"
      ? { rejection: "permission-denied" as const }
      : preview === "conflict"
        ? { rejection: "revision-conflict" as const }
        : {}),
  };
  const next = { ...state, commands: [...(state.commands ?? []), command] };
  return preview === "projected" ? projectContributionCommand(next) : next;
}
export function resolveContributionCommand(
  state: HumanContributionState,
  resolution: "admitted" | "rejected" | "unknown",
  at: string,
): HumanContributionState {
  const command = state.commands?.at(-1);
  if (!command || !["unknown", "pending"].includes(command.status))
    return state;
  return {
    ...state,
    commands: state.commands!.map((c) =>
      c === command
        ? {
            ...c,
            status: resolution,
            ...(resolution === "admitted"
              ? { admittedAt: at }
              : resolution === "rejected"
                ? { rejection: "permission-denied" as const }
                : {}),
          }
        : c,
    ),
  };
}
export function projectContributionCommand(
  state: HumanContributionState,
): HumanContributionState {
  const command = state.commands?.at(-1);
  const current = state.contributions.at(-1)!;
  if (
    !command ||
    command.status !== "admitted" ||
    command.projected ||
    current.delivery ||
    current.version !== command.version ||
    current.body !== command.body ||
    current.note !== command.note ||
    !current.citesInput
  )
    return state;
  const delivered = deliverContribution(state, command.admittedAt!);
  return {
    ...delivered,
    commands: state.commands!.map((c) =>
      c === command ? { ...c, projected: true } : c,
    ),
  };
}
