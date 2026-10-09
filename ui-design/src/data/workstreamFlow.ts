import type { KnowledgeWorkspace } from "./knowledgeCheckpoint";
import { contributionView } from "./contributionView";
import {
  contributionPerformer,
  contributorNames,
  pendingKnowledgeHandoff,
  handoffIsCurrent,
} from "./knowledgeHandoff";
import {
  contributionAcceptanceBlocked,
  knowledgeResponsibilityStatus,
} from "./knowledgeResponsibility";
import { useProgress, useActors } from "./useProgress";
import { workshopProgress, workshopSource, workshopActors } from "./workshop";
import { caseProgress } from "./caseLifecycle";
import { briefGuideIsCurrent } from "./briefHandoff";
import { guideInputStatus, currentGuideSubject } from "./workstreamInputs";
import { exceptionTickets, exceptionProgress } from "./exceptionLoop";
export type FlowLane = {
  id: string;
  label: string;
  status: string;
  next: string;
  actor?: string;
  waiting: string;
  source: string;
  path: string;
};
export function workstreamFlow(
  state: KnowledgeWorkspace,
): { stream: string; lanes: FlowLane[] }[] {
  const c = state.contribution,
    v = c.contributions.at(-1)!,
    view = contributionView(c),
    performer = contributionPerformer(c),
    handoff = pendingKnowledgeHandoff(c),
    blocked = contributionAcceptanceBlocked(c);
  const done =
    !!v.reassessment &&
    v.reassessment.conclusion === "Suitable for stated scope" &&
    !v.revisionRequest;
  const actor = blocked
    ? knowledgeResponsibilityStatus(c) === "Acceptance pending"
      ? "Leo"
      : "Demo organization owner"
    : handoff
      ? handoffIsCurrent(c, handoff)
        ? contributorNames[handoff.to]
        : "Demo organization owner"
      : done
        ? undefined
        : v.delivery && view.attention !== "revision"
          ? "Maya"
          : contributorNames[performer];
  const guide: FlowLane[] = [
    {
      id: "contribution",
      label: "Contribution and editorial review",
      status: handoff ? "Contribution handoff pending" : view.stage,
      actor,
      next: handoff
        ? "Inspect the exact pending handoff; ownership transfers only on acceptance."
        : blocked || actor === contributorNames[performer]
          ? view.contributorNext
          : done
            ? "Inspect the scoped assessment; publication and outcome decisions remain separate."
            : view.receiverNext,
      waiting: handoff
        ? "Named recipient response; original contributor retains responsibility."
        : done
          ? "No pending editorial response."
          : view.locked
            ? "Command acknowledgement or delivery projection."
            : v.delivery && !v.receipt
              ? "Maya’s receipt of the exact delivery."
              : v.delivery && view.attention !== "revision"
                ? "Maya’s independent assessment."
                : blocked
                  ? "Explicit responsibility response or a new owner offer."
                  : "A delivered contribution from the current contributor.",
      source: `K-01-H · draft-0${v.version}`,
      path:
        handoff || blocked
          ? "/work?persona=leo&" +
            (actor === "Demo organization owner"
              ? "useActor=owner"
              : "contributionActor=" + (handoff ? handoff.to : performer))
          : "/work?persona=" +
            (actor === "Maya" ? "maya" : "leo") +
            (performer === "delegate" && actor !== "Maya"
              ? "&contributionActor=delegate"
              : ""),
    },
  ];
  const u = useProgress(c, state.use, {
    adoptions: state.adoptions,
    checks: state.applicability ?? [],
  });
  guide.push({
    id: "use",
    label: "Bounded use and goal review",
    status: u.title,
    actor: u.actor ? useActors[u.actor] : undefined,
    next: u.detail,
    waiting: u.actor
      ? "The named next performer’s separate response."
      : u.represented
        ? "Stopping condition or evidence gap; inspect current records."
        : "A suitable assessed guide before a bounded-use mandate.",
    source: state.use?.mandate.id ?? "No local use mandate",
    path: u.destination.split("?")[0].replace("/organizations/knowledge", ""),
  });
  const wc = {
      brief: state.brief,
      contribution: c,
      caseEvents: state.caseEvents ?? [],
    },
    b = state.brief.versions.at(-1),
    current = !!b?.receipt && briefGuideIsCurrent(state.brief, b, c),
    cp = caseProgress(wc.caseEvents, wc),
    w = workshopProgress(state.workshopEvents ?? [], wc);
  const workshop: FlowLane[] = [
    {
      id: "brief",
      label: "Workshop brief",
      status: !b
        ? "Input missing: workshop brief"
        : !b.receipt
          ? `brief-v${b.version} · receipt pending`
          : !current
            ? `brief-v${b.version} · historical guide input`
            : `brief-v${b.version} · received current input`,
      actor: current ? undefined : b && !b.receipt ? "Maya" : "Leo",
      next: current
        ? "Resolve the coordination case separately before workshop allocation."
        : b && !b.receipt
          ? "Maya inspects and acknowledges the exact delivered brief."
          : "Leo coordinates a usable current brief; guide applicability is required when linked.",
      waiting: current
        ? "No pending brief receipt."
        : b && !b.receipt
          ? "Maya’s exact receipt."
          : "Current audience, schedule and exercise input from Leo.",
      source: b ? `brief-v${b.version}` : "No delivered brief",
      path: "/workstreams/K-02",
    },
    {
      id: "case",
      label: "Brief coordination case",
      status: cp.status,
      actor: cp.actor ? workshopActors[cp.actor] : undefined,
      next: cp.nextStep,
      waiting: cp.waitingFor,
      source: wc.caseEvents.at(-1)?.id ?? "Authored case · no local response",
      path: "/cases/current-workshop-brief",
    },
    {
      id: "workshop",
      label: "Workshop delivery and criterion review",
      status: w.status,
      actor: w.last
        ? w.actor
          ? workshopActors[w.actor]
          : undefined
        : workshopSource(wc)
          ? workshopActors.owner
          : undefined,
      next: w.last
        ? w.nextStep
        : workshopSource(wc)
          ? "Owner may explicitly offer facilitation against the resolved current brief."
          : "Resolve the current brief coordination case before offering facilitation.",
      waiting: w.closed
        ? "No pending cycle action; inspect the recorded result and its limits."
        : !w.last
          ? "Resolved current brief, then explicit allocation and acceptance."
          : w.stale && !w.execution
            ? "Changed source requires cancellation and a fresh allocation."
            : w.pending
              ? "Named handoff recipient response; current facilitator retains responsibility."
              : w.nextStep,
      source: w.last
        ? `K-02 · cycle ${w.last.cycle} · ${w.last.id}`
        : "No local workshop cycle",
      path: "/workshop/K-02",
    },
  ];
  const ec = { ...wc, workshopEvents: state.workshopEvents ?? [] };
  for (const id of exceptionTickets(state.exceptionEvents ?? [])) {
    const p = exceptionProgress(state.exceptionEvents ?? [], id, ec);
    if (!p.closed)
      workshop.push({
        id: `exception:${id}`,
        label: "Exception follow-up",
        status: p.status,
        actor: p.actor ? workshopActors[p.actor] : undefined,
        next: p.next,
        waiting:
          p.pending && p.stale
            ? "Changed remedy; owner must request a fresh response."
            : p.pending
              ? "Owner review of the handler response and exact current remedy."
              : p.offer?.assignee
                ? `${workshopActors[p.offer.assignee]} handling response.`
                : "Owner allocation of a handler.",
        source: id,
        path: "/exceptions",
      });
  }
  const g = guideInputStatus(
    state.brief.guideHandoffs ?? [],
    currentGuideSubject(c),
  );
  if (state.brief.guideHandoffs?.length)
    workshop.unshift({
      id: "guide-input",
      label: "K-01 → K-02 guide input",
      status: g.ready
        ? "Exact guide received and applicable"
        : "Guide exchange needs follow-up",
      actor: g.ready ? undefined : g.actor,
      next: g.reason,
      waiting: g.ready
        ? "No pending exchange response; workshop and publication decisions remain separate."
        : g.reason,
      source: state.brief.guideHandoffs.at(-1)!.id,
      path: "/workstreams/K-02",
    });
  return [
    { stream: "K-01", lanes: guide },
    { stream: "K-02", lanes: workshop },
  ];
}
