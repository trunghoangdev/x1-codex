import type { OrganizationScenario } from "./organizationScenario";
import type { KnowledgeWorkspace } from "./knowledgeCheckpoint";
import { assessedUseSubject, useVersion } from "./authorizedUse";
import { goalSource } from "./goalLoop";
import { useProgress, useActors } from "./useProgress";
import { workshopProgress, workshopActors } from "./workshop";
import { caseProgress, caseActors } from "./caseLifecycle";
export const knowledgeGoal = {
  id: "knowledge-application",
  title: "Help members turn shared knowledge into practical next steps",
  intent:
    "Members can find reliable guidance and demonstrate applying it in a practical learning exercise.",
  streamIds: ["K-01", "K-02"],
  owner: "Organization-level goal owner not allocated in this sample",
  source: "Independently authored Knowledge goal map · goal-map-v1",
};
export type GoalEvidence = {
  id: string;
  kind: string;
  actor: string;
  at: string;
  summary: string;
};
export type GoalContribution = {
  streamId: string;
  name: string;
  goal: string;
  expected: string;
  status: string;
  positive: boolean;
  historical: boolean;
  scope: string;
  evidence: GoalEvidence[];
  gap: string;
  responsible: string;
  next: string;
  destination: string;
  retained: unknown;
  prior: string;
};
export function organizationGoals(
  scenario: OrganizationScenario,
  state: KnowledgeWorkspace,
) {
  if (scenario.id !== "knowledge") return undefined;
  const rows: GoalContribution[] = [];
  for (const id of knowledgeGoal.streamIds) {
    const stream = scenario.streams.find((s) => s.id === id);
    if (!stream) continue;
    if (id === "K-01") {
      const u = state.use,
        review = u?.goalReviews?.at(-1),
        view = useProgress(state.contribution, u, {
          adoptions: state.adoptions,
          checks: state.applicability ?? [],
        });
      const historical =
        !!u &&
        (u.subject !== assessedUseSubject(state.contribution) ||
          (!!review && review.source !== goalSource(u)));
      const positive =
        !historical && review?.decision === "Goal met in simulation";
      const evidence: GoalEvidence[] = [];
      if (u?.execution)
        evidence.push({
          id: u.execution.id,
          kind: "Execution observation",
          actor: u.execution.actor,
          at: u.execution.at,
          summary: u.execution.result + ": " + u.execution.rationale,
        });
      if (u?.readerEvidence)
        evidence.push({
          id: u.readerEvidence.id,
          kind: "Reader evidence",
          actor: u.readerEvidence.actor,
          at: u.readerEvidence.at,
          summary: u.readerEvidence.kind + ": " + u.readerEvidence.rationale,
        });
      if (u?.outcome)
        evidence.push({
          id: u.outcome.id,
          kind: "Criterion review",
          actor: u.outcome.actor,
          at: u.outcome.at,
          summary: u.outcome.conclusion + ": " + u.outcome.rationale,
        });
      if (review)
        evidence.push({
          id: review.id,
          kind: "Separate scoped goal decision",
          actor: "Demo organization owner",
          at: review.at,
          summary: review.decision + ": " + review.rationale,
        });
      rows.push({
        streamId: id,
        name: stream.name,
        goal: stream.goal,
        expected:
          "Reader observations showing members can find reliable answers and identify next steps; a separate scoped goal decision.",
        status: historical
          ? "Historical source · current goal not established"
          : positive
            ? "Scoped goal met in simulation"
            : review
              ? review.decision
              : u?.outcome
                ? "Scoped goal decision pending"
                : u?.execution?.result === "Failed"
                  ? "Execution failed · goal evidence gap"
                  : "Goal evidence not yet assessed",
        positive,
        historical,
        scope: u
          ? `Guide draft-${useVersion(u.subject)} · ${u.audience} · ${u.mandate.id}`
          : "No bounded material/audience/use cycle represented",
        evidence,
        gap: historical
          ? "Retained evidence belongs to an earlier exact source. It cannot establish the current guide’s result."
          : review
            ? `${review.limitations} Real reader outcomes remain unverified.`
            : u?.outcome
              ? "Outcome review exists, but the owner has not recorded a separate goal decision. Real reader outcomes remain unverified."
              : "No scoped goal decision. Delivery, receipt, editorial suitability and authorization alone are not reader outcome evidence.",
        responsible: view.actor
          ? useActors[view.actor]
          : "Next goal-evidence follow-up unallocated",
        next: view.title + ". " + view.detail,
        destination: view.destination.split("?")[0],
        retained: {
          source: u?.subject ?? null,
          execution: u?.execution ?? null,
          readerEvidence: u?.readerEvidence ?? null,
          outcome: u?.outcome ?? null,
          goalDecision: review ?? null,
        },
        prior: `${(u?.previousMaterials?.length ?? 0) + (u?.previousCycle ? 1 : 0)} retained earlier material/cycle records; prior results do not establish this cycle’s goal.`,
      });
    } else {
      const context = {
          brief: state.brief,
          contribution: state.contribution,
          caseEvents: state.caseEvents ?? [],
        },
        view = workshopProgress(state.workshopEvents ?? [], context),
        last = view.last;
      const assessed =
        last &&
        [
          "Criterion met in simulation",
          "Insufficient evidence",
          "Criterion not met",
        ].includes(last.action);
      const historical = !!last && view.stale,
        positive =
          !historical && last?.action === "Criterion met in simulation";
      const observations = view.cycle.find(
        (e) => e.action === "Record observations",
      );
      const evidence: GoalEvidence[] = view.cycle
        .filter((e) =>
          [
            "Session succeeded",
            "Session failed",
            "Record observations",
            "Criterion met in simulation",
            "Insufficient evidence",
            "Criterion not met",
          ].includes(e.action),
        )
        .map((e) => ({
          id: e.id,
          kind: e.action,
          actor: workshopActors[e.actor],
          at: e.at,
          summary: e.body,
        }));
      const caseView = caseProgress(state.caseEvents ?? [], context);
      const responsible =
        !last && (!caseView.resolved || caseView.stale)
          ? caseActors[caseView.actor ?? "leo"]
          : view.actor
            ? workshopActors[view.actor]
            : "No pending workshop action; organization-level evidence follow-up unallocated";
      rows.push({
        streamId: id,
        name: stream.name,
        goal: stream.goal,
        expected:
          "Participant observations demonstrating application of the guide in a practical exercise, with separate criterion review.",
        status: historical
          ? "Historical workshop · current result not established"
          : positive
            ? "Scoped criterion met in simulation"
            : assessed
              ? last!.action
              : view.execution?.action === "Session failed"
                ? "Session failed · criterion review pending"
                : observations
                  ? "Observations recorded · criterion review pending"
                  : "Learning evidence not yet assessed",
        positive,
        historical,
        scope: last
          ? `Local workshop cycle ${last.cycle} · brief-v${view.cycle[0].context.brief.versions.at(-1)?.version} · audience retained in that brief`
          : "No workshop delivery cycle represented",
        evidence,
        gap: historical
          ? "The brief or case resolution changed. Retained session evidence concerns the original workshop, not the current source."
          : assessed
            ? `${last!.body} No real participant outcomes or separate organization-wide goal decision are established.`
            : observations
              ? "Observations require an independent criterion review; they do not establish a learning outcome alone."
              : "No assessed participant observations. A received brief, resolved case or preparation-ready decision is not learning evidence.",
        responsible,
        next:
          !last && (!caseView.resolved || caseView.stale)
            ? "Resolve the current workshop-brief case before facilitator allocation. " +
              caseView.nextStep
            : view.nextStep,
        destination:
          !last && (!caseView.resolved || caseView.stale)
            ? "/organizations/knowledge/cases/current-workshop-brief"
            : "/organizations/knowledge/workshop/K-02",
        retained: {
          allocationSource: view.cycle[0]?.source ?? null,
          execution: view.execution ?? null,
          observations: observations ?? null,
          criterionReview: assessed ? last : null,
        },
        prior: `${Math.max(0, (last?.cycle ?? 1) - 1)} earlier workshop cycles; no result transfers to a later cycle.`,
      });
    }
  }
  return {
    goal: knowledgeGoal,
    rows,
    positive: rows.filter((r) => r.positive).length,
    historical: rows.filter((r) => r.historical).length,
    boundary:
      "Organization-wide outcome not verified. Current positive local decisions are scoped simulations, not proof of real member benefit or an aggregate completion score.",
  };
}
