import {
  pendingReviewHandoff,
  reviewPackage,
  reviewRoles,
} from "./reviewHandoffs";
import type { KnowledgeWorkspace } from "./knowledgeCheckpoint";
import { assessedUseSubject } from "./authorizedUse";
import { useProgress, useActors } from "./useProgress";
import {
  applicabilitySources,
  currentApplicability,
} from "./scopeApplicability";
import { currentGuideSubject, guideInputStatus } from "./workstreamInputs";
import { briefGuideIsCurrent } from "./briefHandoff";
import { caseEvidence, caseProgress, caseActors } from "./caseLifecycle";
import { workshopProgress, workshopSource, workshopActors } from "./workshop";
export type ImpactStatus =
  "Blocked" | "Review needed" | "Historical" | "Current";
export type ChangeImpact = {
  id: string;
  stream: "K-01" | "K-02";
  title: string;
  status: ImpactStatus;
  reason: string;
  owner: string;
  next: string;
  destination: string;
  retained: unknown;
  current: unknown;
};
export function changeImpact(state: KnowledgeWorkspace): ChangeImpact[] {
  const rows: ChangeImpact[] = [];
  const scope = {
    adoptions: state.adoptions,
    checks: state.applicability ?? [],
  };
  if (state.use) {
    const view = useProgress(state.contribution, state.use, scope);
    rows.push({
      id: "bounded-use-source",
      stream: "K-01",
      title: "Bounded use and downstream goal follow-up",
      status: view.stale
        ? "Blocked"
        : view.scopeBlocked
          ? "Review needed"
          : "Current",
      reason: view.stale
        ? view.detail
        : (view.scopeBlocked ??
          "The retained material matches the current assessed source. Separate authorization, execution and outcome requirements still apply."),
      owner: view.actor ? useActors[view.actor] : "Follow-up unallocated",
      next:
        view.stale || view.scopeBlocked
          ? view.title + ". " + view.detail
          : "Inspect the exact use stage; source matching does not mean authorization or goal attainment.",
      destination: view.destination,
      retained: {
        subject: state.use.subject,
        mandateId: state.use.mandate.id,
        outcome: state.use.outcome,
        goalReviews: state.use.goalReviews,
      },
      current: {
        subject: assessedUseSubject(state.contribution) ?? null,
        stage: view.stage,
        scopeBlocked: view.scopeBlocked ?? null,
      },
    });
  }
  if (state.use) {
    const pending = pendingReviewHandoff(state.use);
    if (pending) {
      const changed =
        state.use.subject !== assessedUseSubject(state.contribution) ||
        pending.package !== reviewPackage(state.use, pending.role);
      const view = useProgress(state.contribution, state.use, scope);
      rows.push({
        id: "pending-review-handoff",
        stream: "K-01",
        title: `Pending review handoff · ${reviewRoles[pending.role]}`,
        status: changed ? "Blocked" : "Current",
        reason: changed
          ? "Exact material or responsibility package changed. The old offer cannot be accepted; original responsibility is retained until a valid handoff."
          : "Pending offer matches its exact package; separate acceptance is still required.",
        owner: view.actor ? useActors[view.actor] : "Follow-up unallocated",
        next: changed
          ? "Demo owner must inspect and cancel the changed offer before proposing a new exact package."
          : view.detail,
        destination: "/organizations/knowledge/use/K-01",
        retained: pending,
        current: {
          subject: assessedUseSubject(state.contribution) ?? null,
          package: reviewPackage(state.use, pending.role),
        },
      });
    }
  }
  const adoption = state.adoptions.at(-1);
  if (adoption) {
    for (const source of applicabilitySources({
      contribution: state.contribution,
      ...(state.use ? { use: state.use } : {}),
    })) {
      const check = currentApplicability(scope.checks, adoption, source);
      const prior = [...scope.checks]
        .reverse()
        .find((c) => c.source.kind === source.kind);
      rows.push({
        id: `scope-${source.kind}`,
        stream: "K-01",
        title: `Adopted scope · ${source.kind}`,
        status:
          check?.conclusion === "Applicable" ? "Current" : "Review needed",
        reason: check
          ? `Exact-source applicability: ${check.conclusion}. ${check.rationale}`
          : prior
            ? "Retained applicability decision does not match the current adoption, audience or exact source. It cannot transfer automatically."
            : "No exact applicability decision exists for the current adopted scope and source; this is missing evidence, not proof of a source change.",
        owner: source.reviewer,
        next:
          check?.conclusion === "Applicable"
            ? "No scope reassessment required for this exact source. Use authority remains separate."
            : "Inspect the current adoption and source; record an explicit applicability decision.",
        destination: "/organizations/knowledge/agreements/K-01",
        retained: prior ?? null,
        current: { adoption, source, check: check ?? null },
      });
    }
  }
  const guide = state.brief.guideHandoffs?.at(-1);
  if (guide) {
    const view = guideInputStatus(
      state.brief.guideHandoffs!,
      currentGuideSubject(state.contribution),
    );
    rows.push({
      id: "guide-workshop-input",
      stream: "K-02",
      title: "K-01 guide → K-02 preparation",
      status: view.ready
        ? "Current"
        : guide.subject !== currentGuideSubject(state.contribution)
          ? "Blocked"
          : "Review needed",
      reason: view.reason,
      owner: view.actor,
      next: view.ready
        ? "Inspect the brief that cites this exact handoff; receipt and applicability never approve the workshop."
        : view.reason,
      destination: "/organizations/knowledge/workstreams/K-02",
      retained: guide,
      current: {
        subject: currentGuideSubject(state.contribution) ?? null,
        input: view.input ?? null,
      },
    });
  }
  const brief = state.brief.versions.at(-1);
  if (brief) {
    const current = briefGuideIsCurrent(state.brief, brief, state.contribution);
    rows.push({
      id: "workshop-brief",
      stream: "K-02",
      title: "Latest workshop brief → editorial input",
      status: !current
        ? "Blocked"
        : !brief.receipt
          ? "Review needed"
          : "Current",
      reason: !current
        ? "Latest brief cites a guide or applicability decision that is no longer current."
        : !brief.receipt
          ? "Latest delivered brief has no exact receipt. Earlier receipts do not receive this version."
          : "Latest brief has an exact receipt and its linked guide remains current. Case resolution and workshop readiness are separate.",
      owner: !current
        ? "Leo · coordinate replacement brief"
        : "Maya · brief receiver",
      next: !current
        ? "Resolve guide input and applicability, then deliver and receive a new brief."
        : !brief.receipt
          ? "Inspect the latest brief and record its separate receipt."
          : "Inspect the receiving review; no source replacement is required.",
      destination: "/organizations/knowledge/workstreams/K-02",
      retained: brief,
      current: {
        guideInput:
          guideInputStatus(
            state.brief.guideHandoffs ?? [],
            currentGuideSubject(state.contribution),
          ).input ?? null,
        receipt: brief.receipt ?? null,
      },
    });
  }
  const context = { brief: state.brief, contribution: state.contribution };
  if (state.caseEvents?.length) {
    const view = caseProgress(state.caseEvents, context);
    rows.push({
      id: "workshop-brief-case",
      stream: "K-02",
      title: "Workshop brief coordination case",
      status: view.stale ? "Blocked" : "Current",
      reason: view.stale
        ? "The proposed or approved resolution references a different brief/input than the current source."
        : "No source mismatch detected for the current case stage. Case work and closure remain separate from workshop outcomes.",
      owner: view.actor ? caseActors[view.actor] : "No pending case action",
      next: view.nextStep,
      destination: "/organizations/knowledge/cases/current-workshop-brief",
      retained: view.proposal ?? state.caseEvents.at(-1),
      current: { evidence: caseEvidence(context) ?? null, status: view.status },
    });
  }
  if (state.workshopEvents?.length) {
    const workshopContext = { ...context, caseEvents: state.caseEvents ?? [] },
      view = workshopProgress(state.workshopEvents, workshopContext);
    const historical = view.stale && (!!view.execution || view.closed);
    rows.push({
      id: "workshop-cycle",
      stream: "K-02",
      title: `Workshop delivery · cycle ${view.last!.cycle}`,
      status: view.stale ? (historical ? "Historical" : "Blocked") : "Current",
      reason: view.stale
        ? historical
          ? "Source changed after execution or closure. Retained workshop evidence describes its original cycle; it does not establish results for the new brief."
          : "Current brief or case resolution differs from the allocated source. Acceptance, preparation and execution cannot continue."
        : "The allocation source matches the current resolved brief. Individual preparation, execution and outcome gates still apply.",
      owner: view.actor
        ? workshopActors[view.actor]
        : "No pending workshop action",
      next: view.nextStep,
      destination: "/organizations/knowledge/workshop/K-02",
      retained: {
        source: view.cycle[0].source,
        execution: view.execution ?? null,
        last: view.last,
      },
      current: {
        source: workshopSource(workshopContext) ?? null,
        status: view.status,
      },
    });
  }
  return rows;
}
