import type { OrganizationScenario } from "./organizationScenario";
import type { AuthorizedUse, UseCycle } from "./authorizedUse";
export const goalActors = {
  owner: "Demo organization owner",
  leo: "Leo",
  maya: "Maya",
  outcomeDelegate: "Demo outcome reviewer",
} as const;
export type GoalActor = keyof typeof goalActors;
export type GoalDecision =
  "Goal met in simulation" | "Evidence gap" | "Further work required";
export type GoalTask = {
  id: string;
  assignee: Exclude<GoalActor, "owner">;
  title: string;
  expectedResult: string;
  response?: {
    id: string;
    actor: GoalActor;
    decision: "Accepted" | "Clarification requested" | "Declined";
    at: string;
    rationale: string;
    acknowledged?: true;
  };
  delivery?: { id: string; actor: GoalActor; body: string; at: string };
  review?: {
    id: string;
    actor: "owner";
    decision: "Accepted result" | "Revision needed";
    rationale: string;
    at: string;
  };
  cancellation?: { id: string; actor: "owner"; rationale: string; at: string };
};
export type GoalReview = {
  id: string;
  actor: "owner";
  criterion: "K-01-goal";
  outcomeId: string;
  previousId?: string;
  source: string;
  decision: GoalDecision;
  rationale: string;
  limitations: string;
  at: string;
  followUp?: GoalTask;
};
export function goalSource(state: UseCycle) {
  return JSON.stringify({
    subject: state.subject,
    audience: state.audience,
    outcome: state.outcome,
    execution: state.execution,
    readerEvidence: state.readerEvidence,
  });
}
export function goalRecords(state: UseCycle) {
  return (state.goalReviews ?? []).flatMap((r) =>
    [
      r,
      r.followUp?.response,
      r.followUp?.delivery,
      r.followUp?.review,
      r.followUp?.cancellation,
    ].filter((v): v is NonNullable<typeof v> => !!v),
  );
}
export function goalTaskState(task: GoalTask) {
  return task.cancellation
    ? "Cancelled"
    : task.review
      ? task.review.decision === "Accepted result"
        ? "Completed"
        : "Revision needed"
      : task.delivery
        ? "Submitted"
        : !task.response
          ? "Offered"
          : task.response.decision;
}
export function openGoalTask(state: UseCycle) {
  const task = state.goalReviews?.at(-1)?.followUp;
  return task &&
    ["Offered", "Accepted", "Submitted"].includes(goalTaskState(task))
    ? task
    : undefined;
}
const text = (value: string, max = 3000) =>
  typeof value === "string" && !!value.trim() && value.length <= max;
function time(state: UseCycle, at: string) {
  return (
    !!state.outcome &&
    Number.isFinite(Date.parse(at)) &&
    Date.parse(at) >= Date.parse(state.outcome.at) &&
    goalRecords(state).every((r) => Date.parse(at) >= Date.parse(r.at))
  );
}
export function reviewGoal(
  state: AuthorizedUse,
  subject: string | undefined,
  decision: GoalDecision,
  rationale: string,
  limitations: string,
  at: string,
  followUp?: Pick<GoalTask, "title" | "assignee" | "expectedResult">,
): AuthorizedUse {
  if (
    !state.outcome ||
    subject !== state.subject ||
    ![
      "Goal met in simulation",
      "Evidence gap",
      "Further work required",
    ].includes(decision) ||
    !text(rationale) ||
    !text(limitations) ||
    !time(state, at) ||
    openGoalTask(state) ||
    (state.goalReviews?.length ?? 0) >= 10
  )
    return state;
  if (
    decision === "Goal met in simulation"
      ? state.outcome.conclusion !== "Criterion met in simulation" || !!followUp
      : !followUp ||
        !["leo", "maya", "outcomeDelegate"].includes(followUp.assignee) ||
        !text(followUp.title, 500) ||
        !text(followUp.expectedResult)
  )
    return state;
  const id = `${state.outcome.id}-goal-${(state.goalReviews?.length ?? 0) + 1}`;
  return {
    ...state,
    goalReviews: [
      ...(state.goalReviews ?? []),
      {
        id,
        actor: "owner",
        criterion: "K-01-goal",
        outcomeId: state.outcome.id,
        ...(state.goalReviews?.length
          ? { previousId: state.goalReviews.at(-1)!.id }
          : {}),
        source: goalSource(state),
        decision,
        rationale: rationale.trim(),
        limitations: limitations.trim(),
        at,
        ...(followUp
          ? {
              followUp: {
                id: `${id}-followup`,
                assignee: followUp.assignee,
                title: followUp.title.trim(),
                expectedResult: followUp.expectedResult.trim(),
              },
            }
          : {}),
      },
    ],
  };
}
function update(state: AuthorizedUse, task: GoalTask): AuthorizedUse {
  return {
    ...state,
    goalReviews: state.goalReviews!.map((r, i) =>
      i === state.goalReviews!.length - 1 ? { ...r, followUp: task } : r,
    ),
  };
}
export function respondGoalTask(
  state: AuthorizedUse,
  subject: string | undefined,
  actor: GoalActor,
  decision: "Accepted" | "Clarification requested" | "Declined",
  rationale: string,
  at: string,
  acknowledged = false,
): AuthorizedUse {
  const task = state.goalReviews?.at(-1)?.followUp;
  if (
    !task ||
    task.response ||
    task.cancellation ||
    actor !== task.assignee ||
    !["Accepted", "Clarification requested", "Declined"].includes(decision) ||
    !text(rationale) ||
    !time(state, at) ||
    (decision === "Accepted" && (subject !== state.subject || !acknowledged))
  )
    return state;
  return update(state, {
    ...task,
    response: {
      id: `${task.id}-response`,
      actor,
      decision,
      rationale: rationale.trim(),
      at,
      ...(decision === "Accepted" ? { acknowledged: true as const } : {}),
    },
  });
}
export function deliverGoalTask(
  state: AuthorizedUse,
  subject: string | undefined,
  actor: GoalActor,
  body: string,
  at: string,
): AuthorizedUse {
  const task = state.goalReviews?.at(-1)?.followUp;
  if (
    !task ||
    task.response?.decision !== "Accepted" ||
    task.delivery ||
    task.cancellation ||
    actor !== task.assignee ||
    subject !== state.subject ||
    !text(body, 6000) ||
    !time(state, at)
  )
    return state;
  return update(state, {
    ...task,
    delivery: { id: `${task.id}-delivery`, actor, body: body.trim(), at },
  });
}
export function assessGoalTask(
  state: AuthorizedUse,
  subject: string | undefined,
  decision: "Accepted result" | "Revision needed",
  rationale: string,
  at: string,
): AuthorizedUse {
  const task = state.goalReviews?.at(-1)?.followUp;
  if (
    !task?.delivery ||
    task.review ||
    task.cancellation ||
    subject !== state.subject ||
    !["Accepted result", "Revision needed"].includes(decision) ||
    !text(rationale) ||
    !time(state, at)
  )
    return state;
  return update(state, {
    ...task,
    review: {
      id: `${task.id}-review`,
      actor: "owner",
      decision,
      rationale: rationale.trim(),
      at,
    },
  });
}
export function cancelGoalTask(
  state: AuthorizedUse,
  rationale: string,
  at: string,
): AuthorizedUse {
  const task = openGoalTask(state);
  if (!task || !text(rationale) || !time(state, at)) return state;
  return update(state, {
    ...task,
    cancellation: {
      id: `${task.id}-cancellation`,
      actor: "owner",
      rationale: rationale.trim(),
      at,
    },
  });
}
export function goalProgress(state: UseCycle) {
  if (!state.outcome) return undefined;
  const r = state.goalReviews?.at(-1),
    task = r?.followUp;
  if (r?.decision === "Goal met in simulation")
    return {
      actor: undefined,
      title: "Goal met in this simulation",
      detail: `${r.rationale} Limits: ${r.limitations}. No real organizational outcome is verified.`,
    };
  if ((state.goalReviews?.length ?? 0) >= 10 && !openGoalTask(state))
    return {
      actor: undefined,
      title: "Goal review limit reached",
      detail:
        "This cycle retains ten goal reviews. Remaining gaps are not resolved automatically; inspect history and plan a separately authorized new cycle or material.",
    };
  if (!task)
    return {
      actor: "owner" as const,
      title: "Review outcome against organizational goal",
      detail:
        "Owner must separately decide goal status, remaining evidence gaps and any explicitly allocated follow-up. Outcome review alone does not close the goal.",
    };
  const status = goalTaskState(task);
  return {
    actor: (["Offered", "Accepted"].includes(status)
      ? task.assignee
      : "owner") as GoalActor,
    title:
      status === "Offered"
        ? "Respond to goal follow-up offer"
        : status === "Accepted"
          ? "Deliver goal follow-up result"
          : status === "Submitted"
            ? "Review goal follow-up result"
            : "Reassess goal after follow-up",
    detail: `${task.title} · ${status}. Expected: ${task.expectedResult}. Original outcome: ${state.outcome.conclusion}. Completing this task does not update the outcome or automatically close the goal.`,
  };
}

export function goalLoopScenario(
  base: OrganizationScenario,
  state?: AuthorizedUse,
  subject?: string,
): OrganizationScenario {
  if (base.id !== "knowledge" || !state?.outcome) return base;
  const progress = goalProgress(state)!,
    current = subject === state.subject,
    decision = state.goalReviews?.at(-1);
  const summary = current
    ? `Local simulation · ${progress.title}`
    : "Historical local outcome · current source changed";
  return {
    ...base,
    streams: base.streams.map((s) =>
      s.id === "K-01" ? { ...s, outcome: summary } : s,
    ),
    outcomes: base.outcomes.map((o) =>
      o.streamId === "K-01"
        ? {
            ...o,
            boundary:
              "Local retained outcome/goal decisions apply only to their exact material, audience and cycle. Real readership and organization-wide success remain unverified.",
            criteria: o.criteria.map((c) =>
              c.id === "K-01-goal"
                ? {
                    ...c,
                    available: `${state.outcome!.id} · ${state.outcome!.conclusion}. ${decision ? `${decision.id} · ${decision.decision}` : "Owner goal decision pending"}. Audience: ${state.audience}. ${current ? "Current exact source." : "Historical source; no current goal attainment is inferred."}`,
                    gap: `${decision?.limitations ?? "Owner must record scope limits and evidence gaps."} Real reader observations remain unverified. ${progress.detail}`,
                  }
                : c,
            ),
          }
        : o,
    ),
  };
}
