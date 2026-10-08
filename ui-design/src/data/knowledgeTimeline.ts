import { workshopActors } from "./workshop";
import { caseActors } from "./caseLifecycle";
import { goalActors } from "./goalLoop";
import { reviewRoles, reviewPrincipals } from "./reviewHandoffs";
import type { KnowledgeWorkspace } from "./knowledgeCheckpoint";
import { contributorNames } from "./knowledgeHandoff";
import { assessedUseSubject, type UseCycle } from "./authorizedUse";
export const timelineKinds = [
  "Responsibility",
  "Handoff",
  "Contribution",
  "Editorial",
  "Scope",
  "Use",
  "Workshop brief",
  "Workstream input",
  "Goal follow-up",
  "Coordination case",
  "Workshop delivery",
] as const;
export type TimelineKind = (typeof timelineKinds)[number];
export type KnowledgeTimelineEvent = {
  key: string;
  id: string;
  stream: "K-01" | "K-02";
  kind: TimelineKind;
  title: string;
  actor: string;
  at: string;
  version: string;
  detail: string;
  references: string[];
  destination: string;
  record: unknown;
  frozenSubject?: unknown;
};
const contributorPath = (actor = "leo") =>
  "/organizations/knowledge/contributions/K-01-H?persona=leo" +
  (actor === "delegate" ? "&contributionActor=delegate" : "");
const ownerPath = "/organizations/knowledge/work?persona=leo&useActor=owner";
const mayaPath = "/organizations/knowledge/work?persona=maya";
export function knowledgeTimeline(
  state: KnowledgeWorkspace,
): KnowledgeTimelineEvent[] {
  const events: KnowledgeTimelineEvent[] = [];
  const add = (e: KnowledgeTimelineEvent) => events.push(e);
  const base = { stream: "K-01" as const };
  for (const e of state.contribution.responsibility?.events ?? [])
    add({
      ...base,
      key: `responsibility:${e.id}`,
      id: e.id,
      kind: "Responsibility",
      title: e.action,
      actor: e.actor === "owner" ? "Demo organization owner" : "Leo",
      at: e.at,
      version: "K-01-H · Coordinator",
      detail: e.rationale,
      references: [],
      destination:
        e.actor === "owner"
          ? ownerPath
          : "/organizations/knowledge/work?persona=leo",
      record: e,
    });
  for (const h of state.contribution.handoffs ?? []) {
    add({
      ...base,
      key: `handoff:${h.id}`,
      id: h.id,
      kind: "Handoff",
      title: "Handoff proposed",
      actor: "Demo organization owner",
      at: h.at,
      version: `draft-0${h.draft.version} · ${h.input.id}`,
      detail: `${contributorNames[h.from]} → ${contributorNames[h.to]}. ${h.pendingWork} ${h.rationale}`,
      references: h.requestId ? [h.requestId] : [],
      destination: ownerPath,
      record: h,
    });
    if (h.response)
      add({
        ...base,
        key: `handoff-response:${h.id}`,
        id: `${h.id}-response`,
        kind: "Handoff",
        title: `Handoff ${h.response.decision.toLowerCase()}`,
        actor:
          h.response.actor === "owner"
            ? "Demo organization owner"
            : contributorNames[h.response.actor],
        at: h.response.at,
        version: `draft-0${h.draft.version}`,
        detail: h.response.rationale,
        references: [h.id],
        destination:
          h.response.actor === "owner"
            ? ownerPath
            : h.to === "delegate"
              ? "/organizations/knowledge/work?persona=leo&contributionActor=delegate"
              : "/organizations/knowledge/work?persona=leo",
        record: h.response,
      });
  }
  for (const c of state.contribution.commands ?? []) {
    const actor = contributorNames[c.performer ?? "leo"],
      version = `draft-0${c.version}`;
    add({
      ...base,
      key: `command:${c.id}`,
      id: c.id,
      kind: "Contribution",
      title: "Contribution submission",
      actor,
      at: c.submittedAt,
      version,
      detail: `Current command status: ${c.status}${c.rejection ? ` · ${c.rejection}` : ""}. Projection: ${c.projected ? "updated" : "not updated"}. Earlier status transitions have no separate recorded times.`,
      references: c.respondsTo ? [c.respondsTo] : [],
      destination: contributorPath(c.performer),
      record: c,
    });
    if (c.admittedAt)
      add({
        ...base,
        key: `admission:${c.id}`,
        id: `${c.id}-admission`,
        kind: "Contribution",
        title: "Submission admitted locally",
        actor: "Local command simulation",
        at: c.admittedAt,
        version,
        detail:
          "Admission is separate from delivery projection and receiver receipt.",
        references: [c.id],
        destination: contributorPath(c.performer),
        record: { commandId: c.id, admittedAt: c.admittedAt },
      });
  }
  for (const c of state.contribution.contributions) {
    const version = `draft-0${c.version}`,
      actor = c.delivery?.performer ?? "leo";
    if (c.delivery)
      add({
        ...base,
        key: `delivery:${c.delivery.id}`,
        id: c.delivery.id,
        kind: "Contribution",
        title: "Contribution delivered",
        actor: contributorNames[actor],
        at: c.delivery.at,
        version,
        detail: c.delivery.note,
        references: [
          ...(c.delivery.respondsTo ? [c.delivery.respondsTo] : []),
          ...(state.contribution.commands
            ?.filter((x) => x.version === c.version && x.projected)
            .map((x) => x.id) ?? []),
        ],
        destination: contributorPath(actor),
        record: c.delivery,
      });
    if (c.receipt)
      add({
        ...base,
        key: `receipt:${c.receipt.id}`,
        id: c.receipt.id,
        kind: "Editorial",
        title: "Contribution receipt",
        actor: "Maya",
        at: c.receipt.at,
        version,
        detail:
          "Receipt of the exact delivery; not acceptance or publication authority.",
        references: [c.receipt.deliveryId],
        destination: mayaPath,
        record: c.receipt,
      });
    const a = c.reassessment ?? c.assessment;
    if (a)
      add({
        ...base,
        key: `assessment:${a.id}`,
        id: a.id,
        kind: "Editorial",
        title: a.conclusion,
        actor: "Maya",
        at: a.at,
        version,
        detail: a.rationale,
        references: [a.receiptId, ...("deliveryId" in a ? [a.deliveryId] : [])],
        destination: mayaPath,
        record: a,
      });
  }
  for (const c of state.contribution.contributions)
    if (c.revisionRequest) {
      const q = c.revisionRequest;
      add({
        ...base,
        key: `revision-request:${q.id}`,
        id: q.id,
        kind: "Editorial",
        title: "Further content revision requested",
        actor: q.requester,
        at: q.at,
        version: `draft-0${c.version}`,
        detail: q.rationale,
        references: [q.assessmentId, q.receiptId, q.deliveryId],
        destination: mayaPath,
        record: q,
      });
    }
  for (const a of state.adoptions)
    add({
      ...base,
      key: `adoption:${a.id}`,
      id: a.id,
      kind: "Scope",
      title: "Workstream scope adopted",
      actor: a.adopter,
      at: a.at,
      version: a.versionId,
      detail: `Audience: ${a.audience}. ${a.rationale}`,
      references: a.supersedes ? [a.supersedes] : [],
      destination: "/organizations/knowledge/agreements/K-01",
      record: a,
    });
  for (const a of state.applicability ?? [])
    add({
      ...base,
      key: `applicability:${a.id}`,
      id: a.id,
      kind: "Scope",
      title: `Applicability · ${a.conclusion}`,
      actor: a.reviewer,
      at: a.at,
      version: a.agreementVersion,
      detail: `${a.source.kind} · ${a.source.id} · audience ${a.audience}. ${a.rationale}`,
      references: [a.adoptionId, a.source.id],
      destination: "/organizations/knowledge/agreements/K-01",
      record: a,
      frozenSubject: JSON.parse(a.source.snapshot),
    });
  const use = state.use;
  const cycle = (u: UseCycle, n: number) => {
    const fields = [
      ["mandate", "Use mandate"],
      ["publicationAssessment", "Publication assessment"],
      ["authorization", "Use authorization"],
      ["execution", "Execution observation"],
      ["readerEvidence", "Reader evidence"],
      ["outcome", "Outcome review"],
    ] as const;
    const frozen = JSON.parse(u.subject);
    for (const r of u.goalReviews ?? []) {
      const common = {
        ...base,
        kind: "Goal follow-up" as const,
        version: `draft-0${frozen.version} · use cycle ${n}`,
        destination: "/organizations/knowledge/use/K-01",
        frozenSubject: JSON.parse(r.source),
      };
      add({
        ...common,
        key: `goal:${r.id}`,
        id: r.id,
        title: `Goal decision · ${r.decision}`,
        actor: goalActors.owner,
        at: r.at,
        detail: `${r.rationale} Limits: ${r.limitations}`,
        references: [r.outcomeId, ...(r.previousId ? [r.previousId] : [])],
        record: r,
      });
      const t = r.followUp;
      if (t) {
        add({
          ...common,
          key: `goal:${t.id}`,
          id: t.id,
          title: "Goal follow-up offered",
          actor: goalActors.owner,
          at: r.at,
          detail: `${t.title} → ${goalActors[t.assignee]}. Expected: ${t.expectedResult}`,
          references: [r.id, r.outcomeId],
          record: t,
        });
        for (const event of [
          t.response,
          t.delivery,
          t.review,
          t.cancellation,
        ]) {
          if (!event) continue;
          const title =
            event === t.response
              ? `Goal follow-up · ${t.response!.decision}`
              : event === t.delivery
                ? "Goal follow-up delivered"
                : event === t.review
                  ? `Goal follow-up result · ${t.review!.decision}`
                  : "Goal follow-up cancelled";
          add({
            ...common,
            key: `goal:${event.id}`,
            id: event.id,
            title,
            actor: goalActors[event.actor],
            at: event.at,
            detail: "rationale" in event ? event.rationale : event.body,
            references: [
              t.id,
              r.id,
              ...(event === t.review && t.delivery ? [t.delivery.id] : []),
            ],
            record: event,
          });
        }
      }
    }

    for (const e of u.reviewHandoffs ?? [])
      add({
        ...base,
        key: `review-handoff:${e.id}`,
        id: e.id,
        kind: "Handoff",
        title: `${reviewRoles[e.role]} handoff · ${e.action}`,
        actor:
          e.actor === "owner"
            ? "Demo organization owner"
            : reviewPrincipals[e.actor],
        at: e.at,
        version: `draft-0${frozen.version} · use cycle ${n}`,
        detail: `${reviewPrincipals[e.from]} → ${reviewPrincipals[e.to]}. ${e.rationale}`,
        references: [e.afterRecordId, ...(e.proposalId ? [e.proposalId] : [])],
        destination: "/organizations/knowledge/use/K-01",
        record: e,
        frozenSubject: JSON.parse(e.package),
      });

    for (const r of u.authorityHistory ?? [])
      add({
        ...base,
        key: `use:${r.id}`,
        id: r.id,
        kind: "Use",
        title: `Use authority · ${r.action}`,
        actor: r.actor,
        at: r.at,
        version: `draft-0${frozen.version} · use cycle ${n}`,
        detail: `${r.rationale} Conditions / verification: ${r.conditions}`,
        references: [r.sourceId, r.afterRecordId],
        destination: "/organizations/knowledge/use/K-01",
        record: r,
        frozenSubject: frozen,
      });

    for (const [field, title] of fields) {
      const r = u[field];
      if (!r) continue;
      const result =
        "conclusion" in r
          ? r.conclusion
          : "decision" in r
            ? r.decision
            : "result" in r
              ? r.result
              : "kind" in r
                ? r.kind
                : "";
      add({
        ...base,
        key: `use:${r.id}`,
        id: r.id,
        kind: "Use",
        title: result ? `${title} · ${result}` : title,
        actor: r.actor,
        at: r.at,
        version: `draft-0${frozen.version} · use cycle ${n}`,
        detail: `Audience: ${u.audience}. ${r.rationale}${u.subject !== assessedUseSubject(state.contribution) ? " Historical source differs from the current assessed contribution; old authority does not transfer." : ""}`,
        references: [r.sourceId],
        destination: "/organizations/knowledge/use/K-01",
        record: r,
        frozenSubject: frozen,
      });
    }
  };
  for (const use of [
    ...(state.use?.previousMaterials ?? []),
    ...(state.use ? [state.use] : []),
  ]) {
    if (use?.previousCycle) cycle(use.previousCycle, 1);
    if (use?.continuation)
      add({
        ...base,
        key: `use:${use.continuation.id}`,
        id: use.continuation.id,
        kind: "Use",
        title: "Next use cycle planned",
        actor: use.continuation.actor,
        at: use.continuation.at,
        version: "use cycle 2",
        detail: use.continuation.rationale,
        references: [use.continuation.sourceId],
        destination: "/organizations/knowledge/use/K-01",
        record: use.continuation,
      });
    if (use) cycle(use, use.cycle ?? 1);
  }
  for (const h of state.brief.guideHandoffs ?? []) {
    const source = JSON.parse(h.subject);
    const common = {
      stream: "K-02" as const,
      kind: "Workstream input" as const,
      version: `K-01 → K-02 · draft-0${source.version}`,
      destination: "/organizations/knowledge/workstreams/K-02?persona=leo",
      frozenSubject: source,
    };
    add({
      ...common,
      key: `guide-input:${h.id}`,
      id: h.id,
      title: "Guide input offered to workshop",
      actor: h.sender,
      at: h.at,
      detail: `${h.purpose}. ${h.rationale}`,
      references: [source.delivery.id, source.receipt.id, source.assessment.id],
      record: h,
    });
    if (h.response)
      add({
        ...common,
        key: `guide-input:${h.response.id}`,
        id: h.response.id,
        title: `Guide input · ${h.response.decision}`,
        actor: h.response.actor,
        at: h.response.at,
        detail: h.response.rationale,
        references: [h.id],
        record: h.response,
      });
    for (const a of h.applicability ?? [])
      add({
        ...common,
        key: `guide-input:${a.id}`,
        id: a.id,
        title: `Workshop input · ${a.conclusion}`,
        actor: a.actor,
        at: a.at,
        detail: a.rationale,
        references: [a.sourceId, h.id],
        record: a,
      });
  }
  for (const b of state.brief.versions) {
    const version = `brief-v${b.version}`,
      id = `workshop-brief-v${b.version}`;
    add({
      key: `brief:${id}`,
      id,
      stream: "K-02",
      kind: "Workshop brief",
      title: "Workshop brief delivered",
      actor: "Leo",
      at: b.deliveredAt,
      version,
      detail: b.body,
      references: b.guideInput
        ? [b.guideInput.handoffId, b.guideInput.applicabilityId]
        : [],
      destination: "/organizations/knowledge/workstreams/K-02?persona=leo",
      record: {
        version: b.version,
        body: b.body,
        deliveredAt: b.deliveredAt,
        ...(b.guideInput ? { guideInput: b.guideInput } : {}),
      },
    });
    if (b.receipt)
      add({
        key: `brief-receipt:${b.receipt.id}`,
        id: b.receipt.id,
        stream: "K-02",
        kind: "Workshop brief",
        title: "Workshop brief receipt",
        actor: "Maya",
        at: b.receipt.at,
        version,
        detail: "Exact brief received; editorial review remains separate.",
        references: [id],
        destination: "/organizations/knowledge/workstreams/K-02?persona=maya",
        record: b.receipt,
      });
  }
  for (const event of state.caseEvents ?? [])
    add({
      key: `case:${event.id}`,
      id: event.id,
      stream: "K-02",
      kind: "Coordination case",
      title: event.action,
      actor: caseActors[event.actor],
      at: event.at,
      version: "current-workshop-brief",
      detail: event.rationale,
      references: [
        "workshop-brief-input",
        ...(event.proposalId ? [event.proposalId] : []),
      ],
      destination: `/organizations/knowledge/cases/current-workshop-brief?persona=${event.actor}`,
      record: event,
      ...(event.evidence ? { frozenSubject: JSON.parse(event.evidence) } : {}),
    });
  // Preserve deterministic record order for equal timestamps, without inventing causality.
  for (const event of state.workshopEvents ?? [])
    add({
      key: `workshop:${event.id}`,
      id: event.id,
      stream: "K-02",
      kind: "Workshop delivery",
      title: event.action,
      actor: workshopActors[event.actor],
      at: event.at,
      version: `Local cycle ${event.cycle}`,
      detail: event.body,
      references: [...(event.previousId ? [event.previousId] : [])],
      destination:
        "/organizations/knowledge/workshop/K-02?persona=" +
        (event.actor === "leo" ? "leo" : "maya"),
      record: event,
      frozenSubject: JSON.parse(event.source),
    });
  return events
    .map((e, index) => ({ e, index }))
    .sort(
      (a, b) => Date.parse(b.e.at) - Date.parse(a.e.at) || a.index - b.index,
    )
    .map((x) => x.e);
}
export type TimelineFilters = {
  stream: string;
  kind: string;
  query: string;
  page: number;
  event?: string;
};
export function timelinePage(
  events: KnowledgeTimelineEvent[],
  filters: TimelineFilters,
) {
  const q = filters.query.trim().toLowerCase();
  const matched = events.filter(
    (e) =>
      (filters.stream === "all" || e.stream === filters.stream) &&
      (filters.kind === "all" || e.kind === filters.kind) &&
      (!q ||
        [e.id, e.title, e.actor, e.version, e.detail, ...e.references]
          .join(" ")
          .toLowerCase()
          .includes(q)),
  );
  const pages = Math.max(1, Math.ceil(matched.length / 20)),
    page = Math.max(1, Math.min(filters.page, pages));
  return {
    matched,
    pages,
    page,
    rows: matched.slice((page - 1) * 20, page * 20),
  };
}
