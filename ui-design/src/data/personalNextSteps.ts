import type { KnowledgeWorkspace } from "./knowledgeCheckpoint";
import type { ApplicabilityScope } from "./scopeApplicability";
import { contributionView } from "./contributionView";
import {
  contributionPerformer,
  pendingKnowledgeHandoff,
  contributorNames,
} from "./knowledgeHandoff";
import {
  knowledgeResponsibilityStatus,
  contributionAcceptanceBlocked,
} from "./knowledgeResponsibility";
import { workshopProgress, workshopActors } from "./workshop";
import { caseProgress } from "./caseLifecycle";
import { exceptionTickets, exceptionProgress } from "./exceptionLoop";
import { useProgress } from "./useProgress";
import { currentGuideSubject, guideInputStatus } from "./workstreamInputs";
export type PersonalStep = {
  id: string;
  title: string;
  detail: string;
  group: "work" | "review" | "waiting";
  source: string;
  path?: string;
  panel?: string;
};
/** Read-only next steps, in source order; never a priority or assignment count. */
export function personalNextSteps(
  state: KnowledgeWorkspace,
  actor: string,
  scope?: ApplicabilityScope,
): PersonalStep[] {
  const steps: PersonalStep[] = [];
  const add = (step: PersonalStep) => steps.push(step);
  const c = state.contribution,
    current = c.contributions.at(-1)!,
    view = contributionView(c),
    performer = contributionPerformer(c),
    handoff = pendingKnowledgeHandoff(c),
    blocked = contributionAcceptanceBlocked(c),
    status = knowledgeResponsibilityStatus(c);
  const contributionPath =
    "/organizations/knowledge/contributions/K-01-H?persona=leo" +
    (performer === "delegate" ? "&contributionActor=delegate" : "");
  if (
    handoff &&
    (actor === handoff.to || actor === "owner" || actor === handoff.from)
  )
    add({
      id: "contribution-handoff",
      title:
        actor === handoff.to
          ? "Respond to contribution handoff"
          : actor === "owner"
            ? "Inspect pending contribution handoff"
            : `Waiting for ${contributorNames[handoff.to]}'s handoff response`,
      detail:
        "Proposal alone does not transfer responsibility. Inspect the exact input, draft and authority package.",
      group: actor === handoff.from ? "waiting" : "work",
      source: handoff.id,
      panel: "Knowledge input and authority handoff",
    });
  if (blocked && (actor === "leo" || actor === "owner")) {
    const responsible = status === "Acceptance pending" ? "leo" : "owner";
    add({
      id: "contribution-acceptance",
      title: status,
      detail: view.contributorNext,
      group: actor === responsible ? "work" : "waiting",
      source: "K-01-H · local allocation",
      panel: "Knowledge contribution responsibility",
    });
  } else if (!handoff && actor === performer) {
    const done =
      !!current.reassessment &&
      current.reassessment.conclusion === "Suitable for stated scope" &&
      !current.revisionRequest;
    if (!done)
      add({
        id: "contribution",
        title: view.stage,
        detail: view.contributorNext,
        group:
          current.delivery && view.attention !== "revision"
            ? "waiting"
            : "work",
        source: `K-01-H · draft-0${current.version}`,
        path: contributionPath,
      });
  }
  if (actor === "maya" && !handoff) {
    const wait = !current.delivery || view.attention === "revision";
    const done =
      !!current.reassessment &&
      !current.revisionRequest &&
      view.attention !== "revision";
    if (!done)
      add({
        id: "editorial",
        title: wait
          ? `Waiting for ${contributorNames[performer]}'s contribution`
          : !current.receipt
            ? "Inspect contribution and record receipt"
            : "Review the received contribution",
        detail: view.receiverNext,
        group: wait ? "waiting" : current.receipt ? "review" : "work",
        source: `K-01-H · draft-0${current.version}`,
        panel: "Maya contribution inbox",
      });
  }
  const wc = {
    brief: state.brief,
    contribution: c,
    caseEvents: state.caseEvents ?? [],
  };
  const w = workshopProgress(state.workshopEvents ?? [], wc);
  if (
    w.last &&
    !w.closed &&
    (actor === w.actor || actor === w.facilitator || actor === w.reviewer)
  )
    add({
      id: "workshop",
      title: w.status,
      detail: `${w.actor ? workshopActors[w.actor] : "No actor"} · ${w.nextStep}`,
      group:
        actor !== w.actor
          ? "waiting"
          : actor === w.reviewer &&
              [
                "Submit preparation",
                "Record observations",
                "Session failed",
              ].includes(w.stage)
            ? "review"
            : "work",
      source: `K-02 · cycle ${w.last.cycle}`,
      path: "/workshop/K-02",
    });
  if (state.caseEvents?.length) {
    const p = caseProgress(state.caseEvents, wc);
    if (p.actor && (actor === "leo" || actor === "maya"))
      add({
        id: "case",
        title: p.status,
        detail: p.nextStep,
        group:
          actor !== p.actor
            ? "waiting"
            : p.pending && !p.stale
              ? "review"
              : "work",
        source: "K-02 · brief coordination case",
        path: "/cases/current-workshop-brief",
      });
  }
  const ec = { ...wc, workshopEvents: state.workshopEvents ?? [] };
  for (const id of exceptionTickets(state.exceptionEvents ?? [])) {
    const p = exceptionProgress(state.exceptionEvents ?? [], id, ec);
    if (
      !p.closed &&
      (actor === p.actor || actor === p.offer?.assignee || actor === "owner")
    )
      add({
        id: `exception:${id}`,
        title: `${id} · ${p.status}`,
        detail: p.next,
        group: actor !== p.actor ? "waiting" : p.pending ? "review" : "work",
        source: "K-02 · exception follow-up",
        path: "/exceptions",
      });
  }
  const u = useProgress(c, state.use, scope);
  if (u.represented && u.actor === actor)
    add({
      id: "use",
      title: u.title,
      detail: u.detail,
      group:
        [
          "Assess publication scope",
          "Decide bounded use",
          "Review outcome criterion",
          "Scope applicability decision needed",
          "Review outcome against organizational goal",
          "Review goal follow-up result",
          "Reassess goal after follow-up",
        ].includes(u.title) && !u.stale
          ? "review"
          : "work",
      source: "K-01 · bounded use",
      path: u.destination.split("?")[0].replace("/organizations/knowledge", ""),
    });
  if (state.brief.guideHandoffs?.length) {
    const g = guideInputStatus(
      state.brief.guideHandoffs,
      currentGuideSubject(c),
    );
    if (!g.ready && (actor === "leo" || actor === "maya"))
      add({
        id: "guide-input",
        title: "Guide input for K-02",
        detail: g.reason,
        group: actor !== g.actor.toLowerCase() ? "waiting" : "work",
        source: state.brief.guideHandoffs.at(-1)!.id,
        panel: "Cross-workstream guide input",
      });
  }
  const b = state.brief.versions.at(-1);
  if (b && !b.receipt && (actor === "leo" || actor === "maya"))
    add({
      id: "brief-receipt",
      title:
        actor === "maya"
          ? "Inspect latest workshop brief receipt"
          : "Waiting for Maya’s brief receipt",
      detail: `brief-v${b.version} has been delivered. Receipt remains a separate response.`,
      group: actor === "maya" ? "work" : "waiting",
      source: `K-02 · brief-v${b.version}`,
      panel: "Workshop brief handoff",
    });
  return steps;
}
